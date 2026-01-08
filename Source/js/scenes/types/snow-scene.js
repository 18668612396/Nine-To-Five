// --- 雪地场景 ---

class SnowScene extends Scene {
    constructor() {
        super({
            id: 'snow',
            name: '雪原',
            backgroundColor: '#a8c8d8',
            worldWidth: 4000,
            worldHeight: 4000,
            elementDensity: 0.000012,
            elementTypes: [
                { type: 'snow_tree', weight: 4, config: { sizeRange: [60, 100] } },
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
        
        // 雪地纹理（固定在世界坐标）
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        const patchSpacing = 200;
        const startPatchX = Math.floor(camX / patchSpacing) * patchSpacing;
        const startPatchY = Math.floor(camY / patchSpacing) * patchSpacing;
        
        for (let wx = startPatchX - patchSpacing; wx < camX + viewWidth + patchSpacing; wx += patchSpacing) {
            for (let wy = startPatchY - patchSpacing; wy < camY + viewHeight + patchSpacing; wy += patchSpacing) {
                // 用世界坐标生成伪随机偏移和大小
                const seed = (wx * 173 + wy * 127) % 1000;
                const offsetX = (seed % 80) - 40;
                const offsetY = ((seed * 7) % 80) - 40;
                const radiusX = 50 + (seed % 40);
                const radiusY = 25 + ((seed * 3) % 20);
                
                const screenX = wx + offsetX - camX;
                const screenY = wy + offsetY - camY;
                
                ctx.beginPath();
                ctx.ellipse(screenX, screenY, radiusX, radiusY, 0, 0, Math.PI * 2);
                ctx.fill();
            }
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
