import { _decorator, Component, UITransform } from 'cc';

const { ccclass, property } = _decorator;

/**
 * Attach to: each PF_Obstacles_* root node. Pure visual layer.
 *
 * collisionScale  — shrinks the effective hit-box relative to whatever
 *   bounds are read (BoxCollider2D size or UITransform fallback).
 *   1.0 = full size (default). Tune per-prefab in Inspector:
 *     Ghost / wispy sprites  → ~0.50–0.60  (hit only the body)
 *     Vine / plant           → ~0.30–0.45  (hit only the stem)
 *     Barrel / solid block   → ~0.75–0.85  (almost full)
 */
@ccclass('ObstacleView')
export class ObstacleView extends Component {
    @property({ range: [0.1, 1.0], slide: true, step: 0.05 })
    collisionScale: number = 0.65;

    private _ut: UITransform | null = null;

    onLoad(): void {
        this._ut = this.getComponent(UITransform);
    }

    setPosition(x: number, y: number): void {
        this.node.setPosition(x, y, 0);
    }

    get halfW(): number { return this._ut ? this._ut.contentSize.width  * 0.5 : 32; }
    get halfH(): number { return this._ut ? this._ut.contentSize.height * 0.5 : 32; }
}
