// --- 读报僵尸 (拿报纸，报纸破后会愤怒加速) ---

class ZombieNewspaper extends Monster {
    static CONFIG = {
        id: 'zombie_newspaper',
        name: '读报僵尸',
        hp: 35,
        damage: 15,  // 愤怒时伤害高
        speed: 0.6,  // 初始很慢
        radius: 20,
        color: '#5a8a5a',
        xp: 4,
        gold: 2
    };
    
    constructor(x, y, scaleMult = 1) {
        super(x, y, ZombieNewspaper.CONFIG, scaleMult);
        this.armSwing = 0;
        this.headBob = 0;
        this.newspaperHp = 15 * scaleMult;
        this.isAngry = false;
        this.originalSpeed = this.speed;
    }
    
    takeDamage(amount, kbX = 0, kbY = 0, source = null) {
        // 报纸先吸收伤害
        if (this.newspaperHp > 0) {
            const absorbed = Math.min(this.newspaperHp, amount);
            this.newspaperHp -= absorbed;
            amount -= absorbed;
            
            if (this.newspaperHp <= 0 && !this.isAngry) {
                this.isAngry = true;
                this.speed = 2.0;  // 愤怒加速！
                Events.emit(EVENT.FLOATING_TEXT, {
                    text: '📰 报纸撕碎! 💢',
                    x: this.x, y: this.y - this.radius - 20,
                    color: '#ff0000'
                });
                Events.emit(EVENT.PARTICLES, {
                    x: this.x, y: this.y,
                    count: 10,
                    color: '#f5f5dc'
                });
            }
        }
        
        if (amount > 0) {
            super.takeDamage(amount, kbX, kbY, source);
        }
    }
    
    update(player) {
        super.update(player);
        
        if (this.isAngry) {
            this.armSwing = Math.sin(this.animationFrame * 0.2) * 0.5;
            this.headBob = Math.sin(this.animationFrame * 0.25) * 4;
        } else {
            this.armSwing = Math.sin(this.animationFrame * 0.05) * 0.15;
            this.headBob = Math.sin(this.animationFrame * 0.06) * 1;
        }
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
        
        // 身体 (穿睡衣)
        ctx.fillStyle = this.isAngry ? '#6a4a4a' : '#5a5a7a';
        ctx.beginPath();
        ctx.ellipse(0, r * 0.3, r * 0.6, r * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // 手臂
        if (!this.isAngry) {
            // 双手举报纸
            ctx.fillStyle = '#5a8a5a';
            ctx.beginPath();
            ctx.ellipse(-r * 0.5, -r * 0.2, r * 0.3, r * 0.12, -0.5, 0, Math.PI * 2);
            ctx.ellipse(r * 0.5, -r * 0.2, r * 0.3, r * 0.12, 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.stroke();
            
            // 报纸
            ctx.fillStyle = '#f5f5dc';
            ctx.fillRect(-r * 0.6, -r * 0.7, r * 1.2, r * 0.8);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.strokeRect(-r * 0.6, -r * 0.7, r * 1.2, r * 0.8);
            
            // 报纸文字
            ctx.fillStyle = '#333';
            ctx.font = `${r * 0.15}px Arial`;
            ctx.fillText('NEWS', -r * 0.35, -r * 0.45);
            ctx.fillStyle = '#666';
            for (let i = 0; i < 3; i++) {
                ctx.fillRect(-r * 0.5, -r * 0.3 + i * r * 0.15, r * 1, r * 0.08);
            }
        } else {
            // 愤怒时手臂前伸
            ctx.save();
            ctx.rotate(this.armSwing - 0.7);
            ctx.fillStyle = '#5a8a5a';
            ctx.beginPath();
            ctx.ellipse(-r * 1.1, 0, r * 0.4, r * 0.15, -0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.stroke();
            ctx.restore();
            
            ctx.save();
            ctx.rotate(-this.armSwing + 0.7);
            ctx.fillStyle = '#5a8a5a';
            ctx.beginPath();
            ctx.ellipse(r * 1.1, 0, r * 0.4, r * 0.15, 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.stroke();
            ctx.restore();
        }
        
        // 头部
        ctx.save();
        ctx.translate(0, -r * 0.5 + this.headBob);
        
        // 头
        ctx.fillStyle = this.isAngry ? '#7a5a5a' : '#5a8a5a';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 眼镜 (如果不愤怒)
        if (!this.isAngry) {
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(-r * 0.25, -r * 0.1, r * 0.18, 0, Math.PI * 2);
            ctx.arc(r * 0.25, -r * 0.1, r * 0.18, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-r * 0.07, -r * 0.1);
            ctx.lineTo(r * 0.07, -r * 0.1);
            ctx.stroke();
        }
        
        // 眼睛
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        if (this.isAngry) {
            // 愤怒的眼睛
            ctx.ellipse(-r * 0.25, -r * 0.1, r * 0.25, r * 0.2, 0, 0, Math.PI * 2);
            ctx.ellipse(r * 0.25, -r * 0.1, r * 0.25, r * 0.2, 0, 0, Math.PI * 2);
        } else {
            ctx.ellipse(-r * 0.25, -r * 0.1, r * 0.15, r * 0.2, 0, 0, Math.PI * 2);
            ctx.ellipse(r * 0.25, -r * 0.1, r * 0.15, r * 0.2, 0, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // 瞳孔
        ctx.fillStyle = this.isAngry ? '#ff0000' : '#000';
        ctx.beginPath();
        ctx.arc(-r * 0.25, -r * 0.05, this.isAngry ? r * 0.1 : r * 0.06, 0, Math.PI * 2);
        ctx.arc(r * 0.25, -r * 0.05, this.isAngry ? r * 0.1 : r * 0.06, 0, Math.PI * 2);
        ctx.fill();
        
        // 愤怒符号
        if (this.isAngry) {
            ctx.fillStyle = '#ff0000';
            ctx.font = `bold ${r * 0.4}px Arial`;
            ctx.fillText('💢', r * 0.3, -r * 0.5);
        }
        
        // 嘴巴
        ctx.fillStyle = '#4a2020';
        if (this.isAngry) {
            // 愤怒咆哮
            ctx.beginPath();
            ctx.ellipse(0, r * 0.35, r * 0.3, r * 0.2, 0, 0, Math.PI * 2);
            ctx.fill();
            // 牙齿
            ctx.fillStyle = '#fff';
            for (let i = 0; i < 4; i++) {
                ctx.fillRect(-r * 0.2 + i * r * 0.12, r * 0.2, r * 0.08, r * 0.12);
            }
        } else {
            ctx.beginPath();
            ctx.arc(0, r * 0.3, r * 0.1, 0, Math.PI);
            ctx.fill();
        }
        
        ctx.restore();
        
        // 血条
        if (this.hp < this.maxHp) {
            const barWidth = r * 2;
            const barHeight = 4;
            const hpPct = this.hp / this.maxHp;
            ctx.fillStyle = '#333';
            ctx.fillRect(-barWidth/2, -r * 1.5, barWidth, barHeight);
            ctx.fillStyle = this.isAngry ? '#ff0000' : '#ff4444';
            ctx.fillRect(-barWidth/2, -r * 1.5, barWidth * hpPct, barHeight);
        }
        
        ctx.restore();
    }
}

// 注册Monster
Monster.register('zombie_newspaper', ZombieNewspaper.CONFIG, ZombieNewspaper);
