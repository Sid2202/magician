import { ItemType } from '../core/Constants';
import { LightConstants } from '../core/Constants';

/** Pure data — no Cocos imports. */
export class LightPointModel {
    id: number = 0;
    x: number = 0;
    y: number = 0;
    restored: boolean = false;

    /** Collect N shards to activate, or a specific trade reward */
    requiredShards: number = LightConstants.POINTS_REQUIRED_DEFAULT;
    requiredTrade: ItemType | null = null;

    reset(id: number, x: number, y: number, requiredShards?: number): void {
        this.id = id;
        this.x = x;
        this.y = y;
        this.restored = false;
        this.requiredShards = requiredShards ?? LightConstants.POINTS_REQUIRED_DEFAULT;
        this.requiredTrade = null;
    }

    canActivateWithShards(shardCount: number): boolean {
        return !this.restored && this.requiredTrade === null && shardCount >= this.requiredShards;
    }

    canActivateWithTrade(rewardType: string): boolean {
        return !this.restored && this.requiredTrade !== null && this.requiredTrade === rewardType;
    }
}
