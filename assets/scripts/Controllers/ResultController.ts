import { _decorator, Component, Animation, AnimationClip, Node, Vec3, tween, Prefab, instantiate } from 'cc';
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

    @property(Prefab)
    public characterNode: Prefab = null

    @property(Node)
    public characterEntryTarget: Node = null;

    onLoad(): void {
        if (!this.animationComponent) {
            this.animationComponent = this.getComponent(Animation);
        }

        if (this.animationComponent) {
            this.animationComponent.on(Animation.EventType.FINISHED, this._onAnimationFinished, this);
            
            // Play introClip1 first
            if (this.introClip1) {
                // Ensure clip is added
                const hasClip = this.animationComponent.clips.some(c => c && c.name === this.introClip1.name);
                if (!hasClip) {
                    this.animationComponent.addClip(this.introClip1, this.introClip1.name);
                }
                this.animationComponent.play(this.introClip1.name);
            }
        }

        this._startCharacterEntry();
    }

    private _startCharacterEntry(): void {
        if (!this.characterNode) return;

        // Instantiate character from Prefab
        const node = instantiate(this.characterNode);
        this.node.addChild(node);

        // Position it bottom-left off-screen
        const startPos = new Vec3(-700, -500, 0);
        node.setPosition(startPos);

        // Move to a central offset (e.g., -100, -200)
        const targetPos = new Vec3(-100, -200, 0);
        tween(node)
            .to(1.2, { position: targetPos }, { easing: 'sineOut' })
            .call(() => {
                console.log('[ResultController] Character entered and standing.');
            })
            .start();
    }

    private _onAnimationFinished(type: Animation.EventType, state: any): void {
        // Sequential animation handling
        if (this.introClip1 && state.name === this.introClip1.name && this.introClip2) {
            const hasClip = this.animationComponent.clips.some(c => c && c.name === this.introClip2.name);
            if (!hasClip) {
                this.animationComponent.addClip(this.introClip2, this.introClip2.name);
            }
            this.animationComponent.play(this.introClip2.name);
        }
    }
}
