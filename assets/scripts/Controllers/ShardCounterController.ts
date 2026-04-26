import { _decorator, Component, Label, Node, tween, Tween, Vec3 } from 'cc';
import { GameEventsBus } from '../common/event/GlobalEventTarget';
import { GameEvents } from '../gameplay/input/GameEvents';
import { GameManager } from '../Managers/GameManager';

const { ccclass, property } = _decorator;

/**
 * Attach to: PF_ShardCounter root node.
 *
 * Listens for ShardCollected → updates label + plays punch animation.
 * Shows "X / 3" so the player always knows progress.
 */
@ccclass('ShardCounterController')
export class ShardCounterController extends Component {
    @property(Label) countLabel: Label = null;

    private readonly _one     = new Vec3(1,   1,   1);
    private readonly _scaleUp = new Vec3(1.4, 1.4, 1);

    onLoad(): void {
        this._setCount(0);
        GameEventsBus.get().on(GameEvents.ShardCollected, this._onShardCollected, this);
        GameEventsBus.get().on(GameEvents.GameStart,      this._onGameStart,      this);
    }

    onDestroy(): void {
        GameEventsBus.get().off(GameEvents.ShardCollected, this._onShardCollected, this);
        GameEventsBus.get().off(GameEvents.GameStart,      this._onGameStart,      this);
    }

    private _onShardCollected(): void {
        const count = GameManager.getInstance().inventory.getShardCount();
        this._setCount(count);
        this._punchScale();
    }

    private _onGameStart(): void {
        this._setCount(0);
    }

    private _setCount(n: number): void {
        if (this.countLabel) this.countLabel.string = `${n} / 3`;
    }

    private _punchScale(): void {
        Tween.stopAllByTarget(this.node);
        this.node.setScale(this._one);
        tween(this.node)
            .to(0.09, { scale: this._scaleUp }, { easing: 'quadOut' })
            .to(0.14, { scale: this._one },     { easing: 'quadIn'  })
            .start();
    }
}
