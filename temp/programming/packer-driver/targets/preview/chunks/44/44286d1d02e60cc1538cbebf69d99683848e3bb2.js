System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, PlayerConstants, WorldConstants, LightConstants, SpawnConstants, CollisionConstants, _crd, GameEvent, ItemType, PoolType;

  _export({
    PlayerConstants: void 0,
    WorldConstants: void 0,
    LightConstants: void 0,
    SpawnConstants: void 0,
    CollisionConstants: void 0
  });

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "f484cZu26FG2oQ15W8penew", "Constants", undefined);

      _export("GameEvent", GameEvent = {
        ITEM_COLLECTED: "ITEM_COLLECTED",
        ITEM_CONSUMED: "ITEM_CONSUMED",
        NPC_INTERACT: "NPC_INTERACT",
        TRADE_SUCCESS: "TRADE_SUCCESS",
        LIGHT_RESTORED: "LIGHT_RESTORED",
        GAME_OVER: "GAME_OVER",
        PLAYER_HIT: "PLAYER_HIT",
        GAME_START: "GAME_START",
        GAME_PAUSE: "GAME_PAUSE",
        GAME_RESUME: "GAME_RESUME"
      });

      _export("ItemType", ItemType = {
        SHARD: "SHARD",
        FOOD: "FOOD",
        TOOL: "TOOL"
      });

      _export("PoolType", PoolType = {
        SHARD: "SHARD",
        FOOD: "FOOD",
        TOOL: "TOOL",
        NPC: "NPC",
        OBSTACLE: "OBSTACLE"
      });

      _export("PlayerConstants", PlayerConstants = class PlayerConstants {});

      PlayerConstants.SPEED = 300;
      PlayerConstants.HOVER_DAMPING = 0.85;
      PlayerConstants.INPUT_DEADZONE = 0.1;

      _export("WorldConstants", WorldConstants = class WorldConstants {});

      WorldConstants.BASE_SCROLL_SPEED = 200;
      WorldConstants.LAYER_VELOCITY = {
        far: 0.2,
        mid: 0.5,
        near: 0.8,
        gameplay: 1.0
      };

      _export("LightConstants", LightConstants = class LightConstants {});

      LightConstants.POINTS_REQUIRED_DEFAULT = 3;

      _export("SpawnConstants", SpawnConstants = class SpawnConstants {});

      SpawnConstants.ITEM_INTERVAL_MIN = 1.5;
      SpawnConstants.ITEM_INTERVAL_MAX = 3.0;
      SpawnConstants.NPC_INTERVAL_MIN = 8.0;
      SpawnConstants.NPC_INTERVAL_MAX = 15.0;
      SpawnConstants.SPAWN_AHEAD_X = 1200;

      _export("CollisionConstants", CollisionConstants = class CollisionConstants {});

      CollisionConstants.PLAYER_HALF_W = 32;
      CollisionConstants.PLAYER_HALF_H = 32;
      CollisionConstants.ITEM_HALF_W = 24;
      CollisionConstants.ITEM_HALF_H = 24;
      CollisionConstants.NPC_HALF_W = 48;
      CollisionConstants.NPC_HALF_H = 48;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=44286d1d02e60cc1538cbebf69d99683848e3bb2.js.map