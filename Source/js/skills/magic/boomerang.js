// --- 回旋镖 ---

class BoomerangSkill extends MagicSkill {
    constructor() {
        super({
            id: 'boomerang',
            name: '回旋镖',
            icon: '🪃',
            desc: '飞出后返回，去程回程都能造成伤害',
            cooldown: 25,
            energyCost: 2
        });
    }
    
    createProjectile(caster, mods) {
        // 回旋镖不受环绕影响
        const boomerangMods = { ...mods, orbital: false };
        return new BoomerangProjectile(caster, boomerangMods);
    }
}

class BoomerangProjectile extends SkillProjectile {
    constructor(caster, mods) {
        super(caster, mods);
        const star = mods.star || 1;
        this.damage = 12 * (mods.damage || 1) * (1 + (star - 1) * 0.3);
        this.speed = 10 * (mods.speed || 1);
        this.radius = 10 * this.sizeScale;
        this.duration = 300;
        this.penetrate = 999;
        
        // 强制禁用环绕
        this.orbital = false;
        
        // 回旋镖特有属性
        this.phase = 'outgoing'; // outgoing, returning
        this.maxDistance = (150 + star * 30) * this.sizeScale;
        this.traveledDistance = 0;
        this.caster = caster;
        this.rotation = 0;
        this.rotationSpeed = 0.3;
        this.startX = caster.x;
        this.startY = caster.y;
        
        // 命中记录（去程和回程分开）
        this.outgoingHits = [];
        this.returningHits = [];
    }
    
    update() {
        this.rotation += this.rotationSpeed;
        
        if (this.phase === 'outgoing') {
            // 去程
            this.x += this.dx * this.speed;
            this.y += this.dy * this.speed;
            this.traveledDistance += this.speed;
            
            // 到达最大距离，开始返回
            if (this.traveledDistance >= this.maxDistance) {
                this.phase = 'returning';
            }
        } else {
            // 回程 - 追踪施法者
            const dx = this.caster.x - this.x;
            const dy = this.caster.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 10) {
                this.dx = dx / dist;
                this.dy = dy / dist;
                this.x += this.dx * this.speed * 1.2; // 回程稍快
                this.y += this.dy * this.speed * 1.2;
            }
            
            // 返回到施法者身边
            if (dist < 30) {
                this.markedForDeletion = true;
            }
        }
        
        // 检测碰撞
        this.checkCollisions();
        
        this.duration--;
        if (this.duration <= 0) {
            this.markedForDeletion = true;
        }
    }
    
    checkCollisions() {
        const enemies = SkillProjectile.enemies || [];
        const bosses = SkillProjectile.bosses || [];
        const hitList = this.phase === 'outgoing' ? this.outgoingHits : this.returningHits;
        
        [...enemies, ...bosses].forEach(e => {
            if (e.markedForDeletion || hitList.includes(e)) return;
            
            const dx = e.x - this.x;
            const dy = e.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < this.radius + e.radius) {
                e.takeDamage(this.damage, this.dx * 3, this.dy * 3, this);
                hitList.push(e);
                
                Events.emit(EVENT.PARTICLES, {
                    x: e.x, y: e.y,
                    count: 4,
                    color: '#ffaa00',
                    spread: 3
                });
            }
        });
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.rotation);
        
        // 回旋镖形状
        const size = this.radius;
        
        // 主体渐变
        const gradient = ctx.createLinearGradient(-size, 0, size, 0);
        gradient.addColorStop(0, '#8B4513');
        gradient.addColorStop(0.5, '#D2691E');
        gradient.addColorStop(1, '#8B4513');
        
        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#5D3A1A';
        ctx.lineWidth = 2;
        
        // 绘制回旋镖形状（V形）
        ctx.beginPath();
        // 左翼
        ctx.moveTo(0, -size * 0.3);
        ctx.quadraticCurveTo(-size * 0.8, -size * 0.5, -size, 0);
        ctx.quadraticCurveTo(-size * 0.8, size * 0.3, 0, size * 0.3);
        // 右翼
        ctx.quadraticCurveTo(size * 0.8, size * 0.3, size, 0);
        ctx.quadraticCurveTo(size * 0.8, -size * 0.5, 0, -size * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // 高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.ellipse(-size * 0.5, -size * 0.1, size * 0.3, size * 0.1, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(size * 0.5, -size * 0.1, size * 0.3, size * 0.1, 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // 运动模糊效果
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#D2691E';
        ctx.lineWidth = 1;
        for (let i = 1; i <= 3; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, size + i * 3, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.restore();
    }
}

// 注册技能
SkillRegistry.registerMagic(new BoomerangSkill());
