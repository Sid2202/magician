System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, ItemController, NPCController, PoolType, ItemType, SpawnConstants, MathUtil, SpawnSystem, _crd, ITEM_TYPES, NPC_WANTS, NPC_REWARDS;

  function _reportPossibleCrUseOfPoolingSystem(extras) {
    _reporterNs.report("PoolingSystem", "./PoolingSystem", _context.meta, extras);
  }

  function _reportPossibleCrUseOfItemController(extras) {
    _reporterNs.report("ItemController", "../controllers/ItemController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfNPCController(extras) {
    _reporterNs.report("NPCController", "../controllers/NPCController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPoolType(extras) {
    _reporterNs.report("PoolType", "../core/Constants", _context.meta, extras);
  }

  function _reportPossibleCrUseOfItemType(extras) {
    _reporterNs.report("ItemType", "../core/Constants", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSpawnConstants(extras) {
    _reporterNs.report("SpawnConstants", "../core/Constants", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMathUtil(extras) {
    _reporterNs.report("MathUtil", "../utils/MathUtil", _context.meta, extras);
  }

  _export("SpawnSystem", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
    }, function (_unresolved_2) {
      ItemController = _unresolved_2.ItemController;
    }, function (_unresolved_3) {
      NPCController = _unresolved_3.NPCController;
    }, function (_unresolved_4) {
      PoolType = _unresolved_4.PoolType;
      ItemType = _unresolved_4.ItemType;
      SpawnConstants = _unresolved_4.SpawnConstants;
    }, function (_unresolved_5) {
      MathUtil = _unresolved_5.MathUtil;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "5d07567uApO04/WY8Tej6gK", "SpawnSystem", undefined);

      __checkObsolete__(['Node']);

      ITEM_TYPES = [(_crd && ItemType === void 0 ? (_reportPossibleCrUseOfItemType({
        error: Error()
      }), ItemType) : ItemType).SHARD, (_crd && ItemType === void 0 ? (_reportPossibleCrUseOfItemType({
        error: Error()
      }), ItemType) : ItemType).FOOD, (_crd && ItemType === void 0 ? (_reportPossibleCrUseOfItemType({
        error: Error()
      }), ItemType) : ItemType).TOOL];
      NPC_WANTS = [(_crd && ItemType === void 0 ? (_reportPossibleCrUseOfItemType({
        error: Error()
      }), ItemType) : ItemType).FOOD, (_crd && ItemType === void 0 ? (_reportPossibleCrUseOfItemType({
        error: Error()
      }), ItemType) : ItemType).TOOL, (_crd && ItemType === void 0 ? (_reportPossibleCrUseOfItemType({
        error: Error()
      }), ItemType) : ItemType).SHARD];
      NPC_REWARDS = ['KEY', 'UNLOCK_PATH', 'REVEAL_SHORTCUT'];
      /**
       * Drives object spawning. Uses PoolingSystem — no instantiate calls here.
       * SpawnSystem is update-driven; call tick(dt) from the scene update loop.
       */

      _export("SpawnSystem", SpawnSystem = class SpawnSystem {
        constructor() {
          this._pooling = null;
          this._spawnParent = null;
          this._itemTimer = 0;
          this._itemInterval = (_crd && SpawnConstants === void 0 ? (_reportPossibleCrUseOfSpawnConstants({
            error: Error()
          }), SpawnConstants) : SpawnConstants).ITEM_INTERVAL_MIN;
          this._npcTimer = 0;
          this._npcInterval = (_crd && SpawnConstants === void 0 ? (_reportPossibleCrUseOfSpawnConstants({
            error: Error()
          }), SpawnConstants) : SpawnConstants).NPC_INTERVAL_MIN;
          this._nextItemId = 0;
          this._nextNpcId = 0;
          this._running = false;

          /** Pooled active lists — accessed by CollisionSystem each frame. */
          this.activeItems = [];
          this.activeNPCs = [];
        }

        init(pooling, spawnParent) {
          this._pooling = pooling;
          this._spawnParent = spawnParent;
          this._running = true;

          this._resetTimers();
        }

        stop() {
          this._running = false;
        }

        tick(dt, screenHalfH) {
          if (!this._running) return;
          this._itemTimer += dt;

          if (this._itemTimer >= this._itemInterval) {
            this._itemTimer = 0;
            this._itemInterval = (_crd && MathUtil === void 0 ? (_reportPossibleCrUseOfMathUtil({
              error: Error()
            }), MathUtil) : MathUtil).randomRange((_crd && SpawnConstants === void 0 ? (_reportPossibleCrUseOfSpawnConstants({
              error: Error()
            }), SpawnConstants) : SpawnConstants).ITEM_INTERVAL_MIN, (_crd && SpawnConstants === void 0 ? (_reportPossibleCrUseOfSpawnConstants({
              error: Error()
            }), SpawnConstants) : SpawnConstants).ITEM_INTERVAL_MAX);

            this._spawnItem(screenHalfH);
          }

          this._npcTimer += dt;

          if (this._npcTimer >= this._npcInterval) {
            this._npcTimer = 0;
            this._npcInterval = (_crd && MathUtil === void 0 ? (_reportPossibleCrUseOfMathUtil({
              error: Error()
            }), MathUtil) : MathUtil).randomRange((_crd && SpawnConstants === void 0 ? (_reportPossibleCrUseOfSpawnConstants({
              error: Error()
            }), SpawnConstants) : SpawnConstants).NPC_INTERVAL_MIN, (_crd && SpawnConstants === void 0 ? (_reportPossibleCrUseOfSpawnConstants({
              error: Error()
            }), SpawnConstants) : SpawnConstants).NPC_INTERVAL_MAX);

            this._spawnNPC(screenHalfH);
          }
        }
        /** Called by world scroll loop so active objects move with the world. */


        scrollActiveObjects(dx) {
          for (const item of this.activeItems) {
            item.scrollX(dx); // Recycle far-left items

            if (item.getModel().x < -(_crd && SpawnConstants === void 0 ? (_reportPossibleCrUseOfSpawnConstants({
              error: Error()
            }), SpawnConstants) : SpawnConstants).SPAWN_AHEAD_X) {
              this._recycleItem(item);
            }
          }

          for (const npc of this.activeNPCs) {
            npc.scrollX(dx);

            if (npc.getModel().x < -(_crd && SpawnConstants === void 0 ? (_reportPossibleCrUseOfSpawnConstants({
              error: Error()
            }), SpawnConstants) : SpawnConstants).SPAWN_AHEAD_X) {
              this._recycleNPC(npc);
            }
          }
        }

        recycleCollectedItem(ctrl) {
          this._recycleItem(ctrl);
        }

        recycleNPC(ctrl) {
          this._recycleNPC(ctrl);
        }

        _spawnItem(screenHalfH) {
          const type = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
          const poolType = type;

          const node = this._pooling.getFromPool(poolType);

          if (!node) return;
          node.setParent(this._spawnParent);
          const ctrl = node.getComponent(_crd && ItemController === void 0 ? (_reportPossibleCrUseOfItemController({
            error: Error()
          }), ItemController) : ItemController);
          if (!ctrl) return;
          const y = (_crd && MathUtil === void 0 ? (_reportPossibleCrUseOfMathUtil({
            error: Error()
          }), MathUtil) : MathUtil).randomRange(-screenHalfH * 0.8, screenHalfH * 0.8);
          ctrl.activate(this._nextItemId++, type, (_crd && SpawnConstants === void 0 ? (_reportPossibleCrUseOfSpawnConstants({
            error: Error()
          }), SpawnConstants) : SpawnConstants).SPAWN_AHEAD_X, y);
          this.activeItems.push(ctrl);
        }

        _spawnNPC(screenHalfH) {
          const node = this._pooling.getFromPool((_crd && PoolType === void 0 ? (_reportPossibleCrUseOfPoolType({
            error: Error()
          }), PoolType) : PoolType).NPC);

          if (!node) return;
          node.setParent(this._spawnParent);
          const ctrl = node.getComponent(_crd && NPCController === void 0 ? (_reportPossibleCrUseOfNPCController({
            error: Error()
          }), NPCController) : NPCController);
          if (!ctrl) return;
          const idx = Math.floor(Math.random() * NPC_WANTS.length);
          const wantsItem = NPC_WANTS[idx];
          const reward = NPC_REWARDS[idx];
          const y = (_crd && MathUtil === void 0 ? (_reportPossibleCrUseOfMathUtil({
            error: Error()
          }), MathUtil) : MathUtil).randomRange(-screenHalfH * 0.6, screenHalfH * 0.6);
          ctrl.activate(this._nextNpcId++, (_crd && SpawnConstants === void 0 ? (_reportPossibleCrUseOfSpawnConstants({
            error: Error()
          }), SpawnConstants) : SpawnConstants).SPAWN_AHEAD_X, y, wantsItem, reward);
          this.activeNPCs.push(ctrl);
        }

        _recycleItem(ctrl) {
          const idx = this.activeItems.indexOf(ctrl);
          if (idx !== -1) this.activeItems.splice(idx, 1);
          ctrl.deactivate();
          const model = ctrl.getModel();
          const poolType = model.type;

          this._pooling.returnToPool(poolType, ctrl.node);
        }

        _recycleNPC(ctrl) {
          const idx = this.activeNPCs.indexOf(ctrl);
          if (idx !== -1) this.activeNPCs.splice(idx, 1);
          ctrl.deactivate();

          this._pooling.returnToPool((_crd && PoolType === void 0 ? (_reportPossibleCrUseOfPoolType({
            error: Error()
          }), PoolType) : PoolType).NPC, ctrl.node);
        }

        _resetTimers() {
          this._itemTimer = 0;
          this._itemInterval = (_crd && MathUtil === void 0 ? (_reportPossibleCrUseOfMathUtil({
            error: Error()
          }), MathUtil) : MathUtil).randomRange((_crd && SpawnConstants === void 0 ? (_reportPossibleCrUseOfSpawnConstants({
            error: Error()
          }), SpawnConstants) : SpawnConstants).ITEM_INTERVAL_MIN, (_crd && SpawnConstants === void 0 ? (_reportPossibleCrUseOfSpawnConstants({
            error: Error()
          }), SpawnConstants) : SpawnConstants).ITEM_INTERVAL_MAX);
          this._npcTimer = 0;
          this._npcInterval = (_crd && MathUtil === void 0 ? (_reportPossibleCrUseOfMathUtil({
            error: Error()
          }), MathUtil) : MathUtil).randomRange((_crd && SpawnConstants === void 0 ? (_reportPossibleCrUseOfSpawnConstants({
            error: Error()
          }), SpawnConstants) : SpawnConstants).NPC_INTERVAL_MIN, (_crd && SpawnConstants === void 0 ? (_reportPossibleCrUseOfSpawnConstants({
            error: Error()
          }), SpawnConstants) : SpawnConstants).NPC_INTERVAL_MAX);
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=0402e1138abbced7352e833e8814290ffa9285f2.js.map