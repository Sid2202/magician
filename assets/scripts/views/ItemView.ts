import { _decorator, Component, Vec3 } from 'cc';

const { ccclass } = _decorator;

/**
 * Cocos component — visual only.
 * Controlled by ItemController.
 */
@ccclass('ItemView')
export class ItemView extends Component {

    private _pos: Vec3 = new Vec3();

    setPosition(x: number, y: number): void {
        this._pos.set(x, y, 0);
        this.node.setPosition(this._pos);
    }

    setVisible(visible: boolean): void {
        this.node.active = visible;
    }
}
