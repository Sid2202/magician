import { _decorator, Component, Node } from 'cc';
import { ItemModel } from '../models/ItemModel';
import { ItemView } from '../views/ItemView';
import { ItemType } from '../core/Constants';

const { ccclass } = _decorator;

/**
 * Pair of ItemModel + ItemView, managed by SpawnSystem/PoolingSystem.
 * One component instance per pooled item node.
 */
@ccclass('ItemController')
export class ItemController extends Component {

    private _model: ItemModel = new ItemModel();
    private _view: ItemView   = null;

    onLoad(): void {
        this._view = this.getComponent(ItemView);
    }

    activate(id: number, type: ItemType, x: number, y: number): void {
        this._model.reset(id, type, x, y);
        this._view?.setVisible(true);
        this._view?.setPosition(x, y);
    }

    deactivate(): void {
        this._model.deactivate();
        this._view?.setVisible(false);
    }

    /** Called by MovementSystem to scroll item with the world. */
    scrollX(dx: number): void {
        this._model.x -= dx;
        this._view?.setPosition(this._model.x, this._model.y);
    }

    getModel(): ItemModel { return this._model; }
}
