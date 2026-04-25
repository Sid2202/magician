import { _decorator, Component } from 'cc';
import { CoinModel }            from '../Models/CoinModel';
import { CoinView }             from '../Views/CoinView';
import { PoolKey, PoolingSystem } from '../Systems/PoolingSystem';

const { ccclass } = _decorator;

/**
 * Attach to: PF_Coin root node (same node as CoinView).
 * Binds CoinModel (data) to CoinView (visual).
 * CollisionSystem and SpawnSystem drive this — no self-contained logic.
 */
@ccclass('CoinController')
export class CoinController extends Component {
    readonly model = new CoinModel();
    private _view: CoinView | null = null;

    onLoad(): void {
        this._view = this.getComponent(CoinView);
    }

    /** Called by SpawnSystem when pulling from pool. */
    activate(x: number, y: number): void {
        this.model.reset();
        this.model.x      = x;
        this.model.y      = y;
        this.model.active = true;
        this.node.active  = true;
        this._view?.setPosition(x, y);
    }

    /** Called by CollisionSystem (collected) or SpawnSystem (culled off-screen). */
    deactivate(): void {
        this.model.active = false;
        PoolingSystem.release(PoolKey.Coin, this.node);
    }

    /** Called every frame by SpawnSystem to scroll the coin left with the world. */
    scrollBy(dx: number): void {
        this.model.x -= dx;
        this._view?.setPosition(this.model.x, this.model.y);
    }

    /** World-space X — used by CoinFXSystem before deactivation. */
    get worldX(): number { return this._view?.worldX ?? this.model.x; }
    get worldY(): number { return this._view?.worldY ?? this.model.y; }
}
