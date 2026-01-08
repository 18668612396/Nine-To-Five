// --- 路障僵尸 (黄绿色) ---

class ZombieCone extends Monster {
    static CONFIG = {
        id: 'zombie_cone',
        name: '路障僵尸',
        hp: 60,
        damage: 10,
        speed: 0.7,
        radius: 22,
        color: '#8ab87a',  // 黄绿色
        xp: 3,
        gold: 2
    };
    
    constructor(x, y, scaleMult = 1) {
        super(x, y, ZombieCone.CONFIG, scaleMult);
        this.coneHp = 30 * scaleMult;
        this.bodyColor = '#8ab87a';
        this.darkColor = '#6a986a';
        this.spotColor = '#7aa86a';
    }
    
    takeDamage(amount, kbX = 0, kbY = 0, source = null) {
        let absorbed = 0;
        if (this.coneHp > 0) {
            absorbed = Math.min(this.coneHp, amount);
            this.coneHp -= absorbed;
            amount -= absorbed;
            
            if (this.coneHp <= 0) {
                Events.emit(EVENT.FLOATING_TEXT, {
                    text: '🚧',
                    x: this.x, y: this.y - this.radius - 20,
                    color: '#ff8800'
                });
            }
        }
        
        if (amount > 0) {
            super.takeDamage(amount, kbX, kbY, source);
        } else if (absorbed > 0) {
            Events.emit(EVENT.FLOATING_TEXT, {
                text: '-' + Math.floor(absorbed),
                x: this.x, y: this.y - this.radius - 10,
                color: '#ff8800'
            });
        }
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        const r = this.radius;
        const bounce = Math.sin(this.animationFrame * 0.09) * 2;
        const wobble = Math.sin(this.animationFrame * 0.07) * 1.5;
        
        ctx.save();
        ctx.translate(x, y + bounce);
        
        // 阴影
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(0, r * 0.8, r * 0.7, r * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 小手
        const armWave = Math.sin(this.animationFrame * 0.1) * 0.2;
        ctx.fillStyle = this.bodyColor;
        ctx.strokeStyle = this.darkColor;
        ctx.lineWidth = 1.5;
        
        ctx.save();
        ctx.rotate(-0.6 + armWave);
        ctx.beginPath();
        ctx.ellipse(-r * 1.05, 0, r * 0.22, r * 0.38, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        
        ctx.save();
        ctx.rotate(0.6 - armWave);
        ctx.beginPath();
        ctx.ellipse(r * 1.05, 0, r * 0.22, r * 0.38, -0.3, 0, Math.PI * 2);
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
        
        // 斑块
        ctx.fillStyle = this.spotColor;
        ctx.beginPath();
        ctx.ellipse(r * 0.35, r * 0.1, r * 0.2, r * 0.15, 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // 路障帽子
        if (this.coneHp > 0) {
            const damage = 1 - this.coneHp / (30 * this.scaleMult);
            ctx.fillStyle = damage > 0.5 ? '#dd5500' : '#ff6600';
            ctx.beginPath();
            ctx.moveTo(-r * 0.55, -r * 0.5);
            ctx.lineTo(0, -r * 1.5);
            ctx.lineTo(r * 0.55, -r * 0.5);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#cc4400';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // 白条纹
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.moveTo(-r * 0.35, -r * 0.7);
            ctx.lineTo(-r * 0.15, -r * 1.1);
            ctx.lineTo(r * 0.15, -r * 1.1);
            ctx.lineTo(r * 0.35, -r * 0.7);
            ctx.closePath();
            ctx.fill();
        }
        
        // 眼睛
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
        
        // 嘴
        ctx.fillStyle = '#4a3030';
        ctx.beginPath();
        ctx.ellipse(0, r * 0.35, r * 0.28, r * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#f5f5dc';
        ctx.fillRect(-r * 0.07, r * 0.24, r * 0.14, r * 0.15);
        
        // 血条
        if (this.hp < this.maxHp || this.coneHp < 30 * this.scaleMult) {
            const barWidth = r * 2;
            const barHeight = 4;
            const totalMax = this.maxHp + 30 * this.scaleMult;
            const totalHp = this.hp + this.coneHp;
            const hpPct = totalHp / totalMax;
            ctx.fillStyle = '#333';
            ctx.fillRect(-barWidth/2, -r * 1.7, barWidth, barHeight);
            ctx.fillStyle = this.coneHp > 0 ? '#ff8800' : '#66bb66';
            ctx.fillRect(-barWidth/2, -r * 1.7, barWidth * hpPct, barHeight);
        }
        
        ctx.restore();
    }
}

Monster.register('zombie_cone', ZombieCone.CONFIG, ZombieCone);
