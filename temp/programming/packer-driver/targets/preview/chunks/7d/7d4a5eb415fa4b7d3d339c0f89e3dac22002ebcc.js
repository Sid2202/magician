System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, ItemType, NPCModel, _crd;

  function _reportPossibleCrUseOfItemType(extras) {
    _reporterNs.report("ItemType", "../core/Constants", _context.meta, extras);
  }

  _export("NPCModel", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      ItemType = _unresolved_2.ItemType;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "e805ccO5sNICrZ+vW5q0Xsc", "NPCModel", undefined);

      /** Pure data — no Cocos imports. */
      _export("NPCModel", NPCModel = class NPCModel {
        constructor() {
          this.id = 0;
          this.x = 0;
          this.y = 0;
          this.active = false;
          this.traded = false;
          this.wantsItem = (_crd && ItemType === void 0 ? (_reportPossibleCrUseOfItemType({
            error: Error()
          }), ItemType) : ItemType).FOOD;
          this.givesReward = 'KEY';
        }

        reset(id, x, y, wantsItem, givesReward) {
          this.id = id;
          this.x = x;
          this.y = y;
          this.active = true;
          this.traded = false;
          this.wantsItem = wantsItem;
          this.givesReward = givesReward;
        }

        deactivate() {
          this.active = false;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=7d4a5eb415fa4b7d3d339c0f89e3dac22002ebcc.js.map