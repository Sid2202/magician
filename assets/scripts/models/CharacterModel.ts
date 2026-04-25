/** Pure data — no Cocos imports. Holds all player state. */
export class CharacterModel {
    /** Current position in local canvas space (pixels from parent origin). */
    x: number = 0;
    y: number = 0;

    /** Velocity, computed each frame from input + damping. */
    vx: number = 0;
    vy: number = 0;

    /** Movement speed in pixels/second. */
    speed: number = 320;

    /** Hover damping coefficient applied when no input (0 = instant stop, 1 = no damping). */
    damping: number = 0.82;

    isAlive: boolean = true;

    /** Bounding box half-extents used for AABB collision. */
    halfW: number = 40;
    halfH: number = 36;

    reset(): void {
        this.x      = 0;
        this.y      = 0;
        this.vx     = 0;
        this.vy     = 0;
        this.isAlive = true;
    }
}
