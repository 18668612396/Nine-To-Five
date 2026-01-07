// --- 场景基类 ---

class Scene {
    constructor(config = {}) {
        this.id = config.id || 'unknown';
        this.name = config.name || '未知场景';
        this.backgroundColor = config.backgroundColor || '#888888';
        
        // 场景元素
        this.elements = [];
        this.particles = []; // 场景粒子（雪花、气泡等）
        
        // 场景范围（无限地图用）
        this.worldWidth = config.worldWidth || 4000;
        this.worldHeight = config.worldHeight || 4000;
        
        // 元素生成配置
        this.elementDensity = config.elementDensity || 0.0001; // 每平方像素的元素密度
        this.elementTypes = config.elementTypes || []; // [{type, weight, config}]
    }
    
    // 初始化场景
    init() {
        this.elements = [];
        this.particles = [];
        this.generateElements();
        this.initParticles();
    }
    
    // 生成场景元素
    generateElements() {
        const totalElements = Math.floor(this.worldWidth * this.worldHeight * this.elementDensity);
        const totalWeight = this.elementTypes.reduce((sum, t) => sum + (t.weight || 1), 0);
        
        for (let i = 0; i < totalElements; i++) {
            const x = Math.random() * this.worldWidth - this.worldWidth / 2;
            const y = Math.random() * this.worldHeight - this.worldHeight / 2;
            
            // 根据权重随机选择元素类型
            let rand = Math.random() * totalWeight;
            let selectedType = this.elementTypes[0];
            
            for (const type of this.elementTypes) {
                rand -= (type.weight || 1);
                if (rand <= 0) {
                    selectedType = type;
                    break;
                }
            }
            
            if (selectedType) {
                const config = { ...selectedType.config };
                // 随机大小变化
                if (config.sizeRange) {
                    config.size = config.sizeRange[0] + Math.random() * (config.sizeRange[1] - config.sizeRange[0]);
                }
                
                const element = SceneElement.create(selectedType.type, x, y, config);
                if (element) {
                    this.elements.push(element);
                }
            }
        }
        
        // 按 zIndex 排序
        this.elements.sort((a, b) => a.zIndex - b.zIndex);
    }
    
    // 初始化粒子（子类重写）
    initParticles() {
        // 默认空实现
    }
    
    // 更新场景
    update(frameCount, player) {
        // 更新元素
        this.elements.forEach(el => el.update(1, frameCount));
        
        // 更新粒子
        this.updateParticles(frameCount);
        
        // 检测玩家与元素的碰撞
        if (player) {
            this.handleCollisions(player);
        }
    }
    
    // 更新粒子（子类重写）
    updateParticles(frameCount) {
        // 默认空实现
    }
    
    // 处理碰撞
    handleCollisions(entity) {
        for (const element of this.elements) {
            if (element.collidable && element.checkCollision(entity)) {
                element.pushEntity(entity);
            }
        }
    }
    
    // 检测任意实体与场景元素的碰撞
    checkEntityCollisions(entities) {
        for (const entity of entities) {
            this.handleCollisions(entity);
        }
    }
    
    // 绘制背景（子类重写）
    drawBackground(ctx, camX, camY, viewWidth, viewHeight, frameCount) {
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, viewWidth, viewHeight);
    }
    
    // 绘制场景元素
    drawElements(ctx, camX, camY, viewWidth, viewHeight, frameCount) {
        for (const element of this.elements) {
            if (element.visible && element.isInView(camX, camY, viewWidth, viewHeight)) {
                element.draw(ctx, camX, camY, frameCount);
            }
        }
    }
    
    // 绘制粒子（子类重写）
    drawParticles(ctx, camX, camY, viewWidth, viewHeight, frameCount) {
        // 默认空实现
    }
    
    // 完整绘制
    draw(ctx, camX, camY, viewWidth, viewHeight, frameCount) {
        this.drawBackground(ctx, camX, camY, viewWidth, viewHeight, frameCount);
        this.drawElements(ctx, camX, camY, viewWidth, viewHeight, frameCount);
        this.drawParticles(ctx, camX, camY, viewWidth, viewHeight, frameCount);
    }
    
    // 获取指定范围内的可碰撞元素
    getCollidableElementsInRange(x, y, range) {
        return this.elements.filter(el => {
            if (!el.collidable) return false;
            const dx = el.x - x;
            const dy = el.y - y;
            return Math.sqrt(dx * dx + dy * dy) < range + el.collisionRadius;
        });
    }
}

// 场景注册表
const SCENE_TYPES = {};

Scene.register = function(id, sceneClass) {
    SCENE_TYPES[id] = sceneClass;
};

Scene.create = function(id) {
    const SceneClass = SCENE_TYPES[id];
    if (SceneClass) {
        const scene = new SceneClass();
        scene.init();
        return scene;
    }
    console.warn('未知场景类型:', id);
    return null;
};

Scene.getAllTypes = function() {
    return Object.keys(SCENE_TYPES);
};

// ========== 场景管理器 (静态) ==========
Scene.Manager = {
    currentScene: null,
    currentSceneId: null,
    
    // 场景映射（地图名 -> 场景ID）
    mapToScene: {
        'forest': 'grass',
        'desert': 'desert',
        'snow': 'snow',
        'ocean': 'ocean'
    },
    
    // 初始化
    init() {
        this.currentScene = null;
        this.currentSceneId = null;
    },
    
    // 设置指定场景
    setScene(mapName) {
        const sceneId = this.mapToScene[mapName] || 'grass';
        return this.loadScene(sceneId);
    },
    
    // 加载场景
    loadScene(sceneId) {
        this.currentScene = Scene.create(sceneId);
        this.currentSceneId = sceneId;
        
        if (!this.currentScene) {
            console.error('无法加载场景:', sceneId);
            this.currentScene = Scene.create('grass');
            this.currentSceneId = 'grass';
        }
        
        return this.currentSceneId;
    },
    
    // 随机选择场景
    randomScene() {
        const types = Scene.getAllTypes();
        if (types.length === 0) {
            return this.loadScene('grass');
        }
        const randomId = types[Math.floor(Math.random() * types.length)];
        return this.loadScene(randomId);
    },
    
    // 更新场景
    update(frameCount, player) {
        if (this.currentScene) {
            this.currentScene.update(frameCount, player);
        }
    },
    
    // 绘制场景
    draw(ctx, camX, camY, viewWidth, viewHeight, frameCount) {
        if (this.currentScene) {
            this.currentScene.draw(ctx, camX, camY, viewWidth, viewHeight, frameCount);
        }
    },
    
    // 处理实体碰撞
    handleCollisions(entity) {
        if (this.currentScene) {
            this.currentScene.handleCollisions(entity);
        }
    },
    
    // 批量处理实体碰撞
    handleEntitiesCollisions(entities) {
        if (this.currentScene) {
            this.currentScene.checkEntityCollisions(entities);
        }
    },
    
    // 获取背景颜色
    getBackgroundColor() {
        return this.currentScene ? this.currentScene.backgroundColor : '#888888';
    },
    
    // 获取当前场景
    getScene() {
        return this.currentScene;
    },
    
    // 获取当前场景ID
    getSceneId() {
        return this.currentSceneId;
    },
    
    // 获取指定范围内的可碰撞元素
    getCollidableElementsInRange(x, y, range) {
        return this.currentScene ? this.currentScene.getCollidableElementsInRange(x, y, range) : [];
    }
};

// 兼容旧代码
const SceneManager = Scene.Manager;
