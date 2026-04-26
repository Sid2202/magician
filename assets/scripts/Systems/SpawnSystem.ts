import { _decorator, Component, Node, Prefab } from 'cc';
import { PoolKey, PoolingSystem }              from './PoolingSystem';
import { CoinController }                      from '../Controllers/CoinController';
import { BgMoving }                            from '../gameplay/BgMoving';
import { ObstacleSpawnSystem }                 from './ObstacleSpawnSystem';
import { ShardSpawnSystem }                    from './ShardSpawnSystem';

export const enum SpawnPattern { LINE = 'LINE', ZIGZAG = 'ZIGZAG', GRID = 'GRID', SINE = 'SINE', ARC = 'ARC' }

export interface GridConfig  { cols: number; rows: number; }
export interface SpawnConfig {
    pattern: SpawnPattern;
    originX: number;
    originY: number;
    spacing: number;
    grid?:   GridConfig;
    isUpArc?: boolean;
    count?: number;
    ignoreObstacles?: boolean;
    arcHeight?: number;
}

const { ccclass, property } = _decorator;

/**
 * Attach to: GameScene prefab root (same level as PF_Character).
 *
 * Coins only scroll when BgMoving is scrolling — they appear fixed in the world.
 * Scroll direction and speed mirror BgMoving exactly so coins stay locked to the BG.
 *
 * Inspector wiring:
 *   coinPrefab  → PF_Coin prefab
 *   bgMoveNode  → the BgMove node (has BgMoving component)
 */
@ccclass('SpawnSystem')
export class SpawnSystem extends Component {
    @property(Prefab) coinPrefab:      Prefab = null;
    @property(Prefab) flyingCoinPrefab: Prefab = null;
    @property(Node)   bgMoveNode:      Node   = null;   // ← wire BgMove node here
    /** Optional — when wired, coins won't spawn on top of active obstacles. */
    @property(ObstacleSpawnSystem) obstacleSpawn: ObstacleSpawnSystem = null;
    /** Padding around obstacles when avoiding them with coins. */
    @property coinObstacleAvoidPadding: number = 150;
    @property         poolWarmupCount: number = 30;
    @property         visibleWidth:    number = 1920;
    @property         bufferAhead:     number = 900;
    @property         groupBaseSpacing:    number = 800; // More horizontal air between coin patterns
    @property         groupSpacingVariance: number = 500;
    @property         cullBehindX:     number = -900;
    @property         cullAheadX:      number = 1200;
    @property         patternSpacing:  number = 80;

    readonly activeCoins: CoinController[] = [];

    private _bgMoving: BgMoving | null       = null;
    private _cull:    CoinController[]       = [];
    private _highestSpawnX: number = -Infinity;

    public static instance: SpawnSystem = null;

    onLoad(): void {
        SpawnSystem.instance = this;
        if (!this.coinPrefab) { console.error('[SpawnSystem] coinPrefab not wired'); return; }
        PoolingSystem.warmup(PoolKey.Coin, this.coinPrefab, this.poolWarmupCount);
        PoolingSystem.warmup(PoolKey.FlyingCoin, this.flyingCoinPrefab, 20);

        if (this.bgMoveNode) {
            this._bgMoving = this.bgMoveNode.getComponent(BgMoving);
        }
        if (!this._bgMoving) console.warn('[SpawnSystem] bgMoveNode not wired — coins will not scroll');
    }

    start(): void {
        this._fillAhead();
    }

    update(dt: number): void {
        // Only advance world fill while the Bg is actually moving.
        const dirX = this._bgMoving?.getScrollDirX() ?? 0;
        if (dirX !== 0) {
            this._scrollAndCull(dirX, dt);
            this._fillAhead();
        }
    }

    // ── Public API ────────────────────────────────────────────────────────

    spawnNow(cfg: SpawnConfig): void {
        switch (cfg.pattern) {
            case SpawnPattern.LINE:   this._spawnLine(cfg);   break;
            case SpawnPattern.ZIGZAG: this._spawnZigzag(cfg); break;
            case SpawnPattern.GRID:   this._spawnGrid(cfg);   break;
            case SpawnPattern.SINE:   this._spawnSine(cfg);   break;
            case SpawnPattern.ARC:    this._spawnArc(cfg);    break;
        }
    }

    removeActive(ctrl: CoinController): void {
        const i = this.activeCoins.indexOf(ctrl);
        if (i !== -1) this.activeCoins.splice(i, 1);
    }

    // ── Pattern builders ──────────────────────────────────────────────────

    private _spawnLine(cfg: SpawnConfig): void {
        for (let i = 0; i < 6; i++) this._place(cfg.originX + i * cfg.spacing, cfg.originY);
    }

    private _spawnZigzag(cfg: SpawnConfig): void {
        const amp = 90;
        for (let i = 0; i < 7; i++) {
            this._place(cfg.originX + i * cfg.spacing, cfg.originY + (i % 2 === 0 ? amp : -amp));
        }
    }

    private _spawnGrid(cfg: SpawnConfig): void {
        const { cols, rows } = cfg.grid ?? { cols: 3, rows: 3 };
        const hGap = cfg.spacing * 1.4;
        const vGap = cfg.spacing * 1.2;
        const halfH = (rows - 1) * vGap * 0.5;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                this._place(cfg.originX + c * hGap, cfg.originY + r * vGap - halfH);
            }
        }
    }

    private _spawnSine(cfg: SpawnConfig): void {
        const amp = 120;
        const count = 10;
        const period = Math.PI * 2;
        const spacingX = cfg.spacing * 1.5; // wider spread for smoother curves
        for (let i = 0; i < count; i++) {
            const angle = (i / (count - 1)) * period;
            this._place(cfg.originX + i * spacingX, cfg.originY + Math.sin(angle) * amp);
        }
    }

    private _spawnArc(cfg: SpawnConfig): void {
        const count = cfg.count ?? 8;
        const height = cfg.arcHeight ?? 150;
        const isUp = cfg.isUpArc ?? (Math.random() > 0.5);
        const spacingX = cfg.spacing * 1.5; // wider spread for smoother curves
        for (let i = 0; i < count; i++) {
            const t = (i / (count - 1)) * 2 - 1;
            const yOffset = (1 - t * t) * height;
            this._place(cfg.originX + i * spacingX, cfg.originY + (isUp ? yOffset : -yOffset), cfg.ignoreObstacles);
        }
    }

    // ── Internals ─────────────────────────────────────────────────────────

    private _place(x: number, y: number, ignoreObstacles: boolean = false): void {
        // Skip placement if it would land on an obstacle — leaves a natural gap in the pattern.
        const obsSys = this.obstacleSpawn || ObstacleSpawnSystem.instance;
        if (!ignoreObstacles && obsSys && obsSys.isAreaBlocked(x, y, 24, 24, this.coinObstacleAvoidPadding)) {
            return;
        }

        // Avoid shards distantly
        if (ShardSpawnSystem.instance) {
            const shards = ShardSpawnSystem.instance.activeShards;
            for (let i = 0; i < shards.length; i++) {
                const s = shards[i];
                if (!s.model.active) continue;
                if (Math.abs(s.model.x - x) < s.model.halfW + 24 + 800) {
                    return; // Skip coin to create gap for shard
                }
            }
        }

        const node = PoolingSystem.get(PoolKey.Coin);
        if (!node) return;
        this.node.addChild(node);
        const ctrl = node.getComponent(CoinController);
        if (!ctrl) { PoolingSystem.release(PoolKey.Coin, node); return; }
        ctrl.activate(x, y);
        this.activeCoins.push(ctrl);
    }

    private _scrollAndCull(dirX: number, dt: number): void {
        const speed = this._bgMoving!.speed;
        // Coins move in the SAME direction as the BG tiles (dirX * speed)
        const dx = dirX * speed * dt;

        if (this._highestSpawnX !== -Infinity) {
            this._highestSpawnX += dx;
        }

        this._cull.length = 0;

        const screenLeftX = -this.visibleWidth * 0.5;
        const safeCullMargin = 200;
        const cullLeftX = screenLeftX - safeCullMargin;
        // Make sure we do not cull coins we just spawned!
        const dynamicCullAheadX = Math.max(this.cullAheadX, this.visibleWidth + this.bufferAhead + 2000);

        for (let i = 0, n = this.activeCoins.length; i < n; i++) {
            const c = this.activeCoins[i];
            c.scrollBy(-dx);   // scrollBy subtracts, so pass positive = scroll left
            const x = c.model.x;
            if (x < cullLeftX || x > dynamicCullAheadX) this._cull.push(c);
        }

        for (const c of this._cull) {
            this.removeActive(c);
            c.deactivate();
        }
    }

    private _fillAhead(): void {
        const coverageStartX = -this.visibleWidth * 0.5;
        const coverageEndX = this.visibleWidth + this.bufferAhead;
        
        let furthestX = Math.max(this._getFurthestCoinX(), this._highestSpawnX);
        if (furthestX === -Infinity || furthestX < coverageStartX) {
            furthestX = 0;
        }

        while (furthestX < coverageEndX) {
            const cfg = this._randomConfig();
            // Increase base spacing between coin groups
            const groupSpacing = Math.max(400, this.groupBaseSpacing * 1.5) + Math.random() * this.groupSpacingVariance;
            cfg.originX = furthestX + groupSpacing;
            const oldFurthest = furthestX;
            this.spawnNow(cfg);
            const newFurthest = this._getFurthestCoinX();
            // ensure we always advance even if pool was exhausted
            furthestX = Math.max(newFurthest, oldFurthest + groupSpacing);
            this._highestSpawnX = furthestX;
        }
    }

    private _getFurthestCoinX(): number {
        if (this.activeCoins.length === 0) {
            return -Infinity;
        }

        let maxX = -Infinity;
        for (const coin of this.activeCoins) {
            maxX = Math.max(maxX, coin.model.x);
        }
        return maxX;
    }

    private _randomConfig(): SpawnConfig {
        const roll = Math.random();
        let pattern: SpawnPattern;
        let grid: GridConfig | undefined;

        if (roll < 0.2) {
            pattern = SpawnPattern.LINE;
        } else if (roll < 0.4) {
            pattern = SpawnPattern.ZIGZAG;
        } else if (roll < 0.6) {
            pattern = SpawnPattern.SINE;
        } else if (roll < 0.8) {
            pattern = SpawnPattern.ARC;
        } else {
            pattern = SpawnPattern.GRID;
            const shapes: GridConfig[] = [
                { cols: 2, rows: 2 },
                { cols: 3, rows: 2 },
                { cols: 2, rows: 3 },
            ];
            grid = shapes[Math.floor(Math.random() * shapes.length)];
        }

        return {
            pattern,
            originX: 0,
            originY: randRange(-120, 120),
            spacing: Math.max(80, this.patternSpacing)
        };
    }
}

function randRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
}