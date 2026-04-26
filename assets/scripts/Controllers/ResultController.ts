import {
    _decorator, Component, Animation, AnimationClip,
    Node, Vec3, tween, Prefab, instantiate, director
} from 'cc';
import { CharacterView, CharacterState } from '../Views/CharacterView';

const { ccclass, property } = _decorator;

/**
 * Attach to: root node of ResultScene.scene (or the ResultScene prefab root inside it).
 *
 * Wire up:
 *   animationComponent  → Animation component for the two result clips
 *   introClip1          → first AnimationClip
 *   introClip2          → second AnimationClip (plays after introClip1)
 *   replayButton        → replay button Node (starts inactive)
 *   characterPrefab     → PF_Character prefab
 *   characterTargetNode → empty Node placed where the character should stop
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
    public replayButton: Node = null;

    @property(Prefab)
    public characterPrefab: Prefab = null;

    @property(Node)
    public characterTargetNode: Node = null;

    private _characterInstance: Node = null;
    private _animListenerBound = false;

    onLoad(): void {
        if (this.replayButton) {
            this.replayButton.active = false;
            this.replayButton.on(Node.EventType.TOUCH_END, this._onReplayTapped, this);
        }

        this._spawnCharacter();
    }

    onDestroy(): void {
        if (this.replayButton) {
            this.replayButton.off(Node.EventType.TOUCH_END, this._onReplayTapped, this);
        }
        if (this.animationComponent && this._animListenerBound) {
            this.animationComponent.off(Animation.EventType.FINISHED, this._onAnimFinished, this);
        }
    }

    // ── Character entry ───────────────────────────────────────────────────

    private _spawnCharacter(): void {
        if (!this.characterPrefab) return;

        this._characterInstance = instantiate(this.characterPrefab);
        this.node.addChild(this._characterInstance);

        // Disable input — display only.
        const ctrl = this._characterInstance.getComponent('CharacterController') as any;
        if (ctrl) {
            if (ctrl.setControllable) ctrl.setControllable(false);
            ctrl.enabled = false;
        }

        const targetPos = this.characterTargetNode
            ? this.characterTargetNode.position.clone()
            : new Vec3(0, -200, 0);

        const startPos = new Vec3(-900, targetPos.y, targetPos.z);
        this._characterInstance.setPosition(startPos);

        const view = this._characterInstance.getComponent(CharacterView);
        if (view) {
            view.setFacing(true);
            view.applyState(CharacterState.MoveH);
        }

        tween(this._characterInstance)
            .to(1.4, { position: targetPos }, { easing: 'sineOut' })
            .call(() => {
                if (view) view.applyState(CharacterState.Idle);
                this._beginAnimationSequence();
            })
            .start();
    }

    // ── Animation sequence ────────────────────────────────────────────────

    private _beginAnimationSequence(): void {
        if (!this.animationComponent) {
            this._showReplayButton();
            return;
        }

        this.animationComponent.on(Animation.EventType.FINISHED, this._onAnimFinished, this);
        this._animListenerBound = true;
        this._playClip(this.introClip1);
    }

    private _onAnimFinished(type: Animation.EventType, state: any): void {
        if (this.introClip1 && state.name === this.introClip1.name && this.introClip2) {
            this._playClip(this.introClip2);
        } else {
            this.animationComponent.off(Animation.EventType.FINISHED, this._onAnimFinished, this);
            this._animListenerBound = false;
            this._showReplayButton();
        }
    }

    private _playClip(clip: AnimationClip | null): void {
        if (!clip || !this.animationComponent) return;
        const already = this.animationComponent.clips.some(c => c?.name === clip.name);
        if (!already) this.animationComponent.addClip(clip, clip.name);
        this.animationComponent.play(clip.name);
    }

    private _showReplayButton(): void {
        if (this.replayButton) this.replayButton.active = true;
    }

    // ── Replay ────────────────────────────────────────────────────────────

    private _onReplayTapped(): void {
        director.loadScene('GameScene');
    }
}
