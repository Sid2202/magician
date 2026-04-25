import { EventTarget } from 'cc';

/**
 * Global event bus for cross-system communication.
 * All systems communicate exclusively through this — no direct references.
 */
export class EventBus {
    private static _instance: EventTarget | null = null;

    static get(): EventTarget {
        if (!EventBus._instance) {
            EventBus._instance = new EventTarget();
        }
        return EventBus._instance;
    }

    /** Call once on game session end to clear all listeners. */
    static reset(): void {
        EventBus._instance = null;
    }
}
