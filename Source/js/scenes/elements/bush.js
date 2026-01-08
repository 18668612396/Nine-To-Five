// --- 灌木 ---

class Bush extends SceneElement {
    constructor(x, y, config = {}) {
        const size = config.size || 25;
        super(x, y, {
            width: size,
            height: size * 0.8,
            collisionRadius: size * 0.7,
            collisionOffsetY: 0,
            zIndex: 0,
            ...config
        });
        
        this.size = size;
        this.color = config.color || '#388e3c';
        this.highlight = config.highlight || '#4caf50';
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        
        // 阴影
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(x, y + 5, this.size * 0.9, this.size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 灌木主体（多个圆组成）
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x - this.size * 0.3, y, this.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + this.size * 0.3, y, this.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y - this.size * 0.2, this.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        // 高光
        ctx.fillStyle = this.highlight;
        ctx.beginPath();
        ctx.arc(x - this.size * 0.2, y - this.size * 0.3, this.size * 0.35, 0, Math.PI * 2);
        ctx.fill();
        
        super.draw(ctx, camX, camY);
    }
}

SceneElement.register('bush', Bush);
