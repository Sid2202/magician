import { _decorator, Component, Vec3 } from 'cc';

const { ccclass } = _decorator;

/**
 * Cocos component — visual only.
 * Controlled by LightSystem via GameController.
 */
@ccclass('LightPointView')
export class LightPointView extends Component {

    private _pos: Vec3 = new Vec3();

    setPosition(x: number, y: number): void {
        this._pos.set(x, y, 0);
        this.node.setPosition(this._pos);
    }

    /** Artist wires restoration animation/particles here. */
    playRestoreEffect(): void {
        // Animation hookup by technical artist
    }

    setRestored(restored: boolean): void {
        // Artist-defined visual state
    }
}
