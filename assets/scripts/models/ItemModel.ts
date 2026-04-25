import { ItemType } from '../core/Constants';

/** Pure data — no Cocos imports. */
export class ItemModel {
    id: number = 0;
    type: ItemType = ItemType.SHARD;
    x: number = 0;
    y: number = 0;
    active: boolean = false;

    reset(id: number, type: ItemType, x: number, y: number): void {
        this.id = id;
        this.type = type;
        this.x = x;
        this.y = y;
        this.active = true;
    }

    deactivate(): void {
        this.active = false;
    }
}
