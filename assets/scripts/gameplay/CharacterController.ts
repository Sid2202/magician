import {
    _decorator, Component, Node, Vec2, Vec3,
    input, Input, KeyCode, EventTouch, UITransform, view
} from 'cc';
import { CharacterModel }  from '../models/CharacterModel';
import { CharacterView, CharacterState } from '../Views/CharacterView';
import { GameManager }     from '../Managers/GameManager';
import { GameEventsBus }   from '../common/event/GlobalEventTarget';
import { GameEvents }      from './input/GameEvents';
import { BgMoving }        from './BgMoving';

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
    private _respawnTargetX = 0;

    // ── Screen shake on hit ───────────────────────────────────────────────
    @property shakeIntensity: number = 12;  // pixels
    @property shakeDuration: number = 0.4;  // seconds

    // ── Respawn safety ────────────────────────────────────────────────────
    @property respawnBackOffset: number = 600;  // pixels to the left when respawning, so player has space

    /** Wire the BgMove node so we can stop scrolling immediately on death. */
    @property(Node) bgMoveNode: Node = null;

    private _bgMoving: BgMoving | null = null;
    private _isControllable: boolean = true;

    // ─────────────────────────────────────────────────────────────────────
    onLoad(): void {
        // CharacterView must be on the SAME node (PF_Character root)
        this._view = this.getComponent(CharacterView);
        if (!this._view) {
            console.warn('[CharacterController] CharacterView not found on this node. ' +
                         'Attach CharacterView.ts to PF_Character root.');
        }

        // Get BgMoving component so we can hard-stop scrolling on death
        if (this.bgMoveNode) {
            this._bgMoving = this.bgMoveNode.getComponent(BgMoving);
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

        GameEventsBus.get().on(GameEvents.PlayerHit,     this._onPlayerHit, this);
        GameEventsBus.get().on(GameEvents.GameOver,     this._onGameOver, this);
        GameEventsBus.get().on(GameEvents.PlayerRespawn, this._onRespawn, this);
    }

    onDestroy(): void {
        input.off(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        input.off(Input.EventType.KEY_UP,   this._onKeyUp,   this);

        const touchArea = this.node.parent ?? this.node;
        touchArea.off(Input.EventType.TOUCH_START,  this._onTouchStart, this);
        touchArea.off(Input.EventType.TOUCH_MOVE,   this._onTouchMove,  this);
        touchArea.off(Input.EventType.TOUCH_END,    this._onTouchEnd,   this);
        touchArea.off(Input.EventType.TOUCH_CANCEL, this._onTouchEnd,   this);

        GameEventsBus.get().off(GameEvents.PlayerHit,     this._onPlayerHit, this);
        GameEventsBus.get().off(GameEvents.GameOver,     this._onGameOver, this);
        GameEventsBus.get().off(GameEvents.PlayerRespawn, this._onRespawn,  this);
    }

    update(dt: number): void {
        const gm = GameManager.getInstance();
        if (!gm?.state.isPlaying || !this._model.isAlive) return;

        if (this._isControllable) {
            this._readInput(dt);
        } else {
            // Force idle velocities if not controllable (unless TeleportSpawnSystem overrides them)
            this._model.vx *= this._model.damping;
            this._model.vy *= this._model.damping;
        }

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

        // Touch position-based controls:
        //   left half  of screen → move left
        //   right half of screen → move right
        //   top half   of screen → move up
        //   bottom half           → move down
        // Quadrant overlap = diagonal movement.
        let tVx = 0;
        let tVy = 0;
        if (this._isTouching) {
            // getVisibleOrigin() gives the bottom-left corner of the canvas in UI
            // coordinates. Adding half the visible size gives the true screen center —
            // works whether the canvas anchor is center (0,0 origin) or corner (0,0 = BL).
            const origin = view.getVisibleOrigin();
            const size   = view.getVisibleSize();
            const centerX = origin.x + size.width  * 0.5;
            const centerY = origin.y + size.height * 0.5;
            tVx = this._touchCurrent.x < centerX ? -spd : spd;
            const vSpd = spd * 1.5; // Multiply vertical velocity for responsive pacing
            tVy = this._touchCurrent.y < centerY ? -vSpd : vSpd;
            
            console.log(`[InputDebug] touch.x: ${this._touchCurrent.x}, centerX: ${centerX} -> tVx: ${tVx}`);
        }

        const hasInput = kLeft || kRight || kUp || kDown || this._isTouching;

        let activeX = 0; // The true horizontal input direction (-1, 0, 1)
        if (hasInput) {
            const vSpd = spd * 1.5;
            // Keyboard always wins over touch on active axes
            m.vx = kLeft ? -spd : kRight ? spd : tVx;
            m.vy = kDown ? -vSpd : kUp    ? vSpd : (this._isTouching ? tVy : 0);
            if (this._isTouching) {
                console.log(`[InputDebug] Model Velocity: vx: ${m.vx}, model.x before dt: ${m.x}`);
            }
            if (m.vx < -1.5) activeX = -1;
            else if (m.vx > 1.5) activeX = 1;
        } else {
            // Hover: exponential decay to zero
            m.vx *= m.damping;
            m.vy *= m.damping;
            if (Math.abs(m.vx) < 1.5) m.vx = 0;
            if (Math.abs(m.vy) < 1.5) m.vy = 0;
        }

        // Only synchronize world scrolling if we haven't died/paused. 
        // Sync world movement dynamically to character input logic!
        if (this._bgMoving) {
            if (activeX === 1) {
                this._bgMoving.resumeScroll(); // Scrolls world mapping left
            } else if (activeX === -1) {
                // To move backwards through the world, world mapping must scroll right!
                // Wait! Does BgMoving have a reverseScroll? We just assign direction.x natively if exposed, 
                // but we can just use setReverse if it exists. 
                // BgMoving's direction property is private: "private direction: Vec3".
                // I will use any to bypass if necessary, or just call resumeScroll and manually set it via any bypass here.
                (this._bgMoving as any).direction.x = 1;
            } else {
                // No horizontal input -> stop playing the world
                this._bgMoving.stopScroll();
            }
        }

        m.x += m.vx * dt;
        m.y += m.vy * dt;
    }

    // ── Bounds (reads collider positions — responsive to screen size) ──────

    private _clampToBounds(): void {
        if (!this._isControllable) return;
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
        if (this._isTouching) {
            console.log(`[InputDebug] Pushed Node Pos: x=${this._pos.x}`);
        }
    }

    // ── Model → View ──────────────────────────────────────────────────────

    private _pushToView(): void {
        if (!this._view) return;
        this._view.applyState(this._state);
        this._view.setFacing(this._lastFacingRight);
    }

    // ── Event handlers ────────────────────────────────────────────────────

    private _onKeyDown(e: { keyCode: number }): void { 
        if (this._isControllable) this._keys.add(e.keyCode);    
    }
    private _onKeyUp(e: { keyCode: number }): void   { 
        this._keys.delete(e.keyCode); 
    }

    private _onTouchStart(e: EventTouch): void {
        if (!this._isControllable) return;
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

    private _onPlayerHit(payload?: { x: number, y: number }): void {
        // Death sequence: pause → shake → vanish → respawn → resume
        this._model.isAlive = false;
        this._model.vx = 0;
        this._model.vy = 0;

        // Enforce exactly 600 pixels distance. Cocos Creator serialization can cache the old inspector value (100)
        // and override the defaults defined in the TypeScript attributes, ruining the math.
        const enforceOffset = 600;

        if (payload && this.node.parent) {
            const uiTrans = this.node.parent.getComponent(UITransform);
            if (uiTrans) {
                const localPos = uiTrans.convertToNodeSpaceAR(new Vec3(payload.x, payload.y, 0));
                this._respawnTargetX = localPos.x - enforceOffset;
            } else {
                this._respawnTargetX = this._model.x - enforceOffset;
            }
        } else {
            this._respawnTargetX = this._model.x - enforceOffset;
        }

        // Hard-stop the scroll immediately — BgMoving won't respond to keys during pause
        this._bgMoving?.stopScroll();
        GameManager.getInstance().pauseGame();

        // Shake the gameplay content node (not camera) to avoid black border issue
        this._shakeScreen();

        // Start vanish animation after shake settles
        this.scheduleOnce(() => {
            this._view?.applyState(CharacterState.Hit);
            this._view?.onAnimationFinished(() => {
                this._deathSequenceReady();
            });
        }, 0.1);
    }

    private _deathSequenceReady(): void {
        // Vanish animation finished. Brief delay so player sees "death" moment,
        // then emit respawn event (HeartCounter handles logic).
        this.scheduleOnce(() => {
            GameEventsBus.get().emit(GameEvents.PlayerRespawn);
        }, 0.3);
    }

    private _onRespawn(): void {
        // Reset velocity and position; clear keyboard buffer so a held key
        // doesn't immediately fling the player back into the obstacle.
        this._model.vx = 0;
        this._model.vy = 0;
        
        let targetX = this._respawnTargetX;
        let deficit = 0;
        const clampLeft = this.fallbackBoundsXLeft;
        
        if (targetX < clampLeft) {
            deficit = clampLeft - targetX;
            targetX = clampLeft;
        }
        
        // Respawn slightly behind the obstacle it collided with (recorded in _respawnTargetX)
        // If it breached the boundary, we halt the character at the boundary and command the world to rewind instead!
        this._model.x = targetX;
        this._model.y = this._spawnY;
        this._model.isAlive = true;
        
        if (deficit > 0) {
            GameEventsBus.get().emit(GameEvents.WorldRewind, deficit);
        }
        this._keys.clear();
        this._isTouching = false;
        this._pushToNode();
        this._view?.applyState(CharacterState.Idle);

        // Resume game after brief respawn appearance so player sees character return
        this.scheduleOnce(() => {
            GameManager.getInstance().resumeGame();
        }, 0.2);
    }

    private _shakeScreen(): void {
        // Shake the GameScene root (parent of PF_Character) — camera stays fixed,
        // so the viewport never moves and no black borders appear.
        const shakeTarget = this.node.parent;
        if (!shakeTarget) return;

        const origPos = shakeTarget.position.clone();
        const intensity = this.shakeIntensity;
        const frameCount = Math.ceil(this.shakeDuration * 60);
        let frame = 0;

        const shake = () => {
            if (!this.isValid) {
                // Component destroyed mid-shake — restore and bail
                shakeTarget.setPosition(origPos);
                return;
            }
            if (frame >= frameCount) {
                shakeTarget.setPosition(origPos);
                return;
            }
            // Dampen shake over time so it fades out naturally
            const progress = 1 - frame / frameCount;
            const offsetX = (Math.random() - 0.5) * intensity * 2 * progress;
            const offsetY = (Math.random() - 0.5) * intensity * 2 * progress;
            shakeTarget.setPosition(origPos.x + offsetX, origPos.y + offsetY, origPos.z);
            frame++;
            this.scheduleOnce(() => shake(), 1 / 60);
        };

        shake();
    }

    /** Called by TeleportSpawnSystem to disable input during win sequence. */
    public setControllable(value: boolean): void {
        this._isControllable = value;
        if (!value) {
            this._keys.clear();
            this._isTouching = false;
        }
    }
}

// ── Module helpers ────────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number): number {
    return v < min ? min : v > max ? max : v;
}
