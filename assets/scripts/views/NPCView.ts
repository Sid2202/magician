import { _decorator, Component, Vec3 } from 'cc';

const { ccclass } = _decorator;

/**
 * Cocos component — visual only.
 * Controlled by NPCController.
 */
@ccclass('NPCView')
export class NPCView extends Component {

    private _pos: Vec3 = new Vec3();

    setPosition(x: number, y: number): void {
        this._pos.set(x, y, 0);
        this.node.setPosition(this._pos);
    }

    setVisible(visible: boolean): void {
        this.node.active = visible;
    }

    /** Signal traded state (artist wires up animation). */
    playTradeEffect(): void {
        // Artist hooks animation here — no logic needed
    }
}
