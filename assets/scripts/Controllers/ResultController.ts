import { _decorator, Component, Animation } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Controller for the ResultScene prefab.
 * Handles the sequential playback of introduction animations.
 */
@ccclass('ResultController')
export class ResultController extends Component {
    @property(Animation) 
    public animationComponent: Animation = null;

    onLoad(): void {
        if (!this.animationComponent) {
            this.animationComponent = this.getComponent(Animation);
        }

        if (this.animationComponent) {
            // Start play sequence
            this.animationComponent.play('Result_Intro_01');
            this.animationComponent.on(Animation.EventType.FINISHED, this._onAnimationFinished, this);
        } else {
            console.warn('[ResultController] Animation component not found.');
        }
    }

    private _onAnimationFinished(type: string, state: any): void {
        // Play Result_Intro_02 after Result_Intro_01 completes
        if (state.name === 'Result_Intro_01') {
            this.animationComponent.play('Result_Intro_02');
        }
    }
}
