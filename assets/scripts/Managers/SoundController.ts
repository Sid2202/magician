import { _decorator, Component, AudioSource, resources, AudioClip, JsonAsset } from 'cc';
const { ccclass } = _decorator;

@ccclass('SoundController')
export class SoundController extends Component {
    private static _instance: SoundController = null;

    private _audioSource: AudioSource = null;
    private _sfxMap: { [key: string]: string } = {};
    private _clipCache: Map<string, AudioClip> = new Map();

    public static getInstance(): SoundController {
        return this._instance;
    }

    onLoad() {
        if (SoundController._instance === null) {
            SoundController._instance = this;
            this._audioSource = this.getComponent(AudioSource);
            if (!this._audioSource) {
                this._audioSource = this.addComponent(AudioSource);
            }
        } else {
            this.destroy();
        }
    }

    public init(jsonAsset: JsonAsset) {
        if (jsonAsset && jsonAsset.json && jsonAsset.json.sfx) {
            this._sfxMap = jsonAsset.json.sfx;
            console.log('[SoundController] SFX Map initialized');
        }
    }

    public playSFX(id: string, loop: boolean = false, volume: number = 1.0) {
        const path = this._sfxMap[id];
        if (!path) {
            console.warn(`[SoundController] SFX ID not found: ${id}`);
            return;
        }

        if (this._clipCache.has(path)) {
            this._playSound(this._clipCache.get(path), loop, volume);
        } else {
            resources.load(path, AudioClip, (err, clip) => {
                if (err) {
                    console.error(`[SoundController] Failed to load SFX at ${path}:`, err);
                    return;
                }
                this._clipCache.set(path, clip);
                this._playSound(clip, loop, volume);
            });
        }
    }

    private _playSound(clip: AudioClip, loop: boolean, volume: number) {
        if (!this._audioSource) return;
        
        if (loop) {
            this._audioSource.stop();
            this._audioSource.clip = clip;
            this._audioSource.loop = true;
            this._audioSource.volume = volume;
            this._audioSource.play();
        } else {
            this._audioSource.playOneShot(clip, volume);
        }
    }
}
