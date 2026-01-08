// --- 铁桶僵尸 (青绿色) ---

class ZombieBucket extends Monster {
    static CONFIG = {
        id: 'zombie_bucket',
        name: '铁桶僵尸',
        hp: 50,
        damage: 12,
        speed: 0.6,
        radius: 24,
        color: '#6a9aaa',  // 青绿色
        xp: 5,
        gold: 3
    };
    
    constructor(x, y, scaleMult = 1) {
        super(x, y, ZombieBucket.CONFIG, scaleMult);
        this.bucketHp = 80 * scaleMult;
        this.bodyColor = '#6a9aaa';
        this.darkColor = '#4a7a8a';
        this.spotColor = '#5a8a9a';
    }
    
    takeDamage(amount, kbX = 0, kbY = 0, source = null) {
        let absorbed = 0;
        if (this.bucketHp > 0) {
            absorbed = Math.min(this.bucketHp, amount);
            this.bucketHp -= absorbed;
            amount -= absorbed;
            
            if (this.bucketHp <= 0) {
                Events.emit(EVENT.FLOATING_TEXT, {
                    text: '🪣',
                    x: this.x, y: this.y - this.radius - 20,
                    color: '#888'
                });
                Events.emit(EVENT.PARTICLES, {
                    x: this.x, y: this.y - this.radius,
                    count: 6,
                    color: '#888'
                });
            }
        }
        
        if (amount > 0) {
            super.takeDamage(amount, kbX, kbY, source);
        } else if (absorbed > 0) {
            Events.emit(EVENT.FLOATING_TEXT, {
                text: '-' + Math.floor(absorbed),
                x: this.x, y: this.y - this.radius - 10,
                color: '#888'
            });
        }
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        const r = this.radius;
        const bounce = Math.sin(this.animationFrame * 0.08) * 1.5;
        const wobble = Math.sin(this.animationFrame * 0.06) * 1;
        
        ctx.save();
        ctx.translate(x, y + bounce);
        
        // 阴影
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(0, r * 0.8, r * 0.75, r * 0.28, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 小手
        const armWave = Math.sin(this.animationFrame * 0.08) * 0.15;
        ctx.fillStyle = this.bodyColor;
        ctx.strokeStyle = this.darkColor;
        ctx.lineWidth = 1.5;
        
        ctx.save();
        ctx.rotate(-0.55 + armWave);
        ctx.beginPath();
        ctx.ellipse(-r * 1.0, 0, r * 0.2, r * 0.35, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        
        ctx.save();
        ctx.rotate(0.55 - armWave);
        ctx.beginPath();
        ctx.ellipse(r * 1.0, 0, r * 0.2, r * 0.35, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        
        // 身体
        ctx.fillStyle = this.bodyColor;
        ctx.strokeStyle = this.darkColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, r + wobble, r - wobble * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // 铁桶
        if (this.bucketHp > 0) {
            const damage = 1 - this.bucketHp / (80 * this.scaleMult);
            const bucketColor = damage > 0.6 ? '#666' : damage > 0.3 ? '#888' : '#aaa';
            
            // 桶身
            ctx.fillStyle = bucketColor;
            ctx.beginPath();
            ctx.moveTo(-r * 0.65, -r * 0.3);
            ctx.lineTo(-r * 0.55, -r * 1.1);
            ctx.lineTo(r * 0.55, -r * 1.1);
            ctx.lineTo(r * 0.65, -r * 0.3);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // 金属环
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(-r * 0.6, -r * 0.55);
            ctx.lineTo(r * 0.6, -r * 0.55);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-r * 0.57, -r * 0.85);
            ctx.lineTo(r * 0.57, -r * 0.85);
            ctx.stroke();
            
            // 高光
            ctx.fillStyle = 'rgba(255,255,255,0.25)';
            ctx.beginPath();
            ctx.ellipse(-r * 0.25, -r * 0.7, r * 0.08, r * 0.2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // 眼睛从桶下露出
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.ellipse(-r * 0.25, r * 0.05, r * 0.15, r * 0.18, 0, 0, Math.PI * 2);
            ctx.ellipse(r * 0.25, r * 0.05, r * 0.15, r * 0.18, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            ctx.fillStyle = '#222';
            ctx.beginPath();
            ctx.arc(-r * 0.25, r * 0.08, r * 0.05, 0, Math.PI * 2);
            ctx.arc(r * 0.25, r * 0.08, r * 0.05, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // 没桶时正常眼睛
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.ellipse(-r * 0.3, -r * 0.15, r * 0.2, r * 0.24, 0, 0, Math.PI * 2);
            ctx.ellipse(r * 0.3, -r * 0.15, r * 0.2, r * 0.24, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            ctx.fillStyle = '#222';
            ctx.beginPath();
            ctx.arc(-r * 0.3, -r * 0.1, r * 0.07, 0, Math.PI * 2);
            ctx.arc(r * 0.3, -r * 0.1, r * 0.07, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 嘴
        ctx.fillStyle = '#4a3030';
        ctx.beginPath();
        ctx.ellipse(0, r * 0.4, r * 0.25, r * 0.14, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#f5f5dc';
        ctx.fillRect(-r * 0.06, r * 0.3, r * 0.12, r * 0.12);
        
        // 血条
        if (this.hp < this.maxHp || this.bucketHp < 80 * this.scaleMult) {
            const barWidth = r * 2;
            const barHeight = 4;
            const totalMax = this.maxHp + 80 * this.scaleMult;
            const totalHp = this.hp + this.bucketHp;
            const hpPct = totalHp / totalMax;
            ctx.fillStyle = '#333';
            ctx.fillRect(-barWidth/2, -r * 1.3, barWidth, barHeight);
            ctx.fillStyle = this.bucketHp > 0 ? '#888' : '#66bb66';
            ctx.fillRect(-barWidth/2, -r * 1.3, barWidth * hpPct, barHeight);
        }
        
        ctx.restore();
    }
}

Monster.register('zombie_bucket', ZombieBucket.CONFIG, ZombieBucket);
