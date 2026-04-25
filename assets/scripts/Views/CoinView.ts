import { _decorator, Component, UITransform } from 'cc';

const { ccclass } = _decorator;

/**
 * Attach to: PF_Coin root node.
 * Pure visual layer — no logic, no events.
 * Exposes position setter and bounding box for CollisionSystem.
 */
@ccclass('CoinView')
export class CoinView extends Component {
    private _ut: UITransform | null = null;

    onLoad(): void {
        this._ut = this.getComponent(UITransform);
    }

    setPosition(x: number, y: number): void {
        this.node.setPosition(x, y, 0);
    }

    get halfW(): number { return this._ut ? this._ut.contentSize.width  * 0.5 : 24; }
    get halfH(): number { return this._ut ? this._ut.contentSize.height * 0.5 : 24; }

    /** World-space position, used by CoinFXSystem to place the flying coin. */
    get worldX(): number { return this.node.worldPosition.x; }
    get worldY(): number { return this.node.worldPosition.y; }
}
