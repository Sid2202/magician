System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, EventTarget, EventBus, _crd;

  _export("EventBus", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      EventTarget = _cc.EventTarget;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "b53ddVPoWFHGLs2Jy2Gk9qi", "EventBus", undefined);

      /**
       * Global event bus for cross-system communication.
       * All systems communicate exclusively through this — no direct references.
       */
      __checkObsolete__(['EventTarget']);

      _export("EventBus", EventBus = class EventBus {
        static get() {
          if (!EventBus._instance) {
            EventBus._instance = new EventTarget();
          }

          return EventBus._instance;
        }
        /** Call once on game session end to clear all listeners. */


        static reset() {
          EventBus._instance = null;
        }

      });

      EventBus._instance = null;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=edaf23a6d02a474cf21dde186855998a8fdb739f.js.map