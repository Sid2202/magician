import { _decorator, Component, Vec2, Vec3, input, Input, KeyCode, EventTouch } from 'cc';
import { CharacterModel } from '../Models/CharacterModel';
import { CharacterView } from '../Views/CharacterView';
import { GameManager } from '../Managers/GameManager';
import { GameEventsBus } from '../common/event/GlobalEventTarget';
import { GameEvents } from './input/GameEvents';

const { ccclass, property } = _decorator;

/**
 * Attach to the ROOT NODE of PF_Character prefab.
 *
 * This is the CONTROLLER layer for the character.
 * It owns the CharacterModel (data) and drives CharacterView (visuals).
 *
 * Responsibilities:
 *   - Reads keyboard (WASD / arrows) and touch drag input
 *   - Integrates velocity + hover damping each frame
 *   - Clamps position inside screen bounds
 *   - Tells CharacterView which animation to play and which way to face
 *
 * The character does NOT scroll with the world — it moves freely within
 * screen bounds while the world (paths, items, NPCs) scrolls past it.
 */
@ccclass('CharacterController')
export class CharacterController extends Component {

    /** Drag boundsX/Y to tune how far the character can travel from center. */
    @property boundsX:        number = 460;
    @property boundsYTop:     number = 480;
    @property boundsYBottom:  number = -480;

    // Model — pure data, no Cocos
    private _model: CharacterModel = new CharacterModel();

    // View — on Chr_Pose_Side child, fetched in onLoad
    private _view: CharacterView | null = null;

    // ── Input state ───────────────────────────────────────────────────────
    private _keys:          Set<number> = new Set();
    private _isTouching:    boolean     = false;
    private _touchStart:    Vec2        = new Vec2();
    private _touchCurrent:  Vec2        = new Vec2();

    // Reusable — avoids per-frame Vec3 allocation
    private _pos: Vec3 = new Vec3();

    // Tracks last non-zero vx to preserve facing when velocity damps to 0
    private _lastFacingRight: boolean = true;

    // ─────────────────────────────────────────────────────────────────────
    onLoad(): void {
        // Grab the view from Chr_Pose_Side child
        this._view = this.getComponentInChildren(CharacterView);
        if (!this._view) {
            console.warn('[CharacterController] CharacterView not found on a child node. ' +
                         'Attach CharacterView.ts to Chr_Pose_Side.');
        }

        // Sync model to where the artist placed the character in the prefab
        this.node.getPosition(this._pos);
        this._model.x = this._pos.x;
        this._model.y = this._pos.y;

        // Keyboard
        input.on(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        input.on(Input.EventType.KEY_UP,   this._onKeyUp,   this);

        // Touch — listen on the whole parent node (the full gameplay area)
        const touchArea = this.node.parent ?? this.node;
        touchArea.on(Input.EventType.TOUCH_START,  this._onTouchStart, this);
        touchArea.on(Input.EventType.TOUCH_MOVE,   this._onTouchMove,  this);
        touchArea.on(Input.EventType.TOUCH_END,    this._onTouchEnd,   this);
        touchArea.on(Input.EventType.TOUCH_CANCEL, this._onTouchEnd,   this);

        GameEventsBus.get().on(GameEvents.GameOver, this._onGameOver, this);
    }

    onDestroy(): void {
        input.off(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        input.off(Input.EventType.KEY_UP,   this._onKeyUp,   this);

        const touchArea = this.node.parent ?? this.node;
        touchArea.off(Input.EventType.TOUCH_START,  this._onTouchStart, this);
        touchArea.off(Input.EventType.TOUCH_MOVE,   this._onTouchMove,  this);
        touchArea.off(Input.EventType.TOUCH_END,    this._onTouchEnd,   this);
        touchArea.off(Input.EventType.TOUCH_CANCEL, this._onTouchEnd,   this);

        GameEventsBus.get().off(GameEvents.GameOver, this._onGameOver, this);
    }

    update(dt: number): void {
        const gm = GameManager.getInstance();
        if (!gm?.state.isPlaying || !this._model.isAlive) return;

        this._readInput(dt);
        this._clampToBounds();
        this._pushToNode();
        this._pushToView();
    }

    /** Read by GameController each frame for AABB collision. */
    getModel(): CharacterModel { return this._model; }

    // ── Input → Model ─────────────────────────────────────────────────────

    private _readInput(dt: number): void {
        const m   = this._model;
        const spd = m.speed;

        // Keyboard axes
        const kLeft  = this._keys.has(KeyCode.KEY_A) || this._keys.has(KeyCode.ARROW_LEFT);
        const kRight = this._keys.has(KeyCode.KEY_D) || this._keys.has(KeyCode.ARROW_RIGHT);
        const kUp    = this._keys.has(KeyCode.KEY_W) || this._keys.has(KeyCode.ARROW_UP);
        const kDown  = this._keys.has(KeyCode.KEY_S) || this._keys.has(KeyCode.ARROW_DOWN);

        // Touch drag → proportional velocity (capped at full speed)
        let tVx = 0;
        let tVy = 0;
        if (this._isTouching) {
            const DEAD   = 15;    // pixels of deadzone before registering drag
            const SCALE  = 0.014; // drag pixels → speed fraction
            const dx = this._touchCurrent.x - this._touchStart.x;
            const dy = this._touchCurrent.y - this._touchStart.y;
            if (Math.abs(dx) > DEAD) tVx = clamp(dx * SCALE, -1, 1) * spd;
            if (Math.abs(dy) > DEAD) tVy = clamp(dy * SCALE, -1, 1) * spd;
        }

        const hasInput = kLeft || kRight || kUp || kDown || this._isTouching;

        if (hasInput) {
            // Keyboard takes priority over touch on any active axis
            m.vx = kLeft ? -spd : kRight ? spd : tVx;
            m.vy = kUp   ?  spd : kDown  ? -spd : tVy;
        } else {
            // No input → hover damping (exponential decay toward zero)
            m.vx *= m.damping;
            m.vy *= m.damping;
            if (Math.abs(m.vx) < 1.5) m.vx = 0;
            if (Math.abs(m.vy) < 1.5) m.vy = 0;
        }

        m.x += m.vx * dt;
        m.y += m.vy * dt;
    }

    private _clampToBounds(): void {
        const m = this._model;
        m.x = clamp(m.x, -this.boundsX,       this.boundsX);
        m.y = clamp(m.y,  this.boundsYBottom,  this.boundsYTop);
    }

    // ── Model → Node ──────────────────────────────────────────────────────

    private _pushToNode(): void {
        this._pos.set(this._model.x, this._model.y, 0);
        this.node.setPosition(this._pos);
    }

    // ── Model → View ──────────────────────────────────────────────────────

    private _pushToView(): void {
        if (!this._view) return;
        const m = this._model;

        // Facing direction — only update when actually moving horizontally
        if (m.vx > 0.5)       { this._lastFacingRight = true;  }
        else if (m.vx < -0.5) { this._lastFacingRight = false; }
        this._view.setFacing(this._lastFacingRight);

        // Animation state
        const isMoving = Math.abs(m.vx) > 5 || Math.abs(m.vy) > 5;
        if (isMoving) {
            this._view.playFly();
        } else {
            this._view.playIdle();
        }
    }

    // ── Event handlers ────────────────────────────────────────────────────

    private _onKeyDown(e: { keyCode: number }): void { this._keys.add(e.keyCode);    }
    private _onKeyUp(e: { keyCode: number }): void   { this._keys.delete(e.keyCode); }

    private _onTouchStart(e: EventTouch): void {
        this._isTouching = true;
        const loc = e.getUILocation();
        this._touchStart.set(loc.x, loc.y);
        this._touchCurrent.set(loc.x, loc.y);
    }

    private _onTouchMove(e: EventTouch): void {
        const loc = e.getUILocation();
        this._touchCurrent.set(loc.x, loc.y);
    }

    private _onTouchEnd(): void {
        this._isTouching = false;
    }

    private _onGameOver(): void {
        this._model.isAlive = false;
        this._model.vx = 0;
        this._model.vy = 0;
        this._view?.playHit();
    }
}

// ── Module helpers ────────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number): number {
    return v < min ? min : v > max ? max : v;
}
