System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Vec3, _dec, _class, _crd, ccclass, ItemView;

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

      _cclegacy._RF.push({}, "b2f6a3ftatPt4MZRwZKGRbV", "ItemView", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Vec3']);

      ({
        ccclass
      } = _decorator);
      /**
       * Cocos component — visual only.
       * Controlled by ItemController.
       */

      _export("ItemView", ItemView = (_dec = ccclass('ItemView'), _dec(_class = class ItemView extends Component {
        constructor() {
          super(...arguments);
          this._pos = new Vec3();
        }

        setPosition(x, y) {
          this._pos.set(x, y, 0);

          this.node.setPosition(this._pos);
        }

        setVisible(visible) {
          this.node.active = visible;
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=2807ca237083e63fd797094861e6641389f83354.js.map