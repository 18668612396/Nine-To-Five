// --- 海草 ---

class Seaweed extends SceneElement {
    constructor(x, y, config = {}) {
        super(x, y, {
            width: 20,
            height: config.height || 80,
            collidable: false, // 海草不阻挡移动
            zIndex: 0,
            ...config
        });
        
        this.height = config.height || 80;
        this.phase = config.phase || Math.random() * Math.PI * 2;
    }
    
    update(deltaTime, frameCount) {
        // 海草摆动由绘制时处理
    }
    
    draw(ctx, camX, camY, frameCount = 0) {
        const x = this.x - camX;
        const y = this.y - camY;
        
        ctx.strokeStyle = '#2e7d32';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y + this.height);
        
        const segments = 5;
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const waveOffset = Math.sin(frameCount * 0.03 + this.phase + t * 3) * 15 * t;
            ctx.lineTo(x + waveOffset, y + this.height * (1 - t));
        }
        ctx.stroke();
    }
}

SceneElement.register('seaweed', Seaweed);
