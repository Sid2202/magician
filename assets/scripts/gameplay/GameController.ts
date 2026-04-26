import { _decorator, Component, Node, NodePool, Prefab, instantiate, UITransform, Vec3 } from 'cc';
import { GameManager } from '../Managers/GameManager';
import { GameEventsBus } from '../common/event/GlobalEventTarget';
import { GameEvents, ItemType, NpcReward } from './input/GameEvents';
import { CharacterController } from './CharacterController';
import { PathController } from './PathController';
import { BgMoving } from './BgMoving';

const { ccclass, property } = _decorator;

// ── Spawn timing constants ────────────────────────────────────────────────
const SCROLL_SPEED_PX_S  = 220;  // world scroll speed in pixels/second
const PATH_TILE_COUNT    = 3;    // number of looping background tiles
const ITEM_INTERVAL_MIN  = 4.5;  // Spaced out shards horizontally
const ITEM_INTERVAL_MAX  = 8.0;
const NPC_INTERVAL_MIN   = 15.0; // Rare NPC spawns
const NPC_INTERVAL_MAX   = 25.0;
const SPAWN_X_AHEAD      = 700;  // spawn off-screen to the right (pixels from center)
const HALF_SCREEN_H      = 480;  // half-height of gameplay area for random Y

/**
 * Attach to Base_Parent inside GameScene.prefab.
 *
 * Responsibilities:
 *   - Starts the game session (calls GameManager.startSession)
 *   - Loops PF_Path tiles for infinite scrolling background
 *   - Spawns & pools collectible items (Shard, Food, Tool)
 *   - Spawns & pools NPCs
 *   - Runs AABB collision between character and active objects
 *   - Wires trade / light-restoration logic
 */
@ccclass('GameController')
export class GameController extends Component {

    // ── Scene refs wired in Inspector ────────────────────────────────────
    @property(Node) characterNode:  Node = null;  // PF_Character instance

    // ── Prefabs for pooling ───────────────────────────────────────────────
    @property(Prefab) pfPath:   Prefab = null;  // PF_Path prefab
    @property(Prefab) pfShard:  Prefab = null;  // Shard collectible prefab
    @property(Prefab) pfFood:   Prefab = null;  // Food collectible prefab
    @property(Prefab) pfTool:   Prefab = null;  // Tool collectible prefab
    @property(Prefab) pfNpc:    Prefab = null;  // NPC prefab

    /** Wire the BgMove node (has BgMoving component) to sync world scroll. */
    @property(Node) bgMoveNode: Node = null;

    /** Total light points in this level. Passed to GameManager.startSession(). */
    @property totalLightPoints: number = 5;

    // ── Path tiling ───────────────────────────────────────────────────────
    private _pathTiles: PathController[] = [];
    private _tileWidth: number = 1280;

    // ── Object pools ─────────────────────────────────────────────────────
    private _itemPool: NodePool = new NodePool();
    private _npcPool:  NodePool = new NodePool();

    // ── Active objects ────────────────────────────────────────────────────
    /** Each entry: { node, type (ItemType | 'NPC'), x, y, wantsItem?, givesReward? } */
    private _activeItems: ActiveItem[] = [];
    private _activeNpcs:  ActiveNpc[]  = [];

    // ── Spawn timers ──────────────────────────────────────────────────────
    private _itemTimer:    number = 0;
    private _itemInterval: number = ITEM_INTERVAL_MIN;
    private _npcTimer:     number = 0;
    private _npcInterval:  number = NPC_INTERVAL_MIN;

    // ── Character reference ───────────────────────────────────────────────
    private _charCtrl: CharacterController = null;

    // ── Reusable ──────────────────────────────────────────────────────────
    private _recycleItems: ActiveItem[] = [];
    private _recycleNpcs:  ActiveNpc[]  = [];

    private _bgMoving: BgMoving | null = null;

    // ─────────────────────────────────────────────────────────────────────
    onLoad(): void {
        GameManager.startSession(this.totalLightPoints);
        this._charCtrl = this.characterNode?.getComponent(CharacterController);

        if (this.bgMoveNode) {
            this._bgMoving = this.bgMoveNode.getComponent(BgMoving);
        }

        this._setupPathTiles();
        this._seedPools();
        this._subscribeEvents();
    }

    onDestroy(): void {
        GameEventsBus.get().off(GameEvents.GameOver, this._onGameOver, this);
        this._itemPool.clear();
        this._npcPool.clear();
    }

    update(dt: number): void {
        if (!GameManager.getInstance()?.state.isPlaying) return;

        const dirX  = this._bgMoving?.getScrollDirX() ?? 0;
        const speed = this._bgMoving?.speed ?? 0;
        // if dirX is -1 (scrolling left), the world components must move by +dx
        const dx = -dirX * speed * dt;

        if (dx !== 0) {
            this._scrollPathTiles(dx);
            this._tickSpawners(dt);
            this._scrollActiveObjects(dx);
            this._checkCollisions();
        }
    }

    // ── Setup ─────────────────────────────────────────────────────────────

    private _setupPathTiles(): void {
        if (!this.pfPath) return;

        // Sample tile width from prefab's UITransform
        const sample = instantiate(this.pfPath);
        const ut = sample.getComponent(UITransform);
        if (ut) this._tileWidth = ut.contentSize.width;
        sample.destroy();

        // Spawn PATH_TILE_COUNT tiles laid end-to-end from left of screen
        for (let i = 0; i < PATH_TILE_COUNT; i++) {
            const tileNode = instantiate(this.pfPath);
            this.node.addChild(tileNode);

            const ctrl = tileNode.getComponent(PathController);
            if (ctrl) {
                ctrl.tileWidth = this._tileWidth;
                // Lay tiles starting at -tileWidth to just off right edge
                ctrl.setPositionX(-this._tileWidth + i * this._tileWidth);
                this._pathTiles.push(ctrl);
            }
        }
    }

    private _seedPools(): void {
        const seed = (pool: NodePool, prefab: Prefab | null, count: number) => {
            if (!prefab) return;
            for (let i = 0; i < count; i++) {
                const n = instantiate(prefab);
                n.active = false;
                pool.put(n);
            }
        };
        // Items share one pool — each node carries its ItemType as userData
        seed(this._itemPool, this.pfShard, 15);
        seed(this._itemPool, this.pfFood,  10);
        seed(this._itemPool, this.pfTool,  10);
        seed(this._npcPool,  this.pfNpc,   6);
    }

    private _subscribeEvents(): void {
        GameEventsBus.get().on(GameEvents.GameOver, this._onGameOver, this);
        GameEventsBus.get().on(GameEvents.TradeSuccess, this._onTradeSuccess, this);
    }

    // ── Path scrolling ────────────────────────────────────────────────────

    private _scrollPathTiles(dx: number): void {
        for (const tile of this._pathTiles) {
            tile.scrollBy(dx);

            // Recycle: if the tile's right edge is off-screen left, jump it to the right
            if (tile.getRightEdgeX() < -this._tileWidth) {
                // Find the rightmost tile's right edge and place after it
                let maxRight = -Infinity;
                for (const t of this._pathTiles) {
                    if (t.getRightEdgeX() > maxRight) maxRight = t.getRightEdgeX();
                }
                tile.setPositionX(maxRight + this._tileWidth * 0.5);
            }
        }
    }

    // ── Spawn timers ──────────────────────────────────────────────────────

    private _tickSpawners(dt: number): void {
        this._itemTimer += dt;
        if (this._itemTimer >= this._itemInterval) {
            this._itemTimer = 0;
            this._itemInterval = randRange(ITEM_INTERVAL_MIN, ITEM_INTERVAL_MAX);
            this._spawnItem();
        }

        this._npcTimer += dt;
        if (this._npcTimer >= this._npcInterval) {
            this._npcTimer = 0;
            this._npcInterval = randRange(NPC_INTERVAL_MIN, NPC_INTERVAL_MAX);
            this._spawnNpc();
        }
    }

    private _spawnItem(): void {
        const types: ItemType[] = [ItemType.Shard, ItemType.Food, ItemType.Tool];
        const type  = types[Math.floor(Math.random() * types.length)];
        const prefab = this._prefabForItemType(type);
        if (!prefab) return;

        let node = this._itemPool.get();
        if (!node) node = instantiate(prefab);
        if (!node) return;

        node.active = true;
        this.node.addChild(node);

        const y = randRange(-HALF_SCREEN_H * 0.7, HALF_SCREEN_H * 0.7);
        node.setPosition(new Vec3(SPAWN_X_AHEAD, y, 0));

        this._activeItems.push({ node, type, x: SPAWN_X_AHEAD, y });
    }

    private _spawnNpc(): void {
        if (!this.pfNpc) return;

        let node = this._npcPool.get();
        if (!node) node = instantiate(this.pfNpc);
        if (!node) return;

        node.active = true;
        this.node.addChild(node);

        const wantsItem  = NPC_WANTS[Math.floor(Math.random() * NPC_WANTS.length)];
        const givesReward: NpcReward = NPC_REWARDS[NPC_WANTS.indexOf(wantsItem)];
        const y = randRange(-HALF_SCREEN_H * 0.6, HALF_SCREEN_H * 0.6);
        node.setPosition(new Vec3(SPAWN_X_AHEAD, y, 0));

        this._activeNpcs.push({ node, wantsItem, givesReward, x: SPAWN_X_AHEAD, y, traded: false });
    }

    // ── Scroll active objects ─────────────────────────────────────────────

    private _scrollActiveObjects(dx: number): void {
        const CULL_X = -SPAWN_X_AHEAD;

        for (const item of this._activeItems) {
            item.x -= dx;
            item.node.setPosition(new Vec3(item.x, item.y, 0));
            if (item.x < CULL_X) this._recycleItems.push(item);
        }
        for (const npc of this._activeNpcs) {
            npc.x -= dx;
            npc.node.setPosition(new Vec3(npc.x, npc.y, 0));
            if (npc.x < CULL_X) this._recycleNpcs.push(npc);
        }

        // Recycle culled objects
        for (const item of this._recycleItems) this._returnItem(item);
        for (const npc  of this._recycleNpcs)  this._returnNpc(npc);
        this._recycleItems.length = 0;
        this._recycleNpcs.length  = 0;
    }

    // ── Collision detection (AABB) ─────────────────────────────────────────

    private _checkCollisions(): void {
        if (!this._charCtrl) return;

        const cm = this._charCtrl.getModel();
        if (!cm.isAlive) return;

        const CW = cm.halfW;
        const CH = cm.halfH;

        // Items
        for (const item of this._activeItems) {
            const IW = 28, IH = 28;
            if (aabb(cm.x, cm.y, CW, CH, item.x, item.y, IW, IH)) {
                GameManager.getInstance().onItemCollected(item.type);
                this._recycleItems.push(item);
            }
        }

        // NPCs
        for (const npc of this._activeNpcs) {
            if (npc.traded) continue;
            const NW = 52, NH = 52;
            if (aabb(cm.x, cm.y, CW, CH, npc.x, npc.y, NW, NH)) {
                this._tryTrade(npc);
            }
        }

        // Flush collision-triggered recycles
        for (const item of this._recycleItems) this._returnItem(item);
        this._recycleItems.length = 0;
    }

    // ── Trade logic ────────────────────────────────────────────────────────

    private _tryTrade(npc: ActiveNpc): void {
        const gm = GameManager.getInstance();
        if (!gm.inventory.hasItem(npc.wantsItem)) return;

        gm.inventory.consumeItem(npc.wantsItem);
        GameEventsBus.get().emit(GameEvents.ItemConsumed, npc.wantsItem);

        npc.traded = true;
        GameEventsBus.get().emit(GameEvents.TradeSuccess, npc.givesReward);
        GameEventsBus.get().emit(GameEvents.NpcInteract, npc.givesReward);
    }

    private _onTradeSuccess(reward: string): void {
        // A trade reward may activate a light point
        // GameController doesn't own light points directly —
        // individual LightPointController nodes listen for TradeSuccess.
    }

    // ── Recycling helpers ──────────────────────────────────────────────────

    private _returnItem(item: ActiveItem): void {
        const idx = this._activeItems.indexOf(item);
        if (idx !== -1) this._activeItems.splice(idx, 1);
        item.node.active = false;
        item.node.removeFromParent();
        this._itemPool.put(item.node);
    }

    private _returnNpc(npc: ActiveNpc): void {
        const idx = this._activeNpcs.indexOf(npc);
        if (idx !== -1) this._activeNpcs.splice(idx, 1);
        npc.node.active = false;
        npc.node.removeFromParent();
        this._npcPool.put(npc.node);
    }

    private _prefabForItemType(type: ItemType): Prefab | null {
        if (type === ItemType.Shard) return this.pfShard;
        if (type === ItemType.Food)  return this.pfFood;
        if (type === ItemType.Tool)  return this.pfTool;
        return null;
    }

    private _onGameOver(): void {
        // Timers stop because update() checks isPlaying
    }
}

// ── Internal types ────────────────────────────────────────────────────────

interface ActiveItem {
    node: Node;
    type: ItemType;
    x: number;
    y: number;
}

interface ActiveNpc {
    node: Node;
    wantsItem:   ItemType;
    givesReward: NpcReward;
    x: number;
    y: number;
    traded: boolean;
}

// ── Module-level helpers ──────────────────────────────────────────────────

const NPC_WANTS:   ItemType[]   = [ItemType.Food,   ItemType.Tool,        ItemType.Shard         ];
const NPC_REWARDS: NpcReward[]  = ['KEY',           'UNLOCK_PATH',        'REVEAL_SHORTCUT'      ];

function randRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
}

function aabb(ax: number, ay: number, ahw: number, ahh: number,
              bx: number, by: number, bhw: number, bhh: number): boolean {
    return Math.abs(ax - bx) < ahw + bhw && Math.abs(ay - by) < ahh + bhh;
}
