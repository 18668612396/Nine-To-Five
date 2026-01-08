// --- 雪堆 ---

class SnowPile extends SceneElement {
    constructor(x, y, config = {}) {
        const size = config.size || 25;
        super(x, y, {
            width: size,
            height: size * 0.5,
            collisionRadius: size * 0.9,
            collisionOffsetY: 0,
            zIndex: 0,
            ...config
        });
        
        this.size = size;
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        
        // 主雪堆
        ctx.fillStyle = '#d8e8f0';
        ctx.beginPath();
        ctx.ellipse(x, y, this.size * 1.2, this.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 次雪堆
        ctx.fillStyle = '#c0d8e8';
        ctx.beginPath();
        ctx.ellipse(x + 5, y + 3, this.size * 0.8, this.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        super.draw(ctx, camX, camY);
    }
}

SceneElement.register('snow_pile', SnowPile);
