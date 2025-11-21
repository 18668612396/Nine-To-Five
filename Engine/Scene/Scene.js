class Scene extends Asset {
    constructor(name) {
        super(name);
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
        // Remove destroyed objects
        this.gameObjects = this.gameObjects.filter(obj => !obj.destroyed);

        // Iterate over a copy to allow modification during update
        const activeObjects = this.gameObjects.filter(obj => obj.active);
        for (const obj of activeObjects) {
            obj.update(dt);
        }
    }

    draw(ctx) {
        // Use Main Camera if available
        const camera = window.Camera && window.Camera.main;
        
        if (camera) {
            camera.apply(ctx);
        } else {
            // Fallback clear if no camera
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }

        // Filter visible objects
        const renderList = this.gameObjects.filter(obj => obj.active);
        
        // Sort by sortingOrder then Y coordinate
        renderList.sort((a, b) => {
            // Try to get Renderer component for sorting order
            // Note: This assumes Renderer is available in global scope or imported
            // Since we are in Scene.js, we might not have direct access to Renderer class if not global.
            // But in this project structure, classes are global.
            
            let orderA = 0;
            let orderB = 0;
            
            // We can't easily use instanceof Renderer if Renderer isn't defined yet or circular dependency.
            // But we can check if the object has a component with sortingOrder property.
            // Or just assume the first component with sortingOrder is the renderer.
            
            const findRenderer = (obj) => obj.components.find(c => c.sortingOrder !== undefined);
            const rA = findRenderer(a);
            const rB = findRenderer(b);
            
            if (rA) orderA = rA.sortingOrder;
            if (rB) orderB = rB.sortingOrder;

            if (orderA !== orderB) {
                return orderA - orderB;
            }

            const ay = a.transform ? a.transform.y : a.y;
            const by = b.transform ? b.transform.y : b.y;
            return ay - by;
        });

        for (const obj of renderList) {
            obj.draw(ctx);
        }

        if (camera) {
            camera.reset(ctx);
        }
    }

    /**
     * Load a scene from a JSON object
     * @param {Object} json 
     */
    static async fromJSON(json) {
        const scene = new Scene(json.name || 'Untitled Scene');
        
        const instantiateObject = async (objData, parent = null) => {
            // Handle Prefab Reference
            if (objData.prefab) {
                if (window.resourceManager) {
                    try {
                        const prefab = await window.resourceManager.load(objData.prefab);
                        if (prefab && prefab.instantiate) {
                            const obj = prefab.instantiate();
                            
                            // Apply Scene Overrides
                            if (objData.name) obj.name = objData.name;
                            if (objData.x !== undefined) obj.transform.x = objData.x;
                            if (objData.y !== undefined) obj.transform.y = objData.y;
                            
                            if (parent) {
                                parent.transform.setChild(obj.transform);
                            }
                            scene.add(obj);
                            return obj;
                        }
                    } catch (e) {
                        console.error(`SceneLoader: Failed to load prefab '${objData.prefab}'`, e);
                    }
                }
                return null;
            }

            const type = objData.type || 'GameObject';
            
            // Try to find the class in global scope
            const ClassRef = window[type];
            if (!ClassRef) {
                console.warn(`SceneLoader: Class '${type}' not found.`);
                return null;
            }

            let obj;
            try {
                if (type === 'GameObject') {
                    obj = new GameObject(objData.name || 'GameObject', objData.x || 0, objData.y || 0);
                } else {
                    obj = new ClassRef();
                    if (objData.x !== undefined) obj.x = objData.x;
                    if (objData.y !== undefined) obj.y = objData.y;
                    if (objData.name) obj.name = objData.name;
                }
            } catch (e) {
                console.error(`SceneLoader: Failed to instantiate ${type}`, e);
                return null;
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
                        // If component has onLoad method, use it
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
                parent.transform.setChild(obj.transform);
            }
            
            // Always add to scene for flat update/draw list
            scene.add(obj);

            // Handle Children
            if (Array.isArray(objData.children)) {
                for (const childData of objData.children) {
                    await instantiateObject(childData, obj);
                }
            }

            return obj;
        };

        if (json.objects) {
            for (const objData of json.objects) {
                await instantiateObject(objData);
            }
        }
        
        return scene;
    }
}

window.Scene = Scene;
