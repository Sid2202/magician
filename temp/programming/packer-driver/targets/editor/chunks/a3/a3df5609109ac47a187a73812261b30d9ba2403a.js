System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5", "__unresolved_6", "__unresolved_7"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, PlayerModel, PlayerView, InputSystem, MovementSystem, EventBus, GameEvent, GameManager, _dec, _dec2, _class, _class2, _descriptor, _crd, ccclass, property, PlayerController;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfPlayerModel(extras) {
    _reporterNs.report("PlayerModel", "../models/PlayerModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerView(extras) {
    _reporterNs.report("PlayerView", "../views/PlayerView", _context.meta, extras);
  }

  function _reportPossibleCrUseOfInputSystem(extras) {
    _reporterNs.report("InputSystem", "../systems/InputSystem", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMovementSystem(extras) {
    _reporterNs.report("MovementSystem", "../systems/MovementSystem", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEventBus(extras) {
    _reporterNs.report("EventBus", "../core/EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameEvent(extras) {
    _reporterNs.report("GameEvent", "../core/Constants", _context.meta, extras);
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
    }, function (_unresolved_2) {
      PlayerModel = _unresolved_2.PlayerModel;
    }, function (_unresolved_3) {
      PlayerView = _unresolved_3.PlayerView;
    }, function (_unresolved_4) {
      InputSystem = _unresolved_4.InputSystem;
    }, function (_unresolved_5) {
      MovementSystem = _unresolved_5.MovementSystem;
    }, function (_unresolved_6) {
      EventBus = _unresolved_6.EventBus;
    }, function (_unresolved_7) {
      GameEvent = _unresolved_7.GameEvent;
    }, function (_unresolved_8) {
      GameManager = _unresolved_8.GameManager;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "96276MIr7lFALrGebdz6nRR", "PlayerController", undefined);

      __checkObsolete__(['_decorator', 'Component']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * Orchestrates PlayerModel ↔ InputSystem ↔ MovementSystem ↔ PlayerView.
       * Contains no gameplay math — delegates to systems.
       */

      _export("PlayerController", PlayerController = (_dec = ccclass('PlayerController'), _dec2 = property(_crd && PlayerView === void 0 ? (_reportPossibleCrUseOfPlayerView({
        error: Error()
      }), PlayerView) : PlayerView), _dec(_class = (_class2 = class PlayerController extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "view", _descriptor, this);

          this._model = new (_crd && PlayerModel === void 0 ? (_reportPossibleCrUseOfPlayerModel({
            error: Error()
          }), PlayerModel) : PlayerModel)();
          this._input = new (_crd && InputSystem === void 0 ? (_reportPossibleCrUseOfInputSystem({
            error: Error()
          }), InputSystem) : InputSystem)();
          this._movement = new (_crd && MovementSystem === void 0 ? (_reportPossibleCrUseOfMovementSystem({
            error: Error()
          }), MovementSystem) : MovementSystem)();
        }

        onLoad() {
          this._input.init(this.node.scene);

          (_crd && EventBus === void 0 ? (_reportPossibleCrUseOfEventBus({
            error: Error()
          }), EventBus) : EventBus).get().on((_crd && GameEvent === void 0 ? (_reportPossibleCrUseOfGameEvent({
            error: Error()
          }), GameEvent) : GameEvent).GAME_OVER, this._onGameOver, this);
        }

        onDestroy() {
          this._input.destroy();

          (_crd && EventBus === void 0 ? (_reportPossibleCrUseOfEventBus({
            error: Error()
          }), EventBus) : EventBus).get().off((_crd && GameEvent === void 0 ? (_reportPossibleCrUseOfGameEvent({
            error: Error()
          }), GameEvent) : GameEvent).GAME_OVER, this._onGameOver, this);
        }

        update(dt) {
          const gm = (_crd && GameManager === void 0 ? (_reportPossibleCrUseOfGameManager({
            error: Error()
          }), GameManager) : GameManager).getInstance();
          if (!gm || !gm.state.isPlaying || !this._model.isAlive) return;

          this._input.readInto(this._model.input);

          this._movement.updatePlayer(this._model, dt);

          if (this.view) {
            this.view.setPosition(this._model.x, this._model.y);

            if (this._model.vx !== 0) {
              this.view.setFacingDirection(this._model.vx > 0);
            }
          }
        }

        getModel() {
          return this._model;
        }

        _onGameOver() {
          this._model.isAlive = false;
          this._model.vx = 0;
          this._model.vy = 0;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "view", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=a3df5609109ac47a187a73812261b30d9ba2403a.js.map