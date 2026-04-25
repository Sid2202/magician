System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, EventBus, GameEvent, CollisionConstants, CollisionSystem, _crd;

  function _reportPossibleCrUseOfEventBus(extras) {
    _reporterNs.report("EventBus", "../core/EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameEvent(extras) {
    _reporterNs.report("GameEvent", "../core/Constants", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCollisionConstants(extras) {
    _reporterNs.report("CollisionConstants", "../core/Constants", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerModel(extras) {
    _reporterNs.report("PlayerModel", "../models/PlayerModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfItemModel(extras) {
    _reporterNs.report("ItemModel", "../models/ItemModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfNPCModel(extras) {
    _reporterNs.report("NPCModel", "../models/NPCModel", _context.meta, extras);
  }

  _export("CollisionSystem", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      EventBus = _unresolved_2.EventBus;
    }, function (_unresolved_3) {
      GameEvent = _unresolved_3.GameEvent;
      CollisionConstants = _unresolved_3.CollisionConstants;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "93845QERelE/4vWM4ELtT3T", "CollisionSystem", undefined);

      /**
       * AABB-based collision detection. Centralized — runs once per frame.
       * Emits events rather than calling handlers directly.
       */
      _export("CollisionSystem", CollisionSystem = class CollisionSystem {
        checkPlayerVsItems(player, items) {
          var pw = (_crd && CollisionConstants === void 0 ? (_reportPossibleCrUseOfCollisionConstants({
            error: Error()
          }), CollisionConstants) : CollisionConstants).PLAYER_HALF_W;
          var ph = (_crd && CollisionConstants === void 0 ? (_reportPossibleCrUseOfCollisionConstants({
            error: Error()
          }), CollisionConstants) : CollisionConstants).PLAYER_HALF_H;
          var iw = (_crd && CollisionConstants === void 0 ? (_reportPossibleCrUseOfCollisionConstants({
            error: Error()
          }), CollisionConstants) : CollisionConstants).ITEM_HALF_W;
          var ih = (_crd && CollisionConstants === void 0 ? (_reportPossibleCrUseOfCollisionConstants({
            error: Error()
          }), CollisionConstants) : CollisionConstants).ITEM_HALF_H;

          for (var item of items) {
            if (!item.active) continue;

            if (this._aabb(player.x, player.y, pw, ph, item.x, item.y, iw, ih)) {
              item.deactivate();
              (_crd && EventBus === void 0 ? (_reportPossibleCrUseOfEventBus({
                error: Error()
              }), EventBus) : EventBus).get().emit((_crd && GameEvent === void 0 ? (_reportPossibleCrUseOfGameEvent({
                error: Error()
              }), GameEvent) : GameEvent).ITEM_COLLECTED, item.type);
            }
          }
        }

        checkPlayerVsNPCs(player, npcs) {
          var pw = (_crd && CollisionConstants === void 0 ? (_reportPossibleCrUseOfCollisionConstants({
            error: Error()
          }), CollisionConstants) : CollisionConstants).PLAYER_HALF_W;
          var ph = (_crd && CollisionConstants === void 0 ? (_reportPossibleCrUseOfCollisionConstants({
            error: Error()
          }), CollisionConstants) : CollisionConstants).PLAYER_HALF_H;
          var nw = (_crd && CollisionConstants === void 0 ? (_reportPossibleCrUseOfCollisionConstants({
            error: Error()
          }), CollisionConstants) : CollisionConstants).NPC_HALF_W;
          var nh = (_crd && CollisionConstants === void 0 ? (_reportPossibleCrUseOfCollisionConstants({
            error: Error()
          }), CollisionConstants) : CollisionConstants).NPC_HALF_H;

          for (var npc of npcs) {
            if (!npc.active || npc.traded) continue;

            if (this._aabb(player.x, player.y, pw, ph, npc.x, npc.y, nw, nh)) {
              (_crd && EventBus === void 0 ? (_reportPossibleCrUseOfEventBus({
                error: Error()
              }), EventBus) : EventBus).get().emit((_crd && GameEvent === void 0 ? (_reportPossibleCrUseOfGameEvent({
                error: Error()
              }), GameEvent) : GameEvent).NPC_INTERACT, npc);
            }
          }
        }
        /** Returns true when two AABB rectangles overlap. No allocation. */


        _aabb(ax, ay, ahw, ahh, bx, by, bhw, bhh) {
          return Math.abs(ax - bx) < ahw + bhw && Math.abs(ay - by) < ahh + bhh;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=8fb2c6904aade69d7f956bf05575bfd6a046559b.js.map