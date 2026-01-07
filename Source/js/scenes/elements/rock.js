// --- 岩石 ---

class Rock extends SceneElement {
    constructor(x, y, config = {}) {
        super(x, y, {
            width: config.size || 30,
            height: (config.size || 30) * 0.8,
            collisionRadius: (config.size || 30) * 0.7,
            collisionOffsetY: 0,
            zIndex: 0,
            ...config
        });
        
        this.size = config.size || 30;
        this.color = config.color || '#9e9e9e';
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        
        // 阴影
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(x, y + 5, this.size * 0.8, this.size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 岩石主体
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(x - this.size, y);
        ctx.lineTo(x - this.size * 0.3, y - this.size);
        ctx.lineTo(x + this.size * 0.5, y - this.size * 0.7);
        ctx.lineTo(x + this.size, y);
        ctx.lineTo(x + this.size * 0.3, y + this.size * 0.4);
        ctx.lineTo(x - this.size * 0.5, y + this.size * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // 高光
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.moveTo(x - this.size * 0.5, y - this.size * 0.3);
        ctx.lineTo(x, y - this.size * 0.8);
        ctx.lineTo(x + this.size * 0.3, y - this.size * 0.5);
        ctx.lineTo(x, y - this.size * 0.2);
        ctx.closePath();
        ctx.fill();
        
        super.draw(ctx, camX, camY);
    }
}

SceneElement.register('rock', Rock);
