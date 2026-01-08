// --- 海洋场景 ---

class OceanScene extends Scene {
    constructor() {
        super({
            id: 'ocean',
            name: '深海',
            backgroundColor: '#1a5276',
            worldWidth: 4000,
            worldHeight: 4000,
            elementDensity: 0.00001,
            elementTypes: [
                { type: 'seaweed', weight: 4, config: { height: 80 } },
                { type: 'coral', weight: 3, config: { sizeRange: [25, 40] } },
                { type: 'rock', weight: 2, config: { sizeRange: [20, 35], color: '#2c3e50' } }
            ]
        });
        
        this.bubbles = [];
        this.maxBubbles = 30;
    }
    
    initParticles() {
        this.bubbles = [];
        for (let i = 0; i < this.maxBubbles; i++) {
            this.bubbles.push(this.createBubble());
        }
    }
    
    createBubble() {
        return {
            x: Math.random() * 2000 - 1000,
            y: Math.random() * 2000 - 1000,
            size: 3 + Math.random() * 8,
            speed: 0.5 + Math.random() * 1.5,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.03 + Math.random() * 0.02
        };
    }
    
    updateParticles(frameCount) {
        this.bubbles.forEach(b => {
            b.y -= b.speed;
            b.x += Math.sin(frameCount * b.wobbleSpeed + b.wobble) * 0.5;
            
            // 循环
            if (b.y < -1000) {
                b.y = 1000;
                b.x = Math.random() * 2000 - 1000;
            }
        });
    }
    
    drawBackground(ctx, camX, camY, viewWidth, viewHeight, frameCount) {
        // 深海渐变背景
        const gradient = ctx.createLinearGradient(0, 0, 0, viewHeight);
        gradient.addColorStop(0, '#1a5276');
        gradient.addColorStop(0.5, '#154360');
        gradient.addColorStop(1, '#0e2f44');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, viewWidth, viewHeight);
        
        // 光线效果
        for (let i = 0; i < 5; i++) {
            const baseX = (i * 200 - camX * 0.1) % (viewWidth + 200) - 100;
            const rayGradient = ctx.createLinearGradient(baseX, 0, baseX + 50, viewHeight);
            rayGradient.addColorStop(0, 'rgba(255, 255, 200, 0.1)');
            rayGradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
            ctx.fillStyle = rayGradient;
            ctx.beginPath();
            ctx.moveTo(baseX, 0);
            ctx.lineTo(baseX + 80, viewHeight);
            ctx.lineTo(baseX + 30, viewHeight);
            ctx.closePath();
            ctx.fill();
        }
        
        // 水波纹
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            const waveY = ((frameCount * 0.3 + i * 150) % (viewHeight + 100)) - 50;
            ctx.beginPath();
            for (let x = 0; x <= viewWidth; x += 10) {
                const y = waveY + Math.sin(x * 0.01 + frameCount * 0.02 + i) * 20;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }
    
    drawParticles(ctx, camX, camY, viewWidth, viewHeight, frameCount) {
        // 气泡
        this.bubbles.forEach(b => {
            const screenX = ((b.x - camX * 0.5) % viewWidth + viewWidth) % viewWidth;
            const screenY = ((b.y - camY * 0.5) % viewHeight + viewHeight) % viewHeight;
            
            // 气泡轮廓
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(screenX, screenY, b.size, 0, Math.PI * 2);
            ctx.stroke();
            
            // 高光
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(screenX - b.size * 0.3, screenY - b.size * 0.3, b.size * 0.3, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    // 海洋场景特殊：海草需要传入 frameCount 来绘制动画
    drawElements(ctx, camX, camY, viewWidth, viewHeight, frameCount) {
        for (const element of this.elements) {
            if (element.visible && element.isInView(camX, camY, viewWidth, viewHeight)) {
                element.draw(ctx, camX, camY, frameCount);
            }
        }
    }
}

Scene.register('ocean', OceanScene);
