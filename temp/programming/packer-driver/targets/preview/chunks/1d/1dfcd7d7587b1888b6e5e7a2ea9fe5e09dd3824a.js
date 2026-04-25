System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Vec3, _dec, _class, _crd, ccclass, LightPointView;

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      Vec3 = _cc.Vec3;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "8f1e21ffNxFiLhOeh0JUu7/", "LightPointView", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Vec3']);

      ({
        ccclass
      } = _decorator);
      /**
       * Cocos component — visual only.
       * Controlled by LightSystem via GameController.
       */

      _export("LightPointView", LightPointView = (_dec = ccclass('LightPointView'), _dec(_class = class LightPointView extends Component {
        constructor() {
          super(...arguments);
          this._pos = new Vec3();
        }

        setPosition(x, y) {
          this._pos.set(x, y, 0);

          this.node.setPosition(this._pos);
        }
        /** Artist wires restoration animation/particles here. */


        playRestoreEffect() {// Animation hookup by technical artist
        }

        setRestored(restored) {// Artist-defined visual state
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=1dfcd7d7587b1888b6e5e7a2ea9fe5e09dd3824a.js.map