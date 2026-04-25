import { _decorator, Component, Node } from 'cc';
import { GameManager } from '../Managers/GameManager';
import { GameEventsBus } from '../common/event/GlobalEventTarget';
import { GameEvents } from '../gameplay/input/GameEvents';

const { ccclass, property } = _decorator;

/**
 * Attach to the Canvas node in GameScene.scene.
 *
 * Responsibilities:
 *   - Owns the scene node references (UIParent, SceneParent, PopupParent)
 *   - Kicks off the game session
 *   - Listens for game-over / level-complete to hand off to UI
 *
 * All gameplay logic lives in GameController (on Base_Parent inside GameScene.prefab).
 */
@ccclass('GameScene')
export class GameScene extends Component {

    @property(Node) sceneParent:  Node = null;  // GameScene.prefab lives here
    @property(Node) uiParent:     Node = null;  // HUD / score UI goes here
    @property(Node) popupParent:  Node = null;  // Popups go here

    onLoad(): void {
        this._subscribeEvents();
    }

    start(): void {
        // GameController (on Base_Parent) wires itself via GameManager.startSession().
        // Nothing extra needed here until we add a lobby/loading screen.
    }

    onDestroy(): void {
        GameManager.endSession();
    }

    // ── Event handlers ────────────────────────────────────────────────────

    private _subscribeEvents(): void {
        const bus = GameEventsBus.get();
        bus.on(GameEvents.GameOver,       this._onGameOver,       this);
        bus.on(GameEvents.LevelComplete,  this._onLevelComplete,  this);
    }

    private _onGameOver(): void {
        // TODO: show GameOver popup via PopupManager
        console.log('[GameScene] Game Over');
    }

    private _onLevelComplete(): void {
        // TODO: show LevelComplete popup
        console.log('[GameScene] Level Complete – light fully restored!');
    }
}
