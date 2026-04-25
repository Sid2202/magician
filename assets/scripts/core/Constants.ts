export const enum GameEvent {
    ITEM_COLLECTED  = 'ITEM_COLLECTED',
    ITEM_CONSUMED   = 'ITEM_CONSUMED',
    NPC_INTERACT    = 'NPC_INTERACT',
    TRADE_SUCCESS   = 'TRADE_SUCCESS',
    LIGHT_RESTORED  = 'LIGHT_RESTORED',
    GAME_OVER       = 'GAME_OVER',
    PLAYER_HIT      = 'PLAYER_HIT',
    GAME_START      = 'GAME_START',
    GAME_PAUSE      = 'GAME_PAUSE',
    GAME_RESUME     = 'GAME_RESUME',
}

export const enum ItemType {
    SHARD = 'SHARD',
    FOOD  = 'FOOD',
    TOOL  = 'TOOL',
}

export const enum PoolType {
    SHARD    = 'SHARD',
    FOOD     = 'FOOD',
    TOOL     = 'TOOL',
    NPC      = 'NPC',
    OBSTACLE = 'OBSTACLE',
}

export class PlayerConstants {
    static readonly SPEED           = 300;
    static readonly HOVER_DAMPING   = 0.85;
    static readonly INPUT_DEADZONE  = 0.1;
}

export class WorldConstants {
    static readonly BASE_SCROLL_SPEED    = 200;
    static readonly LAYER_VELOCITY: Record<string, number> = {
        far:        0.2,
        mid:        0.5,
        near:       0.8,
        gameplay:   1.0,
    };
}

export class LightConstants {
    static readonly POINTS_REQUIRED_DEFAULT = 3;
}

export class SpawnConstants {
    static readonly ITEM_INTERVAL_MIN = 1.5;
    static readonly ITEM_INTERVAL_MAX = 3.0;
    static readonly NPC_INTERVAL_MIN  = 8.0;
    static readonly NPC_INTERVAL_MAX  = 15.0;
    static readonly SPAWN_AHEAD_X     = 1200;
}

export class CollisionConstants {
    static readonly PLAYER_HALF_W = 32;
    static readonly PLAYER_HALF_H = 32;
    static readonly ITEM_HALF_W   = 24;
    static readonly ITEM_HALF_H   = 24;
    static readonly NPC_HALF_W    = 48;
    static readonly NPC_HALF_H    = 48;
}
