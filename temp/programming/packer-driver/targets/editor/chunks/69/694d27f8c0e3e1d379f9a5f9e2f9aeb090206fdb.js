System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, EventBus, GameEvent, TradeSystem, _crd;

  function _reportPossibleCrUseOfEventBus(extras) {
    _reporterNs.report("EventBus", "../core/EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameEvent(extras) {
    _reporterNs.report("GameEvent", "../core/Constants", _context.meta, extras);
  }

  function _reportPossibleCrUseOfNPCModel(extras) {
    _reporterNs.report("NPCModel", "../models/NPCModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfInventoryModel(extras) {
    _reporterNs.report("InventoryModel", "../models/InventoryModel", _context.meta, extras);
  }

  _export("TradeSystem", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      EventBus = _unresolved_2.EventBus;
    }, function (_unresolved_3) {
      GameEvent = _unresolved_3.GameEvent;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "a0801uV8XdFVpX97WgHLYMa", "TradeSystem", undefined);

      /**
       * Handles NPC trade logic. Pure system — no Cocos, no node refs.
       * Triggered by NPC_INTERACT event; emits TRADE_SUCCESS or no-op.
       */
      _export("TradeSystem", TradeSystem = class TradeSystem {
        constructor() {
          this._inventory = null;
        }

        init(inventory) {
          this._inventory = inventory;
          (_crd && EventBus === void 0 ? (_reportPossibleCrUseOfEventBus({
            error: Error()
          }), EventBus) : EventBus).get().on((_crd && GameEvent === void 0 ? (_reportPossibleCrUseOfGameEvent({
            error: Error()
          }), GameEvent) : GameEvent).NPC_INTERACT, this._onNPCInteract, this);
        }

        destroy() {
          (_crd && EventBus === void 0 ? (_reportPossibleCrUseOfEventBus({
            error: Error()
          }), EventBus) : EventBus).get().off((_crd && GameEvent === void 0 ? (_reportPossibleCrUseOfGameEvent({
            error: Error()
          }), GameEvent) : GameEvent).NPC_INTERACT, this._onNPCInteract, this);
        }

        _onNPCInteract(npc) {
          if (npc.traded) return;
          if (!this._inventory.hasItem(npc.wantsItem)) return;

          this._inventory.consumeItem(npc.wantsItem);

          (_crd && EventBus === void 0 ? (_reportPossibleCrUseOfEventBus({
            error: Error()
          }), EventBus) : EventBus).get().emit((_crd && GameEvent === void 0 ? (_reportPossibleCrUseOfGameEvent({
            error: Error()
          }), GameEvent) : GameEvent).ITEM_CONSUMED, npc.wantsItem);
          npc.traded = true;
          (_crd && EventBus === void 0 ? (_reportPossibleCrUseOfEventBus({
            error: Error()
          }), EventBus) : EventBus).get().emit((_crd && GameEvent === void 0 ? (_reportPossibleCrUseOfGameEvent({
            error: Error()
          }), GameEvent) : GameEvent).TRADE_SUCCESS, npc.givesReward);
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=694d27f8c0e3e1d379f9a5f9e2f9aeb090206fdb.js.map