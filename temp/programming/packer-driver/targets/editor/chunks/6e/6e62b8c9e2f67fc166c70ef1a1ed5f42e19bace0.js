System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, ItemModel, ItemView, _dec, _class, _crd, ccclass, ItemController;

  function _reportPossibleCrUseOfItemModel(extras) {
    _reporterNs.report("ItemModel", "../models/ItemModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfItemView(extras) {
    _reporterNs.report("ItemView", "../views/ItemView", _context.meta, extras);
  }

  function _reportPossibleCrUseOfItemType(extras) {
    _reporterNs.report("ItemType", "../core/Constants", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
    }, function (_unresolved_2) {
      ItemModel = _unresolved_2.ItemModel;
    }, function (_unresolved_3) {
      ItemView = _unresolved_3.ItemView;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "727f4XBfDpC9JOac58fpw9H", "ItemController", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node']);

      ({
        ccclass
      } = _decorator);
      /**
       * Pair of ItemModel + ItemView, managed by SpawnSystem/PoolingSystem.
       * One component instance per pooled item node.
       */

      _export("ItemController", ItemController = (_dec = ccclass('ItemController'), _dec(_class = class ItemController extends Component {
        constructor(...args) {
          super(...args);
          this._model = new (_crd && ItemModel === void 0 ? (_reportPossibleCrUseOfItemModel({
            error: Error()
          }), ItemModel) : ItemModel)();
          this._view = null;
        }

        onLoad() {
          this._view = this.getComponent(_crd && ItemView === void 0 ? (_reportPossibleCrUseOfItemView({
            error: Error()
          }), ItemView) : ItemView);
        }

        activate(id, type, x, y) {
          var _this$_view, _this$_view2;

          this._model.reset(id, type, x, y);

          (_this$_view = this._view) == null || _this$_view.setVisible(true);
          (_this$_view2 = this._view) == null || _this$_view2.setPosition(x, y);
        }

        deactivate() {
          var _this$_view3;

          this._model.deactivate();

          (_this$_view3 = this._view) == null || _this$_view3.setVisible(false);
        }
        /** Called by MovementSystem to scroll item with the world. */


        scrollX(dx) {
          var _this$_view4;

          this._model.x -= dx;
          (_this$_view4 = this._view) == null || _this$_view4.setPosition(this._model.x, this._model.y);
        }

        getModel() {
          return this._model;
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=6e62b8c9e2f67fc166c70ef1a1ed5f42e19bace0.js.map