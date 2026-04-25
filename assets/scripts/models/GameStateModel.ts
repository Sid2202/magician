/** Pure data — no Cocos imports. */
export const enum GamePhase {
    IDLE           = 'IDLE',
    PLAYING        = 'PLAYING',
    PAUSED         = 'PAUSED',
    LEVEL_COMPLETE = 'LEVEL_COMPLETE',
    GAME_OVER      = 'GAME_OVER',
}

export class GameStateModel {
    phase: GamePhase = GamePhase.IDLE;
    /** 0–1; drives visual light intensity, managed by LightSystem. */
    globalLightValue: number = 0;
    totalLightPoints: number = 0;
    restoredLightPoints: number = 0;
    score: number = 0;

    get isPlaying(): boolean {
        return this.phase === GamePhase.PLAYING;
    }

    reset(): void {
        this.phase = GamePhase.IDLE;
        this.globalLightValue = 0;
        this.totalLightPoints = 0;
        this.restoredLightPoints = 0;
        this.score = 0;
    }
}
