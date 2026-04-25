System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, ItemType, ItemModel, _crd;

  function _reportPossibleCrUseOfItemType(extras) {
    _reporterNs.report("ItemType", "../core/Constants", _context.meta, extras);
  }

  _export("ItemModel", void 0);

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

      _cclegacy._RF.push({}, "7bbb3UDmx1Kfbro1pXFPqa3", "ItemModel", undefined);

      /** Pure data — no Cocos imports. */
      _export("ItemModel", ItemModel = class ItemModel {
        constructor() {
          this.id = 0;
          this.type = (_crd && ItemType === void 0 ? (_reportPossibleCrUseOfItemType({
            error: Error()
          }), ItemType) : ItemType).SHARD;
          this.x = 0;
          this.y = 0;
          this.active = false;
        }

        reset(id, type, x, y) {
          this.id = id;
          this.type = type;
          this.x = x;
          this.y = y;
          this.active = true;
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
//# sourceMappingURL=2b27418e14193c913fca3c22e839a3efc3176179.js.map