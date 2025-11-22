class Prefab extends Asset {
    constructor(json) {
        super(json.name || 'Prefab');
        this.data = json;
    }

    /**
     * Instantiate the prefab into the scene
     * @param {Vector2} position - Optional position override
     * @param {GameObject} parent - Optional parent
     * @param {Scene} scene - Optional scene to add to (defaults to activeScene)
     * @returns {GameObject} The instantiated root object
     */
    instantiate(position = null, parent = null, scene = null) {
        if (!this.data) return null;
        return Prefab.instantiateData(this.data, position, parent, scene);
    }

    /**
     * Static helper to instantiate from JSON data directly
     * @param {Object} data - The JSON data of the GameObject
     * @param {Vector2} position - Optional position override (World Position)
     * @param {GameObject} parent - Optional parent
     * @param {Scene} scene - Optional scene to add to (defaults to activeScene)
     */
    static instantiateData(data, position = null, parent = null, scene = null) {
        // Deep clone data to prevent shared references
        const clonedData = JSON.parse(JSON.stringify(data));

        // Create GameObject
        let obj;
        if (clonedData.type && window[clonedData.type]) {
            const ClassRef = window[clonedData.type];
            obj = new ClassRef(clonedData.name || 'GameObject');
        } else {
            obj = new GameObject(clonedData.name || 'GameObject');
        }

        // Set Properties
        if (clonedData.properties) {
            Object.assign(obj, clonedData.properties);
        }

        // Set Parent first (so setting world position works correctly if we had full matrix math)
        if (parent) {
            obj.transform.setParent(parent.transform);
        }

        // Apply Transform
        // 1. Apply Prefab Transform (Local)
        if (clonedData.transform) {
            if (clonedData.transform.position) {
                obj.transform.localPosition.x = clonedData.transform.position.x;
                obj.transform.localPosition.y = clonedData.transform.position.y;
            }
            if (clonedData.transform.rotation !== undefined) obj.transform.localRotation = clonedData.transform.rotation;
            if (clonedData.transform.scale) {
                obj.transform.localScale.x = clonedData.transform.scale.x;
                obj.transform.localScale.y = clonedData.transform.scale.y;
            }
        }

        // 2. Override with provided Position (World)
        if (position) {
            obj.transform.x = position.x;
            obj.transform.y = position.y;
        }

        // Add Components
        if (Array.isArray(clonedData.components)) {
            for (const compData of clonedData.components) {
                const CompClass = window[compData.type];
                if (!CompClass) {
                    console.warn(`Prefab: Component '${compData.type}' not found.`);
                    continue;
                }

                // Special handling for Transform to avoid duplicates
                if (compData.type === 'Transform') {
                    if (compData.properties) {
                        const props = compData.properties;
                        if (props.localPosition) {
                            obj.transform.localPosition.x = props.localPosition.x;
                            obj.transform.localPosition.y = props.localPosition.y;
                        }
                        if (props.localRotation !== undefined) obj.transform.localRotation = props.localRotation;
                        if (props.localScale) {
                            obj.transform.localScale.x = props.localScale.x;
                            obj.transform.localScale.y = props.localScale.y;
                        }
                    }
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

        // Add to scene
        let targetScene = scene;
        if (!targetScene && window.game && window.game.sceneManager && window.game.sceneManager.activeScene) {
            targetScene = window.game.sceneManager.activeScene;
        }

        if (targetScene) {
            targetScene.add(obj);
        }

        // Handle Children
        if (Array.isArray(clonedData.children)) {
            for (const childData of clonedData.children) {
                // Children are instantiated relative to this object
                Prefab.instantiateData(childData, null, obj, targetScene);
            }
        }

        return obj;
    }
}

window.Prefab = Prefab;
