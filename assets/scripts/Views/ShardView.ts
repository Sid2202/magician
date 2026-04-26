import { _decorator, Component, UITransform } from 'cc';

const { ccclass } = _decorator;

/** Attach to: PF_Shard root node. Pure visual layer. */
@ccclass('ShardView')
export class ShardView extends Component {
    private _ut: UITransform | null = null;

    onLoad(): void {
        this._ut = this.getComponent(UITransform);
    }

    setPosition(x: number, y: number): void {
        this.node.setPosition(x, y, 0);
    }

    get halfW(): number { return this._ut ? this._ut.contentSize.width  * 0.5 : 36; }
    get halfH(): number { return this._ut ? this._ut.contentSize.height * 0.5 : 36; }
}
