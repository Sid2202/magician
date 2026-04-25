export const enum ObstacleType {
    Ghost   = 'OBS_GHOST',
    Barrel  = 'OBS_BARREL',
    Plant   = 'OBS_PLANT',
    Rock    = 'OBS_ROCK',
    Spider  = 'OBS_SPIDER',
    Vine_01 = 'OBS_VINE_01',
    Vine_02 = 'OBS_VINE_02',
    Vine_03 = 'OBS_VINE_03',
}

export class ObstacleModel {
    type: ObstacleType = ObstacleType.Rock;

    x = 0;
    y = 0;

    halfW = 32;
    halfH = 32;

    active = false;

    /** Free-form per-type runtime state — used by ObstacleBehavior implementations. */
    readonly state: Record<string, number> = Object.create(null);

    reset(): void {
        this.x = 0;
        this.y = 0;
        this.active = false;
        for (const k in this.state) delete this.state[k];
    }
}
