import { _decorator, Component, Node, Prefab } from 'cc';
import { PoolKey, PoolingSystem }              from './PoolingSystem';
import { CoinController }                      from '../Controllers/CoinController';
import { BgMoving }                            from '../gameplay/BgMoving';

export const enum SpawnPattern { LINE = 'LINE', ZIGZAG = 'ZIGZAG', GRID = 'GRID' }

export interface GridConfig  { cols: number; rows: number; }
export interface SpawnConfig {
    pattern: SpawnPattern;
    originX: number;
    originY: number;
    spacing: number;
    grid?:   GridConfig;
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
    @property         poolWarmupCount: number = 30;
    @property         spawnAheadX:     number = 800;
    @property         cullBehindX:     number = -900;
    @property         cullAheadX:      number = 1200;
    @property         spawnInterval:   number = 3.0;
    @property         patternSpacing:  number = 80;

    readonly activeCoins: CoinController[] = [];

    private _bgMoving: BgMoving | null       = null;
    private _timer     = 0;
    private _cull:    CoinController[]       = [];

    onLoad(): void {
        if (!this.coinPrefab) { console.error('[SpawnSystem] coinPrefab not wired'); return; }
        PoolingSystem.warmup(PoolKey.Coin, this.coinPrefab, this.poolWarmupCount);
        PoolingSystem.warmup(PoolKey.FlyingCoin, this.flyingCoinPrefab, 20);

        if (this.bgMoveNode) {
            this._bgMoving = this.bgMoveNode.getComponent(BgMoving);
        }
        if (!this._bgMoving) console.warn('[SpawnSystem] bgMoveNode not wired — coins will not scroll');
    }

    update(dt: number): void {
        // Coins only scroll when BG is moving — same direction, same speed
        const dirX = this._bgMoving?.getScrollDirX() ?? 0;
        if (dirX !== 0) {
            this._scrollAndCull(dirX, dt);
        }

        // Auto-spawn on timer regardless of movement
        this._timer += dt;
        if (this._timer >= this.spawnInterval) {
            this._timer = 0;
            this.spawnNow(this._randomConfig());
        }
    }

    // ── Public API ────────────────────────────────────────────────────────

    spawnNow(cfg: SpawnConfig): void {
        switch (cfg.pattern) {
            case SpawnPattern.LINE:   this._spawnLine(cfg);   break;
            case SpawnPattern.ZIGZAG: this._spawnZigzag(cfg); break;
            case SpawnPattern.GRID:   this._spawnGrid(cfg);   break;
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

    // ── Internals ─────────────────────────────────────────────────────────

    private _place(x: number, y: number): void {
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
        this._cull.length = 0;

        for (let i = 0, n = this.activeCoins.length; i < n; i++) {
            const c = this.activeCoins[i];
            c.scrollBy(-dx);   // scrollBy subtracts, so pass positive = scroll left
            const x = c.model.x;
            if (x < this.cullBehindX || x > this.cullAheadX) this._cull.push(c);
        }

        for (const c of this._cull) {
            this.removeActive(c);
            c.deactivate();
        }
    }

    private _randomConfig(): SpawnConfig {
        const roll = Math.random();
        let pattern: SpawnPattern;
        let grid: GridConfig | undefined;

        if (roll < 0.33) {
            pattern = SpawnPattern.LINE;
        } else if (roll < 0.66) {
            pattern = SpawnPattern.ZIGZAG;
        } else {
            pattern = SpawnPattern.GRID;
            const shapes: GridConfig[] = [
                { cols: 2, rows: 3 },
                { cols: 3, rows: 3 },
                { cols: 2, rows: 5 },
            ];
            grid = shapes[Math.floor(Math.random() * shapes.length)];
        }

        return {
            pattern,
            originX: this.spawnAheadX,
            originY: randRange(-150, 150),
            spacing: this.patternSpacing,
            grid,
        };
    }
}

function randRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
}
