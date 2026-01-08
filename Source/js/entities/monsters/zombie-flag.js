// --- 旗帜僵尸 (浅绿色，速度快) ---

class ZombieFlag extends Monster {
    static CONFIG = {
        id: 'zombie_flag',
        name: '旗帜僵尸',
        hp: 25,
        damage: 8,
        speed: 1.1,
        radius: 20,
        color: '#9ac39a',  // 浅绿色
        xp: 3,
        gold: 2
    };
    
    constructor(x, y, scaleMult = 1) {
        super(x, y, ZombieFlag.CONFIG, scaleMult);
        this.flagWave = 0;
        this.bodyColor = '#9ac39a';
        this.darkColor = '#7aa37a';
        this.spotColor = '#8ab38a';
    }
    
    update(player) {
        super.update(player);
        this.flagWave += 0.15;
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        const r = this.radius;
        const bounce = Math.sin(this.animationFrame * 0.12) * 2.5;
        const wobble = Math.sin(this.animationFrame * 0.1) * 1.5;
        
        ctx.save();
        ctx.translate(x, y + bounce);
        
        // 阴影
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(0, r * 0.8, r * 0.7, r * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 旗杆 (在身后)
        ctx.strokeStyle = '#6b4423';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(r * 0.3, r * 0.3);
        ctx.lineTo(r * 0.3, -r * 2.2);
        ctx.stroke();
        
        // 旗帜
        ctx.save();
        ctx.translate(r * 0.3, -r * 2.2);
        const wave = Math.sin(this.flagWave) * 0.1;
        ctx.rotate(wave);
        
        ctx.fillStyle = '#cc0000';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(r * 0.8 + Math.sin(this.flagWave) * 3, r * 0.3, r * 1.2, r * 0.25);
        ctx.quadraticCurveTo(r * 0.8 + Math.sin(this.flagWave + 1) * 3, r * 0.6, r * 1.2, r * 0.9);
        ctx.quadraticCurveTo(r * 0.5, r * 0.8, 0, r * 1.0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#990000';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 骷髅
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(r * 0.55, r * 0.5, r * 0.22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(r * 0.48, r * 0.47, r * 0.05, 0, Math.PI * 2);
        ctx.arc(r * 0.62, r * 0.47, r * 0.05, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // 小手
        const armWave = Math.sin(this.animationFrame * 0.15) * 0.25;
        ctx.fillStyle = this.bodyColor;
        ctx.strokeStyle = this.darkColor;
        ctx.lineWidth = 1.5;
        
        // 左手摆动
        ctx.save();
        ctx.rotate(-0.6 + armWave);
        ctx.beginPath();
        ctx.ellipse(-r * 1.1, 0, r * 0.22, r * 0.38, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        
        // 右手举旗
        ctx.save();
        ctx.translate(r * 0.3, 0);
        ctx.rotate(-0.2);
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.5, r * 0.2, r * 0.35, 0, 0, Math.PI * 2);
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
        ctx.ellipse(-r * 0.35, r * 0.15, r * 0.18, r * 0.14, -0.3, 0, Math.PI * 2);
        ctx.fill();
        
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
        ctx.arc(-r * 0.28, -r * 0.1, r * 0.07, 0, Math.PI * 2);
        ctx.arc(r * 0.32, -r * 0.1, r * 0.07, 0, Math.PI * 2);
        ctx.fill();
        
        // 嘴 (咧嘴)
        ctx.fillStyle = '#4a3030';
        ctx.beginPath();
        ctx.arc(0, r * 0.3, r * 0.25, 0, Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#f5f5dc';
        ctx.fillRect(-r * 0.12, r * 0.3, r * 0.1, r * 0.12);
        ctx.fillRect(r * 0.02, r * 0.3, r * 0.1, r * 0.12);
        
        // 血条
        if (this.hp < this.maxHp) {
            const barWidth = r * 2;
            const barHeight = 4;
            const hpPct = this.hp / this.maxHp;
            ctx.fillStyle = '#333';
            ctx.fillRect(-barWidth/2, -r - 14, barWidth, barHeight);
            ctx.fillStyle = '#66bb66';
            ctx.fillRect(-barWidth/2, -r - 14, barWidth * hpPct, barHeight);
        }
        
        ctx.restore();
    }
}

Monster.register('zombie_flag', ZombieFlag.CONFIG, ZombieFlag);
