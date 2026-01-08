// --- 持枪僵尸 (远程攻击) ---

class ZombieGunner extends Monster {
    static CONFIG = {
        id: 'zombie_gunner',
        name: '持枪僵尸',
        desc: '手持步枪的僵尸，会远程射击',
        icon: '🔫',
        hp: 25,
        damage: 12,
        speed: 0.6,
        radius: 18,
        color: '#6a8a6a',
        xp: 4,
        gold: 2
    };
    
    constructor(x, y, scaleMult = 1) {
        super(x, y, ZombieGunner.CONFIG, scaleMult);
        this.bodyColor = '#6a8a6a';
        this.darkColor = '#4a6a4a';
        
        // 射击相关
        this.shootCooldown = 0;
        this.shootInterval = 120; // 2秒一发
        this.shootRange = 300;    // 射程
        this.bulletSpeed = 5;
        this.aimAngle = 0;
        this.isAiming = false;
        this.aimTime = 0;
    }
    
    update(player) {
        this.animationFrame++;
        
        if (!player) {
            super.update(player);
            return;
        }
        
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // 更新瞄准角度
        this.aimAngle = Math.atan2(dy, dx);
        
        // 在射程内停下来射击
        if (dist < this.shootRange) {
            this.isAiming = true;
            this.aimTime++;
            
            // 冷却结束后射击
            if (this.shootCooldown <= 0) {
                this.shoot(player);
                this.shootCooldown = this.shootInterval;
            }
            
            // 缓慢移动
            this.x += (dx / dist) * this.speed * 0.3;
            this.y += (dy / dist) * this.speed * 0.3;
        } else {
            this.isAiming = false;
            this.aimTime = 0;
            // 正常追击
            super.update(player);
        }
        
        if (this.shootCooldown > 0) this.shootCooldown--;
    }
    
    shoot(player) {
        const proj = new BossProjectile(
            this.x + Math.cos(this.aimAngle) * 25,
            this.y + Math.sin(this.aimAngle) * 25,
            Math.cos(this.aimAngle) * this.bulletSpeed,
            Math.sin(this.aimAngle) * this.bulletSpeed,
            6, '#ffcc00', this.damage * this.scaleMult, 'bullet'
        );
        proj.life = 180;
        Events.emit(EVENT.PROJECTILE_FIRE, { projectile: proj, isBoss: true });
        
        // 射击特效
        Events.emit(EVENT.PARTICLES, {
            x: this.x + Math.cos(this.aimAngle) * 30,
            y: this.y + Math.sin(this.aimAngle) * 30,
            count: 3,
            color: '#ffaa00',
            spread: 2
        });
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        const r = this.radius;
        const bounce = Math.sin(this.animationFrame * 0.1) * 1.5;
        
        ctx.save();
        this.beginDraw(ctx);
        ctx.translate(x, y + bounce);
        
        // 阴影
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(0, r * 0.8, r * 0.7, r * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 枪 (先画，在身体后面)
        ctx.save();
        ctx.rotate(this.aimAngle);
        ctx.fillStyle = '#444';
        ctx.fillRect(r * 0.3, -3, r * 1.5, 6);
        ctx.fillStyle = '#666';
        ctx.fillRect(r * 0.3, -2, r * 0.4, 4);
        // 枪口闪光
        if (this.shootCooldown > this.shootInterval - 5) {
            ctx.fillStyle = '#ffaa00';
            ctx.beginPath();
            ctx.arc(r * 1.8, 0, 5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
        
        // 身体
        ctx.fillStyle = this.bodyColor;
        ctx.strokeStyle = this.darkColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // 军帽
        ctx.fillStyle = '#3a4a3a';
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.7, r * 0.8, r * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-r * 0.5, -r * 1.1, r, r * 0.4);
        
        // 眼睛 (瞄准时眯眼)
        ctx.fillStyle = '#fff';
        const eyeHeight = this.isAiming ? r * 0.12 : r * 0.2;
        ctx.beginPath();
        ctx.ellipse(-r * 0.3, -r * 0.1, r * 0.18, eyeHeight, 0, 0, Math.PI * 2);
        ctx.ellipse(r * 0.3, -r * 0.1, r * 0.18, eyeHeight, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 瞳孔
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(-r * 0.3, -r * 0.1, r * 0.07, 0, Math.PI * 2);
        ctx.arc(r * 0.3, -r * 0.1, r * 0.07, 0, Math.PI * 2);
        ctx.fill();
        
        // 嘴
        ctx.fillStyle = '#4a3030';
        ctx.beginPath();
        ctx.ellipse(0, r * 0.35, r * 0.2, r * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 血条
        if (this.hp < this.maxHp) {
            const barWidth = r * 2;
            const barHeight = 4;
            const hpPct = this.hp / this.maxHp;
            ctx.fillStyle = '#333';
            ctx.fillRect(-barWidth/2, -r - 20, barWidth, barHeight);
            ctx.fillStyle = '#66bb66';
            ctx.fillRect(-barWidth/2, -r - 20, barWidth * hpPct, barHeight);
        }
        
        this.endDraw(ctx, x, y, r);
        ctx.restore();
    }
}

Monster.register('zombie_gunner', ZombieGunner.CONFIG, ZombieGunner);
