type Listener = { fn: Function; ctx: unknown };

class EventBusImpl {
    private readonly _map = new Map<string, Listener[]>();

    on(event: string, fn: Function, ctx: unknown = null): void {
        let list = this._map.get(event);
        if (!list) { list = []; this._map.set(event, list); }
        list.push({ fn, ctx });
    }

    off(event: string, fn: Function, ctx: unknown = null): void {
        const list = this._map.get(event);
        if (!list) return;
        const i = list.findIndex(l => l.fn === fn && l.ctx === ctx);
        if (i !== -1) list.splice(i, 1);
    }

    emit(event: string, data?: unknown): void {
        const list = this._map.get(event);
        if (!list || list.length === 0) return;
        // snapshot so listeners can safely call off() during emit
        const snap = list.slice();
        for (let i = 0; i < snap.length; i++) snap[i].fn.call(snap[i].ctx, data);
    }

    clear(): void { this._map.clear(); }
}

export const EventBus = new EventBusImpl();

export const CoinEvents = {
    CoinCollected:  'COIN_COLLECTED',
    CoinFXComplete: 'COIN_FX_COMPLETE',
} as const;
