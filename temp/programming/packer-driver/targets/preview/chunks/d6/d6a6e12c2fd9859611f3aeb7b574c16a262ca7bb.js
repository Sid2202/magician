System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5", "__unresolved_6", "__unresolved_7"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, EventBus, GameEvent, GameStateModel, GamePhase, LightSystem, PoolingSystem, SpawnSystem, CollisionSystem, _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _class3, _crd, ccclass, property, GameManager;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfEventBus(extras) {
    _reporterNs.report("EventBus", "./EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameEvent(extras) {
    _reporterNs.report("GameEvent", "./Constants", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameStateModel(extras) {
    _reporterNs.report("GameStateModel", "../models/GameStateModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGamePhase(extras) {
    _reporterNs.report("GamePhase", "../models/GameStateModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfLightSystem(extras) {
    _reporterNs.report("LightSystem", "../systems/LightSystem", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPoolingSystem(extras) {
    _reporterNs.report("PoolingSystem", "../systems/PoolingSystem", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSpawnSystem(extras) {
    _reporterNs.report("SpawnSystem", "../systems/SpawnSystem", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCollisionSystem(extras) {
    _reporterNs.report("CollisionSystem", "../systems/CollisionSystem", _context.meta, extras);
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
    }, function (_unresolved_4) {
      GameStateModel = _unresolved_4.GameStateModel;
      GamePhase = _unresolved_4.GamePhase;
    }, function (_unresolved_5) {
      LightSystem = _unresolved_5.LightSystem;
    }, function (_unresolved_6) {
      PoolingSystem = _unresolved_6.PoolingSystem;
    }, function (_unresolved_7) {
      SpawnSystem = _unresolved_7.SpawnSystem;
    }, function (_unresolved_8) {
      CollisionSystem = _unresolved_8.CollisionSystem;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "a5f9bFzM/dGnLnuex4aR9aJ", "GameManager", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * Root game orchestrator. Owns the game lifecycle and top-level systems.
       * Attach to the root node of the game scene.
       */

      _export("GameManager", GameManager = (_dec = ccclass('GameManager'), _dec2 = property(Node), _dec3 = property(Node), _dec(_class = (_class2 = (_class3 = class GameManager extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "poolRoot", _descriptor, this);

          _initializerDefineProperty(this, "spawnRoot", _descriptor2, this);

          this._state = new (_crd && GameStateModel === void 0 ? (_reportPossibleCrUseOfGameStateModel({
            error: Error()
          }), GameStateModel) : GameStateModel)();
          this._lightSystem = new (_crd && LightSystem === void 0 ? (_reportPossibleCrUseOfLightSystem({
            error: Error()
          }), LightSystem) : LightSystem)();
          this._pooling = new (_crd && PoolingSystem === void 0 ? (_reportPossibleCrUseOfPoolingSystem({
            error: Error()
          }), PoolingSystem) : PoolingSystem)();
          this._spawn = new (_crd && SpawnSystem === void 0 ? (_reportPossibleCrUseOfSpawnSystem({
            error: Error()
          }), SpawnSystem) : SpawnSystem)();
          this._collision = new (_crd && CollisionSystem === void 0 ? (_reportPossibleCrUseOfCollisionSystem({
            error: Error()
          }), CollisionSystem) : CollisionSystem)();
        }

        static getInstance() {
          return GameManager._instance;
        }

        get pooling() {
          return this._pooling;
        }

        get spawn() {
          return this._spawn;
        }

        get collision() {
          return this._collision;
        }

        get lightSystem() {
          return this._lightSystem;
        }

        get state() {
          return this._state;
        }

        onLoad() {
          GameManager._instance = this;

          this._pooling.init(this.poolRoot);

          this._spawn.init(this._pooling, this.spawnRoot);

          this._lightSystem.init();

          this._subscribeEvents();
        }

        start() {
          this._startGame();
        }

        onDestroy() {
          GameManager._instance = null;
          (_crd && EventBus === void 0 ? (_reportPossibleCrUseOfEventBus({
            error: Error()
          }), EventBus) : EventBus).reset();
        }

        _startGame() {
          this._state.phase = (_crd && GamePhase === void 0 ? (_reportPossibleCrUseOfGamePhase({
            error: Error()
          }), GamePhase) : GamePhase).PLAYING;
          (_crd && EventBus === void 0 ? (_reportPossibleCrUseOfEventBus({
            error: Error()
          }), EventBus) : EventBus).get().emit((_crd && GameEvent === void 0 ? (_reportPossibleCrUseOfGameEvent({
            error: Error()
          }), GameEvent) : GameEvent).GAME_START);
        }

        _subscribeEvents() {
          var bus = (_crd && EventBus === void 0 ? (_reportPossibleCrUseOfEventBus({
            error: Error()
          }), EventBus) : EventBus).get();
          bus.on((_crd && GameEvent === void 0 ? (_reportPossibleCrUseOfGameEvent({
            error: Error()
          }), GameEvent) : GameEvent).GAME_OVER, this._onGameOver, this);
          bus.on((_crd && GameEvent === void 0 ? (_reportPossibleCrUseOfGameEvent({
            error: Error()
          }), GameEvent) : GameEvent).LIGHT_RESTORED, this._onLightRestored, this);
        }

        _onGameOver() {
          this._state.phase = (_crd && GamePhase === void 0 ? (_reportPossibleCrUseOfGamePhase({
            error: Error()
          }), GamePhase) : GamePhase).GAME_OVER;

          this._spawn.stop();
        }

        _onLightRestored(lightValue) {
          this._state.globalLightValue = lightValue;

          if (lightValue >= 1.0) {
            // All light restored — level complete
            this._state.phase = (_crd && GamePhase === void 0 ? (_reportPossibleCrUseOfGamePhase({
              error: Error()
            }), GamePhase) : GamePhase).LEVEL_COMPLETE;
          }
        }

      }, _class3._instance = null, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "poolRoot", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "spawnRoot", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=d6a6e12c2fd9859611f3aeb7b574c16a262ca7bb.js.map