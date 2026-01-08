// --- 普通僵尸 (绿色) ---

class ZombieNormal extends Monster {
    static CONFIG = {
        id: 'zombie_normal',
        name: '普通僵尸',
        hp: 30,
        damage: 8,
        speed: 0.8,
        radius: 20,
        color: '#7ab37a',  // 绿色
        xp: 2,
        gold: 1
    };
    
    constructor(x, y, scaleMult = 1) {
        super(x, y, ZombieNormal.CONFIG, scaleMult);
        this.bodyColor = '#7ab37a';
        this.darkColor = '#5a935a';
        this.spotColor = '#5a8a5a';
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        const r = this.radius;
        const bounce = Math.sin(this.animationFrame * 0.1) * 2;
        const wobble = Math.sin(this.animationFrame * 0.08) * 1.5;
        
        ctx.save();
        ctx.translate(x, y + bounce);
        
        // 阴影
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(0, r * 0.8, r * 0.7, r * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 伸出的小手 (僵尸特征)
        const armWave = Math.sin(this.animationFrame * 0.12) * 0.2;
        ctx.fillStyle = this.bodyColor;
        ctx.strokeStyle = this.darkColor;
        ctx.lineWidth = 1.5;
        
        ctx.save();
        ctx.rotate(-0.6 + armWave);
        ctx.beginPath();
        ctx.ellipse(-r * 1.1, 0, r * 0.25, r * 0.4, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        
        ctx.save();
        ctx.rotate(0.6 - armWave);
        ctx.beginPath();
        ctx.ellipse(r * 1.1, 0, r * 0.25, r * 0.4, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        
        // 身体 (圆润的blob)
        ctx.fillStyle = this.bodyColor;
        ctx.strokeStyle = this.darkColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, r + wobble, r - wobble * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // 深色斑块 (腐烂感)
        ctx.fillStyle = this.spotColor;
        ctx.beginPath();
        ctx.ellipse(r * 0.3, -r * 0.2, r * 0.25, r * 0.2, 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-r * 0.4, r * 0.3, r * 0.2, r * 0.15, -0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // 大眼睛 (呆滞)
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(-r * 0.3, -r * 0.15, r * 0.22, r * 0.26, 0, 0, Math.PI * 2);
        ctx.ellipse(r * 0.3, -r * 0.15, r * 0.22, r * 0.26, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 小瞳孔 (呆滞感)
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(-r * 0.3, -r * 0.1, r * 0.08, 0, Math.PI * 2);
        ctx.arc(r * 0.3, -r * 0.1, r * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        // 嘴巴 (露牙)
        ctx.fillStyle = '#4a3030';
        ctx.beginPath();
        ctx.ellipse(0, r * 0.35, r * 0.3, r * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 一颗大门牙
        ctx.fillStyle = '#f5f5dc';
        ctx.fillRect(-r * 0.08, r * 0.22, r * 0.16, r * 0.18);
        
        // 头发 (几根稀疏的)
        ctx.strokeStyle = '#3a5a3a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-r * 0.2, -r * 0.85);
        ctx.quadraticCurveTo(-r * 0.3, -r * 1.1, -r * 0.15, -r * 1.15);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(r * 0.1, -r * 0.9);
        ctx.quadraticCurveTo(r * 0.2, -r * 1.15, r * 0.3, -r * 1.1);
        ctx.stroke();
        
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

Monster.register('zombie_normal', ZombieNormal.CONFIG, ZombieNormal);
