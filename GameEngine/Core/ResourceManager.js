class ResourceManager {
    constructor() {
        this.loaders = new Map();
        this.cache = new Map();
        
        // Register default loaders
        this.registerLoader('.json', this.loadJson.bind(this));
        this.registerLoader('.scene', this.loadScene.bind(this));
        this.registerLoader('.png', this.loadImage.bind(this));
        this.registerLoader('.jpg', this.loadImage.bind(this));
        this.registerLoader('.txt', this.loadText.bind(this));
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
     * Load an asset based on its extension
     * @param {string} url 
     */
    async load(url) {
        if (this.cache.has(url)) {
            return this.cache.get(url);
        }

        const ext = this.getExtension(url);
        const loader = this.loaders.get(ext);

        if (!loader) {
            console.warn(`No loader found for extension '${ext}', falling back to text.`);
            return this.loadText(url);
        }

        try {
            console.log(`Loading asset: ${url}`);
            const asset = await loader(url);
            this.cache.set(url, asset);
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

    async loadScene(url) {
        // .scene files are JSON files describing the scene
        const json = await this.loadJson(url);
        // Assuming Scene class is available globally or imported
        if (typeof Scene !== 'undefined' && Scene.fromJSON) {
            return Scene.fromJSON(json);
        } else {
            return json; // Return raw data if Scene class not found
        }
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
window.resourceManager = new ResourceManager();
