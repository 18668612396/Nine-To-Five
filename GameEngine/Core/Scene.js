class Scene {
    constructor(name) {
        this.name = name;
        this.gameObjects = [];
        this.isLoaded = false;
    }

    add(gameObject) {
        this.gameObjects.push(gameObject);
        // If scene is already running, we might want to trigger start here
        // But currently GameObject calls component.start() immediately upon addComponent
    }

    remove(gameObject) {
        const index = this.gameObjects.indexOf(gameObject);
        if (index > -1) {
            this.gameObjects.splice(index, 1);
        }
    }

    update(dt) {
        // Iterate over a copy to allow modification during update
        const activeObjects = this.gameObjects.filter(obj => obj.active);
        for (const obj of activeObjects) {
            obj.update(dt);
        }
    }

    draw(ctx) {
        // Y-Sort for 2.5D effect
        // Filter visible objects
        const renderList = this.gameObjects.filter(obj => obj.active);
        
        // Sort by Y coordinate
        renderList.sort((a, b) => {
            const ay = a.transform ? a.transform.y : a.y;
            const by = b.transform ? b.transform.y : b.y;
            return ay - by;
        });

        for (const obj of renderList) {
            obj.draw(ctx);
        }
    }

    /**
     * Load a scene from a JSON object
     * @param {Object} json 
     */
    static fromJSON(json) {
        const scene = new Scene(json.name || 'Untitled Scene');
        
        if (Array.isArray(json.objects)) {
            for (const objData of json.objects) {
                const type = objData.type || 'GameObject';
                
                // Try to find the class in global scope
                const ClassRef = window[type];
                if (!ClassRef) {
                    console.warn(`SceneLoader: Class '${type}' not found.`);
                    continue;
                }

                // Instantiate
                // We assume a standard constructor or handle specific ones
                let obj;
                if (type === 'GameObject') {
                    obj = new GameObject(objData.name || 'GameObject', objData.x || 0, objData.y || 0);
                } else {
                    // For custom classes, we might need a factory or assume no-arg constructor + property setting
                    // Or assume they follow (x, y) pattern if they are entities
                    try {
                        obj = new ClassRef();
                        if (objData.x !== undefined) obj.x = objData.x;
                        if (objData.y !== undefined) obj.y = objData.y;
                        if (objData.name) obj.name = objData.name;
                    } catch (e) {
                        console.error(`SceneLoader: Failed to instantiate ${type}`, e);
                        continue;
                    }
                }

                // Set Properties
                if (objData.properties) {
                    Object.assign(obj, objData.properties);
                }

                // Add Components
                if (Array.isArray(objData.components)) {
                    for (const compData of objData.components) {
                        const CompClass = window[compData.type];
                        if (!CompClass) {
                            console.warn(`SceneLoader: Component '${compData.type}' not found.`);
                            continue;
                        }

                        const comp = new CompClass();
                        if (compData.properties) {
                            Object.assign(comp, compData.properties);
                        }
                        obj.addComponent(comp);
                    }
                }

                scene.add(obj);
            }
        }

        return scene;
    }
}
