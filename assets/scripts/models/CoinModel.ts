/** Pure data — no Cocos imports. One instance per pooled coin node. */
export class CoinModel {
    readonly type  = 'COIN' as const;
    readonly value = 1;

    /** Position in SpawnSystem's node-local space (same space as CharacterModel.x/y). */
    x      = 0;
    y      = 0;

    /** Half-extents for AABB collision. */
    halfW  = 24;
    halfH  = 24;

    active = false;

    reset(): void {
        this.x = this.y = 0;
        this.active = false;
    }
}
