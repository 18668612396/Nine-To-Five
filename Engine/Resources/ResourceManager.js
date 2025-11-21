class ResourceManager {
    constructor() {
        this.loaders = new Map();
        this.cache = new Map();
        this.assetMap = null;
        
        // Register default loaders
        this.registerLoader('.json', this.loadJson.bind(this));
        this.registerLoader('.scene', this.loadScene.bind(this));
        this.registerLoader('.prefab', this.loadPrefab.bind(this));
        this.registerLoader('.png', this.loadImage.bind(this));
        this.registerLoader('.jpg', this.loadImage.bind(this));
        this.registerLoader('.txt', this.loadText.bind(this));

        this.init();
    }

    async init() {
        try {
            // Load AssetMap from the Project Library
            // Relative to index.html (which is in Project/NineToFive)
            const response = await fetch('Library/AssetMap.json');
            if (response.ok) {
                this.assetMap = await response.json();
                console.log("ResourceManager: AssetMap loaded.");
            } else {
                console.warn("ResourceManager: Failed to load AssetMap.json");
            }
        } catch (e) {
            console.warn("ResourceManager: Error loading AssetMap.json", e);
        }
    }

    /**
     * Register a loader function for a specific file extension
     * @param {string} extension - e.g., '.png', '.scene'
     * @param {Function} loaderFunc - async function(url) returning the asset
     */
    registerLoader(extension, loaderFunc) {
        this.loaders.set(extension.toLowerCase(), loaderFunc);
    }

    /**
     * Load an asset based on its extension or GUID
     * @param {string} urlOrGuid 
     */
    async load(urlOrGuid) {
        let url = urlOrGuid;

        // Check if input is a GUID (simple regex check or length check)
        // UUID is 36 chars, our simple random is variable but usually no dots
        if (this.assetMap && this.assetMap[urlOrGuid]) {
            url = this.assetMap[urlOrGuid];
            console.log(`ResourceManager: Resolved GUID ${urlOrGuid} to ${url}`);
        }

        if (this.cache.has(url)) {
            return this.cache.get(url);
        }

        const ext = this.getExtension(url);
        const loader = this.loaders.get(ext);

        if (!loader) {
            console.warn(`No loader found for extension '${ext}' (URL: ${url}), falling back to text.`);
            return this.loadText(url);
        }

        try {
            console.log(`Loading asset: ${url}`);
            const asset = await loader(url);
            this.cache.set(url, asset);
            // Also cache by GUID if we loaded by URL but it has a GUID mapping? 
            // Not strictly necessary unless we reverse lookup.
            if (url !== urlOrGuid) {
                this.cache.set(urlOrGuid, asset);
            }
            return asset;
        } catch (e) {
            console.error(`Failed to load asset: ${url}`, e);
            throw e;
        }
    }

    getExtension(url) {
        const dotIndex = url.lastIndexOf('.');
        if (dotIndex === -1) return '';
        return url.substring(dotIndex).toLowerCase();
    }

    // --- Specific Loaders ---

    async loadText(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.text();
    }

    async loadJson(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    }

    async loadAssetWithHeader(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const text = await response.text();

        // Find the start of the JSON content
        const firstBrace = text.indexOf('{');
        
        // If no brace found, or it looks like a pure JSON file (starts with {), try parsing as JSON directly
        // This handles legacy files or files without headers gracefully-ish
        if (firstBrace === 0) {
            return { header: {}, data: JSON.parse(text) };
        }

        if (firstBrace === -1) {
             throw new Error("Invalid asset format: No JSON content found.");
        }

        const headerText = text.substring(0, firstBrace);
        const jsonText = text.substring(firstBrace);

        const header = {};
        headerText.split('\n').forEach(line => {
            const parts = line.split(':');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join(':').trim();
                if (key) header[key] = value;
            }
        });

        try {
            const data = JSON.parse(jsonText);
            return { header, data };
        } catch (e) {
            console.error("Failed to parse JSON body:", e);
            throw e;
        }
    }

    async loadScene(url) {
        const { header, data } = await this.loadAssetWithHeader(url);
        
        if (header.AssetType && header.AssetType !== 'Scene') {
            console.warn(`ResourceManager: AssetType mismatch. Expected 'Scene', got '${header.AssetType}'`);
        }

        // Assuming Scene class is available globally or imported
        if (typeof Scene !== 'undefined' && Scene.fromJSON) {
            return Scene.fromJSON(data);
        } else {
            return data; // Return raw data if Scene class not found
        }
    }

    async loadPrefab(url) {
        const { header, data } = await this.loadAssetWithHeader(url);
        
        if (header.AssetType && header.AssetType !== 'Prefab') {
            console.warn(`ResourceManager: AssetType mismatch. Expected 'Prefab', got '${header.AssetType}'`);
        }

        return new Prefab(data);
    }

    loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(new Error(`Failed to load image: ${url}`));
            img.src = url;
        });
    }
}

// Export global instance
window.ResourceManager = ResourceManager;
window.resourceManager = new ResourceManager();
