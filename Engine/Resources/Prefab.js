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
        
        // Create a context for this instantiation
        const context = new PrefabInstantiationContext();
        
        // Instantiate the prefab
        const rootObject = Prefab.instantiateData(this.data, position, parent, scene, context);
        
        // Resolve all pending references
        context.resolveReferences();
        
        return rootObject;
    }

    /**
     * Static helper to instantiate from JSON data directly
     * @param {Object} data - The JSON data of the GameObject
     * @param {Vector2} position - Optional position override (World Position)
     * @param {GameObject} parent - Optional parent
     * @param {Scene} scene - Optional scene to add to (defaults to activeScene)
     * @param {PrefabInstantiationContext} context - Instantiation context for fileID resolution
     */
    static instantiateData(data, position = null, parent = null, scene = null, context = null) {
        // Create context if not provided (for backward compatibility)
        if (!context) {
            context = new PrefabInstantiationContext();
        }
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

        // Register this GameObject with its fileID
        if (clonedData.fileID !== undefined) {
            context.registerObject(clonedData.fileID, obj);
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
                
                // Register component with its fileID
                if (compData.fileID !== undefined) {
                    context.registerComponent(compData.fileID, comp);
                }
                
                if (compData.properties) {
                    // Process properties and collect references
                    const processedProps = context.processProperties(compData.properties, comp);
                    
                    // If component has onLoad method, use it (for complex deserialization)
                    if (typeof comp.onLoad === 'function') {
                        comp.onLoad(processedProps);
                    } else {
                        Object.assign(comp, processedProps);
                    }
                }
                obj.addComponent(comp);
            }
        }

        // 2. Override with provided Position (World)
        // Moved after components loop to ensure it overrides any Transform component data
        if (position) {
            obj.transform.x = position.x;
            obj.transform.y = position.y;
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
                // Check if this is a nested prefab reference
                if (childData.prefab) {
                    // Load and instantiate nested prefab
                    this.instantiateNestedPrefab(childData, obj, targetScene, context);
                } else {
                    // Regular child GameObject
                    Prefab.instantiateData(childData, null, obj, targetScene, context);
                }
            }
        }

        return obj;
    }

    /**
     * Instantiate a nested prefab
     */
    static async instantiateNestedPrefab(childData, parent, scene, context) {
        if (!window.resourceManager) {
            console.error("ResourceManager not available for nested prefab loading");
            return null;
        }

        try {
            const prefab = await window.resourceManager.load(childData.prefab);
            if (prefab && prefab instanceof Prefab) {
                // Create a sub-context for the nested prefab
                const subContext = context.createSubContext(childData.prefab);
                
                // Instantiate the nested prefab
                const nestedObj = Prefab.instantiateData(prefab.data, null, parent, scene, subContext);
                
                // Apply overrides from parent prefab
                if (childData.name) nestedObj.name = childData.name;
                if (childData.transform) {
                    if (childData.transform.position) {
                        nestedObj.transform.localPosition.x = childData.transform.position.x;
                        nestedObj.transform.localPosition.y = childData.transform.position.y;
                    }
                    if (childData.transform.rotation !== undefined) {
                        nestedObj.transform.localRotation = childData.transform.rotation;
                    }
                    if (childData.transform.scale) {
                        nestedObj.transform.localScale.x = childData.transform.scale.x;
                        nestedObj.transform.localScale.y = childData.transform.scale.y;
                    }
                }
                
                // Register the nested prefab root with fileID if provided
                if (childData.fileID !== undefined) {
                    context.registerObject(childData.fileID, nestedObj);
                }
                
                return nestedObj;
            }
        } catch (e) {
            console.error(`Failed to load nested prefab '${childData.prefab}'`, e);
        }
        return null;
    }
}

/**
 * Context for tracking fileID mappings during prefab instantiation
 */
class PrefabInstantiationContext {
    constructor() {
        // Map of fileID -> GameObject/Component
        this.fileIDMap = new Map();
        
        // Map of prefabGuid -> sub-context
        this.subContexts = new Map();
        
        // Pending references to resolve after instantiation
        this.pendingReferences = [];
    }

    /**
     * Register a GameObject with its fileID
     */
    registerObject(fileID, gameObject) {
        this.fileIDMap.set(fileID, gameObject);
    }

    /**
     * Register a Component with its fileID
     */
    registerComponent(fileID, component) {
        this.fileIDMap.set(fileID, component);
    }

    /**
     * Create a sub-context for a nested prefab
     */
    createSubContext(prefabGuid) {
        const subContext = new PrefabInstantiationContext();
        this.subContexts.set(prefabGuid, subContext);
        return subContext;
    }

    /**
     * Process properties and collect references
     */
    processProperties(properties, targetComponent) {
        const processed = {};
        
        for (const [key, value] of Object.entries(properties)) {
            if (this.isReference(value)) {
                // This is a reference, add to pending list
                this.pendingReferences.push({
                    target: targetComponent,
                    property: key,
                    reference: value
                });
                // Don't set the property yet
            } else {
                processed[key] = value;
            }
        }
        
        return processed;
    }

    /**
     * Check if a value is a reference object
     */
    isReference(value) {
        return value && typeof value === 'object' && 
               (value.fileID !== undefined || (value.guid !== undefined && value.fileID !== undefined));
    }

    /**
     * Resolve all pending references
     */
    resolveReferences() {
        for (const pending of this.pendingReferences) {
            const resolved = this.resolveReference(pending.reference);
            if (resolved) {
                pending.target[pending.property] = resolved;
            } else {
                console.warn(`Failed to resolve reference for ${pending.property}:`, pending.reference);
            }
        }
    }

    /**
     * Resolve a single reference
     */
    resolveReference(ref) {
        if (!ref) return null;

        // Case 1: Local reference (same prefab)
        if (ref.fileID !== undefined && ref.guid === undefined) {
            return this.fileIDMap.get(ref.fileID) || null;
        }

        // Case 2: Cross-prefab reference (guid + fileID)
        if (ref.guid !== undefined && ref.fileID !== undefined) {
            const subContext = this.subContexts.get(ref.guid);
            if (subContext) {
                return subContext.fileIDMap.get(ref.fileID) || null;
            }
        }

        return null;
    }
}

window.Prefab = Prefab;
window.PrefabInstantiationContext = PrefabInstantiationContext;
