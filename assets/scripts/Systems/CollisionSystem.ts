import { _decorator, Component, Node, Vec3 } from 'cc';
import { SpawnSystem }                        from './SpawnSystem';
import { CharacterController }                from '../gameplay/CharacterController';
import { EventBus, CoinEvents }               from '../core/EventBus';
import { CoinController }                     from '../Controllers/CoinController';
import { GameManager }                        from '../Managers/GameManager';

const { ccclass, property } = _decorator;

/**
 * Attach to: same node as SpawnSystem.
 *
 * Uses WORLD positions for AABB so it is immune to coordinate-space
 * differences between PF_Character's parent and SpawnSystem's parent.
 */
@ccclass('CollisionSystem')
export class CollisionSystem extends Component {
    @property(Node) characterNode: Node = null;

    private _charCtrl:  CharacterController | null = null;
    private _spawn:     SpawnSystem         | null = null;
    private _hits:      CoinController[]           = [];

    // Reused Vec3 — avoids per-frame allocation for character world pos
    private readonly _charWP = new Vec3();

    onLoad(): void {
        this._charCtrl = this.characterNode?.getComponent(CharacterController) ?? null;
        this._spawn    = this.getComponent(SpawnSystem);

        if (!this._charCtrl) console.error('[CollisionSystem] characterNode not wired');
        if (!this._spawn)    console.error('[CollisionSystem] SpawnSystem not found on this node');
    }

    update(_dt: number): void {
        if (!this._charCtrl || !this._spawn) return;
        if (!this._charCtrl.getModel().isAlive) return;

        // World position — valid regardless of node hierarchy
        this.characterNode.getWorldPosition(this._charWP);
        const cx  = this._charWP.x;
        const cy  = this._charWP.y;
        const chw = this._charCtrl.getModel().halfW;
        const chh = this._charCtrl.getModel().halfH;

        const coins = this._spawn.activeCoins;
        this._hits.length = 0;

        for (let i = 0, n = coins.length; i < n; i++) {
            const coin = coins[i];
            if (!coin.model.active) continue;

            // Also use world position for coin — matches character's space
            const cwp = coin.node.worldPosition;
            if (aabb(cx, cy, chw, chh, cwp.x, cwp.y, coin.model.halfW, coin.model.halfH)) {
                this._hits.push(coin);
            }
        }
        this._hits.forEach((coin, i) => {
            GameManager.getInstance().inventory.addCoin();
            this._spawn.removeActive(coin);
            EventBus.emit(CoinEvents.CoinCollected, {
                x: coin.worldX,
                y: coin.worldY,
                index: i
            });

            coin.deactivate();
        });
    }
}

function aabb(ax: number, ay: number, ahw: number, ahh: number,
              bx: number, by: number, bhw: number, bhh: number): boolean {
    return Math.abs(ax - bx) < ahw + bhw && Math.abs(ay - by) < ahh + bhh;
}
