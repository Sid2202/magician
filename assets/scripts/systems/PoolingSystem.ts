import { Node, Prefab, instantiate } from 'cc';
import { PoolType } from '../core/Constants';

/**
 * Generic object pool. No instantiate/destroy during gameplay.
 * Pre-populate by calling seed() for each type before game starts.
 */
export class PoolingSystem {

    private _pools: Map<PoolType, Node[]> = new Map();
    private _prefabs: Map<PoolType, Prefab> = new Map();
    private _root: Node = null;

    init(root: Node): void {
        this._root = root;
    }

    registerPrefab(type: PoolType, prefab: Prefab): void {
        this._prefabs.set(type, prefab);
        if (!this._pools.has(type)) {
            this._pools.set(type, []);
        }
    }

    /** Pre-instantiate `count` nodes for `type`. Call before gameplay starts. */
    seed(type: PoolType, count: number): void {
        const prefab = this._prefabs.get(type);
        if (!prefab) {
            console.warn(`[PoolingSystem] No prefab registered for ${type}`);
            return;
        }
        const pool = this._getOrCreatePool(type);
        for (let i = 0; i < count; i++) {
            const node = instantiate(prefab);
            node.active = false;
            node.setParent(this._root);
            pool.push(node);
        }
    }

    /** Retrieve a node from pool. Returns null if pool exhausted (non-critical). */
    getFromPool(type: PoolType): Node | null {
        const pool = this._pools.get(type);
        if (!pool || pool.length === 0) {
            // Pool exhausted — grow by one as last resort (should be avoided via tuning)
            const prefab = this._prefabs.get(type);
            if (!prefab) return null;
            const node = instantiate(prefab);
            node.setParent(this._root);
            return node;
        }
        const node = pool.pop();
        node.active = true;
        return node;
    }

    /** Return a node to its pool for reuse. */
    returnToPool(type: PoolType, node: Node): void {
        node.active = false;
        this._getOrCreatePool(type).push(node);
    }

    private _getOrCreatePool(type: PoolType): Node[] {
        let pool = this._pools.get(type);
        if (!pool) {
            pool = [];
            this._pools.set(type, pool);
        }
        return pool;
    }
}
