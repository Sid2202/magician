import { _decorator, Component } from 'cc';
import { ObstacleModel, ObstacleType } from '../Models/ObstacleModel';
import { ObstacleView } from '../Views/ObstacleView';
import { PoolingSystem } from '../Systems/PoolingSystem';

const { ccclass } = _decorator;

/**
 * Optional per-obstacle behavior — drives idle animations or movement patterns.
 * Implementations are stateless; mutate model.x/y/state directly.
 * Plug in via ObstacleController.setBehavior(...) at activation time.
 */
export interface ObstacleBehavior {
    onActivate?(model: ObstacleModel): void;
    update(model: ObstacleModel, dt: number): void;
}

/**
 * Attach to: every PF_Obstacles_* root node.
 * Mirrors CoinController pattern (model + view + pool release).
 */
@ccclass('ObstacleController')
export class ObstacleController extends Component {
    readonly model = new ObstacleModel();

    private _view: ObstacleView | null = null;
    private _behavior: ObstacleBehavior | null = null;
    /** Pool key this controller was borrowed under — set by spawner so we release back into the right pool. */
    private _poolKey = '';

    onLoad(): void {
        this._view = this.getComponent(ObstacleView);
    }

    activate(type: ObstacleType, x: number, y: number, poolKey: string): void {
        this.model.reset();
        this.model.type = type;
        this.model.x = x;
        this.model.y = y;
        this.model.active = true;
        this._poolKey = poolKey;

        // Use view-derived bounds when available so collision matches sprite size.
        if (this._view) {
            this.model.halfW = this._view.halfW;
            this.model.halfH = this._view.halfH;
        }

        this.node.active = true;
        this._view?.setPosition(x, y);
        this._behavior?.onActivate?.(this.model);
    }

    deactivate(): void {
        this.model.active = false;
        this._behavior = null;
        PoolingSystem.releaseByName(this._poolKey, this.node);
    }

    setBehavior(b: ObstacleBehavior | null): void {
        this._behavior = b;
    }

    /** Called every frame by ObstacleSpawnSystem. */
    tick(dt: number): void {
        if (this._behavior) this._behavior.update(this.model, dt);
    }

    /** Scroll with the world; mirrors CoinController.scrollBy. */
    scrollBy(dx: number): void {
        this.model.x -= dx;
        this._view?.setPosition(this.model.x, this.model.y);
    }
}
