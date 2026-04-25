import { _decorator, Component, Node, Animation, AnimationClip } from 'cc';

const { ccclass, property } = _decorator;

/** All possible character visual states. Exported so CharacterController can use it. */
export enum CharacterState {
    Idle   = 'Idle',    // hovering — idle clip, effects hidden
    MoveV  = 'MoveV',  // moving up or down — idle clip, effects hidden
    MoveH  = 'MoveH',  // moving left or right — motion clip, effects VISIBLE
    Hit    = 'Hit',     // took damage / died — stop all
}

/**
 * Attach to: PF_Character ROOT NODE (same node as CharacterController).
 *
 * This is the VIEW layer — owns all visual concerns, zero game logic.
 * CharacterController calls applyState() and setFacing() every frame.
 *
 * Node wiring (drag in Inspector):
 *   effectNode   → the "Effect" child node (parent of Fly/Star effects)
 *   megicianNode → the "Megician" child node (body parts, used for sprite flip)
 *
 * Animation clips (drag in Inspector):
 *   clipIdle   → "idle" AnimationClip  (hovering, up, down)
 *   clipMotion → "motion" AnimationClip (left/right movement)
 *
 * The Animation component must be on this same node (PF_Character root).
 * Artist adds clips to the Animation component; drag them into these properties.
 */
@ccclass('CharacterView')
export class CharacterView extends Component {

    // ── Node refs ─────────────────────────────────────────────────────────

    /** Drag the "Effect" child node here. Contains all Fly/Star particles. */
    @property(Node) effectNode:   Node = null;

    /** Drag the "Megician" child node here. Flipped to change facing direction. */
    @property(Node) megicianNode: Node = null;

    // ── Animation clips ───────────────────────────────────────────────────

    @property(Animation)
    private animation: Animation = null;

    /** Hovering / up / down animation. Drag the idle AnimationClip here. */
    @property(AnimationClip) clipIdle:   AnimationClip = null;

    /** Left / right movement animation. Drag the motion AnimationClip here. */
    @property(AnimationClip) clipMotion: AnimationClip = null;

    // ── Internal ──────────────────────────────────────────────────────────

    private _anim:         Animation     | null = null;
    private _currentClip:  AnimationClip | null = null;
    private _currentState: CharacterState        = CharacterState.Idle;

    // ─────────────────────────────────────────────────────────────────────
    onLoad(): void {
        this._anim = this.getComponent(Animation);

        if (!this._anim) {
            console.warn('[CharacterView] No Animation component found on PF_Character. ' +
                         'Add an Animation component and assign clips.');
        }
        if (!this.effectNode)   console.warn('[CharacterView] effectNode not wired.');
        if (!this.megicianNode) console.warn('[CharacterView] megicianNode not wired.');

        // Effects always start hidden
        this._setEffectsVisible(false);
    }

    // ── Public API called by CharacterController ──────────────────────────

    /**
     * Apply the current movement state.
     * Switches animation clip and shows/hides effects accordingly.
     * Only acts when state actually changes — no redundant animation calls.
     */
    applyState(state: CharacterState): void {
        if (this._currentState === state) return;
        this._currentState = state;

        switch (state) {
            case CharacterState.Idle:
            case CharacterState.MoveV:
                // Hovering or vertical-only → idle clip, no effects
                this.animation.play(this.clipIdle.name);
                this._setEffectsVisible(false);
                break;

            case CharacterState.MoveH:
                // Horizontal movement → motion clip + show all effects
                this.animation.play(this.clipMotion.name);
                this._setEffectsVisible(true);
                break;

            case CharacterState.Hit:
                // Stop everything
                this._anim?.stop();
                this._setEffectsVisible(false);
                this._currentClip = null;
                break;
        }
    }

    /**
     * Flip the Megician body to face movement direction.
     * Called every frame by CharacterController; internally skips if no change.
     */
    setFacing(movingRight: boolean): void {
        if (!this.megicianNode) return;
        const s    = this.megicianNode.scale;
        const absX = Math.abs(s.x);
        const wantX = movingRight ? absX : -absX;
        // Avoid redundant setScale calls
        if (Math.abs(s.x - wantX) < 0.001) return;
        this.megicianNode.setScale(wantX, s.y, s.z);
    }

    // ── Internal helpers ──────────────────────────────────────────────────

    private _setEffectsVisible(visible: boolean): void {
        if (this.effectNode && this.effectNode.active !== visible) {
            this.effectNode.active = visible;
        }
    }

    private _playClip(clip: AnimationClip | null): void {
        if (!this._anim || !clip || this._currentClip === clip) return;
        this._currentClip = clip;
        this._anim.play(clip.name);
    }
}
