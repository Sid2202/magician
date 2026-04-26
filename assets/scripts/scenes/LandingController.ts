import { _decorator, Component, Animation, AnimationClip, Node, JsonAsset } from 'cc';
import { SoundController } from '../Managers/SoundController';

const { ccclass, property } = _decorator;

@ccclass('LandingController')
export class LandingController extends Component {

    @property(Animation)
    public introAnimation: Animation = null;

    @property(AnimationClip)
    public introClip: AnimationClip = null;

    @property(Node)
    public gameSceneNode: Node = null;

    @property(JsonAsset)
    public soundConfig: JsonAsset = null;

    onLoad(): void {
        this._initSound();
        
        // Ensure game scene starts hidden
        if (this.gameSceneNode) {
            this.gameSceneNode.active = false;
        }

        // Start intro after short delay
        this.scheduleOnce(() => {
            this._playIntro();
        }, 0.2);
    }

    private _initSound(): void {
        let sc = this.node.getComponent(SoundController);
        if (!sc) {
            sc = this.node.addComponent(SoundController);
        }
        if (this.soundConfig) {
            sc.init(this.soundConfig);
        }
    }

    private _playIntro(): void {
        const anim = this.introAnimation || this.getComponent(Animation);
        if (!anim) {
            this._transitionToGame();
            return;
        }

        const clip = this.introClip || (anim.clips.length > 0 ? anim.clips[0] : null);
        if (!clip) {
            this._transitionToGame();
            return;
        }

        SoundController.getInstance()?.playSFX('intro_01');

        const clipName = clip.name;
        if (!anim.getState(clipName)) {
            anim.addClip(clip, clipName);
        }

        // Switch automatically when finished
        anim.on(Animation.EventType.FINISHED, this._transitionToGame, this);
        anim.play(clipName);

        // Safety fallback timer
        const state = anim.getState(clipName);
        const duration = state ? state.duration : 3;
        this.scheduleOnce(() => this._transitionToGame(), duration + 0.1);
    }

    private _transitionToGame(): void {
        console.log('[LandingController] Auto-transitioning to Game Scene node');
        
        if (this.gameSceneNode) {
            // Hide landing, show game
            this.gameSceneNode.active = true;
            this.node.active = false;
            
            // Play a transition sound if desired
            SoundController.getInstance()?.playSFX('intro_02');
        } else {
            console.error('[LandingController] gameSceneNode NOT assigned in Inspector!');
        }
    }
}
