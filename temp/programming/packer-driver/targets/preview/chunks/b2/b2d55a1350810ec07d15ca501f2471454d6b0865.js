System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, EventBus, GameEvent, LightSystem, _crd;

  function _reportPossibleCrUseOfEventBus(extras) {
    _reporterNs.report("EventBus", "../core/EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameEvent(extras) {
    _reporterNs.report("GameEvent", "../core/Constants", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameStateModel(extras) {
    _reporterNs.report("GameStateModel", "../models/GameStateModel", _context.meta, extras);
  }

  _export("LightSystem", void 0);

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

      _cclegacy._RF.push({}, "30e67m3kgFLw5FZJutQ/HIK", "LightSystem", undefined);

      /**
       * Tracks global light progression and emits LIGHT_RESTORED events.
       * Pure system — no Cocos imports.
       */
      _export("LightSystem", LightSystem = class LightSystem {
        init() {// Nothing to pre-subscribe here — driven by GameController
        }
        /**
         * Called by GameController when a light point is activated.
         * Recalculates globalLightValue and emits event.
         */


        onLightPointRestored(state) {
          state.restoredLightPoints++;
          state.globalLightValue = state.totalLightPoints > 0 ? state.restoredLightPoints / state.totalLightPoints : 0;
          (_crd && EventBus === void 0 ? (_reportPossibleCrUseOfEventBus({
            error: Error()
          }), EventBus) : EventBus).get().emit((_crd && GameEvent === void 0 ? (_reportPossibleCrUseOfGameEvent({
            error: Error()
          }), GameEvent) : GameEvent).LIGHT_RESTORED, state.globalLightValue);
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=b2d55a1350810ec07d15ca501f2471454d6b0865.js.map