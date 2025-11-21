class Asset extends EngineObject {
    constructor(name) {
        super(name);
        this.guid = null; // The unique identifier for this asset
        this.path = null; // The path relative to the project root (optional, for debugging)
    }
}

window.Asset = Asset;
