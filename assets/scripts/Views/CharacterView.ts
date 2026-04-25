import { _decorator, Component, Animation, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

/**
 * Attach to Chr_Pose_Side (the sprite/visual child of PF_Character).
 *
 * This is the VIEW layer — owns nothing but visuals.
 * CharacterController calls the public methods below; this script
 * never reads input or touches game state.
 *
 * Animation clip names are expected on the Animation component:
 *   'idle'   → hovering, no input
 *   'fly'    → active movement (any direction)
 *   'hit'    → took damage / game over
 *
 * The artist wires the Animation component and clip names here.
 * If no Animation component is present, all calls are no-ops.
 */
@ccclass('CharacterView')
export class CharacterView extends Component {

    /** If true, the node scaleX is flipped to face movement direction. */
    @property canFlip: boolean = true;

    private _anim: Animation | null = null;
    private _currentClip: string    = '';

    onLoad(): void {
        this._anim = this.getComponent(Animation);
    }

    // ── Animation state triggers ──────────────────────────────────────────

    playIdle(): void {
        this._play('idle');
    }

    playFly(): void {
        this._play('fly');
    }

    playHit(): void {
        this._play('hit');
    }

    // ── Sprite flip ───────────────────────────────────────────────────────

    /**
     * Called by CharacterController each frame when vx changes.
     * @param movingRight  true = face right (default), false = face left
     */
    setFacing(movingRight: boolean): void {
        if (!this.canFlip) return;
        const s = this.node.scale;
        const absX = Math.abs(s.x);
        this.node.setScale(movingRight ? absX : -absX, s.y, s.z);
    }

    // ── Internal ──────────────────────────────────────────────────────────

    private _play(clipName: string): void {
        if (!this._anim || this._currentClip === clipName) return;
        this._currentClip = clipName;
        this._anim.play(clipName);
    }
}
