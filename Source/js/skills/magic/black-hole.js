// --- 黑洞 ---

class BlackHoleSkill extends MagicSkill {
    constructor() {
        super({
            id: 'black_hole',
            name: '黑洞',
            icon: '🕳️',
            desc: '缓慢移动的黑洞，吸附并持续伤害附近敌人',
            cooldown: 60,
            energyCost: 10
        });
    }
    
    createProjectile(caster, mods) {
        return new BlackHoleProjectile(caster, mods);
    }
}

class BlackHoleProjectile extends SkillProjectile {
    constructor(caster, mods) {
        super(caster, mods);
        const star = mods.star || 1;
        this.baseDamage = 5;
        this.damage = this.baseDamage * (mods.damage || 1);
        this.speed = 2 * (mods.speed || 1);
        this.baseRadius = 40;
        
        // 星级影响大小：1星40，2星60，3星90
        const sizeMultipliers = { 1: 1, 2: 1.5, 3: 2.25 };
        this.radius = this.baseRadius * (sizeMultipliers[star] || 1) * this.sizeScale;
        this.pullRadius = this.radius * 3;
        this.duration = 180;
        this.star = star;
        this.penetrate = 999;
        this.hitList = [];
        this.damageInterval = 10;
        this.damageTimer = 0;
        this.rotationAngle = 0;
        this.particles = [];
        
        // 星级影响伤害
        const damageMultipliers = { 1: 1, 2: 1.5, 3: 2.5 };
        this.damage *= damageMultipliers[star] || 1;
        
        // 螺旋飞出时使用的初始半径和扩展速度
        this.orbitalRadius = 50;
        this.orbitalExpandSpeed = 1.2;
        this.orbitalSpeed = 0.1;
        this.orbitalAngle = mods.angle || 0;
    }
    
    update() {
        // 处理螺旋飞出移动
        if (this.orbital) {
            this.orbitalAngle += this.orbitalSpeed;
            this.orbitalRadius += this.orbitalExpandSpeed;  // 半径持续增大
            this.x = this.caster.x + Math.cos(this.orbitalAngle) * this.orbitalRadius;
            this.y = this.caster.y + Math.sin(this.orbitalAngle) * this.orbitalRadius;
            
            // 飞出屏幕范围后消失
            if (this.orbitalRadius > 1200) {
                this.markedForDeletion = true;
                return;
            }
        } else {
            // 普通移动
            this.x += this.dx * this.speed;
            this.y += this.dy * this.speed;
        }
        
        this.duration--;
        this.rotationAngle += 0.1;
        this.damageTimer++;
        
        // 获取敌人列表
        const enemies = SkillProjectile.enemies || [];
        const bosses = SkillProjectile.bosses || [];
        
        // 生成漩涡粒子
        if (Math.random() < 0.3) {
            const angle = Math.random() * Math.PI * 2;
            const dist = this.pullRadius * (0.5 + Math.random() * 0.5);
            this.particles.push({
                x: this.x + Math.cos(angle) * dist,
                y: this.y + Math.sin(angle) * dist,
                angle: angle,
                dist: dist,
                life: 30
            });
        }
        
        // 更新粒子
        this.particles = this.particles.filter(p => {
            p.life--;
            p.dist -= 3;
            p.angle += 0.15;
            p.x = this.x + Math.cos(p.angle) * p.dist;
            p.y = this.y + Math.sin(p.angle) * p.dist;
            return p.life > 0 && p.dist > 5;
        });
        
        // 持续吸引敌人
        this.pullEnemies(enemies, bosses);
        
        // 持续伤害
        if (this.damageTimer >= this.damageInterval) {
            this.damageTimer = 0;
            this.damageEnemiesInRange(enemies, bosses);
        }
        
        if (this.duration <= 0) {
            this.markedForDeletion = true;
            Events.emit(EVENT.PARTICLES, {
                x: this.x, y: this.y,
                count: 20,
                color: '#9933ff',
                spread: 4, size: 5
            });
        }
    }
    
    pullEnemies(enemies, bosses) {
        // 吸引普通敌人
        enemies.forEach(e => {
            if (!e.markedForDeletion) {
                const dx = this.x - e.x;
                const dy = this.y - e.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < this.pullRadius && dist > 5) {
                    const pullForce = (1 - dist / this.pullRadius) * 3;
                    e.x += (dx / dist) * pullForce;
                    e.y += (dy / dist) * pullForce;
                }
            }
        });
        
        // 吸引Boss（力度减半）
        bosses.forEach(boss => {
            if (!boss.markedForDeletion) {
                const dx = this.x - boss.x;
                const dy = this.y - boss.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < this.pullRadius && dist > 10) {
                    const pullForce = (1 - dist / this.pullRadius) * 1.5;
                    boss.x += (dx / dist) * pullForce;
                    boss.y += (dy / dist) * pullForce;
                }
            }
        });
    }
    
    damageEnemiesInRange(enemies, bosses) {
        enemies.forEach(e => {
            if (!e.markedForDeletion) {
                const dx = e.x - this.x;
                const dy = e.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < this.radius + e.radius) {
                    e.takeDamage(this.damage, 0, 0, this);
                }
            }
        });
        
        bosses.forEach(boss => {
            if (!boss.markedForDeletion) {
                const dx = boss.x - this.x;
                const dy = boss.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < this.radius + boss.radius) {
                    boss.takeDamage(this.damage, 0, 0);
                }
            }
        });
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        
        ctx.save();
        
        // 吸附范围
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = '#6600cc';
        ctx.beginPath();
        ctx.arc(x, y, this.pullRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // 漩涡粒子
        ctx.globalAlpha = 0.6;
        this.particles.forEach(p => {
            const px = p.x - camX;
            const py = p.y - camY;
            const size = 2 + (p.life / 30) * 3;
            ctx.fillStyle = `rgba(153, 51, 255, ${p.life / 30})`;
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // 外圈光环
        ctx.globalAlpha = 0.5;
        const gradient = ctx.createRadialGradient(x, y, this.radius * 0.5, x, y, this.radius * 1.2);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.5, 'rgba(102, 0, 204, 0.5)');
        gradient.addColorStop(0.8, 'rgba(153, 51, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(153, 51, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, this.radius * 1.2, 0, Math.PI * 2);
        ctx.fill();
        
        // 核心
        ctx.globalAlpha = 1;
        const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, this.radius);
        coreGradient.addColorStop(0, '#000000');
        coreGradient.addColorStop(0.6, '#1a0033');
        coreGradient.addColorStop(1, '#330066');
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(x, y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 旋转光环
        ctx.strokeStyle = '#cc66ff';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.7;
        for (let i = 0; i < 3; i++) {
            const ringAngle = this.rotationAngle + (Math.PI * 2 / 3) * i;
            ctx.beginPath();
            ctx.arc(x, y, this.radius * 0.7, ringAngle, ringAngle + Math.PI * 0.5);
            ctx.stroke();
        }
        
        // 中心亮点
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, this.radius * 0.1, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// 注册技能
SkillRegistry.registerMagic(new BlackHoleSkill());
