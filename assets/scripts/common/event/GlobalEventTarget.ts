import { EventTarget } from 'cc';

/** Global cross-scene event bus. Use for app-level signals (pause, game over, etc.). */
export class GlobalEventTarget {
    private static _et: EventTarget | null = null;

    static get(): EventTarget {
        if (!GlobalEventTarget._et) {
            GlobalEventTarget._et = new EventTarget();
        }
        return GlobalEventTarget._et;
    }
}

/**
 * Per-session gameplay event bus.
 * All gameplay systems talk through this — no direct references.
 * Call destroy() on game session end to wipe all listeners.
 */
export class GameEventsBus {
    private static _et: EventTarget | null = null;

    static get(): EventTarget {
        if (!GameEventsBus._et) {
            GameEventsBus._et = new EventTarget();
        }
        return GameEventsBus._et;
    }

    static destroy(): void {
        GameEventsBus._et = null;
    }
}
