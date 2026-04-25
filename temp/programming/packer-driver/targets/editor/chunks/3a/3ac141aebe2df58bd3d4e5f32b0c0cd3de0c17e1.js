System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, PlayerConstants, PlayerModel, _crd;

  function _reportPossibleCrUseOfPlayerConstants(extras) {
    _reporterNs.report("PlayerConstants", "../core/Constants", _context.meta, extras);
  }

  _export("PlayerModel", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      PlayerConstants = _unresolved_2.PlayerConstants;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "a04e4K80ERJ7Ic5Z3/Fyj/+", "PlayerModel", undefined);

      /** Pure data — no Cocos imports. */
      _export("PlayerModel", PlayerModel = class PlayerModel {
        constructor() {
          this.x = 0;
          this.y = 0;
          this.vx = 0;
          this.vy = 0;
          this.speed = (_crd && PlayerConstants === void 0 ? (_reportPossibleCrUseOfPlayerConstants({
            error: Error()
          }), PlayerConstants) : PlayerConstants).SPEED;
          this.isAlive = true;
          this.input = {
            left: false,
            right: false,
            up: false,
            down: false
          };
        }

        get hasInput() {
          return this.input.left || this.input.right || this.input.up || this.input.down;
        }

        reset() {
          this.x = 0;
          this.y = 0;
          this.vx = 0;
          this.vy = 0;
          this.isAlive = true;
          this.input = {
            left: false,
            right: false,
            up: false,
            down: false
          };
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=3ac141aebe2df58bd3d4e5f32b0c0cd3de0c17e1.js.map