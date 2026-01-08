// --- 普通僵尸 (绿色) ---

class ZombieNormal extends Monster {
    static CONFIG = {
        id: 'zombie_normal',
        name: '普通僵尸',
        hp: 30,
        damage: 8,
        speed: 0.8,  // 行动迟缓
        radius: 20,
        color: '#5a8a5a',  // 绿色皮肤
        xp: 2,
        gold: 1
    };
    
    constructor(x, y, scaleMult = 1) {
        super(x, y, ZombieNormal.CONFIG, scaleMult);
        this.armSwing = 0;
        this.headBob = 0;
    }
    
    update(player) {
        super.update(player);
        this.armSwing = Math.sin(this.animationFrame * 0.08) * 0.3;
        this.headBob = Math.sin(this.animationFrame * 0.1) * 2;
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
        
        // 身体 (破旧西装)
        ctx.fillStyle = '#4a3728';  // 棕色西装
        ctx.beginPath();
        ctx.ellipse(0, r * 0.3, r * 0.6, r * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // 领带
        ctx.fillStyle = '#8b0000';
        ctx.beginPath();
        ctx.moveTo(-3, -r * 0.1);
        ctx.lineTo(3, -r * 0.1);
        ctx.lineTo(2, r * 0.5);
        ctx.lineTo(0, r * 0.6);
        ctx.lineTo(-2, r * 0.5);
        ctx.closePath();
        ctx.fill();
        
        // 手臂 (伸出的僵尸手)
        ctx.save();
        ctx.rotate(this.armSwing - 0.5);
        ctx.fillStyle = '#5a8a5a';
        ctx.beginPath();
        ctx.ellipse(-r * 0.9, 0, r * 0.35, r * 0.15, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();
        ctx.restore();
        
        ctx.save();
        ctx.rotate(-this.armSwing + 0.5);
        ctx.fillStyle = '#5a8a5a';
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
        ctx.fillStyle = '#5a8a5a';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 头发 (稀疏)
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(-r * 0.3 + i * r * 0.2, -r * 0.6);
            ctx.lineTo(-r * 0.35 + i * r * 0.2, -r * 0.85);
            ctx.stroke();
        }
        
        // 眼睛 (大白眼)
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
        
        // 嘴巴 (张开露牙)
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
Monster.register('zombie_normal', ZombieNormal.CONFIG, ZombieNormal);
