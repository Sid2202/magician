import {
    _decorator, Component, Vec2, Vec3,
    input, Input, KeyCode, EventTouch,
} from 'cc';
import { CharacterModel }  from '../Models/CharacterModel';
import { CharacterView, CharacterState } from '../Views/CharacterView';
import { GameManager }     from '../Managers/GameManager';
import { GameEventsBus }   from '../common/event/GlobalEventTarget';
import { GameEvents }      from './input/GameEvents';

const { ccclass, property } = _decorator;

/**
 * Attach to: PF_Character (root node of the character prefab).
 *
 * This is the CONTROLLER layer.
 * It owns CharacterModel (data) and drives CharacterView (visuals).
 *
 * Movement rules:
 *   - Arrow keys (← → ↑ ↓) on desktop / browser
 *   - Touch drag anywhere in the gameplay area on mobile
 *   - No input → character hovers (velocity damps to zero)
 *   - Left / Right movement → MoveH state (effects shown, motion clip)
 *   - Up / Down only       → MoveV state (effects hidden, idle clip)
 *   - No velocity          → Idle state  (effects hidden, idle clip)
 *
 * Bounds:
 *   Wire colliderTop + colliderBottom from the GameScene root level.
 *   Their Y position (in GameScene root space) is used as the vertical clamp.
 *   They update automatically with Widget when screen resizes → responsive bounds.
 *   If not wired, fallback values are used.
 */
@ccclass('CharacterController')
export class CharacterController extends Component {

    // ── Boundary nodes ────────────────────────────────────────────────────
    /** Drag Collider_Top node here (must be at GameScene root level, NOT inside PF_Character). */
    @property colliderTop:    any = null;
    @property colliderBottom: any = null;

    // ── Fallback bounds (used when colliders are not wired) ───────────────
    @property fallbackBoundsXLeft:   number = -460;  // how far left the character can go
    @property fallbackBoundsXRight:  number =  150;  // keep character left-of-centre so world ahead stays visible
    @property fallbackBoundsYTop:    number =  300;
    @property fallbackBoundsYBottom: number = -300;

    // ── Model (pure data) ─────────────────────────────────────────────────
    private _model: CharacterModel = new CharacterModel();

    // ── View (visual layer, on same node) ─────────────────────────────────
    private _view: CharacterView | null = null;

    // ── State ─────────────────────────────────────────────────────────────
    private _state:          CharacterState = CharacterState.Idle;
    private _lastFacingRight: boolean        = true;

    // ── Keyboard ──────────────────────────────────────────────────────────
    private _keys: Set<number> = new Set();

    // ── Touch ─────────────────────────────────────────────────────────────
    private _isTouching:   boolean = false;
    private _touchStart:   Vec2    = new Vec2();
    private _touchCurrent: Vec2    = new Vec2();

    // ── Allocation-free Vec3 ──────────────────────────────────────────────
    private _pos: Vec3 = new Vec3();

    // ── Spawn point captured at onLoad, used on respawn ───────────────────
    private _spawnX = 0;
    private _spawnY = 0;

    // ─────────────────────────────────────────────────────────────────────
    onLoad(): void {
        // CharacterView must be on the SAME node (PF_Character root)
        this._view = this.getComponent(CharacterView);
        if (!this._view) {
            console.warn('[CharacterController] CharacterView not found on this node. ' +
                         'Attach CharacterView.ts to PF_Character root.');
        }

        // Sync model to editor-placed position
        this.node.getPosition(this._pos);
        this._model.x = this._pos.x;
        this._model.y = this._pos.y;

        // Keyboard
        input.on(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        input.on(Input.EventType.KEY_UP,   this._onKeyUp,   this);

        // Touch — listen on parent so the whole gameplay area responds
        const touchArea = this.node.parent ?? this.node;
        touchArea.on(Input.EventType.TOUCH_START,  this._onTouchStart, this);
        touchArea.on(Input.EventType.TOUCH_MOVE,   this._onTouchMove,  this);
        touchArea.on(Input.EventType.TOUCH_END,    this._onTouchEnd,   this);
        touchArea.on(Input.EventType.TOUCH_CANCEL, this._onTouchEnd,   this);

        // Capture spawn position so PlayerRespawn can return us here.
        this._spawnX = this._model.x;
        this._spawnY = this._model.y;

        GameEventsBus.get().on(GameEvents.GameOver,     this._onGameOver,    this);
        GameEventsBus.get().on(GameEvents.PlayerRespawn, this._onRespawn,    this);
    }

    onDestroy(): void {
        input.off(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        input.off(Input.EventType.KEY_UP,   this._onKeyUp,   this);

        const touchArea = this.node.parent ?? this.node;
        touchArea.off(Input.EventType.TOUCH_START,  this._onTouchStart, this);
        touchArea.off(Input.EventType.TOUCH_MOVE,   this._onTouchMove,  this);
        touchArea.off(Input.EventType.TOUCH_END,    this._onTouchEnd,   this);
        touchArea.off(Input.EventType.TOUCH_CANCEL, this._onTouchEnd,   this);

        GameEventsBus.get().off(GameEvents.GameOver,     this._onGameOver, this);
        GameEventsBus.get().off(GameEvents.PlayerRespawn, this._onRespawn,  this);
    }

    update(dt: number): void {
        const gm = GameManager.getInstance();
        if (!gm?.state.isPlaying || !this._model.isAlive) return;

        this._readInput(dt);
        this._clampToBounds();
        this._resolveState();
        this._pushToNode();
        this._pushToView();
    }

    /** Read by GameController each frame for AABB collision checks. */
    getModel(): CharacterModel { return this._model; }

    // ── Input → Model ─────────────────────────────────────────────────────

    private _readInput(dt: number): void {
        const m   = this._model;
        const spd = m.speed;

        // Arrow keys (browser) + WASD
        const kLeft  = this._keys.has(KeyCode.ARROW_LEFT)  || this._keys.has(KeyCode.KEY_A);
        const kRight = this._keys.has(KeyCode.ARROW_RIGHT) || this._keys.has(KeyCode.KEY_D);
        const kUp    = this._keys.has(KeyCode.ARROW_UP)    || this._keys.has(KeyCode.KEY_W);
        const kDown  = this._keys.has(KeyCode.ARROW_DOWN)  || this._keys.has(KeyCode.KEY_S);

        // Touch drag → virtual joystick feel (drag distance = speed fraction)
        let tVx = 0;
        let tVy = 0;
        if (this._isTouching) {
            const DEAD  = 12;    // px deadzone before movement starts
            const SCALE = 0.013; // drag distance → speed multiplier
            const dx = this._touchCurrent.x - this._touchStart.x;
            const dy = this._touchCurrent.y - this._touchStart.y;
            if (Math.abs(dx) > DEAD) tVx = clamp(dx * SCALE, -1, 1) * spd;
            if (Math.abs(dy) > DEAD) tVy = clamp(dy * SCALE, -1, 1) * spd;
        }

        const hasInput = kLeft || kRight || kUp || kDown || this._isTouching;

        if (hasInput) {
            // Keyboard always wins over touch on active axes
            m.vx = kLeft ? -spd : kRight ? spd : tVx;
            m.vy = kDown ? -spd : kUp    ? spd : tVy;
        } else {
            // Hover: exponential decay to zero
            m.vx *= m.damping;
            m.vy *= m.damping;
            if (Math.abs(m.vx) < 1.5) m.vx = 0;
            if (Math.abs(m.vy) < 1.5) m.vy = 0;
        }

        m.x += m.vx * dt;
        m.y += m.vy * dt;
    }

    // ── Bounds (reads collider positions — responsive to screen size) ──────

    private _clampToBounds(): void {
        const m = this._model;

        // Colliders live at GameScene root level so their .position.y is
        // already in the same local space as the character's movement.
        const topY    = this.colliderTop    ? (this.colliderTop    as any).position.y : this.fallbackBoundsYTop;
        const bottomY = this.colliderBottom ? (this.colliderBottom as any).position.y : this.fallbackBoundsYBottom;

        m.x = clamp(m.x, this.fallbackBoundsXLeft, this.fallbackBoundsXRight);
        m.y = clamp(m.y,  bottomY, topY);
    }

    // ── State machine ─────────────────────────────────────────────────────

    private _resolveState(): void {
        const { vx, vy } = this._model;
        const THRESHOLD = 8;

        let next: CharacterState;

        if (Math.abs(vx) > THRESHOLD) {
            // Horizontal motion takes priority → shows effects
            next = CharacterState.MoveH;
        } else if (Math.abs(vy) > THRESHOLD) {
            // Vertical only → idle animation, no effects
            next = CharacterState.MoveV;
        } else {
            next = CharacterState.Idle;
        }

        this._state = next;

        // Track facing so sprite flip persists during MoveV / Idle
        if (this._model.vx > THRESHOLD)  this._lastFacingRight = true;
        if (this._model.vx < -THRESHOLD) this._lastFacingRight = false;
    }

    // ── Model → Node ──────────────────────────────────────────────────────

    private _pushToNode(): void {
        this._pos.set(this._model.x, this._model.y, 0);
        this.node.setPosition(this._pos);
    }

    // ── Model → View ──────────────────────────────────────────────────────

    private _pushToView(): void {
        if (!this._view) return;
        this._view.applyState(this._state);
        this._view.setFacing(this._lastFacingRight);
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
        this._view?.applyState(CharacterState.Hit);
    }

    private _onRespawn(): void {
        // Reset velocity and position; clear keyboard buffer so a held key
        // doesn't immediately fling the player back into the obstacle.
        this._model.vx = 0;
        this._model.vy = 0;
        this._model.x = this._spawnX;
        this._model.y = this._spawnY;
        this._model.isAlive = true;
        this._keys.clear();
        this._isTouching = false;
        this._pushToNode();
        this._view?.applyState(CharacterState.Idle);
    }
}

// ── Module helpers ────────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number): number {
    return v < min ? min : v > max ? max : v;
}
