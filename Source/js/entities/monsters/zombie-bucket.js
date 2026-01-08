// --- 铁桶僵尸 (银色铁桶) ---

class ZombieBucket extends Monster {
    static CONFIG = {
        id: 'zombie_bucket',
        name: '铁桶僵尸',
        hp: 50,
        damage: 12,
        speed: 0.6,  // 更慢
        radius: 24,
        color: '#4a7a4a',  // 深绿色
        xp: 5,
        gold: 3
    };
    
    constructor(x, y, scaleMult = 1) {
        super(x, y, ZombieBucket.CONFIG, scaleMult);
        this.armSwing = 0;
        this.headBob = 0;
        this.bucketHp = 80 * scaleMult;  // 铁桶额外血量
    }
    
    takeDamage(amount, kbX = 0, kbY = 0, source = null) {
        // 铁桶先吸收伤害
        let absorbed = 0;
        if (this.bucketHp > 0) {
            absorbed = Math.min(this.bucketHp, amount);
            this.bucketHp -= absorbed;
            amount -= absorbed;
            
            if (this.bucketHp <= 0) {
                Events.emit(EVENT.FLOATING_TEXT, {
                    text: '🪣 铁桶破碎!',
                    x: this.x, y: this.y - this.radius - 20,
                    color: '#888888'
                });
                Events.emit(EVENT.PARTICLES, {
                    x: this.x, y: this.y - this.radius,
                    count: 8,
                    color: '#888888'
                });
            }
        }
        
        if (amount > 0) {
            super.takeDamage(amount, kbX, kbY, source);
        } else if (absorbed > 0) {
            Events.emit(EVENT.FLOATING_TEXT, {
                text: '-' + Math.floor(absorbed),
                x: this.x, y: this.y - this.radius - 10,
                color: '#888888'
            });
        }
    }
    
    update(player) {
        super.update(player);
        this.armSwing = Math.sin(this.animationFrame * 0.06) * 0.25;
        this.headBob = Math.sin(this.animationFrame * 0.08) * 1.5;
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
        ctx.ellipse(0, r * 0.8, r * 0.75, r * 0.28, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 身体 (破旧衣服)
        ctx.fillStyle = '#3a3a50';  // 深蓝灰色
        ctx.beginPath();
        ctx.ellipse(0, r * 0.3, r * 0.65, r * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // 手臂
        ctx.save();
        ctx.rotate(this.armSwing - 0.5);
        ctx.fillStyle = '#4a7a4a';
        ctx.beginPath();
        ctx.ellipse(-r * 0.95, 0, r * 0.38, r * 0.16, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();
        ctx.restore();
        
        ctx.save();
        ctx.rotate(-this.armSwing + 0.5);
        ctx.fillStyle = '#4a7a4a';
        ctx.beginPath();
        ctx.ellipse(r * 0.95, 0, r * 0.38, r * 0.16, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();
        ctx.restore();
        
        // 头部
        ctx.save();
        ctx.translate(0, -r * 0.5 + this.headBob);
        
        // 头
        ctx.fillStyle = '#4a7a4a';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 铁桶 (如果还有)
        if (this.bucketHp > 0) {
            // 桶身
            const bucketDamage = 1 - (this.bucketHp / (80 * this.scaleMult));
            const bucketColor = bucketDamage > 0.5 ? '#666666' : '#888888';
            
            ctx.fillStyle = bucketColor;
            ctx.beginPath();
            ctx.moveTo(-r * 0.6, -r * 0.2);
            ctx.lineTo(-r * 0.5, -r * 1.1);
            ctx.lineTo(r * 0.5, -r * 1.1);
            ctx.lineTo(r * 0.6, -r * 0.2);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#444';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // 桶的金属环
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-r * 0.55, -r * 0.5);
            ctx.lineTo(r * 0.55, -r * 0.5);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-r * 0.52, -r * 0.85);
            ctx.lineTo(r * 0.52, -r * 0.85);
            ctx.stroke();
            
            // 高光
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            ctx.ellipse(-r * 0.2, -r * 0.7, r * 0.1, r * 0.25, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 眼睛 (从桶下面露出)
        const eyeY = this.bucketHp > 0 ? r * 0.1 : -r * 0.1;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(-r * 0.25, eyeY, r * 0.2, r * 0.25, 0, 0, Math.PI * 2);
        ctx.ellipse(r * 0.25, eyeY, r * 0.2, r * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // 瞳孔
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-r * 0.25, eyeY + r * 0.05, r * 0.08, 0, Math.PI * 2);
        ctx.arc(r * 0.25, eyeY + r * 0.05, r * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        // 嘴巴
        ctx.fillStyle = '#4a2020';
        ctx.beginPath();
        ctx.ellipse(0, r * 0.4, r * 0.22, r * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // 血条
        if (this.hp < this.maxHp || this.bucketHp < 80 * this.scaleMult) {
            const barWidth = r * 2;
            const barHeight = 4;
            const totalMaxHp = this.maxHp + 80 * this.scaleMult;
            const totalHp = this.hp + this.bucketHp;
            const hpPct = totalHp / totalMaxHp;
            ctx.fillStyle = '#333';
            ctx.fillRect(-barWidth/2, -r * 1.8, barWidth, barHeight);
            ctx.fillStyle = this.bucketHp > 0 ? '#888888' : '#ff4444';
            ctx.fillRect(-barWidth/2, -r * 1.8, barWidth * hpPct, barHeight);
        }
        
        ctx.restore();
    }
}

// 注册Monster
Monster.register('zombie_bucket', ZombieBucket.CONFIG, ZombieBucket);
