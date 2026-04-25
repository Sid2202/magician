System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, instantiate, PoolingSystem, _crd;

  function _reportPossibleCrUseOfPoolType(extras) {
    _reporterNs.report("PoolType", "../core/Constants", _context.meta, extras);
  }

  _export("PoolingSystem", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      instantiate = _cc.instantiate;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "80c21vJPUZFM7hRlhgovAQn", "PoolingSystem", undefined);

      __checkObsolete__(['Node', 'Prefab', 'instantiate']);

      /**
       * Generic object pool. No instantiate/destroy during gameplay.
       * Pre-populate by calling seed() for each type before game starts.
       */
      _export("PoolingSystem", PoolingSystem = class PoolingSystem {
        constructor() {
          this._pools = new Map();
          this._prefabs = new Map();
          this._root = null;
        }

        init(root) {
          this._root = root;
        }

        registerPrefab(type, prefab) {
          this._prefabs.set(type, prefab);

          if (!this._pools.has(type)) {
            this._pools.set(type, []);
          }
        }
        /** Pre-instantiate `count` nodes for `type`. Call before gameplay starts. */


        seed(type, count) {
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


        getFromPool(type) {
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


        returnToPool(type, node) {
          node.active = false;

          this._getOrCreatePool(type).push(node);
        }

        _getOrCreatePool(type) {
          let pool = this._pools.get(type);

          if (!pool) {
            pool = [];

            this._pools.set(type, pool);
          }

          return pool;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=6a31228aebe8b923b7b6df3f3f34545026e4fa32.js.map