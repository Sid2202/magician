/** Pure math helpers. No Cocos imports. */
export class MathUtil {

    static clamp(value: number, min: number, max: number): number {
        return value < min ? min : value > max ? max : value;
    }

    static lerp(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    }

    static randomRange(min: number, max: number): number {
        return min + Math.random() * (max - min);
    }

    static randomInt(min: number, max: number): number {
        return Math.floor(MathUtil.randomRange(min, max + 1));
    }

    static approachZero(value: number, step: number): number {
        if (value > 0) return Math.max(0, value - step);
        if (value < 0) return Math.min(0, value + step);
        return 0;
    }

    /** Normalize a value from [inMin, inMax] to [outMin, outMax]. */
    static remap(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
        return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
    }
}
