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

    private _candles: { node: Node, isLit: boolean, lastRelativeX: number | null, lastX: number | null }[] = [];

    onLoad(): void {
        this._validate();
        this._subscribeEvents();
        GameManager.startSession(1);  // temp until GameController exists

        this._findCandles(this.node);
    }

    onDestroy(): void {
        GameManager.endSession();
    }

    update(dt: number): void {
        if (!this.characterNode || this._candles.length === 0) return;

        const charX = this.characterNode.worldPosition.x;

        for (const candle of this._candles) {
            const currentX = candle.node.worldPosition.x;
            const currentRelativeX = currentX - charX;

            if (candle.lastX !== null && candle.lastRelativeX !== null) {
                // Detect a large jump in world space (background looping)
                if (Math.abs(currentX - candle.lastX) > 300) {
                    candle.isLit = false;
                } 
                // Detect passing: candle was ahead of player, now at or behind player
                else if (candle.lastRelativeX > 0 && currentRelativeX <= 0) {
                    candle.isLit = true;
                }
            }

            candle.lastX = currentX;
            candle.lastRelativeX = currentRelativeX;

            const glow = candle.node.getChildByName('Magician_Glow');
            if (glow && glow.active !== candle.isLit) {
                glow.active = candle.isLit;
            }
        }
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
        bus.on(GameEvents.GameWon,       this._onGameWon,       this);
    }

    private _onGameOver(): void {
        // TODO: show GameOver popup (PopupManager.getInstance().create(...))
        console.log('[GameScene] Game Over');
    }

    private _onLevelComplete(): void {
        // TODO: show LevelComplete popup
        console.log('[GameScene] Level Complete');
    }

    private _onGameWon(): void {
        GameManager.getInstance().pauseGame();
        console.log('[GameScene] Game Won!');
    }

    // ── Scene queries ─────────────────────────────────────────────────────

    private _findCandles(node: Node): void {
        if (node.name.startsWith('PF_Collectible_Candle')) {
            this._candles.push({ node, isLit: false, lastRelativeX: null, lastX: null });
        }
        for (const child of node.children) {
            this._findCandles(child);
        }
    }
}
