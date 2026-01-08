// --- 树 ---

class Tree extends SceneElement {
    constructor(x, y, config = {}) {
        const size = config.size || 40;
        super(x, y, {
            width: size,
            height: size * 1.5,
            collisionRadius: size * 0.8,
            collisionOffsetY: -size * 0.3,
            zIndex: 1,
            ...config
        });
        
        this.size = size;
        this.trunkColor = config.trunkColor || '#8d6e63';
        this.leafColor = config.leafColor || '#4caf50';
        this.leafHighlight = config.leafHighlight || '#66bb6a';
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        
        // 阴影
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(x, y + 10, this.size * 0.8, this.size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 树干
        ctx.fillStyle = this.trunkColor;
        ctx.fillRect(x - 5, y - 10, 10, 20);
        
        // 树冠
        ctx.fillStyle = this.leafColor;
        ctx.beginPath();
        ctx.arc(x, y - 20, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // 树冠高光
        ctx.fillStyle = this.leafHighlight;
        ctx.beginPath();
        ctx.arc(x - 5, y - 25, this.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        super.draw(ctx, camX, camY);
    }
}

SceneElement.register('tree', Tree);
