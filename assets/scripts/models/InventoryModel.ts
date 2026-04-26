import { ItemType } from '../gameplay/input/GameEvents';

/** Pure data — no Cocos imports. Counter-based inventory for the 3 item types. */
export class InventoryModel {
    private _counts: Map<ItemType, number> = new Map([
        [ItemType.Shard, 0],
        [ItemType.Food,  0],
        [ItemType.Tool,  0],
    ]);

    // ── Coins ─────────────────────────────────────────────────────────────
    private _coinCount = 0;

    addCoin(): void             { this._coinCount++;             }
    getCoinCount(): number      { return this._coinCount;        }

    // ── Shards ────────────────────────────────────────────────────────────
    private _shardCount = 0;

    addShard(): void            { this._shardCount++;            }
    getShardCount(): number     { return this._shardCount;       }

    addItem(type: ItemType): void {
        this._counts.set(type, (this._counts.get(type) ?? 0) + 1);
    }

    /** Returns false if the item isn't available. */
    consumeItem(type: ItemType): boolean {
        const n = this._counts.get(type) ?? 0;
        if (n <= 0) return false;
        this._counts.set(type, n - 1);
        return true;
    }

    hasItem(type: ItemType): boolean {
        return (this._counts.get(type) ?? 0) > 0;
    }

    getCount(type: ItemType): number {
        return this._counts.get(type) ?? 0;
    }

    reset(): void {
        this._counts.set(ItemType.Shard, 0);
        this._counts.set(ItemType.Food,  0);
        this._counts.set(ItemType.Tool,  0);
        this._coinCount  = 0;
        this._shardCount = 0;
    }
}
