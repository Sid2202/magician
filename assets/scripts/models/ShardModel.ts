/** Pure data for a single collectible shard. */
export class ShardModel {
    /** Which of the three shards this is (1, 2, or 3). */
    index: number = 1;

    x = 0;
    y = 0;

    halfW = 36;
    halfH = 36;

    active = false;

    reset(): void {
        this.x = this.y = 0;
        this.active = false;
    }
}
