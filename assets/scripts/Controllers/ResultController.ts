import { _decorator, Component, Animation, AnimationClip, Node, Vec3, tween } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Controller for the ResultScene prefab.
 * Handles the sequential playback of introduction animations and character entry.
 */
@ccclass('ResultController')
export class ResultController extends Component {
    @property(Animation) 
    public animationComponent: Animation = null;

    @property(AnimationClip)
    public introClip1: AnimationClip = null;
    @property(AnimationClip)
    public introClip2: AnimationClip = null;

    @property(Node)
    public characterNode: Node = null;

    @property(Node)
    public characterEntryTarget: Node = null;

    onLoad(): void {
        if (!this.animationComponent) {
            this.animationComponent = this.getComponent(Animation);
        }

        if (this.animationComponent) {
            this.animationComponent.on(Animation.EventType.FINISHED, this._onAnimationFinished, this);
            // The user will connect animations; we play the first one if it exists
            const clips = this.animationComponent.clips;
            this.animationComponent.play(this.introClip1.name)
            this.animationComponent.play(this.introClip2.name)
        }

        this._startCharacterEntry();
    }

    private _startCharacterEntry(): void {
        if (!this.characterNode || !this.characterEntryTarget) return;

        // Ensure character is visible
        this.characterNode.active = true;

        // Position it off-screen left (relative to result prefab)
        const startPos = new Vec3(-800, 0, 0);
        this.characterNode.setPosition(startPos);

        // Move to target
        const targetPos = this.characterEntryTarget.position;
        tween(this.characterNode)
            .to(1.0, { position: targetPos }, { easing: 'sineOut' })
            .call(() => {
                console.log('[ResultController] Character entered and standing.');
            })
            .start();
    }

    private _onAnimationFinished(type: string, state: any): void {
        // Sequential animation handling (can be customized by user)
        const clips = this.animationComponent.clips;
        const currentIndex = clips.findIndex(c => c.name === state.name);
        if (currentIndex !== -1 && currentIndex < clips.length - 1) {
            this.animationComponent.play(clips[currentIndex + 1].name);
        }
    }
}
