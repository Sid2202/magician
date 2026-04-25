import { EventBus } from '../core/EventBus';
import { GameEvent, CollisionConstants } from '../core/Constants';
import { PlayerModel } from '../models/PlayerModel';
import { ItemModel } from '../models/ItemModel';
import { NPCModel } from '../models/NPCModel';

/**
 * AABB-based collision detection. Centralized — runs once per frame.
 * Emits events rather than calling handlers directly.
 */
export class CollisionSystem {

    checkPlayerVsItems(player: PlayerModel, items: ItemModel[]): void {
        const pw = CollisionConstants.PLAYER_HALF_W;
        const ph = CollisionConstants.PLAYER_HALF_H;
        const iw = CollisionConstants.ITEM_HALF_W;
        const ih = CollisionConstants.ITEM_HALF_H;

        for (const item of items) {
            if (!item.active) continue;
            if (this._aabb(player.x, player.y, pw, ph, item.x, item.y, iw, ih)) {
                item.deactivate();
                EventBus.get().emit(GameEvent.ITEM_COLLECTED, item.type);
            }
        }
    }

    checkPlayerVsNPCs(player: PlayerModel, npcs: NPCModel[]): void {
        const pw = CollisionConstants.PLAYER_HALF_W;
        const ph = CollisionConstants.PLAYER_HALF_H;
        const nw = CollisionConstants.NPC_HALF_W;
        const nh = CollisionConstants.NPC_HALF_H;

        for (const npc of npcs) {
            if (!npc.active || npc.traded) continue;
            if (this._aabb(player.x, player.y, pw, ph, npc.x, npc.y, nw, nh)) {
                EventBus.get().emit(GameEvent.NPC_INTERACT, npc);
            }
        }
    }

    /** Returns true when two AABB rectangles overlap. No allocation. */
    private _aabb(
        ax: number, ay: number, ahw: number, ahh: number,
        bx: number, by: number, bhw: number, bhh: number,
    ): boolean {
        return Math.abs(ax - bx) < ahw + bhw && Math.abs(ay - by) < ahh + bhh;
    }
}
