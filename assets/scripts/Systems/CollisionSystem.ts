import { _decorator, Component, Node, Vec3, BoxCollider2D } from "cc";
import { SpawnSystem } from "./SpawnSystem";
import { CharacterController } from "../gameplay/CharacterController";
import { EventBus, CoinEvents } from "../core/EventBus";
import { CoinController } from "../Controllers/CoinController";
import { GameManager } from "../Managers/GameManager";

const { ccclass, property } = _decorator;

/**
 * Attach to: same node as SpawnSystem.
 *
 * Uses WORLD positions for AABB so it is immune to coordinate-space
 * differences between PF_Character's parent and SpawnSystem's parent.
 */
@ccclass("CollisionSystem")
export class CollisionSystem extends Component {
  @property(Node) characterNode: Node = null;

  private _charCtrl: CharacterController | null = null;
  private _spawn: SpawnSystem | null = null;
  private _hits: CoinController[] = [];

  // Reused Vec3 — avoids per-frame allocation for character world pos
  private readonly _charWP = new Vec3();

  onLoad(): void {
    this._charCtrl =
      this.characterNode?.getComponent(CharacterController) ?? null;
    this._spawn = this.getComponent(SpawnSystem);

    if (!this._charCtrl)
      console.error("[CollisionSystem] characterNode not wired");
    if (!this._spawn)
      console.error("[CollisionSystem] SpawnSystem not found on this node");
  }

  update(_dt: number): void {
    if (!this._charCtrl || !this._spawn) return;
    if (!this._charCtrl.getModel().isAlive) return;

    // World position — valid regardless of node hierarchy
    this.characterNode.getWorldPosition(this._charWP);
    const charScale = this.characterNode.worldScale;

    let cx = this._charWP.x;
    let cy = this._charWP.y;
    let chw = this._charCtrl.getModel().halfW;
    let chh = this._charCtrl.getModel().halfH;

    const charCollider = this.characterNode.getComponent(BoxCollider2D);
    if (charCollider) {
      // Respect the collider's offset and size scaled by the node's world scale
      cx += charCollider.offset.x * Math.abs(charScale.x);
      cy += charCollider.offset.y * Math.abs(charScale.y);
      chw = (charCollider.size.width / 2) * Math.abs(charScale.x);
      chh = (charCollider.size.height / 2) * Math.abs(charScale.y);
    }

    const coins = this._spawn.activeCoins;
    this._hits.length = 0;

    for (let i = 0, n = coins.length; i < n; i++) {
      const coin = coins[i];
      if (!coin.model.active) continue;

      const cwp = coin.node.worldPosition;
      const coinScale = coin.node.worldScale;

      let coinX = cwp.x;
      let coinY = cwp.y;
      let coinHW = coin.model.halfW;
      let coinHH = coin.model.halfH;

      const coinCollider = coin.node.getComponent(BoxCollider2D);
      if (coinCollider) {
        coinX += coinCollider.offset.x * Math.abs(coinScale.x);
        coinY += coinCollider.offset.y * Math.abs(coinScale.y);
        coinHW = (coinCollider.size.width / 2) * Math.abs(coinScale.x);
        coinHH = (coinCollider.size.height / 2) * Math.abs(coinScale.y);
      }

      if (aabb(cx, cy, chw, chh, coinX, coinY, coinHW, coinHH)) {
        this._hits.push(coin);
      }
    }
    this._hits.forEach((coin, i) => {
      GameManager.getInstance().inventory.addCoin();
      this._spawn.removeActive(coin);
      EventBus.emit(CoinEvents.CoinCollected, {
        x: coin.worldX,
        y: coin.worldY,
        index: i,
      });

      coin.deactivate();
    });
  }
}

function aabb(
  ax: number,
  ay: number,
  ahw: number,
  ahh: number,
  bx: number,
  by: number,
  bhw: number,
  bhh: number,
): boolean {
  return Math.abs(ax - bx) < ahw + bhw && Math.abs(ay - by) < ahh + bhh;
}
