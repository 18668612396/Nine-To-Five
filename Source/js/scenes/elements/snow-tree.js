// --- 雪松 ---

class SnowTree extends SceneElement {
    constructor(x, y, config = {}) {
        const size = config.size || 35;
        super(x, y, {
            width: size,
            height: size * 2,
            collisionRadius: size * 0.5,
            collisionOffsetY: -size * 0.3,
            zIndex: 1,
            ...config
        });
        
        this.size = size;
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        
        // 树干
        ctx.fillStyle = '#4a3728';
        ctx.fillRect(x - 4, y - 5, 8, 15);
        
        // 树冠（三层）
        ctx.fillStyle = '#1b5e20';
        for (let i = 0; i < 3; i++) {
            const layerY = y - 10 - i * (this.size * 0.35);
            const layerSize = this.size * (1 - i * 0.25);
            ctx.beginPath();
            ctx.moveTo(x, layerY - layerSize * 0.8);
            ctx.lineTo(x - layerSize * 0.6, layerY);
            ctx.lineTo(x + layerSize * 0.6, layerY);
            ctx.closePath();
            ctx.fill();
        }
        
        // 雪覆盖
        ctx.fillStyle = '#e8f4ff';
        for (let i = 0; i < 3; i++) {
            const layerY = y - 10 - i * (this.size * 0.35);
            const layerSize = this.size * (1 - i * 0.25);
            ctx.beginPath();
            ctx.moveTo(x, layerY - layerSize * 0.8);
            ctx.lineTo(x - layerSize * 0.3, layerY - layerSize * 0.5);
            ctx.lineTo(x + layerSize * 0.3, layerY - layerSize * 0.5);
            ctx.closePath();
            ctx.fill();
        }
        
        super.draw(ctx, camX, camY);
    }
}

SceneElement.register('snow_tree', SnowTree);
