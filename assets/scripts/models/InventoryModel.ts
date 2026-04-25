import { ItemType } from '../core/Constants';

/** Pure data — no Cocos imports. */
export class InventoryModel {
    private _counts: Map<ItemType, number> = new Map([
        [ItemType.SHARD, 0],
        [ItemType.FOOD,  0],
        [ItemType.TOOL,  0],
    ]);

    addItem(type: ItemType): void {
        this._counts.set(type, (this._counts.get(type) ?? 0) + 1);
    }

    consumeItem(type: ItemType): boolean {
        const count = this._counts.get(type) ?? 0;
        if (count <= 0) return false;
        this._counts.set(type, count - 1);
        return true;
    }

    hasItem(type: ItemType): boolean {
        return (this._counts.get(type) ?? 0) > 0;
    }

    getCount(type: ItemType): number {
        return this._counts.get(type) ?? 0;
    }

    reset(): void {
        this._counts.set(ItemType.SHARD, 0);
        this._counts.set(ItemType.FOOD,  0);
        this._counts.set(ItemType.TOOL,  0);
    }
}
