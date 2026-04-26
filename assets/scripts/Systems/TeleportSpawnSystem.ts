import { _decorator, Component, Node, Prefab, instantiate, Vec3, tween } from 'cc';
import { GameEventsBus } from '../common/event/GlobalEventTarget';
import { GameEvents } from '../gameplay/input/GameEvents';
import { BgMoving } from '../gameplay/BgMoving';
import { GameManager } from '../Managers/GameManager';
import { TeleportController } from '../Controllers/TeleportController';
import { ResultController } from '../Controllers/ResultController';
import { SoundController } from '../Managers/SoundController';

const { ccclass, property } = _decorator;

/**
 * System to handle the single portal spawn at the end of the game.
 * Attach to: GameScene prefab root.
 */
@ccclass('TeleportSpawnSystem')
export class TeleportSpawnSystem extends Component {
    @property(Prefab) teleportPrefab: Prefab = null;
    @property(Prefab) resultPrefab:   Prefab = null;
    @property(Node)   bgMoveNode:     Node   = null;
    @property(Node)   characterNode:  Node   = null;

    /** Distance ahead to spawn the portal when triggered. */
    @property spawnAheadX: number = 200;
    /** Ensures the portal does not overlap the character on spawn. */
    @property minAheadFromCharacterX: number = 280;
    /** Seconds for the final "enter portal" motion. */
    @property enterPortalDuration: number = 0.45;

    private _bgMoving: BgMoving | null = null;
    private _activeTeleport: Node | null = null;
    private _teleportCtrl: TeleportController | null = null;
    private _isWinSequence: boolean = false;
    private _isTeleportEntering: boolean = false;
    private _targetCharacterPos: Vec3 = new Vec3();
    private _tmpDir: Vec3 = new Vec3();
    private _tmpNextPos: Vec3 = new Vec3();

    public static instance: TeleportSpawnSystem = null;

    public get activeTeleport(): Node | null {
        return this._activeTeleport;
    }
    public get isAutoSequenceActive(): boolean {
        return this._isWinSequence || this._isTeleportEntering;
    }

    onLoad(): void {
        TeleportSpawnSystem.instance = this;
        if (this.bgMoveNode) {
            this._bgMoving = this.bgMoveNode.getComponent(BgMoving);
        }

        GameEventsBus.get().on(GameEvents.AllShardsCollected, this._onAllShardsCollected, this);
        GameEventsBus.get().on(GameEvents.GameStart, this._onGameStart, this);
        GameEventsBus.get().on(GameEvents.WorldRewind, this._onWorldRewind, this);
    }

    onDestroy(): void {
        GameEventsBus.get().off(GameEvents.AllShardsCollected, this._onAllShardsCollected, this);
        GameEventsBus.get().off(GameEvents.GameStart, this._onGameStart, this);
        GameEventsBus.get().off(GameEvents.WorldRewind, this._onWorldRewind, this);
    }

    update(dt: number): void {
        if (!this._activeTeleport || !GameManager.getInstance().state.isPlaying) return;

        if (this._isWinSequence) {
            // Automated character movement toward portal
            const char = this.characterNode;
            if (char) {
                const target = this._activeTeleport.position;
                const current = char.position;
                const dist = Vec3.distance(current, target);
                
                if (dist < 20) {
                    // Reached portal
                    this._isWinSequence = false;
                    this.onTeleportEnter();
                } else {
                    Vec3.subtract(this._tmpDir, target, current);
                    this._tmpDir.normalize();
                    const moveSpeed = 400; // pixels per second
                    this._tmpNextPos.set(
                        current.x + this._tmpDir.x * moveSpeed * dt,
                        current.y + this._tmpDir.y * moveSpeed * dt,
                        current.z
                    );
                    
                    // Sync with CharacterController's model so it doesn't overwrite position
                    const ctrl = char.getComponent('CharacterController') as any;
                    if (ctrl && ctrl.getModel) {
                        const m = ctrl.getModel();
                        m.x = this._tmpNextPos.x;
                        m.y = this._tmpNextPos.y;
                        m.vx = this._tmpDir.x * moveSpeed;
                        m.vy = this._tmpDir.y * moveSpeed;
                    } else {
                        char.setPosition(this._tmpNextPos);
                    }
                }
            }
            return;
        }

        const dirX = this._bgMoving?.getScrollDirX() ?? 0;
        if (dirX === 0) return;

        const speed = this._bgMoving?.speed ?? 0;
        const dx = dirX * speed * dt;

        // Scroll the teleport with the world
        if (this._teleportCtrl) {
            this._teleportCtrl.scrollBy(-dx);
        } else {
            const pos = this._activeTeleport.position;
            this._activeTeleport.setPosition(pos.x - dx, pos.y, pos.z);
        }
    }

    private _onAllShardsCollected(): void {
        if (this._activeTeleport || !this.teleportPrefab) return;

        // Stop background scrolling immediately
        if (this._bgMoving) this._bgMoving.stopScroll();

        // Disable character controls
        if (this.characterNode) {
            const ctrl = this.characterNode.getComponent('CharacterController') as any;
            if (ctrl && ctrl.setControllable) {
                ctrl.setControllable(false);
            }
        }

        this._activeTeleport = instantiate(this.teleportPrefab);
        this.node.addChild(this._activeTeleport);

        // Spawn with a guaranteed visible gap ahead of the character.
        const charX = this.characterNode ? this.characterNode.position.x : 0;
        const spawnX = Math.max(this.spawnAheadX, charX + this.minAheadFromCharacterX);
        this._activeTeleport.setPosition(new Vec3(spawnX, 0, 0));
        this._teleportCtrl = this._activeTeleport.getComponent(TeleportController);
        SoundController.getInstance()?.playSFX('teleport');
        
        this._isWinSequence = true;
        this._isTeleportEntering = false;
        console.log('[TeleportSpawnSystem] Starting win sequence. Portal at x=' + spawnX);
    }

    private _onGameStart(): void {
        this._isWinSequence = false;
        this._isTeleportEntering = false;
        if (this._activeTeleport) {
            this._activeTeleport.destroy();
            this._activeTeleport = null;
            this._teleportCtrl = null;
        }
    }

    private _onWorldRewind(amount: number): void {
        if (this._activeTeleport) {
            if (this._teleportCtrl) {
                this._teleportCtrl.scrollBy(amount);
            } else {
                const pos = this._activeTeleport.position;
                this._activeTeleport.setPosition(pos.x + amount, pos.y, pos.z);
            }
        }
    }

    /** Called by CollisionSystem when player hits the teleport. */
    public onTeleportEnter(): void {
        if (!this._activeTeleport || this._isTeleportEntering) return;

        this._isWinSequence = false;
        this._isTeleportEntering = true;

        // Stop game mechanics first, then run entry cinematic.
        GameManager.getInstance().winGame();
        if (this._bgMoving) this._bgMoving.stopScroll();

        const finalizeEntry = () => {
            if (!this._activeTeleport) return;
            this._activeTeleport.active = false;
            if (this.characterNode) this.characterNode.active = false;
            this._isTeleportEntering = false;

            // Slight pause before result screen
            this.scheduleOnce(() => {
                if (this.resultPrefab) {
                    const result = instantiate(this.resultPrefab);
                    this.node.parent?.addChild(result);
                    result.setPosition(Vec3.ZERO);
                } else {
                    console.warn('[TeleportSpawnSystem] resultPrefab not wired');
                }
            }, 0.35);
        };

        if (!this.characterNode) {
            finalizeEntry();
            return;
        }

        const char = this.characterNode;
        const ctrl = char.getComponent('CharacterController') as any;
        if (ctrl && ctrl.getModel) {
            const m = ctrl.getModel();
            m.vx = 0;
            m.vy = 0;
        }

        const target = this._activeTeleport.position.clone();
        const startScale = char.scale.clone();
        tween(char)
            .to(this.enterPortalDuration, {
                position: target,
                scale: new Vec3(startScale.x * 0.15, startScale.y * 0.15, startScale.z)
            }, { easing: 'quadIn' })
            .call(finalizeEntry)
            .start();
    }
}
