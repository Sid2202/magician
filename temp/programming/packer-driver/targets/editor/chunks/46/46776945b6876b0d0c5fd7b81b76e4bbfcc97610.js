System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, GameStateModel, _crd, GamePhase;

  _export("GameStateModel", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "38e1aJ3TxZEJ7Sk701lz58A", "GameStateModel", undefined);

      /** Pure data — no Cocos imports. */
      _export("GamePhase", GamePhase = {
        IDLE: "IDLE",
        PLAYING: "PLAYING",
        PAUSED: "PAUSED",
        LEVEL_COMPLETE: "LEVEL_COMPLETE",
        GAME_OVER: "GAME_OVER"
      });

      _export("GameStateModel", GameStateModel = class GameStateModel {
        constructor() {
          this.phase = GamePhase.IDLE;

          /** 0–1; drives visual light intensity, managed by LightSystem. */
          this.globalLightValue = 0;
          this.totalLightPoints = 0;
          this.restoredLightPoints = 0;
          this.score = 0;
        }

        get isPlaying() {
          return this.phase === GamePhase.PLAYING;
        }

        reset() {
          this.phase = GamePhase.IDLE;
          this.globalLightValue = 0;
          this.totalLightPoints = 0;
          this.restoredLightPoints = 0;
          this.score = 0;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=46776945b6876b0d0c5fd7b81b76e4bbfcc97610.js.map