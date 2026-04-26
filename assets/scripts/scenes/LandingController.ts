import { _decorator, Component, Animation, AnimationClip, Node, director } from 'cc';

const { ccclass, property } = _decorator;

/**
 * Attach to: root node of LandingScene.scene (or the LandingScene prefab root inside it).
 * Wire: introAnimation, introClip, playButton.
 */
@ccclass('LandingController')
export class LandingController extends Component {

    @property(Animation)
    public introAnimation: Animation = null;

    @property(AnimationClip)
    public introClip: AnimationClip = null;

    @property(Node)
    public playButton: Node = null;

    private _buttonShown = false;

    onLoad(): void {
        this._buttonShown = false;

        if (this.playButton) {
            this.playButton.active = false;
            this.playButton.on(Node.EventType.TOUCH_END, this._onPlayTapped, this);
        }

        // Delay intro slightly to ensure Cocos Animation system is fully ready
        this.scheduleOnce(() => {
            this._playIntro();
        }, 0.1);
    }

    onDestroy(): void {
        if (this.playButton) {
            this.playButton.off(Node.EventType.TOUCH_END, this._onPlayTapped, this);
        }
    }

    private _playIntro(): void {
        const anim = this.introAnimation || this.getComponent(Animation);
        
        if (!anim) {
            console.warn('[LandingController] No Animation component found.');
            this._showButton();
            return;
        }

        // Use introClip if wired, otherwise fallback to the first clip in the component
        const clip = this.introClip || (anim.clips.length > 0 ? anim.clips[0] : null);
        
        if (!clip) {
            console.warn('[LandingController] No AnimationClip found to play.');
            this._showButton();
            return;
        }

        // Ensure clip is added to the component
        const clipName = clip.name;
        if (!anim.getState(clipName)) {
            anim.addClip(clip, clipName);
        }

        anim.on(Animation.EventType.FINISHED, this._showButton, this);
        anim.play(clipName);

        // Safety fallback: if FINISHED doesn't fire (looping clip or engine bug), show button after clip duration
        const state = anim.getState(clipName);
        const duration = state ? state.duration : 3;
        this.scheduleOnce(() => this._showButton(), duration + 0.1);
    }

    private _showButton(): void {
        if (this._buttonShown) return;
        this._buttonShown = true;
        this.unscheduleAllCallbacks();
        if (this.playButton) {
            this.playButton.active = true;
        }
    }

    private _onPlayTapped(): void {
        director.loadScene('GameScene');
    }
}