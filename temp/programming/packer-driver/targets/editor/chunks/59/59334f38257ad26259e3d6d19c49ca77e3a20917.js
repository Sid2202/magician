System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Vec3, _dec, _class, _crd, ccclass, property, PlayerView;

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

      _cclegacy._RF.push({}, "11b8a0Fqp5N27C+Ulpv7RAT", "PlayerView", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'Vec3']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * Cocos component — visual representation only.
       * Receives position from PlayerController; contains no game logic.
       */

      _export("PlayerView", PlayerView = (_dec = ccclass('PlayerView'), _dec(_class = class PlayerView extends Component {
        constructor(...args) {
          super(...args);
          this._pos = new Vec3();
        }

        /** Called by PlayerController each frame with the computed position. */
        setPosition(x, y) {
          this._pos.set(x, y, 0);

          this.node.setPosition(this._pos);
        }
        /** Visual-only: flip sprite based on horizontal direction. */


        setFacingDirection(movingRight) {
          const s = this.node.scale;
          this.node.setScale(movingRight ? Math.abs(s.x) : -Math.abs(s.x), s.y, s.z);
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=59334f38257ad26259e3d6d19c49ca77e3a20917.js.map