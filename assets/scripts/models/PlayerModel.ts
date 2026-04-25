import { PlayerConstants } from '../core/Constants';

export interface InputState {
    left:  boolean;
    right: boolean;
    up:    boolean;
    down:  boolean;
}

/** Pure data — no Cocos imports. */
export class PlayerModel {
    x: number = 0;
    y: number = 0;
    vx: number = 0;
    vy: number = 0;
    speed: number = PlayerConstants.SPEED;
    isAlive: boolean = true;

    input: InputState = { left: false, right: false, up: false, down: false };

    get hasInput(): boolean {
        return this.input.left || this.input.right || this.input.up || this.input.down;
    }

    reset(): void {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.isAlive = true;
        this.input = { left: false, right: false, up: false, down: false };
    }
}
