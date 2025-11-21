class AnimationClip extends Asset {
    constructor(json) {
        super(json.name || 'AnimationClip');
        this.frameRate = json.frameRate || 10;
        this.loop = json.loop !== undefined ? json.loop : true;
        this.frames = json.frames || []; // Array of GUIDs
        
        // Runtime cache for loaded images
        this._loadedImages = [];
    }

    /**
     * Preload all frames in this clip
     */
    async loadFrames() {
        if (this._loadedImages.length > 0) return;

        const promises = this.frames.map(guid => resourceManager.load(guid));
        this._loadedImages = await Promise.all(promises);
    }

    getFrame(index) {
        if (this._loadedImages.length === 0) return null;
        return this._loadedImages[index % this._loadedImages.length];
    }
}

window.AnimationClip = AnimationClip;
