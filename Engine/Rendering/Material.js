class Material extends Asset {
    constructor(nameOrJson = 'DefaultMaterial') {
        let name = nameOrJson;
        let json = null;

        if (typeof nameOrJson === 'object') {
            json = nameOrJson;
            name = json.name || 'Material';
        }

        super(name);
        this._properties = new Map();
        
        // Default properties
        this.setColor('_Color', { r: 255, g: 255, b: 255, a: 1.0 });
        this.setTexture('_MainTex', null);
        
        // Default Shader
        this.shader = window.SpriteShader ? new window.SpriteShader() : null;

        if (json) {
            this.deserialize(json);
        }
    }

    deserialize(json) {
        if (json.properties) {
            for (const [key, value] of Object.entries(json.properties)) {
                this._properties.set(key, value);
            }
        }
    }

    setColor(name, color) {
        this._properties.set(name, color);
    }

    getColor(name) {
        return this._properties.get(name) || { r: 255, g: 255, b: 255, a: 1.0 };
    }

    setTexture(name, texture) {
        this._properties.set(name, texture);
    }

    getTexture(name) {
        return this._properties.get(name);
    }

    setFloat(name, value) {
        this._properties.set(name, value);
    }

    getFloat(name) {
        return this._properties.get(name) || 0.0;
    }
}

window.Material = Material;
