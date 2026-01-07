// --- 场景元素基类 ---

class SceneElement {
    constructor(x, y, config = {}) {
        this.x = x;
        this.y = y;
        this.width = config.width || 40;
        this.height = config.height || 40;
        this.radius = config.radius || Math.max(this.width, this.height) / 2;
        
        // 碰撞相关
        this.collidable = config.collidable !== false; // 默认可碰撞
        this.collisionRadius = config.collisionRadius || this.radius * 0.6;
        this.collisionOffsetY = config.collisionOffsetY || 0; // 碰撞中心Y偏移
        
        // 渲染相关
        this.zIndex = config.zIndex || 0; // 渲染层级
        this.visible = true;
        
        // 动画相关
        this.animationPhase = Math.random() * Math.PI * 2;
    }
    
    // 更新（子类重写）
    update(deltaTime, frameCount) {
        // 默认空实现
    }
    
    // 绘制（子类重写）
    draw(ctx, camX, camY) {
        // 默认绘制碰撞区域（调试用）
        if (this.collidable && window.DEBUG_COLLISION) {
            const x = this.x - camX;
            const y = this.y + this.collisionOffsetY - camY;
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y, this.collisionRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    // 检测与实体的碰撞
    checkCollision(entity) {
        if (!this.collidable) return false;
        
        const dx = entity.x - this.x;
        const dy = entity.y - (this.y + this.collisionOffsetY);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = this.collisionRadius + (entity.radius || 15);
        
        return dist < minDist;
    }
    
    // 推开实体（碰撞响应）
    pushEntity(entity) {
        if (!this.collidable) return;
        
        const dx = entity.x - this.x;
        const dy = entity.y - (this.y + this.collisionOffsetY);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = this.collisionRadius + (entity.radius || 15);
        
        if (dist < minDist && dist > 0) {
            const pushX = (dx / dist) * (minDist - dist + 1);
            const pushY = (dy / dist) * (minDist - dist + 1);
            entity.x += pushX;
            entity.y += pushY;
        }
    }
    
    // 获取碰撞中心
    getCollisionCenter() {
        return {
            x: this.x,
            y: this.y + this.collisionOffsetY
        };
    }
    
    // 是否在视野内
    isInView(camX, camY, viewWidth, viewHeight, margin = 100) {
        return this.x > camX - margin &&
               this.x < camX + viewWidth + margin &&
               this.y > camY - margin &&
               this.y < camY + viewHeight + margin;
    }
}

// 场景元素注册表
const SCENE_ELEMENT_TYPES = {};

SceneElement.register = function(id, elementClass) {
    SCENE_ELEMENT_TYPES[id] = elementClass;
};

SceneElement.create = function(id, x, y, config) {
    const ElementClass = SCENE_ELEMENT_TYPES[id];
    if (ElementClass) {
        return new ElementClass(x, y, config);
    }
    console.warn('未知场景元素类型:', id);
    return null;
};

SceneElement.getAllTypes = function() {
    return Object.keys(SCENE_ELEMENT_TYPES);
};
