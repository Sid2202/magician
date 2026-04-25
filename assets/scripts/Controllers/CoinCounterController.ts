import { _decorator, Component }   from 'cc';
import { EventBus, CoinEvents }    from '../core/EventBus';
import { CoinCounterView }         from '../Views/CoinCounterView';
import { GameManager }             from '../Managers/GameManager';

const { ccclass } = _decorator;

/**
 * Attach to: PF_CoinCounter root node (same node as CoinCounterView).
 *
 * Responsibilities:
 *   COIN_COLLECTED  → update label count immediately (inventory already incremented)
 *   COIN_FX_COMPLETE → play punch + score-popup FX on the counter
 *
 * Exposes getWorldPosition() so CoinFXSystem can aim flying coins here.
 */
@ccclass('CoinCounterController')
export class CoinCounterController extends Component {
    private _view: CoinCounterView | null = null;

    onLoad(): void {
        this._view = this.getComponent(CoinCounterView);
        this._view?.setCount(0);
        EventBus.on(CoinEvents.CoinCollected,  this._onCoinCollected,  this);
        EventBus.on(CoinEvents.CoinFXComplete, this._onCoinFXComplete, this);
    }

    onDestroy(): void {
        EventBus.off(CoinEvents.CoinCollected,  this._onCoinCollected,  this);
        EventBus.off(CoinEvents.CoinFXComplete, this._onCoinFXComplete, this);
    }

    getWorldPosition(out: { x: number; y: number }): void {
        this._view?.getWorldPosition(out);
    }

    // ── Event handlers ────────────────────────────────────────────────────

    private _onCoinCollected(): void {
        // Label updates instantly — inventory was already incremented by CollisionSystem
        const count = GameManager.getInstance().inventory.getCoinCount();
        this._view?.setCount(count);
    }

    private _onCoinFXComplete(): void {
        // Visual flourish fires when the coin physically reaches the counter
        this._view?.playArrivalFX(1);
    }
}
