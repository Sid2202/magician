System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, input, Input, KeyCode, Vec2, PlayerConstants, InputSystem, _crd;

  function _reportPossibleCrUseOfInputState(extras) {
    _reporterNs.report("InputState", "../models/PlayerModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerConstants(extras) {
    _reporterNs.report("PlayerConstants", "../core/Constants", _context.meta, extras);
  }

  _export("InputSystem", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      input = _cc.input;
      Input = _cc.Input;
      KeyCode = _cc.KeyCode;
      Vec2 = _cc.Vec2;
    }, function (_unresolved_2) {
      PlayerConstants = _unresolved_2.PlayerConstants;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "29184kYY4JNH41SFl5P5KTF", "InputSystem", undefined);

      __checkObsolete__(['EventTarget', 'input', 'Input', 'KeyCode', 'Vec2', 'Scene']);

      /**
       * Abstracts keyboard + touch/joystick input into a plain InputState.
       * Stateless relative to game logic — just reads hardware.
       */
      _export("InputSystem", InputSystem = class InputSystem {
        constructor() {
          this._keys = new Set();

          /** Normalized axis from virtual joystick (set by UI layer). */
          this._joystickAxis = new Vec2(0, 0);
        }

        init(_scene) {
          input.on(Input.EventType.KEY_DOWN, this._onKeyDown, this);
          input.on(Input.EventType.KEY_UP, this._onKeyUp, this);
        }

        destroy() {
          input.off(Input.EventType.KEY_DOWN, this._onKeyDown, this);
          input.off(Input.EventType.KEY_UP, this._onKeyUp, this);
        }
        /** Called by virtual joystick component on mobile. */


        setJoystickAxis(x, y) {
          this._joystickAxis.set(x, y);
        }
        /** Writes current input state into target (no allocation). */


        readInto(target) {
          const jx = Math.abs(this._joystickAxis.x) > (_crd && PlayerConstants === void 0 ? (_reportPossibleCrUseOfPlayerConstants({
            error: Error()
          }), PlayerConstants) : PlayerConstants).INPUT_DEADZONE ? this._joystickAxis.x : 0;
          const jy = Math.abs(this._joystickAxis.y) > (_crd && PlayerConstants === void 0 ? (_reportPossibleCrUseOfPlayerConstants({
            error: Error()
          }), PlayerConstants) : PlayerConstants).INPUT_DEADZONE ? this._joystickAxis.y : 0;
          target.left = this._keys.has(KeyCode.KEY_A) || this._keys.has(KeyCode.ARROW_LEFT) || jx < 0;
          target.right = this._keys.has(KeyCode.KEY_D) || this._keys.has(KeyCode.ARROW_RIGHT) || jx > 0;
          target.up = this._keys.has(KeyCode.KEY_W) || this._keys.has(KeyCode.ARROW_UP) || jy > 0;
          target.down = this._keys.has(KeyCode.KEY_S) || this._keys.has(KeyCode.ARROW_DOWN) || jy < 0;
        }

        _onKeyDown(e) {
          this._keys.add(e.keyCode);
        }

        _onKeyUp(e) {
          this._keys.delete(e.keyCode);
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=0b9b6001a0560dc2973eb07e081c0dd81df1d725.js.map