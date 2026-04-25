System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, Vec3, PlayerConstants, WorldConstants, MovementSystem, _crd;

  function _reportPossibleCrUseOfPlayerModel(extras) {
    _reporterNs.report("PlayerModel", "../models/PlayerModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerConstants(extras) {
    _reporterNs.report("PlayerConstants", "../core/Constants", _context.meta, extras);
  }

  function _reportPossibleCrUseOfWorldConstants(extras) {
    _reporterNs.report("WorldConstants", "../core/Constants", _context.meta, extras);
  }

  _export("MovementSystem", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      Vec3 = _cc.Vec3;
    }, function (_unresolved_2) {
      PlayerConstants = _unresolved_2.PlayerConstants;
      WorldConstants = _unresolved_2.WorldConstants;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "5c0a9Pk1G5B7rfEDiFgLmjH", "MovementSystem", undefined);

      __checkObsolete__(['Node', 'Vec3']);

      /**
       * Handles all position/velocity math for player and world layers.
       * Pure math — no Cocos scene graph manipulation except setting node positions.
       */
      _export("MovementSystem", MovementSystem = class MovementSystem {
        constructor() {
          this._parallaxLayers = [];
          this._scrollSpeed = (_crd && WorldConstants === void 0 ? (_reportPossibleCrUseOfWorldConstants({
            error: Error()
          }), WorldConstants) : WorldConstants).BASE_SCROLL_SPEED;
          this._pos = new Vec3();
        }

        registerParallaxLayer(node, velocityMultiplier, tileWidth) {
          this._parallaxLayers.push({
            node,
            velocityMultiplier,
            _offset: 0,
            tileWidth
          });
        }

        clearParallaxLayers() {
          this._parallaxLayers.length = 0;
        }

        setScrollSpeed(speed) {
          this._scrollSpeed = speed;
        }
        /** Integrate player velocity from input state. No allocation. */


        updatePlayer(model, dt) {
          var {
            input
          } = model;
          var spd = model.speed;
          var ax = 0;
          var ay = 0;
          if (input.left) ax -= spd;
          if (input.right) ax += spd;
          if (input.up) ay += spd;
          if (input.down) ay -= spd;

          if (model.hasInput) {
            model.vx = ax;
            model.vy = ay;
          } else {
            // Hover damping — bleed velocity to zero
            model.vx *= (_crd && PlayerConstants === void 0 ? (_reportPossibleCrUseOfPlayerConstants({
              error: Error()
            }), PlayerConstants) : PlayerConstants).HOVER_DAMPING;
            model.vy *= (_crd && PlayerConstants === void 0 ? (_reportPossibleCrUseOfPlayerConstants({
              error: Error()
            }), PlayerConstants) : PlayerConstants).HOVER_DAMPING;
            if (Math.abs(model.vx) < 1) model.vx = 0;
            if (Math.abs(model.vy) < 1) model.vy = 0;
          }

          model.x += model.vx * dt;
          model.y += model.vy * dt;
        }
        /**
         * Scrolls all parallax layers by their velocity multiplier.
         * Returns the world delta X this frame so callers can scroll gameplay objects.
         */


        updateWorld(dt) {
          var dx = this._scrollSpeed * dt;

          for (var layer of this._parallaxLayers) {
            layer._offset += dx * layer.velocityMultiplier; // Seamless wrap

            if (layer.tileWidth > 0 && layer._offset >= layer.tileWidth) {
              layer._offset -= layer.tileWidth;
            }

            layer.node.getPosition(this._pos);
            this._pos.x = -layer._offset;
            layer.node.setPosition(this._pos);
          }

          return dx;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=7e9051f5f3e9d068a054cf2bd7d21ef2a65c77eb.js.map