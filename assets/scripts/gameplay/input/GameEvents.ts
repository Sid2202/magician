/** All game event string constants. Use GameEventsBus to emit/receive. */
export class GameEvents {
    // ── Lifecycle ──────────────────────────────────────────────────────────
    static readonly GameStart       = 'GameStart';
    static readonly GameOver        = 'GameOver';
    static readonly GamePause       = 'GamePause';
    static readonly GameResume      = 'GameResume';
    static readonly LevelComplete   = 'LevelComplete';

    // ── Collectibles ───────────────────────────────────────────────────────
    static readonly ItemCollected   = 'ItemCollected';   // payload: ItemType
    static readonly ItemConsumed    = 'ItemConsumed';    // payload: ItemType

    // ── NPC / Trade ────────────────────────────────────────────────────────
    static readonly NpcInteract     = 'NpcInteract';     // payload: NPCModel
    static readonly TradeSuccess    = 'TradeSuccess';    // payload: rewardType string

    // ── Light Progression ─────────────────────────────────────────────────
    static readonly LightRestored   = 'LightRestored';  // payload: number (0–1)

    // ── Player damage / hearts ────────────────────────────────────────────
    static readonly PlayerHit       = 'PlayerHit';       // payload: { x, y } world hit point
    static readonly PlayerRespawn   = 'PlayerRespawn';   // emitted after a hit when hearts > 0 remain
    static readonly HeartsChanged   = 'HeartsChanged';   // payload: number remaining
}

/** All collectible item types. */
export const enum ItemType {
    Shard = 'SHARD',
    Food  = 'FOOD',
    Tool  = 'TOOL',
}

/** Rewards an NPC can give after a trade. */
export type NpcReward = 'KEY' | 'UNLOCK_PATH' | 'REVEAL_SHORTCUT';
