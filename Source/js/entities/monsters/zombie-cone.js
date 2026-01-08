// --- 路障僵尸 (橙色路障帽) ---

class ZombieCone extends Monster {
    static CONFIG = {
        id: 'zombie_cone',
        name: '路障僵尸',
        hp: 60,  // 更高血量
        damage: 10,
        speed: 0.7,  // 稍慢
        radius: 22,
        color: '#6a9a6a',  // 稍亮的绿色
        xp: 3,
        gold: 2
    };
    
    constructor(x, y, scaleMult = 1) {
        super(x, y, ZombieCone.CONFIG, scaleMult);
        this.armSwing = 0;
        this.headBob = 0;
        this.coneHp = 30 * scaleMult;  // 路障额外血量
    }
    
    takeDamage(amount, kbX = 0, kbY = 0, source = null) {
        // 路障先吸收伤害
        let absorbed = 0;
        if (this.coneHp > 0) {
            absorbed = Math.min(this.coneHp, amount);
            this.coneHp -= absorbed;
            amount -= absorbed;
            
            if (this.coneHp <= 0) {
                Events.emit(EVENT.FLOATING_TEXT, {
                    text: '🚧 路障破碎!',
                    x: this.x, y: this.y - this.radius - 20,
                    color: '#ff8800'
                });
            }
        }
        
        if (amount > 0) {
            super.takeDamage(amount, kbX, kbY, source);
        } else if (absorbed > 0) {
            // 即使伤害被吸收也显示
            Events.emit(EVENT.FLOATING_TEXT, {
                text: '-' + Math.floor(absorbed),
                x: this.x, y: this.y - this.radius - 10,
                color: '#ff8800'
            });
        }
    }
    
    update(player) {
        super.update(player);
        this.armSwing = Math.sin(this.animationFrame * 0.07) * 0.3;
        this.headBob = Math.sin(this.animationFrame * 0.09) * 2;
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        const r = this.radius;
        
        ctx.save();
        ctx.translate(x, y);
        
        // 阴影
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(0, r * 0.8, r * 0.7, r * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 身体
        ctx.fillStyle = '#4a3728';
        ctx.beginPath();
        ctx.ellipse(0, r * 0.3, r * 0.6, r * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // 手臂
        ctx.save();
        ctx.rotate(this.armSwing - 0.5);
        ctx.fillStyle = '#6a9a6a';
        ctx.beginPath();
        ctx.ellipse(-r * 0.9, 0, r * 0.35, r * 0.15, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();
        ctx.restore();
        
        ctx.save();
        ctx.rotate(-this.armSwing + 0.5);
        ctx.fillStyle = '#6a9a6a';
        ctx.beginPath();
        ctx.ellipse(r * 0.9, 0, r * 0.35, r * 0.15, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();
        ctx.restore();
        
        // 头部
        ctx.save();
        ctx.translate(0, -r * 0.5 + this.headBob);
        
        // 头
        ctx.fillStyle = '#6a9a6a';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 路障帽子 (如果还有)
        if (this.coneHp > 0) {
            ctx.fillStyle = '#ff6600';
            ctx.beginPath();
            ctx.moveTo(-r * 0.5, -r * 0.3);
            ctx.lineTo(0, -r * 1.3);
            ctx.lineTo(r * 0.5, -r * 0.3);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#cc4400';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // 白色条纹
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.moveTo(-r * 0.35, -r * 0.5);
            ctx.lineTo(-r * 0.15, -r * 0.9);
            ctx.lineTo(r * 0.15, -r * 0.9);
            ctx.lineTo(r * 0.35, -r * 0.5);
            ctx.closePath();
            ctx.fill();
        }
        
        // 眼睛
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(-r * 0.25, -r * 0.1, r * 0.22, r * 0.28, 0, 0, Math.PI * 2);
        ctx.ellipse(r * 0.25, -r * 0.1, r * 0.22, r * 0.28, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // 瞳孔
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-r * 0.25, -r * 0.05, r * 0.08, 0, Math.PI * 2);
        ctx.arc(r * 0.25, -r * 0.05, r * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        // 嘴巴
        ctx.fillStyle = '#4a2020';
        ctx.beginPath();
        ctx.ellipse(0, r * 0.35, r * 0.25, r * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 牙齿
        ctx.fillStyle = '#fff';
        ctx.fillRect(-r * 0.1, r * 0.25, r * 0.08, r * 0.1);
        ctx.fillRect(r * 0.02, r * 0.25, r * 0.08, r * 0.1);
        
        ctx.restore();
        
        // 血条
        if (this.hp < this.maxHp || this.coneHp < 30 * this.scaleMult) {
            const barWidth = r * 2;
            const barHeight = 4;
            const totalMaxHp = this.maxHp + 30 * this.scaleMult;
            const totalHp = this.hp + this.coneHp;
            const hpPct = totalHp / totalMaxHp;
            ctx.fillStyle = '#333';
            ctx.fillRect(-barWidth/2, -r * 1.8, barWidth, barHeight);
            ctx.fillStyle = this.coneHp > 0 ? '#ff8800' : '#ff4444';
            ctx.fillRect(-barWidth/2, -r * 1.8, barWidth * hpPct, barHeight);
        }
        
        ctx.restore();
    }
}

// 注册Monster
Monster.register('zombie_cone', ZombieCone.CONFIG, ZombieCone);
