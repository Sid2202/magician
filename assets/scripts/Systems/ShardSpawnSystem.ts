import { _decorator, Component, Node, Prefab } from 'cc';
import { PoolingSystem, PoolKey } from './PoolingSystem';
import { SpawnSystem } from './SpawnSystem';
import { ShardController } from '../Controllers/ShardController';
import { ObstacleSpawnSystem } from './ObstacleSpawnSystem';
import { BgMoving } from '../gameplay/BgMoving';
import { GameEventsBus } from '../common/event/GlobalEventTarget';
import { GameEvents } from '../gameplay/input/GameEvents';
import { GameManager } from '../Managers/GameManager';

const { ccclass, property } = _decorator;

/**
 * Shard placement strategy for the game jam "light up the city" narrative.
 *
 *   Shard 1 "First Spark"  — appears after ~4000 px scrolled  (≈ 20 s at base speed)
 *                            Mid-height, clear of obstacles. Rewards early exploration.
 *
 *   Shard 2 "Ember"        — appears after ~10 000 px scrolled (≈ 45 s)
 *                            Slightly elevated, more obstacles in the area.
 *
 *   Shard 3 "Full Light"   — appears after ~18 000 px scrolled (≈ 75 s)
 *                            Late-game challenge zone. Collecting it triggers GameWon.
 *
 * Each shard appears SPEED_AHEAD px ahead of centre so the player has time to see
 * and navigate toward it before it scrolls past.
 */
@ccclass('ShardSpawnSystem')
export class ShardSpawnSystem extends Component {
    @property(Prefab) shardPrefab:  Prefab = null;
    @property(Node)   bgMoveNode:   Node   = null;
    @property(SpawnSystem) spawnSystem: SpawnSystem = null;
    @property(ObstacleSpawnSystem) obstacleSpawn: ObstacleSpawnSystem = null;

    /** How far ahead of centre to place a shard when its trigger fires. */
    @property spawnAheadX: number = 900;
    /** Padding around shard to avoid coins and obstacles. */
    @property avoidPadding: number = 300;

    /** Distance thresholds (px scrolled) that trigger each shard. */
    @property shard1Distance: number =  4000;
    @property shard2Distance: number = 10000;
    @property shard3Distance: number = 18000;

    /** Y positions for each shard (adjust per scene layout). */
    @property shard1Y: number =    0;
    @property shard2Y: number =  120;
    @property shard3Y: number = -100;

    readonly activeShards: ShardController[] = [];

    private _bgMoving: BgMoving | null = null;
    private _distanceScrolled = 0;
    private _triggered = [false, false, false];  // one per shard

    onLoad(): void {
        if (!this.shardPrefab) {
            console.warn('[ShardSpawnSystem] shardPrefab not wired');
            return;
        }
        PoolingSystem.warmup(PoolKey.Shard, this.shardPrefab, 3);

        if (this.bgMoveNode) {
            this._bgMoving = this.bgMoveNode.getComponent(BgMoving);
        }

        GameEventsBus.get().on(GameEvents.GameStart, this._onGameStart, this);
    }

    onDestroy(): void {
        GameEventsBus.get().off(GameEvents.GameStart, this._onGameStart, this);
    }

    update(dt: number): void {
        if (!GameManager.getInstance()?.state.isPlaying) return;

        const dirX = this._bgMoving?.getScrollDirX() ?? 0;
        if (dirX === 0) return;

        const speed = this._bgMoving?.speed ?? 200;
        this._distanceScrolled += speed * dt;

        // Scroll active shards with the world
        const dx = dirX * speed * dt;
        const cull: ShardController[] = [];
        for (const s of this.activeShards) {
            s.scrollBy(-dx);
            if (s.model.x < -1200) cull.push(s);
        }
        for (const s of cull) {
            this._remove(s);
            s.deactivate();
        }

        // Trigger shards by distance
        const thresholds = [this.shard1Distance, this.shard2Distance, this.shard3Distance];
        const yPositions  = [this.shard1Y, this.shard2Y, this.shard3Y];
        for (let i = 0; i < 3; i++) {
            if (!this._triggered[i] && this._distanceScrolled >= thresholds[i]) {
                // Only mark as triggered if we can successfully spawn (no obstruction)
                if (!this._isAreaBlocked(this.spawnAheadX, yPositions[i])) {
                    this._triggered[i] = true;
                    this._spawnShard(i + 1, this.spawnAheadX, yPositions[i]);
                }
            }
        }
    }

    removeShard(ctrl: ShardController): void {
        this._remove(ctrl);
    }

    private _isAreaBlocked(x: number, y: number): boolean {
        const pad = this.avoidPadding;

        // Use model.x/y — same local space as spawnAheadX. worldPosition would mismatch.
        if (this.spawnSystem) {
            for (const coin of this.spawnSystem.activeCoins) {
                if (!coin.model.active) continue;
                if (Math.abs(x - coin.model.x) < coin.model.halfW + pad &&
                    Math.abs(y - coin.model.y) < coin.model.halfH + pad) {
                    return true;
                }
            }
        }

        if (this.obstacleSpawn) {
            for (const obs of this.obstacleSpawn.activeObstacles) {
                if (!obs.model.active) continue;
                if (Math.abs(x - obs.model.x) < obs.model.halfW + pad &&
                    Math.abs(y - obs.model.y) < obs.model.halfH + pad) {
                    return true;
                }
            }
        }

        return false;
    }

    private _spawnShard(index: number, x: number, y: number): void {
        const node = PoolingSystem.get(PoolKey.Shard);
        if (!node) return;
        this.node.addChild(node);
        const ctrl = node.getComponent(ShardController);
        if (!ctrl) { PoolingSystem.release(PoolKey.Shard, node); return; }
        ctrl.activate(index, x, y);
        this.activeShards.push(ctrl);
    }

    private _remove(s: ShardController): void {
        const i = this.activeShards.indexOf(s);
        if (i !== -1) this.activeShards.splice(i, 1);
    }

    private _onGameStart(): void {
        // Full restart — clear any leftover shards and reset distance tracking
        for (const s of this.activeShards) s.deactivate();
        this.activeShards.length = 0;
        this._distanceScrolled = 0;
        this._triggered.fill(false);
    }
}
