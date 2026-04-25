import { _decorator, Component, Node } from 'cc';
import { GameManager } from '../Managers/GameManager';
import { GameEventsBus } from '../common/event/GlobalEventTarget';
import { GameEvents } from '../gameplay/input/GameEvents';

const { ccclass, property } = _decorator;

/**
 * Attach to: GameScene prefab ROOT NODE (the top-level node of GameScene.prefab).
 *
 * This is the entry point for the prefab.
 * It owns references to the two direct children:
 *   - PF_Character  → the playable character
 *   - Base_Parent   → the gameplay world (GameController lives here)
 *
 * It does NOT reference UIParent / SceneParent / PopupParent —
 * those are in the scene (Canvas), outside this prefab.
 * UI connections will be added later via PopupManager.
 */
@ccclass('GameScene')
export class GameScene extends Component {

    /** Drag PF_Character node here (direct child of this prefab root). */
    @property(Node) characterNode: Node = null;

    /** Drag Base_Parent node here (direct child of this prefab root). */
    @property(Node) gameWorldNode: Node = null;

    onLoad(): void {
        this._validate();
        this._subscribeEvents();
        GameManager.startSession(1);  // temp until GameController exists
    }

    onDestroy(): void {
        GameManager.endSession();
    }

    // ── Validation ────────────────────────────────────────────────────────

    private _validate(): void {
        if (!this.characterNode) {
            console.error('[GameScene] characterNode not wired — drag PF_Character here.');
        }
        if (!this.gameWorldNode) {
            console.error('[GameScene] gameWorldNode not wired — drag Base_Parent here.');
        }
    }

    // ── Events ────────────────────────────────────────────────────────────

    private _subscribeEvents(): void {
        const bus = GameEventsBus.get();
        bus.on(GameEvents.GameOver,      this._onGameOver,      this);
        bus.on(GameEvents.LevelComplete, this._onLevelComplete, this);
    }

    private _onGameOver(): void {
        // TODO: show GameOver popup (PopupManager.getInstance().create(...))
        console.log('[GameScene] Game Over');
    }

    private _onLevelComplete(): void {
        // TODO: show LevelComplete popup
        console.log('[GameScene] Level Complete');
    }
}
