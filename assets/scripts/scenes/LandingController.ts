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

        this._playIntro();
    }

    onDestroy(): void {
        if (this.playButton?.isValid) {
            this.playButton.off(Node.EventType.TOUCH_END, this._onPlayTapped, this);
        }
    }

    private _playIntro(): void {
        if (!this.introAnimation) {
            this._showButton();
            return;
        }

        const clip = this.introClip ?? this.introAnimation.clips[0];
        if (!clip) {
            this._showButton();
            return;
        }

        this.introAnimation.on(Animation.EventType.FINISHED, this._showButton, this);

        if (this.introClip) {
            const already = this.introAnimation.clips.some(c => c?.name === this.introClip.name);
            if (!already) this.introAnimation.addClip(this.introClip, this.introClip.name);
            this.introAnimation.play(this.introClip.name);
        } else {
            this.introAnimation.play();
        }

        // Fallback timer in case the clip is looping or FINISHED doesn't fire.
        const state = this.introAnimation.getState(clip.name);
        const duration = state ? state.duration : 3;
        this.scheduleOnce(() => this._showButton(), duration + 0.2);
    }

    private _showButton(): void {
        if (this._buttonShown) return;
        this._buttonShown = true;
        this.unscheduleAllCallbacks();
        if (this.playButton) this.playButton.active = true;
    }

    private _onPlayTapped(): void {
        director.loadScene('GameScene');
    }
}
