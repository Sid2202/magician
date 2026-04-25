System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, LightConstants, LightPointModel, _crd;

  function _reportPossibleCrUseOfItemType(extras) {
    _reporterNs.report("ItemType", "../core/Constants", _context.meta, extras);
  }

  function _reportPossibleCrUseOfLightConstants(extras) {
    _reporterNs.report("LightConstants", "../core/Constants", _context.meta, extras);
  }

  _export("LightPointModel", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      LightConstants = _unresolved_2.LightConstants;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "23a722DMgxBg4C3bkn3NPAB", "LightPointModel", undefined);

      /** Pure data — no Cocos imports. */
      _export("LightPointModel", LightPointModel = class LightPointModel {
        constructor() {
          this.id = 0;
          this.x = 0;
          this.y = 0;
          this.restored = false;

          /** Collect N shards to activate, or a specific trade reward */
          this.requiredShards = (_crd && LightConstants === void 0 ? (_reportPossibleCrUseOfLightConstants({
            error: Error()
          }), LightConstants) : LightConstants).POINTS_REQUIRED_DEFAULT;
          this.requiredTrade = null;
        }

        reset(id, x, y, requiredShards) {
          this.id = id;
          this.x = x;
          this.y = y;
          this.restored = false;
          this.requiredShards = requiredShards != null ? requiredShards : (_crd && LightConstants === void 0 ? (_reportPossibleCrUseOfLightConstants({
            error: Error()
          }), LightConstants) : LightConstants).POINTS_REQUIRED_DEFAULT;
          this.requiredTrade = null;
        }

        canActivateWithShards(shardCount) {
          return !this.restored && this.requiredTrade === null && shardCount >= this.requiredShards;
        }

        canActivateWithTrade(rewardType) {
          return !this.restored && this.requiredTrade !== null && this.requiredTrade === rewardType;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=c132ab7f894e07a1e01922f3a5bb8b2819954cf7.js.map