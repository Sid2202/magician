import { NodePool, Prefab, Node, instantiate } from 'cc';

export const enum PoolKey {
    Coin = 'Coin',
    FlyingCoin = 'FlyingCoin',
}

/**
 * Pure-TypeScript static pool manager. No Cocos component.
 *
 * Usage:
 *   1. Call warmup() once during scene load for each pool key.
 *   2. Call get()     to borrow a node (never null after warmup).
 *   3. Call release() to return a node — never destroy it.
 *   4. Call clear()   on scene destroy.
 */
export class PoolingSystem {
    private static readonly _pools   = new Map<string, NodePool>();
    private static readonly _prefabs = new Map<string, Prefab>();

    /** Pre-instantiate `count` nodes and park them in the pool. Call once at startup. */
    static warmup(key: PoolKey, prefab: Prefab, count: number): void {
        if (!prefab) { console.warn(`[PoolingSystem] warmup: prefab missing for key "${key}"`); return; }
        this._prefabs.set(key, prefab);
        if (!this._pools.has(key)) this._pools.set(key, new NodePool());
        const pool = this._pools.get(key)!;
        for (let i = 0; i < count; i++) {
            const n = instantiate(prefab);
            n.active = false;
            pool.put(n);
        }
    }

    /** Borrow a node. Falls back to instantiate if pool is empty (should not happen). */
    static get(key: PoolKey): Node | null {
        const pool = this._pools.get(key);
        if (pool && pool.size() > 0) return pool.get();
        // fallback — log so we know to increase warmup count
        console.warn(`[PoolingSystem] pool "${key}" empty — instantiating (increase warmupCount)`);
        const prefab = this._prefabs.get(key);
        return prefab ? instantiate(prefab) : null;
    }

    /** Return a node to the pool. Sets active=false automatically. */
    static release(key: PoolKey, node: Node): void {
        node.active = false;
        const pool = this._pools.get(key);
        if (pool) { pool.put(node); } else { node.destroy(); }
    }

    static clear(): void {
        for (const p of this._pools.values()) p.clear();
        this._pools.clear();
        this._prefabs.clear();
    }
}
