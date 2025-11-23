class ResourceManager {
    constructor() {
        this.loaders = new Map();
        this.cache = new Map();
        this.assetMap = null;

        // Register default loaders
        this.registerLoader('.json', this.loadJson.bind(this));
        this.registerLoader('.scene', this.loadScene.bind(this));
        this.registerLoader('.prefab', this.loadPrefab.bind(this));
        this.registerLoader('.anim', this.loadAnimationClip.bind(this));
        this.registerLoader('.controller', this.loadAnimatorController.bind(this));
        this.registerLoader('.png', this.loadImage.bind(this));
        this.registerLoader('.jpg', this.loadImage.bind(this));
        this.registerLoader('.txt', this.loadText.bind(this));
        this.registerLoader('.mat', this.loadMaterial.bind(this));
        this.registerLoader('.tga', this.loadTga.bind(this)); // Register .tga loader

        this.registerLoader('.tga', this.loadTga.bind(this)); // Register .tga loader

        this.ready = this.init();
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
            return await Scene.fromJSON(data);
        } else {
            return data; // Return raw data if Scene class not found
        }
    }

    async loadPrefab(url) {
        const { header, data } = await this.loadAssetWithHeader(url);

        if (header.AssetType && header.AssetType !== 'Prefab') {
            console.warn(`ResourceManager: AssetType mismatch. Expected 'Prefab', got '${header.AssetType}'`);
        }

        // Preload dependencies (e.g. ParticleSystem materials)
        if (data.components) {
            for (const comp of data.components) {
                if (comp.type === 'ParticleSystem' && comp.properties && comp.properties.renderer && comp.properties.renderer.material) {
                    const matGuid = comp.properties.renderer.material;
                    if (typeof matGuid === 'string') {
                        // Fire and forget load, or await?
                        // Await is safer to ensure it's ready when instantiated
                        try {
                            await this.load(matGuid);
                        } catch (e) {
                            console.warn("Failed to preload material for prefab:", matGuid);
                        }
                    }
                }
            }
        }

        return new Prefab(data);
    }

    async loadAnimationClip(url) {
        const { header, data } = await this.loadAssetWithHeader(url);

        if (header.AssetType && header.AssetType !== 'AnimationClip') {
            console.warn(`ResourceManager: AssetType mismatch. Expected 'AnimationClip', got '${header.AssetType}'`);
        }

        const clip = new AnimationClip(data);
        await clip.loadFrames();
        return clip;
    }

    async loadAnimatorController(url) {
        const { header, data } = await this.loadAssetWithHeader(url);

        if (header.AssetType && header.AssetType !== 'AnimatorController') {
            console.warn(`ResourceManager: AssetType mismatch. Expected 'AnimatorController', got '${header.AssetType}'`);
        }

        return new AnimatorController(data);
    }

    loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(new Error(`Failed to load image: ${url}`));
            img.src = url;
        });
    }

    async loadMaterial(url) {
        // Material files might have headers or just be JSON
        // Let's assume they might have headers like other assets
        let data;
        try {
            const result = await this.loadAssetWithHeader(url);
            data = result.data;
        } catch (e) {
            // Fallback to pure JSON if header parsing fails or it's just a JSON file
            data = await this.loadJson(url);
        }

        const material = new Material(data);

        // Load textures if they are GUIDs
        if (material._properties) {
            for (const [key, value] of material._properties) {
                // Check if value looks like a GUID (32 hex chars)
                if (typeof value === 'string' && /^[0-9a-f]{32}$/i.test(value)) {
                    try {
                        const texture = await this.load(value);
                        material.setTexture(key, texture);
                    } catch (err) {
                        console.warn(`Failed to load texture ${value} for material ${url}`, err);
                    }
                }
            }
        }

        return material;
    }

    async loadTga(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const buffer = await response.arrayBuffer();
        if (window.TGALoader) {
            return window.TGALoader.parse(buffer);
        } else {
            throw new Error("TGALoader not found.");
        }
    }
}

// Export global instance
window.ResourceManager = ResourceManager;
window.resourceManager = new ResourceManager();
