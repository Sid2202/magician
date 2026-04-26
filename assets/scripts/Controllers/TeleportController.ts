import { _decorator, Component, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Controller for the PF_Teleport prefab.
 * High-level script to manage teleport behavior if needed.
 */
@ccclass('TeleportController')
export class TeleportController extends Component {

    /**
     * Scroll the teleport node relative to the world.
     * @param dx Displacement in pixels (negative means moving left along with the path)
     */
    public scrollBy(dx: number): void {
        const pos = this.node.position;
        this.node.setPosition(pos.x + dx, pos.y, pos.z);
    }
}
