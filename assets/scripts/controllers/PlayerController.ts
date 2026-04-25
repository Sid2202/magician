import { _decorator, Component } from 'cc';
import { PlayerModel } from '../models/PlayerModel';
import { PlayerView } from '../views/PlayerView';
import { InputSystem } from '../systems/InputSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { EventBus } from '../core/EventBus';
import { GameEvent } from '../core/Constants';
import { GameManager } from '../core/GameManager';

const { ccclass, property } = _decorator;

/**
 * Orchestrates PlayerModel ↔ InputSystem ↔ MovementSystem ↔ PlayerView.
 * Contains no gameplay math — delegates to systems.
 */
@ccclass('PlayerController')
export class PlayerController extends Component {

    @property(PlayerView) view: PlayerView = null;

    private _model: PlayerModel       = new PlayerModel();
    private _input: InputSystem       = new InputSystem();
    private _movement: MovementSystem = new MovementSystem();

    onLoad(): void {
        this._input.init(this.node.scene);
        EventBus.get().on(GameEvent.GAME_OVER, this._onGameOver, this);
    }

    onDestroy(): void {
        this._input.destroy();
        EventBus.get().off(GameEvent.GAME_OVER, this._onGameOver, this);
    }

    update(dt: number): void {
        const gm = GameManager.getInstance();
        if (!gm || !gm.state.isPlaying || !this._model.isAlive) return;

        this._input.readInto(this._model.input);
        this._movement.updatePlayer(this._model, dt);

        if (this.view) {
            this.view.setPosition(this._model.x, this._model.y);
            if (this._model.vx !== 0) {
                this.view.setFacingDirection(this._model.vx > 0);
            }
        }
    }

    getModel(): PlayerModel { return this._model; }

    private _onGameOver(): void {
        this._model.isAlive = false;
        this._model.vx = 0;
        this._model.vy = 0;
    }
}
