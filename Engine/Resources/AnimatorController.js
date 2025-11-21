class AnimatorController extends Asset {
    constructor(json) {
        super(json.name || 'AnimatorController');
        this.clips = {}; // name -> guid
        this.defaultClip = json.defaultClip || null;
        
        if (json.clips) {
            if (Array.isArray(json.clips)) {
                for (const clipData of json.clips) {
                    this.clips[clipData.name] = clipData.guid;
                }
            } else {
                // Handle object format if necessary, but array is better for ordering/metadata
                this.clips = json.clips;
            }
        }
    }
}

window.AnimatorController = AnimatorController;
