import { _decorator, Component, Node, Vec3, BoxCollider2D } from "cc";
import { SpawnSystem } from "./SpawnSystem";
import { ObstacleSpawnSystem } from "./ObstacleSpawnSystem";
import { ShardSpawnSystem } from "./ShardSpawnSystem";
import { TeleportSpawnSystem } from "./TeleportSpawnSystem";
import { CharacterController } from "../gameplay/CharacterController";
import { EventBus, CoinEvents } from "../core/EventBus";
import { CoinController } from "../Controllers/CoinController";
import { GameManager } from "../Managers/GameManager";
import { GameEventsBus } from "../common/event/GlobalEventTarget";
import { GameEvents } from "../gameplay/input/GameEvents";
import { BgMoving } from "../gameplay/BgMoving";
import { ObstacleView } from "../Views/ObstacleView";
import { SoundController } from "../Managers/SoundController";

const { ccclass, property } = _decorator;

@ccclass("CollisionSystem")
export class CollisionSystem extends Component {
  @property(Node) characterNode: Node = null;
  @property(ObstacleSpawnSystem) obstacleSpawn: ObstacleSpawnSystem = null;
  @property(ShardSpawnSystem) shardSpawn: ShardSpawnSystem = null;
  @property(TeleportSpawnSystem) teleportSpawn: TeleportSpawnSystem = null;

  @property invulnerabilitySeconds: number = 1.2;

  private _charCtrl: CharacterController | null = null;
  private _spawn: SpawnSystem | null = null;
  private _hits: CoinController[] = [];
  private _invulnTimer = 0;

  private readonly _charWP = new Vec3();
  private readonly _prevCharWP = new Vec3();
  private _isInitialFrame = true;

  onLoad(): void {
    this._charCtrl = this.characterNode?.getComponent(CharacterController) ?? null;
    this._spawn = this.getComponent(SpawnSystem);
  }

  update(_dt: number): void {
    if (!this._charCtrl || !this._spawn) return;
    if (!this._charCtrl.getModel().isAlive) {
      this._isInitialFrame = true;
      this._invulnTimer = 0;
      return;
    }
    if (this._invulnTimer > 0) this._invulnTimer -= _dt;

    this.characterNode.getWorldPosition(this._charWP);
    const charScale = this.characterNode.worldScale;

    if (this._isInitialFrame) {
      this._prevCharWP.set(this._charWP);
      this._isInitialFrame = false;
    }

    const moveX = this._charWP.x - this._prevCharWP.x;
    const moveY = this._charWP.y - this._prevCharWP.y;

    let cx = (this._charWP.x + this._prevCharWP.x) / 2;
    let cy = (this._charWP.y + this._prevCharWP.y) / 2;
    let chw = this._charCtrl.getModel().halfW + Math.abs(moveX) / 2;
    let chh = this._charCtrl.getModel().halfH + Math.abs(moveY) / 2;

    const charCollider = this.characterNode.getComponent(BoxCollider2D);
    if (charCollider) {
      cx += charCollider.offset.x * Math.abs(charScale.x);
      cy += charCollider.offset.y * Math.abs(charScale.y);
      chw = (charCollider.size.width / 2) * Math.abs(charScale.x) + Math.abs(moveX) / 2;
      chh = (charCollider.size.height / 2) * Math.abs(charScale.y) + Math.abs(moveY) / 2;
    }

    this._prevCharWP.set(this._charWP);

    const bgMoving = this._spawn.bgMoveNode?.getComponent(BgMoving);
    const worldMoveX = (bgMoving?.getScrollDirX() ?? 0) * (bgMoving?.speed ?? 0) * _dt;
    const worldStretchX = Math.abs(worldMoveX) / 2;

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

      coinX -= worldMoveX / 2;
      coinHW += worldStretchX;

      if (aabb(cx, cy, chw, chh, coinX, coinY, coinHW, coinHH)) {
        this._hits.push(coin);
      }
    }
    this._hits.forEach((coin, i) => {
      GameManager.getInstance().inventory.addCoin();
      this._spawn.removeActive(coin);
      EventBus.emit(CoinEvents.CoinCollected, { x: coin.worldX, y: coin.worldY, index: i });
      SoundController.getInstance()?.playSFX('coin_collect', false, 0.3);
      coin.deactivate();
    });

    if (this._invulnTimer > 0) return;
    if (!this.obstacleSpawn) return;

    const obstacles = this.obstacleSpawn.activeObstacles;
    for (let i = 0, n = obstacles.length; i < n; i++) {
      const o = obstacles[i];
      if (!o.model.active) continue;
      const owp = o.node.worldPosition;
      const oScale = o.node.worldScale;
      let ox = owp.x;
      let oy = owp.y;

      const obstacleView = o.node.getComponent(ObstacleView);
      const cs = obstacleView ? obstacleView.collisionScale : 1.0;

      const oCol = o.node.getComponent(BoxCollider2D);
      let ohw, ohh;
      if (oCol) {
        ox += oCol.offset.x * Math.abs(oScale.x);
        oy += oCol.offset.y * Math.abs(oScale.y);
        ohw = (oCol.size.width / 2) * Math.abs(oScale.x) * cs;
        ohh = (oCol.size.height / 2) * Math.abs(oScale.y) * cs;
      } else {
        ohw = o.model.halfW * Math.abs(oScale.x) * cs;
        ohh = o.model.halfH * Math.abs(oScale.y) * cs;
      }

      ox -= worldMoveX / 2;
      ohw += worldStretchX;

      if (aabb(cx, cy, chw, chh, ox, oy, ohw, ohh)) {
        this._invulnTimer = this.invulnerabilitySeconds;
        GameEventsBus.get().emit(GameEvents.PlayerHit, { x: ox, y: oy });
        break;
      }
    }

    if (!this.shardSpawn) return;
    const shards = this.shardSpawn.activeShards;
    for (let i = shards.length - 1; i >= 0; i--) {
      const s = shards[i];
      if (!s.model.active) continue;

      const swp = s.node.worldPosition;
      let shx = swp.x;
      let shy = swp.y;
      let shw = s.model.halfW;
      let shh = s.model.halfH;

      shx -= worldMoveX / 2;
      shw += worldStretchX;

      if (aabb(cx, cy, chw, chh, shx, shy, shw, shh)) {
        const shardIndex = s.model.index;
        GameManager.getInstance().inventory.addShard();
        this.shardSpawn.removeShard(s);
        SoundController.getInstance()?.playSFX('shard_collect');
        s.deactivate();
        GameEventsBus.get().emit(GameEvents.ShardCollected, shardIndex);
        if (GameManager.getInstance().inventory.getShardCount() >= 3) {
          GameEventsBus.get().emit(GameEvents.AllShardsCollected);
        }
      }
    }
  }
}

function aabb(ax: number, ay: number, ahw: number, ahh: number, bx: number, by: number, bhw: number, bhh: number): boolean {
  return Math.abs(ax - bx) < ahw + bhw && Math.abs(ay - by) < ahh + bhh;
}
