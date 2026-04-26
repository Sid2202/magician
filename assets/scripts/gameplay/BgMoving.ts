import { _decorator, Component, Node, Vec3, input, Input, EventKeyboard, KeyCode, UITransform, sys } from 'cc';
import { GameManager } from '../Managers/GameManager';
import { GameEventsBus } from '../common/event/GlobalEventTarget';
import { GameEvents } from './input/GameEvents';
const { ccclass, property } = _decorator;

@ccclass('BgMoving')
export class BgMoving extends Component {
    @property(Node)
    public bgNodeA: Node = null;

    @property(Node)
    public bgNodeB: Node = null;

    @property
    public bgWidth: number = 0;

    @property
    public speed: number = 200;

    private direction: Vec3 = new Vec3(0, 0, 0);

    /** Read by SpawnSystem to sync coin scroll with BG scroll. */
    public getScrollDirX(): number { return this.direction.x; }

    start() {
        if (!this.bgNodeA || !this.bgNodeB) {
            console.warn('BgMoving: bgNodeA and bgNodeB must both be assigned');
            return;
        }

        if (this.bgWidth <= 0) {
            const transform = this.bgNodeA.getComponent(UITransform);
            if (transform) {
                this.bgWidth = transform.width;
            }
        }

        if (this.bgWidth <= 0) {
            console.warn('BgMoving: bgWidth must be set or bgNodeA must have UITransform');
        }

        this.bgNodeA.setPosition(0, 0, 0);
        this.bgNodeB.setPosition(this.bgWidth, 0, 0);

        // Mobile has no keyboard, so auto-scroll. PC scrolls only while RIGHT is held.
        if (sys.isMobile) {
            this.direction.x = -1;
        }
    }

    onEnable() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
        GameEventsBus.get().on(GameEvents.WorldRewind, this._onWorldRewind, this);
    }

    onDisable() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
        GameEventsBus.get().off(GameEvents.WorldRewind, this._onWorldRewind, this);
    }

    private _onWorldRewind(amount: number): void {
        if (!this.bgNodeA || !this.bgNodeB) return;
        
        let posA = this.bgNodeA.position.clone();
        let posB = this.bgNodeB.position.clone();
        posA.x += amount;
        posB.x += amount;
        this.bgNodeA.setPosition(posA);
        this.bgNodeB.setPosition(posB);
        this.repositionIfNeeded(this.bgNodeA, this.bgNodeB);
        this.repositionIfNeeded(this.bgNodeB, this.bgNodeA);
    }

    update(deltaTime: number) {
        if (!this.bgNodeA || !this.bgNodeB || this.bgWidth <= 0) {
            return;
        }

        if (!GameManager.getInstance()?.state.isPlaying) return;

        const displacement = this.direction.x * this.speed * deltaTime;
        if (displacement === 0) {
            return;
        }

        const posA = this.bgNodeA.position.clone();
        const posB = this.bgNodeB.position.clone();
        posA.x += displacement;
        posB.x += displacement;
        this.bgNodeA.setPosition(posA);
        this.bgNodeB.setPosition(posB);

        this.repositionIfNeeded(this.bgNodeA, this.bgNodeB);
        this.repositionIfNeeded(this.bgNodeB, this.bgNodeA);
    }

    private repositionIfNeeded(node: Node, other: Node) {
        const x = node.position.x;
        if (x <= -this.bgWidth) {
            node.setPosition(other.position.x + this.bgWidth, node.position.y, node.position.z);
            console.log('BgMoving: repositioned node to right side');
        } else if (x >= this.bgWidth) {
            node.setPosition(other.position.x - this.bgWidth, node.position.y, node.position.z);
            console.log('BgMoving: repositioned node to left side');
        }
    }

    private onKeyDown(event: EventKeyboard) {
        if (!GameManager.getInstance()?.state.isPlaying) return;
        switch (event.keyCode) {
            case KeyCode.ARROW_LEFT:
            case KeyCode.KEY_A:
                this.direction.x = 1;
                break;
            case KeyCode.ARROW_RIGHT:
            case KeyCode.KEY_D:
                this.direction.x = -1;
                break;
        }
    }

    private onKeyUp(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.ARROW_LEFT:
            case KeyCode.KEY_A:
                if (this.direction.x > 0) this.direction.x = 0;
                break;
            case KeyCode.ARROW_RIGHT:
            case KeyCode.KEY_D:
                if (this.direction.x < 0) this.direction.x = 0;
                break;
        }
    }

    /** Called by CharacterController on death to immediately stop scrolling. */
    public stopScroll(): void { this.direction.x = 0; }

    /** Called on respawn — restores auto-scroll on mobile; PC waits for key press. */
    public resumeScroll(): void {
        if (sys.isMobile) this.direction.x = -1;
    }

    public setBgWidth(width: number) {
        this.bgWidth = width;
    }

    public setSpeed(value: number) {
        this.speed = value;
    }
}

