/** All possible game phases. */
export const enum GamePhase {
    Idle          = 'Idle',
    Playing       = 'Playing',
    Paused        = 'Paused',
    LevelComplete = 'LevelComplete',
    GameOver      = 'GameOver',
}

/** Pure data — no Cocos imports. Single source of truth for game-level state. */
export class GameStateModel {
    phase: GamePhase = GamePhase.Idle;

    /** 0–1. Drives the visual light restoration progress (0 = dark, 1 = full light). */
    globalLightValue: number = 0;

    totalLightPoints:    number = 0;
    restoredLightPoints: number = 0;

    get isPlaying(): boolean {
        return this.phase === GamePhase.Playing;
    }

    reset(): void {
        this.phase               = GamePhase.Idle;
        this.globalLightValue    = 0;
        this.restoredLightPoints = 0;
    }
}
