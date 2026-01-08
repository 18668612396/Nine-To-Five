// --- 沙漠场景 ---

class DesertScene extends Scene {
    constructor() {
        super({
            id: 'desert',
            name: '沙漠',
            backgroundColor: '#f4d03f',
            worldWidth: 4000,
            worldHeight: 4000,
            elementDensity: 0.000008,
            elementTypes: [
                { type: 'cactus', weight: 3, config: { sizeRange: [40, 70] } },
                { type: 'rock', weight: 2, config: { sizeRange: [30, 55], color: '#c9a227' } }
            ]
        });
        
        this.tumbleweeds = [];
        this.maxTumbleweeds = 8;
        this.dunes = [];
    }
    
    init() {
        super.init();
        this.generateDunes();
    }
    
    generateDunes() {
        this.dunes = [];
        for (let i = 0; i < 20; i++) {
            this.dunes.push({
                x: Math.random() * this.worldWidth - this.worldWidth / 2,
                y: Math.random() * this.worldHeight - this.worldHeight / 2,
                width: 150 + Math.random() * 100,
                height: 30 + Math.random() * 20
            });
        }
    }
    
    initParticles() {
        this.tumbleweeds = [];
        for (let i = 0; i < this.maxTumbleweeds; i++) {
            this.tumbleweeds.push(this.createTumbleweed());
        }
    }
    
    createTumbleweed() {
        return {
            x: Math.random() * 2000 - 1000,
            y: Math.random() * 2000 - 1000,
            size: 15 + Math.random() * 10,
            speedX: 1 + Math.random() * 2,
            speedY: (Math.random() - 0.5) * 0.5,
            rotation: 0,
            rotationSpeed: 0.05 + Math.random() * 0.1
        };
    }
    
    updateParticles(frameCount) {
        this.tumbleweeds.forEach(tw => {
            tw.x += tw.speedX;
            tw.y += tw.speedY;
            tw.rotation += tw.rotationSpeed;
            
            // 循环
            if (tw.x > 2000) tw.x = -2000;
            if (tw.y > 2000) tw.y = -2000;
            if (tw.y < -2000) tw.y = 2000;
        });
    }
    
    drawBackground(ctx, camX, camY, viewWidth, viewHeight, frameCount) {
        // 沙漠渐变背景
        const gradient = ctx.createLinearGradient(0, 0, 0, viewHeight);
        gradient.addColorStop(0, '#f4d03f');
        gradient.addColorStop(0.3, '#e9c46a');
        gradient.addColorStop(1, '#d4a84b');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, viewWidth, viewHeight);
        
        // 热浪效果
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for (let i = 0; i < 3; i++) {
            const waveY = ((frameCount * 0.5 + i * 200) % viewHeight);
            ctx.beginPath();
            ctx.moveTo(0, waveY);
            for (let x = 0; x <= viewWidth; x += 20) {
                ctx.lineTo(x, waveY + Math.sin(x * 0.02 + frameCount * 0.05) * 10);
            }
            ctx.lineTo(viewWidth, waveY + 30);
            ctx.lineTo(0, waveY + 30);
            ctx.fill();
        }
        
        // 沙丘
        ctx.fillStyle = '#c9a227';
        this.dunes.forEach(d => {
            const screenX = d.x - camX;
            const screenY = d.y - camY;
            
            if (screenX > -d.width && screenX < viewWidth + d.width &&
                screenY > -d.height && screenY < viewHeight + d.height) {
                ctx.beginPath();
                ctx.ellipse(screenX, screenY, d.width, d.height, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
    
    drawParticles(ctx, camX, camY, viewWidth, viewHeight, frameCount) {
        // 风滚草
        this.tumbleweeds.forEach(tw => {
            const screenX = tw.x - camX;
            const screenY = tw.y - camY;
            
            if (screenX > -50 && screenX < viewWidth + 50 &&
                screenY > -50 && screenY < viewHeight + 50) {
                ctx.save();
                ctx.translate(screenX, screenY);
                ctx.rotate(tw.rotation);
                ctx.strokeStyle = '#8b7355';
                ctx.lineWidth = 2;
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(Math.cos(angle) * tw.size, Math.sin(angle) * tw.size);
                    ctx.stroke();
                }
                ctx.restore();
            }
        });
    }
}

Scene.register('desert', DesertScene);
