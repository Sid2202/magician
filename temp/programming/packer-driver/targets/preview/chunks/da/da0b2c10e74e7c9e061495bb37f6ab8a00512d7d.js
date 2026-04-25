System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, ItemType, InventoryModel, _crd;

  function _reportPossibleCrUseOfItemType(extras) {
    _reporterNs.report("ItemType", "../core/Constants", _context.meta, extras);
  }

  _export("InventoryModel", void 0);

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

      _cclegacy._RF.push({}, "ee6b8OP3V9J/45CrJP0ePW9", "InventoryModel", undefined);

      /** Pure data — no Cocos imports. */
      _export("InventoryModel", InventoryModel = class InventoryModel {
        constructor() {
          this._counts = new Map([[(_crd && ItemType === void 0 ? (_reportPossibleCrUseOfItemType({
            error: Error()
          }), ItemType) : ItemType).SHARD, 0], [(_crd && ItemType === void 0 ? (_reportPossibleCrUseOfItemType({
            error: Error()
          }), ItemType) : ItemType).FOOD, 0], [(_crd && ItemType === void 0 ? (_reportPossibleCrUseOfItemType({
            error: Error()
          }), ItemType) : ItemType).TOOL, 0]]);
        }

        addItem(type) {
          var _this$_counts$get;

          this._counts.set(type, ((_this$_counts$get = this._counts.get(type)) != null ? _this$_counts$get : 0) + 1);
        }

        consumeItem(type) {
          var _this$_counts$get2;

          var count = (_this$_counts$get2 = this._counts.get(type)) != null ? _this$_counts$get2 : 0;
          if (count <= 0) return false;

          this._counts.set(type, count - 1);

          return true;
        }

        hasItem(type) {
          var _this$_counts$get3;

          return ((_this$_counts$get3 = this._counts.get(type)) != null ? _this$_counts$get3 : 0) > 0;
        }

        getCount(type) {
          var _this$_counts$get4;

          return (_this$_counts$get4 = this._counts.get(type)) != null ? _this$_counts$get4 : 0;
        }

        reset() {
          this._counts.set((_crd && ItemType === void 0 ? (_reportPossibleCrUseOfItemType({
            error: Error()
          }), ItemType) : ItemType).SHARD, 0);

          this._counts.set((_crd && ItemType === void 0 ? (_reportPossibleCrUseOfItemType({
            error: Error()
          }), ItemType) : ItemType).FOOD, 0);

          this._counts.set((_crd && ItemType === void 0 ? (_reportPossibleCrUseOfItemType({
            error: Error()
          }), ItemType) : ItemType).TOOL, 0);
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=da0b2c10e74e7c9e061495bb37f6ab8a00512d7d.js.map