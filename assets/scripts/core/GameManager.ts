import { _decorator, Component, Node } from 'cc';
import { EventBus } from './EventBus';
import { GameEvent } from './Constants';
import { GameStateModel, GamePhase } from '../models/GameStateModel';
import { LightSystem } from '../systems/LightSystem';
import { PoolingSystem } from '../systems/PoolingSystem';
import { SpawnSystem } from '../systems/SpawnSystem';
import { CollisionSystem } from '../systems/CollisionSystem';

const { ccclass, property } = _decorator;

/**
 * Root game orchestrator. Owns the game lifecycle and top-level systems.
 * Attach to the root node of the game scene.
 */
@ccclass('GameManager')
export class GameManager extends Component {

    private static _instance: GameManager | null = null;

    @property(Node) poolRoot: Node = null;
    @property(Node) spawnRoot: Node = null;

    private _state: GameStateModel    = new GameStateModel();
    private _lightSystem: LightSystem = new LightSystem();
    private _pooling: PoolingSystem   = new PoolingSystem();
    private _spawn: SpawnSystem       = new SpawnSystem();
    private _collision: CollisionSystem = new CollisionSystem();

    static getInstance(): GameManager { return GameManager._instance; }
    get pooling(): PoolingSystem     { return this._pooling; }
    get spawn(): SpawnSystem         { return this._spawn; }
    get collision(): CollisionSystem { return this._collision; }
    get lightSystem(): LightSystem   { return this._lightSystem; }
    get state(): GameStateModel      { return this._state; }

    onLoad(): void {
        GameManager._instance = this;
        this._pooling.init(this.poolRoot);
        this._spawn.init(this._pooling, this.spawnRoot);
        this._lightSystem.init();
        this._subscribeEvents();
    }

    start(): void {
        this._startGame();
    }

    onDestroy(): void {
        GameManager._instance = null;
        EventBus.reset();
    }

    private _startGame(): void {
        this._state.phase = GamePhase.PLAYING;
        EventBus.get().emit(GameEvent.GAME_START);
    }

    private _subscribeEvents(): void {
        const bus = EventBus.get();
        bus.on(GameEvent.GAME_OVER, this._onGameOver, this);
        bus.on(GameEvent.LIGHT_RESTORED, this._onLightRestored, this);
    }

    private _onGameOver(): void {
        this._state.phase = GamePhase.GAME_OVER;
        this._spawn.stop();
    }

    private _onLightRestored(lightValue: number): void {
        this._state.globalLightValue = lightValue;
        if (lightValue >= 1.0) {
            // All light restored — level complete
            this._state.phase = GamePhase.LEVEL_COMPLETE;
        }
    }
}
