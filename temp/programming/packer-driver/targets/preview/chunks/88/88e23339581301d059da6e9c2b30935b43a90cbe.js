System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5", "__unresolved_6"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, EventBus, GameEvent, ItemType, InventoryModel, LightPointView, LightPointModel, GameManager, _dec, _dec2, _class, _class2, _descriptor, _crd, ccclass, property, GameController;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfEventBus(extras) {
    _reporterNs.report("EventBus", "../core/EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameEvent(extras) {
    _reporterNs.report("GameEvent", "../core/Constants", _context.meta, extras);
  }

  function _reportPossibleCrUseOfItemType(extras) {
    _reporterNs.report("ItemType", "../core/Constants", _context.meta, extras);
  }

  function _reportPossibleCrUseOfInventoryModel(extras) {
    _reporterNs.report("InventoryModel", "../models/InventoryModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfLightPointView(extras) {
    _reporterNs.report("LightPointView", "../views/LightPointView", _context.meta, extras);
  }

  function _reportPossibleCrUseOfLightPointModel(extras) {
    _reporterNs.report("LightPointModel", "../models/LightPointModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameManager(extras) {
    _reporterNs.report("GameManager", "../core/GameManager", _context.meta, extras);
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
      Node = _cc.Node;
    }, function (_unresolved_2) {
      EventBus = _unresolved_2.EventBus;
    }, function (_unresolved_3) {
      GameEvent = _unresolved_3.GameEvent;
      ItemType = _unresolved_3.ItemType;
    }, function (_unresolved_4) {
      InventoryModel = _unresolved_4.InventoryModel;
    }, function (_unresolved_5) {
      LightPointView = _unresolved_5.LightPointView;
    }, function (_unresolved_6) {
      LightPointModel = _unresolved_6.LightPointModel;
    }, function (_unresolved_7) {
      GameManager = _unresolved_7.GameManager;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "8ef016YVM5C8YQNosqCb3D2", "GameController", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * Top-level scene controller.
       * Bridges inventory, light points, and cross-system events.
       */

      _export("GameController", GameController = (_dec = ccclass('GameController'), _dec2 = property([Node]), _dec(_class = (_class2 = class GameController extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "lightPointNodes", _descriptor, this);

          this._inventory = new (_crd && InventoryModel === void 0 ? (_reportPossibleCrUseOfInventoryModel({
            error: Error()
          }), InventoryModel) : InventoryModel)();
          this._lightModels = [];
          this._lightViews = [];
        }

        onLoad() {
          this._initLightPoints();

          this._subscribeEvents();
        }

        onDestroy() {
          var bus = (_crd && EventBus === void 0 ? (_reportPossibleCrUseOfEventBus({
            error: Error()
          }), EventBus) : EventBus).get();
          bus.off((_crd && GameEvent === void 0 ? (_reportPossibleCrUseOfGameEvent({
            error: Error()
          }), GameEvent) : GameEvent).ITEM_COLLECTED, this._onItemCollected, this);
          bus.off((_crd && GameEvent === void 0 ? (_reportPossibleCrUseOfGameEvent({
            error: Error()
          }), GameEvent) : GameEvent).ITEM_CONSUMED, this._onItemConsumed, this);
          bus.off((_crd && GameEvent === void 0 ? (_reportPossibleCrUseOfGameEvent({
            error: Error()
          }), GameEvent) : GameEvent).TRADE_SUCCESS, this._onTradeSuccess, this);
        }

        getInventory() {
          return this._inventory;
        }

        _initLightPoints() {
          var gm = (_crd && GameManager === void 0 ? (_reportPossibleCrUseOfGameManager({
            error: Error()
          }), GameManager) : GameManager).getInstance();

          for (var i = 0; i < this.lightPointNodes.length; i++) {
            var model = new (_crd && LightPointModel === void 0 ? (_reportPossibleCrUseOfLightPointModel({
              error: Error()
            }), LightPointModel) : LightPointModel)();
            model.reset(i, 0, 0);

            this._lightModels.push(model);

            var view = this.lightPointNodes[i].getComponent(_crd && LightPointView === void 0 ? (_reportPossibleCrUseOfLightPointView({
              error: Error()
            }), LightPointView) : LightPointView);

            this._lightViews.push(view);
          }

          if (gm) {
            gm.state.totalLightPoints = this._lightModels.length;
          }
        }

        _subscribeEvents() {
          var bus = (_crd && EventBus === void 0 ? (_reportPossibleCrUseOfEventBus({
            error: Error()
          }), EventBus) : EventBus).get();
          bus.on((_crd && GameEvent === void 0 ? (_reportPossibleCrUseOfGameEvent({
            error: Error()
          }), GameEvent) : GameEvent).ITEM_COLLECTED, this._onItemCollected, this);
          bus.on((_crd && GameEvent === void 0 ? (_reportPossibleCrUseOfGameEvent({
            error: Error()
          }), GameEvent) : GameEvent).ITEM_CONSUMED, this._onItemConsumed, this);
          bus.on((_crd && GameEvent === void 0 ? (_reportPossibleCrUseOfGameEvent({
            error: Error()
          }), GameEvent) : GameEvent).TRADE_SUCCESS, this._onTradeSuccess, this);
        }

        _onItemCollected(type) {
          this._inventory.addItem(type); // Attempt shard-based light activation after each shard collect


          if (type === (_crd && ItemType === void 0 ? (_reportPossibleCrUseOfItemType({
            error: Error()
          }), ItemType) : ItemType).SHARD) {
            this._tryActivateLightPoints();
          }
        }

        _onItemConsumed(type) {
          this._inventory.consumeItem(type);
        }

        _onTradeSuccess(rewardType) {
          this._tryActivateLightPointsByTrade(rewardType);
        }

        _tryActivateLightPoints() {
          var shards = this._inventory.getCount((_crd && ItemType === void 0 ? (_reportPossibleCrUseOfItemType({
            error: Error()
          }), ItemType) : ItemType).SHARD);

          for (var model of this._lightModels) {
            if (!model.restored && model.canActivateWithShards(shards)) {
              this._activateLightPoint(model);
            }
          }
        }

        _tryActivateLightPointsByTrade(rewardType) {
          for (var model of this._lightModels) {
            if (!model.restored && model.canActivateWithTrade(rewardType)) {
              this._activateLightPoint(model);
            }
          }
        }

        _activateLightPoint(model) {
          model.restored = true;
          var view = this._lightViews[model.id];
          view == null || view.playRestoreEffect();
          view == null || view.setRestored(true);
          var gm = (_crd && GameManager === void 0 ? (_reportPossibleCrUseOfGameManager({
            error: Error()
          }), GameManager) : GameManager).getInstance();

          if (gm) {
            gm.lightSystem.onLightPointRestored(gm.state);
          }
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "lightPointNodes", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return [];
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=88e23339581301d059da6e9c2b30935b43a90cbe.js.map