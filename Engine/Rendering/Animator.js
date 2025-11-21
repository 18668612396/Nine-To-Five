class Animator extends Component {
    constructor(controllerPath = null) {
        super('Animator');
        this.clips = {}; // name -> AnimationClip
        this.currentClip = null;
        this.currentTime = 0;
        this.isPlaying = false;
        this.spriteRenderer = null;
        this.currentFrameIndex = -1;
        this.controller = null;
        this._controllerPath = null;
        
        if (controllerPath) {
            this.controllerPath = controllerPath;
        }
    }

    get controllerPath() { return this._controllerPath; }
    set controllerPath(val) {
        this._controllerPath = val;
        if (val) {
            this.loadController(val);
        }
    }

    async loadController(pathOrGuid) {
        if (!window.resourceManager) return;
        
        try {
            this.controller = await window.resourceManager.load(pathOrGuid);
            if (this.controller && this.controller.clips) {
                // Load all referenced clips
                const promises = [];
                
                if (Array.isArray(this.controller.clips)) {
                    for (const clipData of this.controller.clips) {
                        promises.push(
                            window.resourceManager.load(clipData.guid).then(clip => {
                                if (clip) this.clips[clipData.name] = clip;
                            })
                        );
                    }
                } else {
                    for (const [name, guid] of Object.entries(this.controller.clips)) {
                        promises.push(
                            window.resourceManager.load(guid).then(clip => {
                                if (clip) this.clips[name] = clip;
                            })
                        );
                    }
                }
                await Promise.all(promises);
                
                // Auto play default clip
                if (this.controller.defaultClip) {
                    this.play(this.controller.defaultClip);
                }
            }
        } catch (e) {
            console.error("Animator: Failed to load controller", e);
        }
    }

    start() {
        this.spriteRenderer = this.gameObject.getComponent(SpriteRenderer);
        if (!this.spriteRenderer) {
            console.warn('Animator: No SpriteRenderer found on GameObject ' + this.gameObject.name);
        }
    }

    // Deprecated: Use controller instead
    addClip(name, clip) {
        this.clips[name] = clip;
    }

    play(name) {
        const clip = this.clips[name];
        if (!clip) {
            // If controller is loading, maybe queue it? For now just warn.
            // Or maybe it's not loaded yet.
            console.warn(`Animator: Clip '${name}' not found.`);
            return;
        }
        
        if (this.currentClip === clip && this.isPlaying) return;

        this.currentClip = clip;
        this.currentTime = 0;
        this.currentFrameIndex = -1;
        this.isPlaying = true;
        
        // Ensure frames are loaded
        if (this.currentClip.loadFrames) {
             this.currentClip.loadFrames();
        }
    }

    stop() {
        this.isPlaying = false;
    }

    update(dt) {
        if (!this.isPlaying || !this.currentClip) return;
        
        // Lazy fetch SpriteRenderer if not found in start (e.g. added later)
        if (!this.spriteRenderer) {
            this.spriteRenderer = this.gameObject.getComponent(SpriteRenderer);
            if (!this.spriteRenderer) return;
        }

        this.currentTime += dt;
        
        const frameDuration = 1 / this.currentClip.frameRate;
        let frameIndex = Math.floor(this.currentTime / frameDuration);

        if (frameIndex >= this.currentClip.frames.length) {
            if (this.currentClip.loop) {
                frameIndex = frameIndex % this.currentClip.frames.length;
            } else {
                frameIndex = this.currentClip.frames.length - 1;
                this.isPlaying = false; // Stop at end
            }
        }

        if (frameIndex !== this.currentFrameIndex) {
            const frameImage = this.currentClip.getFrame(frameIndex);
            if (frameImage) {
                this.spriteRenderer.sprite = frameImage;
                this.currentFrameIndex = frameIndex;
            }
        }
    }
}
window.Animator = Animator;
