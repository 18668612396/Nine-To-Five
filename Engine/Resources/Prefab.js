class Prefab extends Asset {
    constructor(json) {
        super(json.name || 'Prefab');
        this.data = json;
    }

    /**
     * Instantiate the prefab into the scene
     * @param {Vector2} position - Optional position override
     * @param {GameObject} parent - Optional parent
     * @returns {GameObject} The instantiated root object
     */
    instantiate(position = null, parent = null) {
        if (!this.data) return null;
        return Prefab.instantiateData(this.data, position, parent);
    }

    /**
     * Static helper to instantiate from JSON data directly
     * @param {Object} data - The JSON data of the GameObject
     * @param {Vector2} position - Optional position override
     * @param {GameObject} parent - Optional parent
     */
    static instantiateData(data, position = null, parent = null) {
        // Create GameObject
        // If data has a 'type' field, try to instantiate that specific class
        // Otherwise use generic GameObject
        let obj;
        if (data.type && window[data.type]) {
            const ClassRef = window[data.type];
            obj = new ClassRef(data.name || 'GameObject');
        } else {
            obj = new GameObject(data.name || 'GameObject');
        }

        // Set Properties
        if (data.properties) {
            Object.assign(obj, data.properties);
        }

        // Override Position if provided
        if (position) {
            obj.transform.position.x = position.x;
            obj.transform.position.y = position.y;
        } else if (data.transform) {
            // If transform data is explicitly saved
            if (data.transform.position) {
                obj.transform.position.x = data.transform.position.x;
                obj.transform.position.y = data.transform.position.y;
            }
            if (data.transform.rotation !== undefined) obj.transform.rotation = data.transform.rotation;
            if (data.transform.scale) {
                obj.transform.scale.x = data.transform.scale.x;
                obj.transform.scale.y = data.transform.scale.y;
            }
        }

        // Add Components
        if (Array.isArray(data.components)) {
            for (const compData of data.components) {
                const CompClass = window[compData.type];
                if (!CompClass) {
                    console.warn(`Prefab: Component '${compData.type}' not found.`);
                    continue;
                }

                const comp = new CompClass();
                if (compData.properties) {
                    // If component has onLoad method, use it (for complex deserialization)
                    if (typeof comp.onLoad === 'function') {
                        comp.onLoad(compData.properties);
                    } else {
                        Object.assign(comp, compData.properties);
                    }
                }
                obj.addComponent(comp);
            }
        }

        // Set Parent
        if (parent) {
            obj.transform.setParent(parent.transform);
        }

        // Add to active scene automatically if we have one
        if (window.game && window.game.sceneManager && window.game.sceneManager.activeScene) {
            window.game.sceneManager.activeScene.add(obj);
        }

        // Handle Children
        if (Array.isArray(data.children)) {
            for (const childData of data.children) {
                Prefab.instantiateData(childData, null, obj);
            }
        }

        return obj;
    }
}

window.Prefab = Prefab;
