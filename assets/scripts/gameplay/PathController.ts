import { _decorator, Component, Node, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

/**
 * Attach to the root node of PF_Path prefab.
 *
 * A single path tile. Managed and scrolled by GameController.
 * When GameController calls scrollBy(dx), this tile moves left by dx.
 * GameController recycles this tile when it exits the screen.
 *
 * This component itself holds NO game logic — it is purely a
 * position-managed view node controlled externally.
 */
@ccclass('PathController')
export class PathController extends Component {

    /** Width of this tile in pixels. Must match the UITransform content size. */
    @property tileWidth: number = 1280;

    private _pos: Vec3 = new Vec3();

    /** Called by GameController each frame to advance this tile leftward. */
    scrollBy(dx: number): void {
        this.node.getPosition(this._pos);
        this._pos.x -= dx;
        this.node.setPosition(this._pos);
    }

    /** Returns the current left edge X of this tile in local parent space. */
    getLeftEdgeX(): number {
        return this.node.position.x - this.tileWidth * 0.5;
    }

    /** Returns the current right edge X of this tile. */
    getRightEdgeX(): number {
        return this.node.position.x + this.tileWidth * 0.5;
    }

    /** Teleport tile to a new X position (used when recycling off-screen tiles). */
    setPositionX(x: number): void {
        this.node.getPosition(this._pos);
        this._pos.x = x;
        this.node.setPosition(this._pos);
    }
}
