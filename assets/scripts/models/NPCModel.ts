import { ItemType } from '../core/Constants';

export type NPCRewardType = ItemType | 'KEY' | 'UNLOCK_PATH' | 'REVEAL_SHORTCUT';

/** Pure data — no Cocos imports. */
export class NPCModel {
    id: number = 0;
    x: number = 0;
    y: number = 0;
    active: boolean = false;
    traded: boolean = false;

    wantsItem: ItemType = ItemType.FOOD;
    givesReward: NPCRewardType = 'KEY';

    reset(id: number, x: number, y: number, wantsItem: ItemType, givesReward: NPCRewardType): void {
        this.id = id;
        this.x = x;
        this.y = y;
        this.active = true;
        this.traded = false;
        this.wantsItem = wantsItem;
        this.givesReward = givesReward;
    }

    deactivate(): void {
        this.active = false;
    }
}
