import { _decorator, Component } from 'cc';
import { NPCModel, NPCRewardType } from '../models/NPCModel';
import { NPCView } from '../views/NPCView';
import { ItemType } from '../core/Constants';

const { ccclass } = _decorator;

/**
 * Pair of NPCModel + NPCView.
 * One component instance per pooled NPC node.
 */
@ccclass('NPCController')
export class NPCController extends Component {

    private _model: NPCModel = new NPCModel();
    private _view: NPCView   = null;

    onLoad(): void {
        this._view = this.getComponent(NPCView);
    }

    activate(id: number, x: number, y: number, wantsItem: ItemType, givesReward: NPCRewardType): void {
        this._model.reset(id, x, y, wantsItem, givesReward);
        this._view?.setVisible(true);
        this._view?.setPosition(x, y);
    }

    deactivate(): void {
        this._model.deactivate();
        this._view?.setVisible(false);
    }

    scrollX(dx: number): void {
        this._model.x -= dx;
        this._view?.setPosition(this._model.x, this._model.y);
    }

    markTraded(): void {
        this._model.traded = true;
        this._view?.playTradeEffect();
    }

    getModel(): NPCModel { return this._model; }
}
