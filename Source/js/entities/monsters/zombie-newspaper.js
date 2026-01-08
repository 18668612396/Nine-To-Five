// --- 读报僵尸 (报纸破后愤怒加速) ---

class ZombieNewspaper extends Monster {
    static CONFIG = {
        id: 'zombie_newspaper',
        name: '读报僵尸',
        hp: 35,
        damage: 15,
        speed: 0.6,
        radius: 20,
        color: '#7ab37a',
        xp: 4,
        gold: 2
    };
    
    constructor(x, y, scaleMult = 1) {
        super(x, y, ZombieNewspaper.CONFIG, scaleMult);
        this.newspaperHp = 15 * scaleMult;
        this.isAngry = false;
    }
    
    takeDamage(amount, kbX = 0, kbY = 0, source = null) {
        if (this.newspaperHp > 0) {
            const absorbed = Math.min(this.newspaperHp, amount);
            this.newspaperHp -= absorbed;
            amount -= absorbed;
            
            if (this.newspaperHp <= 0 && !this.isAngry) {
                this.isAngry = true;
                this.speed = 2.0;
                Events.emit(EVENT.FLOATING_TEXT, {
                    text: '💢',
                    x: this.x, y: this.y - this.radius - 20,
                    color: '#ff0000'
                });
                Events.emit(EVENT.PARTICLES, {
                    x: this.x, y: this.y,
                    count: 8,
                    color: '#f5f5dc'
                });
            }
        }
        
        if (amount > 0) {
            super.takeDamage(amount, kbX, kbY, source);
        }
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        const r = this.radius;
        const bounceSpeed = this.isAngry ? 0.2 : 0.08;
        const bounceAmp = this.isAngry ? 4 : 1.5;
        const bounce = Math.sin(this.animationFrame * bounceSpeed) * bounceAmp;
        const wobble = Math.sin(this.animationFrame * 0.08) * (this.isAngry ? 2.5 : 1);
        
        ctx.save();
        ctx.translate(x, y + bounce);
        
        // 阴影
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(0, r * 0.8, r * 0.7, r * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 小手
        const armWave = Math.sin(this.animationFrame * (this.isAngry ? 0.2 : 0.06)) * (this.isAngry ? 0.4 : 0.1);
        ctx.fillStyle = this.isAngry ? '#8a6a6a' : '#6a9a6a';
        ctx.strokeStyle = this.isAngry ? '#6a4a4a' : '#4a7a4a';
        ctx.lineWidth = 1.5;
        
        if (!this.isAngry && this.newspaperHp > 0) {
            // 双手举报纸
            ctx.save();
            ctx.translate(-r * 0.5, -r * 0.3);
            ctx.rotate(-0.2);
            ctx.beginPath();
            ctx.ellipse(0, 0, r * 0.18, r * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
            
            ctx.save();
            ctx.translate(r * 0.5, -r * 0.3);
            ctx.rotate(0.2);
            ctx.beginPath();
            ctx.ellipse(0, 0, r * 0.18, r * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
            
            // 报纸
            ctx.fillStyle = '#f5f5dc';
            ctx.fillRect(-r * 0.7, -r * 0.9, r * 1.4, r * 0.9);
            ctx.strokeStyle = '#ccc';
            ctx.lineWidth = 1;
            ctx.strokeRect(-r * 0.7, -r * 0.9, r * 1.4, r * 0.9);
            
            // 报纸内容
            ctx.fillStyle = '#666';
            for (let i = 0; i < 3; i++) {
                ctx.fillRect(-r * 0.55, -r * 0.75 + i * r * 0.22, r * 1.1, r * 0.12);
            }
        } else {
            // 愤怒时手臂前伸
            ctx.save();
            ctx.rotate(-0.8 + armWave);
            ctx.beginPath();
            ctx.ellipse(-r * 1.2, 0, r * 0.22, r * 0.4, 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
            
            ctx.save();
            ctx.rotate(0.8 - armWave);
            ctx.beginPath();
            ctx.ellipse(r * 1.2, 0, r * 0.22, r * 0.4, -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
        
        // 身体
        ctx.fillStyle = this.isAngry ? '#9a7a7a' : '#7ab37a';
        ctx.strokeStyle = this.isAngry ? '#7a5a5a' : '#5a935a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, r + wobble, r - wobble * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // 眼睛
        ctx.fillStyle = '#fff';
        const eyeSize = this.isAngry ? 1.3 : 1;
        ctx.beginPath();
        ctx.ellipse(-r * 0.3, -r * 0.15, r * 0.2 * eyeSize, r * 0.24 * eyeSize, 0, 0, Math.PI * 2);
        ctx.ellipse(r * 0.3, -r * 0.15, r * 0.2 * eyeSize, r * 0.24 * eyeSize, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 瞳孔
        ctx.fillStyle = this.isAngry ? '#cc0000' : '#222';
        const pupilSize = this.isAngry ? 0.1 : 0.07;
        ctx.beginPath();
        ctx.arc(-r * 0.3, -r * 0.1, r * pupilSize, 0, Math.PI * 2);
        ctx.arc(r * 0.3, -r * 0.1, r * pupilSize, 0, Math.PI * 2);
        ctx.fill();
        
        // 愤怒符号
        if (this.isAngry) {
            ctx.fillStyle = '#ff0000';
            ctx.font = 'bold 12px Arial';
            ctx.fillText('💢', r * 0.4, -r * 0.6);
        }
        
        // 嘴
        ctx.fillStyle = '#4a3030';
        if (this.isAngry) {
            // 愤怒大嘴
            ctx.beginPath();
            ctx.ellipse(0, r * 0.35, r * 0.35, r * 0.22, 0, 0, Math.PI * 2);
            ctx.fill();
            // 牙齿
            ctx.fillStyle = '#f5f5dc';
            for (let i = 0; i < 3; i++) {
                ctx.fillRect(-r * 0.2 + i * r * 0.15, r * 0.2, r * 0.1, r * 0.15);
            }
        } else {
            ctx.beginPath();
            ctx.arc(0, r * 0.3, r * 0.15, 0, Math.PI);
            ctx.fill();
        }
        
        // 血条
        if (this.hp < this.maxHp) {
            const barWidth = r * 2;
            const barHeight = 4;
            const hpPct = this.hp / this.maxHp;
            ctx.fillStyle = '#333';
            ctx.fillRect(-barWidth/2, -r - 14, barWidth, barHeight);
            ctx.fillStyle = this.isAngry ? '#ff4444' : '#66bb66';
            ctx.fillRect(-barWidth/2, -r - 14, barWidth * hpPct, barHeight);
        }
        
        ctx.restore();
    }
}

Monster.register('zombie_newspaper', ZombieNewspaper.CONFIG, ZombieNewspaper);
