import { _decorator, Component, Node } from 'cc';
import { EventBus } from '../core/EventBus';
import { GameEvent, ItemType } from '../core/Constants';
import { InventoryModel } from '../models/InventoryModel';
import { LightPointView } from '../views/LightPointView';
import { LightPointModel } from '../models/LightPointModel';
import { GameManager } from '../core/GameManager';

const { ccclass, property } = _decorator;

/**
 * Top-level scene controller.
 * Bridges inventory, light points, and cross-system events.
 */
@ccclass('GameController')
export class GameController extends Component {

    @property([Node]) lightPointNodes: Node[] = [];

    private _inventory: InventoryModel = new InventoryModel();
    private _lightModels: LightPointModel[] = [];
    private _lightViews: LightPointView[] = [];

    onLoad(): void {
        this._initLightPoints();
        this._subscribeEvents();
    }

    onDestroy(): void {
        const bus = EventBus.get();
        bus.off(GameEvent.ITEM_COLLECTED, this._onItemCollected, this);
        bus.off(GameEvent.ITEM_CONSUMED,  this._onItemConsumed, this);
        bus.off(GameEvent.TRADE_SUCCESS,  this._onTradeSuccess, this);
    }

    getInventory(): InventoryModel { return this._inventory; }

    private _initLightPoints(): void {
        const gm = GameManager.getInstance();
        for (let i = 0; i < this.lightPointNodes.length; i++) {
            const model = new LightPointModel();
            model.reset(i, 0, 0);
            this._lightModels.push(model);

            const view = this.lightPointNodes[i].getComponent(LightPointView);
            this._lightViews.push(view);
        }
        if (gm) {
            gm.state.totalLightPoints = this._lightModels.length;
        }
    }

    private _subscribeEvents(): void {
        const bus = EventBus.get();
        bus.on(GameEvent.ITEM_COLLECTED, this._onItemCollected, this);
        bus.on(GameEvent.ITEM_CONSUMED,  this._onItemConsumed, this);
        bus.on(GameEvent.TRADE_SUCCESS,  this._onTradeSuccess, this);
    }

    private _onItemCollected(type: ItemType): void {
        this._inventory.addItem(type);
        // Attempt shard-based light activation after each shard collect
        if (type === ItemType.SHARD) {
            this._tryActivateLightPoints();
        }
    }

    private _onItemConsumed(type: ItemType): void {
        this._inventory.consumeItem(type);
    }

    private _onTradeSuccess(rewardType: string): void {
        this._tryActivateLightPointsByTrade(rewardType);
    }

    private _tryActivateLightPoints(): void {
        const shards = this._inventory.getCount(ItemType.SHARD);
        for (const model of this._lightModels) {
            if (!model.restored && model.canActivateWithShards(shards)) {
                this._activateLightPoint(model);
            }
        }
    }

    private _tryActivateLightPointsByTrade(rewardType: string): void {
        for (const model of this._lightModels) {
            if (!model.restored && model.canActivateWithTrade(rewardType)) {
                this._activateLightPoint(model);
            }
        }
    }

    private _activateLightPoint(model: LightPointModel): void {
        model.restored = true;
        const view = this._lightViews[model.id];
        view?.playRestoreEffect();
        view?.setRestored(true);

        const gm = GameManager.getInstance();
        if (gm) {
            gm.lightSystem.onLightPointRestored(gm.state);
        }
    }
}
