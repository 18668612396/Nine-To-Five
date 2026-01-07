// --- 雪地场景 ---

class SnowScene extends Scene {
    constructor() {
        super({
            id: 'snow',
            name: '雪原',
            backgroundColor: '#a8c8d8',
            worldWidth: 4000,
            worldHeight: 4000,
            elementDensity: 0.00012,
            elementTypes: [
                { type: 'snow_tree', weight: 4, config: { sizeRange: [30, 50] } },
                { type: 'snow_pile', weight: 3, config: { sizeRange: [20, 35] } },
                { type: 'rock', weight: 1, config: { sizeRange: [15, 25], color: '#8899aa' } }
            ]
        });
        
        this.snowflakes = [];
        this.maxSnowflakes = 100;
    }
    
    initParticles() {
        this.snowflakes = [];
        for (let i = 0; i < this.maxSnowflakes; i++) {
            this.snowflakes.push(this.createSnowflake());
        }
    }
    
    createSnowflake() {
        return {
            x: Math.random() * 1000 - 500,
            y: Math.random() * 1000 - 500,
            size: 2 + Math.random() * 4,
            speed: 1 + Math.random() * 2,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.02 + Math.random() * 0.03
        };
    }
    
    updateParticles(frameCount) {
        this.snowflakes.forEach(sf => {
            sf.y += sf.speed;
            sf.x += Math.sin(frameCount * sf.wobbleSpeed + sf.wobble) * 0.5;
        });
    }
    
    drawBackground(ctx, camX, camY, viewWidth, viewHeight, frameCount) {
        // 雪地渐变背景
        const gradient = ctx.createLinearGradient(0, 0, 0, viewHeight);
        gradient.addColorStop(0, '#a8c8d8');
        gradient.addColorStop(1, '#7ba3b8');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, viewWidth, viewHeight);
        
        // 雪地纹理
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 30; i++) {
            const patchX = ((i * 173 - camX * 0.5) % (viewWidth + 200)) - 100;
            const patchY = ((i * 127 - camY * 0.5) % (viewHeight + 200)) - 100;
            ctx.beginPath();
            ctx.ellipse(patchX, patchY, 60 + i % 40, 30 + i % 20, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawParticles(ctx, camX, camY, viewWidth, viewHeight, frameCount) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        
        this.snowflakes.forEach(sf => {
            // 相对于相机位置绘制，实现视差效果
            const screenX = ((sf.x - camX * 0.3) % viewWidth + viewWidth) % viewWidth;
            const screenY = ((sf.y - camY * 0.3) % viewHeight + viewHeight) % viewHeight;
            
            ctx.beginPath();
            ctx.arc(screenX, screenY, sf.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

Scene.register('snow', SnowScene);
