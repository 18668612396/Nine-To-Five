// --- 珊瑚 ---

class Coral extends SceneElement {
    constructor(x, y, config = {}) {
        super(x, y, {
            width: config.size || 30,
            height: (config.size || 30) * 1.2,
            collisionRadius: (config.size || 30) * 0.4,
            collisionOffsetY: 0,
            zIndex: 0,
            ...config
        });
        
        this.size = config.size || 30;
        this.color = config.color || this.randomColor();
    }
    
    randomColor() {
        const colors = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#da77f2'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        
        ctx.fillStyle = this.color;
        
        // 珊瑚分支
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI - Math.PI / 2 + (Math.random() - 0.5) * 0.3;
            const branchLength = this.size * (0.6 + Math.random() * 0.4);
            const endX = x + Math.cos(angle) * branchLength;
            const endY = y + Math.sin(angle) * branchLength;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            ctx.lineWidth = 6;
            ctx.strokeStyle = this.color;
            ctx.stroke();
            
            // 分支末端圆球
            ctx.beginPath();
            ctx.arc(endX, endY, 5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 底座
        ctx.beginPath();
        ctx.arc(x, y, this.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        super.draw(ctx, camX, camY);
    }
}

SceneElement.register('coral', Coral);
