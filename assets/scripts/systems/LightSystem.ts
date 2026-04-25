import { EventBus } from '../core/EventBus';
import { GameEvent } from '../core/Constants';
import { GameStateModel } from '../models/GameStateModel';

/**
 * Tracks global light progression and emits LIGHT_RESTORED events.
 * Pure system — no Cocos imports.
 */
export class LightSystem {

    init(): void {
        // Nothing to pre-subscribe here — driven by GameController
    }

    /**
     * Called by GameController when a light point is activated.
     * Recalculates globalLightValue and emits event.
     */
    onLightPointRestored(state: GameStateModel): void {
        state.restoredLightPoints++;
        state.globalLightValue = state.totalLightPoints > 0
            ? state.restoredLightPoints / state.totalLightPoints
            : 0;

        EventBus.get().emit(GameEvent.LIGHT_RESTORED, state.globalLightValue);
    }
}
