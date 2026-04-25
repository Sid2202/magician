import { _decorator, Component, Node, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

/**
 * Cocos component — visual representation only.
 * Receives position from PlayerController; contains no game logic.
 */
@ccclass('PlayerView')
export class PlayerView extends Component {

    private _pos: Vec3 = new Vec3();

    /** Called by PlayerController each frame with the computed position. */
    setPosition(x: number, y: number): void {
        this._pos.set(x, y, 0);
        this.node.setPosition(this._pos);
    }

    /** Visual-only: flip sprite based on horizontal direction. */
    setFacingDirection(movingRight: boolean): void {
        const s = this.node.scale;
        this.node.setScale(movingRight ? Math.abs(s.x) : -Math.abs(s.x), s.y, s.z);
    }
}
