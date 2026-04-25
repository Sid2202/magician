import { _decorator, Component, Node, Vec2, Vec3, input, Input, KeyCode, EventTouch, UITransform, view } from 'cc';
import { CharacterModel } from '../Models/CharacterModel';
import { GameManager } from '../Managers/GameManager';
import { GameEventsBus } from '../common/event/GlobalEventTarget';
import { GameEvents } from './input/GameEvents';

const { ccclass, property } = _decorator;

/**
 * Attach to the root node of PF_Character prefab.
 *
 * Handles:
 *   - Keyboard (WASD / arrows) + touch drag input
 *   - Hover damping when idle
 *   - Position clamped to screen bounds
 *   - Flips sprite to face movement direction
 *
 * The node this is attached to IS the character pivot.
 * Sprite lives on the child node (Chr_Pose_Side).
 */
@ccclass('CharacterController')
export class CharacterController extends Component {

    /** Drag the Chr_Pose_Side child node here — used only for sprite flip. */
    @property(Node) spriteNode: Node = null;

    /** Screen boundary padding in pixels (keeps character from leaving the viewport). */
    @property boundsX: number = 460;
    @property boundsYTop: number = 480;
    @property boundsYBottom: number = -480;

    private _model: CharacterModel = new CharacterModel();

    // ── Keyboard state ────────────────────────────────────────────────────
    private _keys: Set<number> = new Set();

    // ── Touch state ───────────────────────────────────────────────────────
    private _isTouching: boolean = false;
    private _touchCurrent: Vec2  = new Vec2();
    private _touchStart: Vec2    = new Vec2();

    // ── Reusable Vec3 to avoid per-frame allocation ───────────────────────
    private _pos: Vec3 = new Vec3();

    // ─────────────────────────────────────────────────────────────────────
    onLoad(): void {
        // Keyboard
        input.on(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        input.on(Input.EventType.KEY_UP,   this._onKeyUp,   this);

        // Touch — listen on the parent (Base_Parent / whole gameplay area)
        const touchTarget = this.node.parent ?? this.node;
        touchTarget.on(Input.EventType.TOUCH_START, this._onTouchStart, this);
        touchTarget.on(Input.EventType.TOUCH_MOVE,  this._onTouchMove,  this);
        touchTarget.on(Input.EventType.TOUCH_END,   this._onTouchEnd,   this);
        touchTarget.on(Input.EventType.TOUCH_CANCEL, this._onTouchEnd,  this);

        // Sync model to node's starting position
        this.node.getPosition(this._pos);
        this._model.x = this._pos.x;
        this._model.y = this._pos.y;

        GameEventsBus.get().on(GameEvents.GameOver, this._onGameOver, this);
    }

    onDestroy(): void {
        input.off(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        input.off(Input.EventType.KEY_UP,   this._onKeyUp,   this);

        const touchTarget = this.node.parent ?? this.node;
        touchTarget.off(Input.EventType.TOUCH_START, this._onTouchStart, this);
        touchTarget.off(Input.EventType.TOUCH_MOVE,  this._onTouchMove,  this);
        touchTarget.off(Input.EventType.TOUCH_END,   this._onTouchEnd,   this);
        touchTarget.off(Input.EventType.TOUCH_CANCEL, this._onTouchEnd,  this);

        GameEventsBus.get().off(GameEvents.GameOver, this._onGameOver, this);
    }

    update(dt: number): void {
        const gm = GameManager.getInstance();
        if (!gm?.state.isPlaying || !this._model.isAlive) return;

        this._applyInput(dt);
        this._clampToBounds();
        this._pushToNode();
        this._updateSpriteFlip();
    }

    getModel(): CharacterModel { return this._model; }

    // ── Input processing ──────────────────────────────────────────────────

    private _applyInput(dt: number): void {
        const m   = this._model;
        const spd = m.speed;

        // --- Keyboard ---
        const kLeft  = this._keys.has(KeyCode.KEY_A) || this._keys.has(KeyCode.ARROW_LEFT);
        const kRight = this._keys.has(KeyCode.KEY_D) || this._keys.has(KeyCode.ARROW_RIGHT);
        const kUp    = this._keys.has(KeyCode.KEY_W) || this._keys.has(KeyCode.ARROW_UP);
        const kDown  = this._keys.has(KeyCode.KEY_S) || this._keys.has(KeyCode.ARROW_DOWN);

        // --- Touch drag (delta from touch start) ---
        let tDx = 0;
        let tDy = 0;
        if (this._isTouching) {
            const DRAG_THRESHOLD = 15;
            const DRAG_SCALE     = 0.012; // drag distance → velocity multiplier
            const dx = this._touchCurrent.x - this._touchStart.x;
            const dy = this._touchCurrent.y - this._touchStart.y;
            if (Math.abs(dx) > DRAG_THRESHOLD) tDx = dx * DRAG_SCALE * spd;
            if (Math.abs(dy) > DRAG_THRESHOLD) tDy = dy * DRAG_SCALE * spd;
        }

        const hasKbInput = kLeft || kRight || kUp || kDown;
        const hasTouchInput = this._isTouching;
        const hasInput = hasKbInput || hasTouchInput;

        if (hasInput) {
            let ax = tDx;
            let ay = tDy;
            if (kLeft)  ax = -spd;
            if (kRight) ax =  spd;
            if (kUp)    ay =  spd;
            if (kDown)  ay = -spd;

            m.vx = ax;
            m.vy = ay;
        } else {
            // Hover: bleed velocity to zero
            m.vx *= m.damping;
            m.vy *= m.damping;
            if (Math.abs(m.vx) < 2) m.vx = 0;
            if (Math.abs(m.vy) < 2) m.vy = 0;
        }

        m.x += m.vx * dt;
        m.y += m.vy * dt;
    }

    private _clampToBounds(): void {
        const m = this._model;
        m.x = Math.max(-this.boundsX,   Math.min(this.boundsX,   m.x));
        m.y = Math.max(this.boundsYBottom, Math.min(this.boundsYTop, m.y));
    }

    private _pushToNode(): void {
        this._pos.set(this._model.x, this._model.y, 0);
        this.node.setPosition(this._pos);
    }

    private _updateSpriteFlip(): void {
        if (!this.spriteNode || this._model.vx === 0) return;
        const s = this.spriteNode.scale;
        const facingRight = this._model.vx > 0;
        // Flip by negating scaleX; preserve Y/Z
        this.spriteNode.setScale(
            facingRight ? Math.abs(s.x) : -Math.abs(s.x),
            s.y,
            s.z,
        );
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

    private _onTouchEnd(_e: EventTouch): void {
        this._isTouching = false;
    }

    private _onGameOver(): void {
        this._model.isAlive = false;
        this._model.vx = 0;
        this._model.vy = 0;
    }
}
