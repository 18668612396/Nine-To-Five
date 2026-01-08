// --- 仙人掌 ---

class Cactus extends SceneElement {
    constructor(x, y, config = {}) {
        const size = config.size || 25;
        super(x, y, {
            width: size,
            height: size * 1.5,
            collisionRadius: size * 0.35,
            collisionOffsetY: -size * 0.3,
            zIndex: 1,
            ...config
        });
        
        this.size = size;
        this.type = config.type !== undefined ? config.type : Math.floor(Math.random() * 2);
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        
        ctx.fillStyle = '#2d5a27';
        
        if (this.type === 0) {
            // 经典仙人掌
            ctx.fillRect(x - 5, y - this.size, 10, this.size);
            ctx.fillRect(x - 15, y - this.size * 0.7, 10, this.size * 0.4);
            ctx.fillRect(x + 5, y - this.size * 0.5, 10, this.size * 0.3);
            
            // 刺
            ctx.strokeStyle = '#1b3d1a';
            ctx.lineWidth = 1;
            for (let i = 0; i < 4; i++) {
                const spineY = y - this.size * 0.2 - i * (this.size * 0.2);
                ctx.beginPath();
                ctx.moveTo(x - 5, spineY);
                ctx.lineTo(x - 10, spineY - 3);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x + 5, spineY);
                ctx.lineTo(x + 10, spineY - 3);
                ctx.stroke();
            }
        } else {
            // 圆形仙人掌
            ctx.beginPath();
            ctx.ellipse(x, y - this.size * 0.5, this.size * 0.4, this.size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // 纹理线
            ctx.strokeStyle = '#1b3d1a';
            ctx.lineWidth = 1;
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI - Math.PI / 2;
                ctx.beginPath();
                ctx.moveTo(x, y - this.size * 0.5 - this.size * 0.5);
                ctx.quadraticCurveTo(
                    x + Math.cos(angle) * this.size * 0.3,
                    y - this.size * 0.5,
                    x + Math.cos(angle) * this.size * 0.2,
                    y
                );
                ctx.stroke();
            }
        }
        
        super.draw(ctx, camX, camY);
    }
}

SceneElement.register('cactus', Cactus);
