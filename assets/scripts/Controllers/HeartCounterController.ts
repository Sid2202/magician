import { _decorator, Component, Node } from 'cc';
import { GameEventsBus } from '../common/event/GlobalEventTarget';
import { GameEvents } from '../gameplay/input/GameEvents';
import { GameManager } from '../Managers/GameManager';
import { ObstacleSpawnSystem } from '../Systems/ObstacleSpawnSystem';

const { ccclass, property } = _decorator;

/**
 * Attach to: PF_HeartCounter root node.
 *
 * Owns the visible heart icons (3 children expected) and the death/respawn flow:
 *   PlayerHit → consume one heart
 *   hearts > 0 → emit PlayerRespawn (CharacterController will reset position & isAlive)
 *   hearts == 0 → restart the session (3 hearts back) and emit PlayerRespawn
 *
 * No scene reload — we just clear the world (obstacles), restore hearts,
 * and let scrolling resume.
 */
@ccclass('HeartCounterController')
export class HeartCounterController extends Component {

    @property maxHearts: number = 3;

    /** Optional explicit wiring; if empty, auto-discovers heart child nodes by index. */
    @property([Node]) heartNodes: Node[] = [];

    /** Wire here so we can clear obstacles on full game restart. */
    @property(ObstacleSpawnSystem) obstacleSpawn: ObstacleSpawnSystem = null;

    private _hearts = 0;

    onLoad(): void {
        // Auto-discover children if not explicitly wired
        if (this.heartNodes.length === 0) {
            for (let i = 0; i < this.node.children.length && this.heartNodes.length < this.maxHearts; i++) {
                this.heartNodes.push(this.node.children[i]);
            }
        }

        this._hearts = this.maxHearts;
        this._refreshIcons();

        const bus = GameEventsBus.get();
        bus.on(GameEvents.PlayerHit, this._onPlayerHit, this);
    }

    onDestroy(): void {
        const bus = GameEventsBus.get();
        bus.off(GameEvents.PlayerHit, this._onPlayerHit, this);
    }

    private _onPlayerHit(): void {
        this._hearts = Math.max(0, this._hearts - 1);
        this._refreshIcons();
        GameEventsBus.get().emit(GameEvents.HeartsChanged, this._hearts);

        if (this._hearts <= 0) {
            // Full restart: clear obstacles, restore session + hearts, then respawn.
            this.obstacleSpawn?.clearAll();
            GameManager.startSession(GameManager.getInstance().state.totalLightPoints || 1);
            this._hearts = this.maxHearts;
            this._refreshIcons();
            GameEventsBus.get().emit(GameEvents.HeartsChanged, this._hearts);
        }

        // Either way, the player respawns and the run continues.
        GameEventsBus.get().emit(GameEvents.PlayerRespawn);
    }

    private _refreshIcons(): void {
        for (let i = 0; i < this.heartNodes.length; i++) {
            const n = this.heartNodes[i];
            if (n) n.active = i < this._hearts;
        }
    }
}
