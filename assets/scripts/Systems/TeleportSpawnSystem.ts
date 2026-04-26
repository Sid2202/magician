import { _decorator, Component, Node, Prefab, instantiate, Vec3 } from 'cc';
import { GameEventsBus } from '../common/event/GlobalEventTarget';
import { GameEvents } from '../gameplay/input/GameEvents';
import { BgMoving } from '../gameplay/BgMoving';
import { GameManager } from '../Managers/GameManager';
import { TeleportController } from '../Controllers/TeleportController';
import { ResultController } from '../Controllers/ResultController';

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

    private _bgMoving: BgMoving | null = null;
    private _activeTeleport: Node | null = null;
    private _teleportCtrl: TeleportController | null = null;
    private _isWinSequence: boolean = false;
    private _targetCharacterPos: Vec3 = new Vec3();

    public static instance: TeleportSpawnSystem = null;

    public get activeTeleport(): Node | null {
        return this._activeTeleport;
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
                    const dir = new Vec3();
                    Vec3.subtract(dir, target, current);
                    dir.normalize();
                    const moveSpeed = 400; // pixels per second
                    const nextPos = current.clone().add(dir.multiplyScalar(moveSpeed * dt));
                    
                    // Sync with CharacterController's model so it doesn't overwrite position
                    const ctrl = char.getComponent('CharacterController') as any;
                    if (ctrl && ctrl.getModel) {
                        const m = ctrl.getModel();
                        m.x = nextPos.x;
                        m.y = nextPos.y;
                    } else {
                        char.setPosition(nextPos);
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

        // Spawn it stationary at a fixed position
        this._activeTeleport.setPosition(new Vec3(this.spawnAheadX, 0, 0));
        this._teleportCtrl = this._activeTeleport.getComponent(TeleportController);
        
        this._isWinSequence = true;
        console.log('[TeleportSpawnSystem] Starting win sequence. Portal at x=' + this.spawnAheadX);
    }

    private _onGameStart(): void {
        this._isWinSequence = false;
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
        if (!this._activeTeleport) return;

        // Visual feedback
        this._activeTeleport.active = false;
        if (this.characterNode) this.characterNode.active = false;

        // Stop game mechanics
        GameManager.getInstance().winGame();
        if (this._bgMoving) this._bgMoving.stopScroll();

        // Slight pause before result screen
        this.scheduleOnce(() => {
            if (this.resultPrefab) {
                const result = instantiate(this.resultPrefab);
                this.node.parent?.addChild(result);
                result.setPosition(Vec3.ZERO);
            } else {
                console.warn('[TeleportSpawnSystem] resultPrefab not wired');
            }
        }, 0.5);
    }
}
