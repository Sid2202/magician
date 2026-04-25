import { EventTarget, input, Input, KeyCode, Vec2, Scene } from 'cc';
import { InputState } from '../models/PlayerModel';
import { PlayerConstants } from '../core/Constants';

/**
 * Abstracts keyboard + touch/joystick input into a plain InputState.
 * Stateless relative to game logic — just reads hardware.
 */
export class InputSystem {

    private _keys: Set<KeyCode> = new Set();
    /** Normalized axis from virtual joystick (set by UI layer). */
    private _joystickAxis: Vec2 = new Vec2(0, 0);

    init(_scene: Scene): void {
        input.on(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        input.on(Input.EventType.KEY_UP,   this._onKeyUp,   this);
    }

    destroy(): void {
        input.off(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        input.off(Input.EventType.KEY_UP,   this._onKeyUp,   this);
    }

    /** Called by virtual joystick component on mobile. */
    setJoystickAxis(x: number, y: number): void {
        this._joystickAxis.set(x, y);
    }

    /** Writes current input state into target (no allocation). */
    readInto(target: InputState): void {
        const jx = Math.abs(this._joystickAxis.x) > PlayerConstants.INPUT_DEADZONE ? this._joystickAxis.x : 0;
        const jy = Math.abs(this._joystickAxis.y) > PlayerConstants.INPUT_DEADZONE ? this._joystickAxis.y : 0;

        target.left  = this._keys.has(KeyCode.KEY_A) || this._keys.has(KeyCode.ARROW_LEFT)  || jx < 0;
        target.right = this._keys.has(KeyCode.KEY_D) || this._keys.has(KeyCode.ARROW_RIGHT) || jx > 0;
        target.up    = this._keys.has(KeyCode.KEY_W) || this._keys.has(KeyCode.ARROW_UP)    || jy > 0;
        target.down  = this._keys.has(KeyCode.KEY_S) || this._keys.has(KeyCode.ARROW_DOWN)  || jy < 0;
    }

    private _onKeyDown(e: { keyCode: KeyCode }): void {
        this._keys.add(e.keyCode);
    }

    private _onKeyUp(e: { keyCode: KeyCode }): void {
        this._keys.delete(e.keyCode);
    }
}
