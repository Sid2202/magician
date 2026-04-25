import { _decorator, Component, Label, Node, Vec3, tween, Tween, UIOpacity } from 'cc';

const { ccclass, property } = _decorator;

/**
 * Attach to: PF_CoinCounter root node (same node as CoinCounterController).
 *
 * Node setup inside PF_CoinCounter:
 *   ├── Label (coinLabel)         ← the running total "0", "1", "2"…
 *   └── ScorePopup (Node)         ← child node, also has a Label + UIOpacity
 *           └── Label (popupLabel) ← shows "+1" etc., fades out after each coin
 *
 * No logic here — all decisions made by CoinCounterController.
 */
@ccclass('CoinCounterView')
export class CoinCounterView extends Component {
    @property(Label) coinLabel:   Label     = null;
    @property(Label) popupLabel:  Label     = null;   // on the ScorePopup child node
    @property(Node)  popupNode:   Node      = null;   // ScorePopup container

    private _popupOpacity: UIOpacity | null = null;

    private readonly _one      = new Vec3(1,   1,   1);
    private readonly _scaleUp  = new Vec3(1.3, 1.3, 1);
    private readonly _scaleOut = new Vec3(1.5, 1.5, 1);
    private readonly _zero     = new Vec3(0,   0,   1);

    onLoad(): void {
        if (this.popupNode) {
            this._popupOpacity = this.popupNode.getComponent(UIOpacity)
                              ?? this.popupNode.addComponent(UIOpacity);
            this.popupNode.active = false;
        }
    }

    // ── Called by CoinCounterController ──────────────────────────────────

    /** Update the running total immediately (no delay). */
    setCount(n: number): void {
        if (this.coinLabel) this.coinLabel.string = String(n);
    }

    /**
     * Punch-scale the counter node (mimics Yatzee score-up beat).
     * Also fires the "+1" score popup.
     * Called when the flying coin reaches the counter (COIN_FX_COMPLETE).
     */
    playArrivalFX(delta: number = 1): void {
        this._punchCounter();
        this._showScorePopup(delta);
    }

    getWorldPosition(out: { x: number; y: number }): void {
        const wp = this.node.worldPosition;
        out.x = wp.x;
        out.y = wp.y;
    }

    // ── Internal FX ───────────────────────────────────────────────────────

    /** Beat scale on the whole counter node — feels like a heartbeat. */
    private _punchCounter(): void {
        Tween.stopAllByTarget(this.node);
        this.node.setScale(this._one);
        tween(this.node)
            .to(0.08, { scale: this._scaleUp }, { easing: 'quadOut' })
            .to(0.12, { scale: this._one },     { easing: 'quadIn'  })
            .start();
    }

    /**
     * Score-up label: scales from 0 → 1.5 while fading out, mimicking
     * the Yatzee CoinAddItemUI intro animation.
     */
    private _showScorePopup(delta: number): void {
        if (!this.popupNode || !this.popupLabel || !this._popupOpacity) return;

        // Kill any in-progress popup tween
        Tween.stopAllByTarget(this.popupNode);
        Tween.stopAllByTarget(this._popupOpacity);

        this.popupLabel.string    = `+${delta}`;
        this.popupNode.setScale(this._zero);
        this._popupOpacity.opacity = 255;
        this.popupNode.active      = true;

        // Scale up
        tween(this.popupNode)
            .to(0.18, { scale: this._scaleOut }, { easing: 'quadOut' })
            .to(0.25, { scale: this._one },      { easing: 'quadIn'  })
            .call(() => { this.popupNode.active = false; })
            .start();

        // Fade out (starts slightly after scale-up begins)
        tween(this._popupOpacity)
            .delay(0.15)
            .to(0.28, { opacity: 0 })
            .start();
    }
}
