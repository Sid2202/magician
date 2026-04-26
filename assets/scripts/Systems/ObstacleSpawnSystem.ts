import { _decorator, Component, Node, Prefab } from 'cc';
import { PoolingSystem } from './PoolingSystem';
import { ObstacleController } from '../Controllers/ObstacleController';
import { ObstacleType } from '../models/ObstacleModel';
import { BgMoving } from '../gameplay/BgMoving';
import { SpawnSystem } from './SpawnSystem';
import {
    ObstacleFactory, ObstacleGroup, ObstacleKind, ObstacleAnchor,
    OBSTACLE_POOL_KEYS,
} from './ObstacleFactory';

const { ccclass, property } = _decorator;

/**
 * Attach to: GameScene prefab root (sibling of SpawnSystem).
 *
 * - Builds groups via ObstacleFactory and places each piece from its own pool.
 * - Vertical placement is anchor-driven: Ground → just above Collider_Bottom,
 *   Ceiling → just below Collider_Top, AirLow → mid-low band.
 * - Rejects placements that overlap any active coin.
 * - Exposes isAreaBlocked() so the coin spawner can avoid placing coins on
 *   obstacles that already exist further ahead in the world.
 */
@ccclass('ObstacleSpawnSystem')
export class ObstacleSpawnSystem extends Component {
    // ── Prefab refs ──────────────────────────────────────────────────────
    @property(Prefab) ghostPrefab:   Prefab = null;
    @property(Prefab) barrelPrefab:  Prefab = null;
    @property(Prefab) plantPrefab:   Prefab = null;
    @property(Prefab) rockPrefab:    Prefab = null;
    @property(Prefab) spiderPrefab:  Prefab = null;
    @property(Prefab) vine01Prefab:  Prefab = null;
    @property(Prefab) vine02Prefab:  Prefab = null;
    @property(Prefab) vine03Prefab:  Prefab = null;

    @property(Node)         bgMoveNode:     Node = null;
    @property(SpawnSystem)  spawnSystem:    SpawnSystem = null;

    /** Drag Collider_Top here (root-level node, same as CharacterController uses). */
    @property(Node) colliderTop:    Node = null;
    /** Drag Collider_Bottom here. */
    @property(Node) colliderBottom: Node = null;

    @property poolWarmupCount: number = 6;
    @property visibleWidth:    number = 1920;
    @property bufferAhead:     number = 1200;
    @property cullBehindX:     number = -1200;
    @property cullAheadX:      number = 4000;

    // Spread groups much farther apart — game was too dense.
    @property groupBaseSpacing:    number = 2200; // Significantly more horizontal gap
    @property groupSpacingVariance: number = 1000;

    /** Pixels of padding required between any obstacle and any coin. */
    @property coinAvoidPadding: number = 60;

    // ── Vertical insets from the colliders, per anchor ────────────────────
    /** Distance above Collider_Bottom where a ground obstacle's CENTER sits. */
    @property groundInset:  number = 80;
    /** Distance below Collider_Top where a ceiling obstacle's CENTER sits. */
    @property ceilingInset: number = 80;
    /** Air-low obstacles sit this far above ground inset. */
    @property airLowExtra:  number = 110;

    // Fallback Y range when colliders are not wired.
    @property fallbackTopY:    number =  300;
    @property fallbackBottomY: number = -300;

    private _bgMoving: BgMoving | null = null;
    private readonly _active: ObstacleController[] = [];
    private readonly _cull:   ObstacleController[] = [];
    private _highestSpawnX = -Infinity;

    private _ghostActive = false;

    onLoad(): void {
        this._warmup();
        if (this.bgMoveNode) this._bgMoving = this.bgMoveNode.getComponent(BgMoving);
        if (!this._bgMoving) console.warn('[ObstacleSpawnSystem] bgMoveNode not wired — obstacles will not scroll');
        if (!this.spawnSystem) console.warn('[ObstacleSpawnSystem] spawnSystem not wired — obstacles may overlap coins');
    }

    start(): void {
        this._fillAhead();
    }

    update(dt: number): void {
        const dirX = this._bgMoving?.getScrollDirX() ?? 0;
        if (dirX !== 0) {
            this._scrollAndCull(dirX, dt);
            this._fillAhead();
        }
        for (let i = 0; i < this._active.length; i++) this._active[i].tick(dt);
    }

    /** Called by HeartCounter on full restart so old obstacles vanish with the world reset. */
    clearAll(): void {
        for (const o of this._active) o.deactivate();
        this._active.length = 0;
        this._highestSpawnX = -Infinity;
        this._ghostActive = false;
    }

    /**
     * Returns true if (x, y) AABB intersects any active obstacle (with optional padding).
     * Used by SpawnSystem so coins never land on top of an obstacle.
     */
    isAreaBlocked(x: number, y: number, halfW: number, halfH: number, padding: number = 0): boolean {
        const pad = padding;
        for (let i = 0; i < this._active.length; i++) {
            const o = this._active[i];
            if (!o.model.active) continue;
            const dx = Math.abs(o.model.x - x);
            const dy = Math.abs(o.model.y - y);
            if (dx < o.model.halfW + halfW + pad && dy < o.model.halfH + halfH + pad) {
                return true;
            }
        }
        return false;
    }

    // ── Internals ─────────────────────────────────────────────────────────

    private _warmup(): void {
        const pairs: [string, Prefab | null][] = [
            [OBSTACLE_POOL_KEYS[ObstacleType.Ghost],   this.ghostPrefab],
            [OBSTACLE_POOL_KEYS[ObstacleType.Barrel],  this.barrelPrefab],
            [OBSTACLE_POOL_KEYS[ObstacleType.Plant],   this.plantPrefab],
            [OBSTACLE_POOL_KEYS[ObstacleType.Rock],    this.rockPrefab],
            [OBSTACLE_POOL_KEYS[ObstacleType.Spider],  this.spiderPrefab],
            [OBSTACLE_POOL_KEYS[ObstacleType.Vine_01], this.vine01Prefab],
            [OBSTACLE_POOL_KEYS[ObstacleType.Vine_02], this.vine02Prefab],
            [OBSTACLE_POOL_KEYS[ObstacleType.Vine_03], this.vine03Prefab],
        ];
        for (const [key, prefab] of pairs) {
            if (!prefab) {
                console.warn(`[ObstacleSpawnSystem] prefab for "${key}" not wired — that type will be skipped`);
                continue;
            }
            PoolingSystem.warmup(key, prefab, this.poolWarmupCount);
        }
    }

    private _scrollAndCull(dirX: number, dt: number): void {
        const speed = this._bgMoving!.speed;
        const dx = dirX * speed * dt;

        if (this._highestSpawnX !== -Infinity) this._highestSpawnX += dx;

        this._cull.length = 0;

        const screenLeftX = -this.visibleWidth * 0.5;
        const cullLeftX = screenLeftX + this.cullBehindX;
        const cullRightX = this.visibleWidth + this.bufferAhead + 2000;

        for (let i = 0, n = this._active.length; i < n; i++) {
            const o = this._active[i];
            o.scrollBy(-dx);
            const x = o.model.x;
            if (x < cullLeftX || x > cullRightX) this._cull.push(o);
        }

        for (const o of this._cull) {
            this._removeActive(o);
            if (o.model.type === ObstacleType.Ghost) this._ghostActive = false;
            o.deactivate();
        }
    }

    private _fillAhead(): void {
        const coverageEndX = this.visibleWidth + this.bufferAhead;

        let furthestX = Math.max(this._getFurthestX(), this._highestSpawnX);
        if (furthestX === -Infinity || furthestX < -this.visibleWidth * 0.5) furthestX = 0;

        let safety = 12;
        while (furthestX < coverageEndX && safety-- > 0) {
            const groupSpacing = this.groupBaseSpacing + Math.random() * this.groupSpacingVariance;
            const originX = furthestX + groupSpacing;

            const excluded = new Set<ObstacleKind>();
            if (this._ghostActive) excluded.add(ObstacleKind.Ghost);

            const group = ObstacleFactory.buildRandomExcluding(excluded);
            if (!group) { furthestX = originX; continue; }

            const originY = this._anchorY(group.anchor);

            if (this._wouldOverlapCoins(originX, originY, group)) {
                // Skip this slot and try further along.
                furthestX = originX;
                continue;
            }

            this._placeGroup(originX, originY, group);
            furthestX = originX + group.width;
            this._highestSpawnX = furthestX;
        }
    }

    private _anchorY(anchor: ObstacleAnchor): number {
        const topY    = this.colliderTop    ? (this.colliderTop    as any).position.y : this.fallbackTopY;
        const bottomY = this.colliderBottom ? (this.colliderBottom as any).position.y : this.fallbackBottomY;

        switch (anchor) {
            case ObstacleAnchor.Ground:  return bottomY + this.groundInset;
            case ObstacleAnchor.Ceiling: return topY    - this.ceilingInset;
            case ObstacleAnchor.AirLow:  return bottomY + this.groundInset + this.airLowExtra;
        }
    }

    private _placeGroup(originX: number, originY: number, group: ObstacleGroup): void {
        for (const p of group.placements) {
            const key = OBSTACLE_POOL_KEYS[p.type];
            const node = PoolingSystem.get(key);
            if (!node) continue;
            this.node.addChild(node);
            const ctrl = node.getComponent(ObstacleController);
            if (!ctrl) { PoolingSystem.release(key, node); continue; }
            ctrl.activate(p.type, originX + p.dx, originY + p.dy, key);
            this._active.push(ctrl);
            if (p.type === ObstacleType.Ghost) this._ghostActive = true;
        }
    }

    private _wouldOverlapCoins(originX: number, originY: number, group: ObstacleGroup): boolean {
        const coins = this.spawnSystem?.activeCoins;
        if (!coins || coins.length === 0) return false;

        const pad = this.coinAvoidPadding;
        for (const p of group.placements) {
            const ohw = 60, ohh = 60;
            const ox = originX + p.dx;
            const oy = originY + p.dy;
            for (let i = 0; i < coins.length; i++) {
                const c = coins[i];
                if (!c.model.active) continue;
                const dx = Math.abs(c.model.x - ox);
                const dy = Math.abs(c.model.y - oy);
                if (dx < ohw + c.model.halfW + pad && dy < ohh + c.model.halfH + pad) {
                    return true;
                }
            }
        }
        return false;
    }

    private _getFurthestX(): number {
        let m = -Infinity;
        for (const o of this._active) if (o.model.x > m) m = o.model.x;
        return m;
    }

    private _removeActive(o: ObstacleController): void {
        const i = this._active.indexOf(o);
        if (i !== -1) this._active.splice(i, 1);
    }

    /** Read-only accessor for CollisionSystem. */
    get activeObstacles(): ReadonlyArray<ObstacleController> { return this._active; }
}
