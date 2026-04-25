import { EventBus } from '../core/EventBus';
import { GameEvent } from '../core/Constants';
import { NPCModel } from '../models/NPCModel';
import { InventoryModel } from '../models/InventoryModel';

/**
 * Handles NPC trade logic. Pure system — no Cocos, no node refs.
 * Triggered by NPC_INTERACT event; emits TRADE_SUCCESS or no-op.
 */
export class TradeSystem {

    private _inventory: InventoryModel = null;

    init(inventory: InventoryModel): void {
        this._inventory = inventory;
        EventBus.get().on(GameEvent.NPC_INTERACT, this._onNPCInteract, this);
    }

    destroy(): void {
        EventBus.get().off(GameEvent.NPC_INTERACT, this._onNPCInteract, this);
    }

    private _onNPCInteract(npc: NPCModel): void {
        if (npc.traded) return;
        if (!this._inventory.hasItem(npc.wantsItem)) return;

        this._inventory.consumeItem(npc.wantsItem);
        EventBus.get().emit(GameEvent.ITEM_CONSUMED, npc.wantsItem);

        npc.traded = true;
        EventBus.get().emit(GameEvent.TRADE_SUCCESS, npc.givesReward);
    }
}
