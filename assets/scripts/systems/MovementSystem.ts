import { Node, Vec3 } from 'cc';
import { PlayerModel } from '../models/PlayerModel';
import { PlayerConstants, WorldConstants } from '../core/Constants';

interface ParallaxLayer {
    node: Node;
    velocityMultiplier: number;
    /** Current scroll offset — tracks how far layer has moved. */
    _offset: number;
    /** Width of one tile of this layer (for wrapping). */
    tileWidth: number;
}

/**
 * Handles all position/velocity math for player and world layers.
 * Pure math — no Cocos scene graph manipulation except setting node positions.
 */
export class MovementSystem {

    private _parallaxLayers: ParallaxLayer[] = [];
    private _scrollSpeed: number = WorldConstants.BASE_SCROLL_SPEED;
    private _pos: Vec3 = new Vec3();

    registerParallaxLayer(node: Node, velocityMultiplier: number, tileWidth: number): void {
        this._parallaxLayers.push({ node, velocityMultiplier, _offset: 0, tileWidth });
    }

    clearParallaxLayers(): void {
        this._parallaxLayers.length = 0;
    }

    setScrollSpeed(speed: number): void {
        this._scrollSpeed = speed;
    }

    /** Integrate player velocity from input state. No allocation. */
    updatePlayer(model: PlayerModel, dt: number): void {
        const { input } = model;
        const spd = model.speed;

        let ax = 0;
        let ay = 0;
        if (input.left)  ax -= spd;
        if (input.right) ax += spd;
        if (input.up)    ay += spd;
        if (input.down)  ay -= spd;

        if (model.hasInput) {
            model.vx = ax;
            model.vy = ay;
        } else {
            // Hover damping — bleed velocity to zero
            model.vx *= PlayerConstants.HOVER_DAMPING;
            model.vy *= PlayerConstants.HOVER_DAMPING;
            if (Math.abs(model.vx) < 1) model.vx = 0;
            if (Math.abs(model.vy) < 1) model.vy = 0;
        }

        model.x += model.vx * dt;
        model.y += model.vy * dt;
    }

    /**
     * Scrolls all parallax layers by their velocity multiplier.
     * Returns the world delta X this frame so callers can scroll gameplay objects.
     */
    updateWorld(dt: number): number {
        const dx = this._scrollSpeed * dt;

        for (const layer of this._parallaxLayers) {
            layer._offset += dx * layer.velocityMultiplier;
            // Seamless wrap
            if (layer.tileWidth > 0 && layer._offset >= layer.tileWidth) {
                layer._offset -= layer.tileWidth;
            }
            layer.node.getPosition(this._pos);
            this._pos.x = -layer._offset;
            layer.node.setPosition(this._pos);
        }

        return dx;
    }
}
