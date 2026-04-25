System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, NPCModel, NPCView, _dec, _class, _crd, ccclass, NPCController;

  function _reportPossibleCrUseOfNPCModel(extras) {
    _reporterNs.report("NPCModel", "../models/NPCModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfNPCRewardType(extras) {
    _reporterNs.report("NPCRewardType", "../models/NPCModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfNPCView(extras) {
    _reporterNs.report("NPCView", "../views/NPCView", _context.meta, extras);
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
      NPCModel = _unresolved_2.NPCModel;
    }, function (_unresolved_3) {
      NPCView = _unresolved_3.NPCView;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "666acNwofJL/aCKVfFu0Xm5", "NPCController", undefined);

      __checkObsolete__(['_decorator', 'Component']);

      ({
        ccclass
      } = _decorator);
      /**
       * Pair of NPCModel + NPCView.
       * One component instance per pooled NPC node.
       */

      _export("NPCController", NPCController = (_dec = ccclass('NPCController'), _dec(_class = class NPCController extends Component {
        constructor() {
          super(...arguments);
          this._model = new (_crd && NPCModel === void 0 ? (_reportPossibleCrUseOfNPCModel({
            error: Error()
          }), NPCModel) : NPCModel)();
          this._view = null;
        }

        onLoad() {
          this._view = this.getComponent(_crd && NPCView === void 0 ? (_reportPossibleCrUseOfNPCView({
            error: Error()
          }), NPCView) : NPCView);
        }

        activate(id, x, y, wantsItem, givesReward) {
          var _this$_view, _this$_view2;

          this._model.reset(id, x, y, wantsItem, givesReward);

          (_this$_view = this._view) == null || _this$_view.setVisible(true);
          (_this$_view2 = this._view) == null || _this$_view2.setPosition(x, y);
        }

        deactivate() {
          var _this$_view3;

          this._model.deactivate();

          (_this$_view3 = this._view) == null || _this$_view3.setVisible(false);
        }

        scrollX(dx) {
          var _this$_view4;

          this._model.x -= dx;
          (_this$_view4 = this._view) == null || _this$_view4.setPosition(this._model.x, this._model.y);
        }

        markTraded() {
          var _this$_view5;

          this._model.traded = true;
          (_this$_view5 = this._view) == null || _this$_view5.playTradeEffect();
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
//# sourceMappingURL=68f025b670c8bac0a26c6c4ca159c48dd95f27ed.js.map