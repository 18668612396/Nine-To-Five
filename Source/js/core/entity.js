// --- 实体基类 ---

class Entity {
    // 全局帧计数（由 Game 更新）
    static frameCount = 0;
    
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.markedForDeletion = false;
        
        // 受伤闪烁
        this.damageFlash = 0;
        this.damageFlashCooldown = 0; // 闪烁冷却
    }
    
    // 触发受伤闪烁（带冷却）
    triggerDamageFlash() {
        if (this.damageFlashCooldown <= 0) {
            this.damageFlash = 8; // 闪烁8帧
            this.damageFlashCooldown = 15; // 冷却15帧，避免高频触发
        }
    }
    
    // 更新闪烁状态
    updateDamageFlash() {
        if (this.damageFlash > 0) {
            this.damageFlash--;
        }
        if (this.damageFlashCooldown > 0) {
            this.damageFlashCooldown--;
        }
    }
    
    // 应用闪烁效果到绘制上下文
    applyDamageFlash(ctx) {
        if (this.damageFlash > 0) {
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = `rgba(255, 0, 0, ${0.5 + Math.sin(this.damageFlash * 1.5) * 0.3})`;
            ctx.fillRect(-9999, -9999, 99999, 99999);
            ctx.globalCompositeOperation = 'source-over';
        }
    }
    
    // 绘制方法 - 子类应重写
    // ctx: Canvas 2D 上下文
    // camX, camY: 相机偏移
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        
        ctx.beginPath();
        ctx.arc(x, y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}
