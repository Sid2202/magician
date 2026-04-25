import { _decorator, Component, Node, Vec3, tween, Tween } from 'cc';
import { EventBus, CoinEvents }     from '../core/EventBus';
import { CoinController }           from '../Controllers/CoinController';
import { CoinCounterController }    from '../Controllers/CoinCounterController';
import { PoolingSystem, PoolKey } from './PoolingSystem';

const { ccclass, property } = _decorator;

/**
 * Attach to: any STABLE node that does NOT move (e.g. UIParent or Canvas).
 * The coin node is reparented here before the tween so BgMove / SpawnSystem
 * parent transforms don't drag it off course mid-flight.
 *
 * Animation mirrors Yatzee CoinCollectUI.flyAway():
 *   Phase 1 — jump +60px upward  (0.15s quadOut)
 *   Phase 2 — sweep to counter   (0.4s  cubicOut)
 *
 * Inspector wiring:
 *   coinCounterNode → PF_CoinCounter node (must have CoinCounterController)
 */
@ccclass('CoinFXSystem')
export class CoinFXSystem extends Component {
    @property(Node) coinCounterNode: Node = null;

    private _counterCtrl: CoinCounterController | null = null;

    onLoad(): void {
        this._counterCtrl = this.coinCounterNode?.getComponent(CoinCounterController) ?? null;
        if (!this._counterCtrl) console.warn('[CoinFXSystem] coinCounterNode not wired — coins will fly to (0,0)');
        EventBus.on(CoinEvents.CoinCollected, this._onCoinCollected, this);
    }

    onDestroy(): void {
        EventBus.off(CoinEvents.CoinCollected, this._onCoinCollected, this);
    }

    private _onCoinCollected(data: { x: number, y: number, index: number }): void {

        const node = PoolingSystem.get(PoolKey.FlyingCoin);
        if (!node) return;

        const offsetX = (Math.random() - 0.5) * 40;
        const offsetY = Math.random() * 40;


        node.setParent(this.node, true);
        node.setPosition(data.x + offsetX, data.y + offsetY);
        node.setScale(0.6, 0.6, 1);
        node.setRotationFromEuler(0, 0, (Math.random() - 0.5) * 30);
        node.active = true;

        const bouncePos = new Vec3(data.x, data.y + 60, 0);

        const targetPos = new Vec3();
        if (this._counterCtrl) {
            const tmp = { x: 0, y: 0 };
            this._counterCtrl.getWorldPosition(tmp);
            targetPos.set(tmp.x, tmp.y, 0);
        }

        const delay = (data.index ?? 0) * 0.04 + Math.random() * 0.05;

        // Tween.stopAllByTarget(node);

        // tween(node)
        //     .delay(delay)
        //     .to(0.15, { worldPosition: bouncePos }, { easing: 'quadOut' })
            

        //     tween(node)
        //         .delay(delay)
        //         .to(0.2, { worldPosition: mid }, { easing: 'quadOut' })
        //         .to(0.3, { worldPosition: targetPos }, { easing: 'cubicIn' })
        //     .call(() => {
        //         PoolingSystem.release(PoolKey.FlyingCoin, node);
        //         EventBus.emit(CoinEvents.CoinFXComplete);
        //     })
        //     .start();


        Tween.stopAllByTarget(node);
        const mid = new Vec3(
            (data.x + targetPos.x) / 2,
            Math.max(data.y, targetPos.y) + 120,
            0
        );
        tween(node)
            .delay(delay)

            // SCALE POP (runs in parallel with movement)
            .parallel(
                tween().to(0.15, { scale: new Vec3(1.2, 1.2, 1) })
                    .to(0.2, { scale: new Vec3(0.8, 0.8, 1) }),

                // MOVEMENT (your existing logic)
                tween()
                    .to(0.2, { worldPosition: mid }, { easing: 'quadOut' })
                    .to(0.3, { worldPosition: targetPos }, { easing: 'cubicIn' })
            )

            .call(() => {
                PoolingSystem.release(PoolKey.FlyingCoin, node);
                EventBus.emit(CoinEvents.CoinFXComplete);
            })

            .start();
            }
}
