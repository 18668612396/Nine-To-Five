// --- 旗帜僵尸 (红旗，速度稍快) ---

class ZombieFlag extends Monster {
    static CONFIG = {
        id: 'zombie_flag',
        name: '旗帜僵尸',
        hp: 25,
        damage: 8,
        speed: 1.1,  // 比普通僵尸快
        radius: 20,
        color: '#5a8a5a',
        xp: 3,
        gold: 2
    };
    
    constructor(x, y, scaleMult = 1) {
        super(x, y, ZombieFlag.CONFIG, scaleMult);
        this.armSwing = 0;
        this.headBob = 0;
        this.flagWave = 0;
    }
    
    update(player) {
        super.update(player);
        this.armSwing = Math.sin(this.animationFrame * 0.1) * 0.35;
        this.headBob = Math.sin(this.animationFrame * 0.12) * 2.5;
        this.flagWave = Math.sin(this.animationFrame * 0.15) * 0.2;
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
        
        // 旗杆 (在身后)
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(r * 0.3, r * 0.3);
        ctx.lineTo(r * 0.3, -r * 2);
        ctx.stroke();
        
        // 旗帜
        ctx.save();
        ctx.translate(r * 0.3, -r * 2);
        ctx.rotate(this.flagWave);
        
        ctx.fillStyle = '#cc0000';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(r * 1.2, r * 0.3);
        ctx.lineTo(r * 1.1, r * 0.6);
        ctx.lineTo(0, r * 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#880000';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 旗帜上的骷髅图案
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(r * 0.5, r * 0.4, r * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(r * 0.43, r * 0.37, r * 0.05, 0, Math.PI * 2);
        ctx.arc(r * 0.57, r * 0.37, r * 0.05, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // 身体
        ctx.fillStyle = '#4a3728';
        ctx.beginPath();
        ctx.ellipse(0, r * 0.3, r * 0.6, r * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // 左手臂 (摆动)
        ctx.save();
        ctx.rotate(this.armSwing - 0.5);
        ctx.fillStyle = '#5a8a5a';
        ctx.beginPath();
        ctx.ellipse(-r * 0.9, 0, r * 0.35, r * 0.15, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();
        ctx.restore();
        
        // 右手臂 (举旗)
        ctx.save();
        ctx.rotate(-0.3);
        ctx.fillStyle = '#5a8a5a';
        ctx.beginPath();
        ctx.ellipse(r * 0.7, -r * 0.3, r * 0.35, r * 0.15, 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();
        ctx.restore();
        
        // 头部
        ctx.save();
        ctx.translate(0, -r * 0.5 + this.headBob);
        
        // 头
        ctx.fillStyle = '#5a8a5a';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 头发
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(-r * 0.2 + i * r * 0.2, -r * 0.6);
            ctx.lineTo(-r * 0.25 + i * r * 0.2, -r * 0.8);
            ctx.stroke();
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
        
        // 瞳孔 (看向前方)
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-r * 0.22, -r * 0.05, r * 0.08, 0, Math.PI * 2);
        ctx.arc(r * 0.28, -r * 0.05, r * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        // 嘴巴 (咧嘴)
        ctx.fillStyle = '#4a2020';
        ctx.beginPath();
        ctx.arc(0, r * 0.3, r * 0.2, 0, Math.PI);
        ctx.fill();
        
        ctx.restore();
        
        // 血条
        if (this.hp < this.maxHp) {
            const barWidth = r * 2;
            const barHeight = 4;
            const hpPct = this.hp / this.maxHp;
            ctx.fillStyle = '#333';
            ctx.fillRect(-barWidth/2, -r * 1.5, barWidth, barHeight);
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(-barWidth/2, -r * 1.5, barWidth * hpPct, barHeight);
        }
        
        ctx.restore();
    }
}

// 注册Monster
Monster.register('zombie_flag', ZombieFlag.CONFIG, ZombieFlag);
