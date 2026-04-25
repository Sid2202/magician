import { Node } from 'cc';
import { PoolingSystem } from './PoolingSystem';
import { ItemController } from '../controllers/ItemController';
import { NPCController } from '../controllers/NPCController';
import { PoolType, ItemType, SpawnConstants } from '../core/Constants';
import { MathUtil } from '../utils/MathUtil';

const ITEM_TYPES: ItemType[] = [ItemType.SHARD, ItemType.FOOD, ItemType.TOOL];
const NPC_WANTS:  ItemType[] = [ItemType.FOOD, ItemType.TOOL, ItemType.SHARD];
const NPC_REWARDS = ['KEY', 'UNLOCK_PATH', 'REVEAL_SHORTCUT'] as const;

/**
 * Drives object spawning. Uses PoolingSystem — no instantiate calls here.
 * SpawnSystem is update-driven; call tick(dt) from the scene update loop.
 */
export class SpawnSystem {

    private _pooling: PoolingSystem = null;
    private _spawnParent: Node = null;

    private _itemTimer: number = 0;
    private _itemInterval: number = SpawnConstants.ITEM_INTERVAL_MIN;
    private _npcTimer: number  = 0;
    private _npcInterval: number = SpawnConstants.NPC_INTERVAL_MIN;

    private _nextItemId: number = 0;
    private _nextNpcId: number  = 0;
    private _running: boolean   = false;

    /** Pooled active lists — accessed by CollisionSystem each frame. */
    readonly activeItems: ItemController[] = [];
    readonly activeNPCs:  NPCController[]  = [];

    init(pooling: PoolingSystem, spawnParent: Node): void {
        this._pooling = pooling;
        this._spawnParent = spawnParent;
        this._running = true;
        this._resetTimers();
    }

    stop(): void {
        this._running = false;
    }

    tick(dt: number, screenHalfH: number): void {
        if (!this._running) return;

        this._itemTimer += dt;
        if (this._itemTimer >= this._itemInterval) {
            this._itemTimer = 0;
            this._itemInterval = MathUtil.randomRange(
                SpawnConstants.ITEM_INTERVAL_MIN,
                SpawnConstants.ITEM_INTERVAL_MAX,
            );
            this._spawnItem(screenHalfH);
        }

        this._npcTimer += dt;
        if (this._npcTimer >= this._npcInterval) {
            this._npcTimer = 0;
            this._npcInterval = MathUtil.randomRange(
                SpawnConstants.NPC_INTERVAL_MIN,
                SpawnConstants.NPC_INTERVAL_MAX,
            );
            this._spawnNPC(screenHalfH);
        }
    }

    /** Called by world scroll loop so active objects move with the world. */
    scrollActiveObjects(dx: number): void {
        for (const item of this.activeItems) {
            item.scrollX(dx);
            // Recycle far-left items
            if (item.getModel().x < -SpawnConstants.SPAWN_AHEAD_X) {
                this._recycleItem(item);
            }
        }
        for (const npc of this.activeNPCs) {
            npc.scrollX(dx);
            if (npc.getModel().x < -SpawnConstants.SPAWN_AHEAD_X) {
                this._recycleNPC(npc);
            }
        }
    }

    recycleCollectedItem(ctrl: ItemController): void {
        this._recycleItem(ctrl);
    }

    recycleNPC(ctrl: NPCController): void {
        this._recycleNPC(ctrl);
    }

    private _spawnItem(screenHalfH: number): void {
        const type = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
        const poolType = type as unknown as PoolType;
        const node = this._pooling.getFromPool(poolType);
        if (!node) return;

        node.setParent(this._spawnParent);
        const ctrl = node.getComponent(ItemController);
        if (!ctrl) return;

        const y = MathUtil.randomRange(-screenHalfH * 0.8, screenHalfH * 0.8);
        ctrl.activate(this._nextItemId++, type, SpawnConstants.SPAWN_AHEAD_X, y);
        this.activeItems.push(ctrl);
    }

    private _spawnNPC(screenHalfH: number): void {
        const node = this._pooling.getFromPool(PoolType.NPC);
        if (!node) return;

        node.setParent(this._spawnParent);
        const ctrl = node.getComponent(NPCController);
        if (!ctrl) return;

        const idx     = Math.floor(Math.random() * NPC_WANTS.length);
        const wantsItem = NPC_WANTS[idx];
        const reward    = NPC_REWARDS[idx];
        const y = MathUtil.randomRange(-screenHalfH * 0.6, screenHalfH * 0.6);
        ctrl.activate(this._nextNpcId++, SpawnConstants.SPAWN_AHEAD_X, y, wantsItem, reward);
        this.activeNPCs.push(ctrl);
    }

    private _recycleItem(ctrl: ItemController): void {
        const idx = this.activeItems.indexOf(ctrl);
        if (idx !== -1) this.activeItems.splice(idx, 1);
        ctrl.deactivate();
        const model = ctrl.getModel();
        const poolType = model.type as unknown as PoolType;
        this._pooling.returnToPool(poolType, ctrl.node);
    }

    private _recycleNPC(ctrl: NPCController): void {
        const idx = this.activeNPCs.indexOf(ctrl);
        if (idx !== -1) this.activeNPCs.splice(idx, 1);
        ctrl.deactivate();
        this._pooling.returnToPool(PoolType.NPC, ctrl.node);
    }

    private _resetTimers(): void {
        this._itemTimer   = 0;
        this._itemInterval = MathUtil.randomRange(
            SpawnConstants.ITEM_INTERVAL_MIN,
            SpawnConstants.ITEM_INTERVAL_MAX,
        );
        this._npcTimer    = 0;
        this._npcInterval  = MathUtil.randomRange(
            SpawnConstants.NPC_INTERVAL_MIN,
            SpawnConstants.NPC_INTERVAL_MAX,
        );
    }
}
