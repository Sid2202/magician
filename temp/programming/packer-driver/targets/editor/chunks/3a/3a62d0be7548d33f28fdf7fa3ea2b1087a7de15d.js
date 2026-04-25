System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Vec3, _dec, _class, _crd, ccclass, NPCView;

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

      _cclegacy._RF.push({}, "7d652jqh05PCYFyXLmcR5wb", "NPCView", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Vec3']);

      ({
        ccclass
      } = _decorator);
      /**
       * Cocos component — visual only.
       * Controlled by NPCController.
       */

      _export("NPCView", NPCView = (_dec = ccclass('NPCView'), _dec(_class = class NPCView extends Component {
        constructor(...args) {
          super(...args);
          this._pos = new Vec3();
        }

        setPosition(x, y) {
          this._pos.set(x, y, 0);

          this.node.setPosition(this._pos);
        }

        setVisible(visible) {
          this.node.active = visible;
        }
        /** Signal traded state (artist wires up animation). */


        playTradeEffect() {// Artist hooks animation here — no logic needed
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=3a62d0be7548d33f28fdf7fa3ea2b1087a7de15d.js.map