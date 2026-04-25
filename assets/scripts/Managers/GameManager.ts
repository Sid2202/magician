import { GameStateModel, GamePhase } from '../Models/GameStateModel';
import { InventoryModel } from '../Models/InventoryModel';
import { GameEventsBus } from '../common/event/GlobalEventTarget';
import { GameEvents, ItemType } from '../gameplay/input/GameEvents';

/**
 * Pure TypeScript singleton — NOT a Cocos component.
 * Holds the authoritative game state and inventory for the current session.
 * Access anywhere via GameManager.getInstance().
 */
export class GameManager {
    private static _instance: GameManager | null = null;

    private _state:     GameStateModel = new GameStateModel();
    private _inventory: InventoryModel = new InventoryModel();

    private constructor() {}

    static getInstance(): GameManager {
        if (!GameManager._instance) {
            GameManager._instance = new GameManager();
        }
        return GameManager._instance;
    }

    /** Call on session start to reset all state. */
    static startSession(totalLightPoints: number): void {
        const gm = GameManager.getInstance();
        gm._state.reset();
        gm._inventory.reset();
        gm._state.totalLightPoints = totalLightPoints;
        gm._state.phase = GamePhase.Playing;
        GameEventsBus.get().emit(GameEvents.GameStart);
    }

    /** Call on scene teardown to clear listeners and reset singleton. */
    static endSession(): void {
        GameEventsBus.destroy();
        GameManager._instance = null;
    }

    get state():     GameStateModel { return this._state;     }
    get inventory(): InventoryModel { return this._inventory; }

    // ── Convenience helpers called by GameController ─────────────────────

    onItemCollected(type: ItemType): void {
        this._inventory.addItem(type);
        GameEventsBus.get().emit(GameEvents.ItemCollected, type);
    }

    onLightPointRestored(): void {
        this._state.restoredLightPoints++;
        this._state.globalLightValue = this._state.totalLightPoints > 0
            ? this._state.restoredLightPoints / this._state.totalLightPoints
            : 0;
        GameEventsBus.get().emit(GameEvents.LightRestored, this._state.globalLightValue);

        if (this._state.globalLightValue >= 1.0) {
            this._state.phase = GamePhase.LevelComplete;
            GameEventsBus.get().emit(GameEvents.LevelComplete);
        }
    }

    onGameOver(): void {
        this._state.phase = GamePhase.GameOver;
        GameEventsBus.get().emit(GameEvents.GameOver);
    }
}
