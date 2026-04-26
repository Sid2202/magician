import { _decorator, Component } from 'cc';
import { ShardModel } from '../models/ShardModel';
import { ShardView } from '../Views/ShardView';
import { PoolingSystem, PoolKey } from '../Systems/PoolingSystem';

const { ccclass } = _decorator;

/** Attach to: PF_Shard root node. Mirrors CoinController pattern. */
@ccclass('ShardController')
export class ShardController extends Component {
    readonly model = new ShardModel();
    private _view: ShardView | null = null;

    onLoad(): void {
        this._view = this.getComponent(ShardView);
    }

    activate(index: number, x: number, y: number): void {
        this.model.reset();
        this.model.index  = index;
        this.model.x      = x;
        this.model.y      = y;
        this.model.active = true;

        if (this._view) {
            this.model.halfW = this._view.halfW;
            this.model.halfH = this._view.halfH;
        }

        this.node.active = true;
        this._view?.setPosition(x, y);
    }

    deactivate(): void {
        this.model.active = false;
        PoolingSystem.release(PoolKey.Shard, this.node);
    }

    scrollBy(dx: number): void {
        this.model.x -= dx;
        this._view?.setPosition(this.model.x, this.model.y);
    }
}
