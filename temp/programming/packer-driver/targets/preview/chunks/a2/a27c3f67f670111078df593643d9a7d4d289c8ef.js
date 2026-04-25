System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, MathUtil, _crd;

  _export("MathUtil", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "b764bm6Pe5Dqpn+m8rZk0Lg", "MathUtil", undefined);

      /** Pure math helpers. No Cocos imports. */
      _export("MathUtil", MathUtil = class MathUtil {
        static clamp(value, min, max) {
          return value < min ? min : value > max ? max : value;
        }

        static lerp(a, b, t) {
          return a + (b - a) * t;
        }

        static randomRange(min, max) {
          return min + Math.random() * (max - min);
        }

        static randomInt(min, max) {
          return Math.floor(MathUtil.randomRange(min, max + 1));
        }

        static approachZero(value, step) {
          if (value > 0) return Math.max(0, value - step);
          if (value < 0) return Math.min(0, value + step);
          return 0;
        }
        /** Normalize a value from [inMin, inMax] to [outMin, outMax]. */


        static remap(value, inMin, inMax, outMin, outMax) {
          return outMin + (value - inMin) / (inMax - inMin) * (outMax - outMin);
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=a27c3f67f670111078df593643d9a7d4d289c8ef.js.map