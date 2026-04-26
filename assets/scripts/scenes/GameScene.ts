import { _decorator, Component, Node, Sprite, Color, tween, Tween, JsonAsset } from 'cc';
import { BgMoving } from '../gameplay/BgMoving';
import { GameManager } from '../Managers/GameManager';
import { GameEventsBus } from '../common/event/GlobalEventTarget';
import { GameEvents } from '../gameplay/input/GameEvents';
import { SoundController } from '../Managers/SoundController';

const { ccclass, property } = _decorator;

@ccclass('GameScene')
export class GameScene extends Component {

    @property(Node) characterNode: Node = null;
    @property(Node) gameWorldNode: Node = null;
    @property(Node) bgMoveNode: Node = null;
    @property(JsonAsset) soundConfig: JsonAsset = null;

    private _candles: {
        node: Node,
        isLit: boolean,
        lastRelativeX: number | null,
        lastX: number | null,
        glow: Node | null,
        glowSprite: Sprite | null,
        glowTween: Tween<any> | null
    }[] = [];

    onLoad(): void {
        this._validate();
        this._initSound();
        this._subscribeEvents();
        GameManager.startSession(1);

        this._findCandles(this.node);
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

    onDestroy(): void {
        for (const candle of this._candles) {
            if (candle.glowTween) {
                candle.glowTween.stop();
            }
        }
        GameManager.endSession();
    }

    update(dt: number): void {
        if (!this.characterNode || this._candles.length === 0) return;

        const charX = this.characterNode.worldPosition.x;

        for (const candle of this._candles) {
            const currentX = candle.node.worldPosition.x;
            const currentRelativeX = currentX - charX;

            if (candle.lastX !== null && candle.lastRelativeX !== null) {
                if (Math.abs(currentX - candle.lastX) > 300) {
                    candle.isLit = false;
                }
                else if (candle.lastRelativeX > 0 && currentRelativeX <= 0) {
                    candle.isLit = true;
                }
            }

            candle.lastX = currentX;
            candle.lastRelativeX = currentRelativeX;

            if (candle.glow && candle.glow.active !== candle.isLit) {
                candle.glow.active = candle.isLit;

                if (candle.isLit && candle.glowSprite) {
                    if (candle.glowTween) {
                        candle.glowTween.stop();
                    }
                    candle.glowSprite.color = new Color(255, 255, 255, 180);
                    candle.glowTween = tween(candle.glowSprite)
                        .to(0.6, { color: new Color(255, 255, 200, 220) })
                        .to(0.6, { color: new Color(255, 255, 255, 180) })
                        .union()
                        .repeatForever()
                        .start();
                } else if (!candle.isLit && candle.glowTween) {
                    candle.glowTween.stop();
                    candle.glowTween = null;
                }
            }
        }
    }

    private _validate(): void {
        if (!this.characterNode) console.error('[GameScene] characterNode not wired');
        if (!this.gameWorldNode) console.error('[GameScene] gameWorldNode not wired');
    }

    private _subscribeEvents(): void {
        const bus = GameEventsBus.get();
        bus.on(GameEvents.GameOver, this._onGameOver, this);
        bus.on(GameEvents.LevelComplete, this._onLevelComplete, this);
        bus.on(GameEvents.GameWon, this._onGameWon, this);
    }

    private _onGameOver(): void { console.log('[GameScene] Game Over'); }
    private _onLevelComplete(): void { console.log('[GameScene] Level Complete'); }

    private _onGameWon(): void {
        const bgMoving = this.bgMoveNode?.getComponent(BgMoving);
        bgMoving?.stopScroll();
    }

    private _findCandles(node: Node): void {
        if (node.name.startsWith('PF_Collectible_Candle')) {
            const glow = node.getChildByName('Magician_Glow');
            const glowSprite = glow ? glow.getComponent(Sprite) : null;
            this._candles.push({
                node, isLit: false, lastRelativeX: null, lastX: null,
                glow, glowSprite, glowTween: null
            });
        }
        for (const child of node.children) {
            this._findCandles(child);
        }
    }
}
