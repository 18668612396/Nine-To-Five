// --- 魔导弹 ---

class MagicMissileSkill extends MagicSkill {
    constructor() {
        super({
            id: 'magic_missile',
            name: '魔导弹',
            icon: '🚀',
            desc: '追踪敌人的导弹，伤害20',
            cooldown: 35,
            energyCost: 3
        });
    }
    
    createProjectile(caster, mods) {
        return new MissileProjectile(caster, mods);
    }
}

class MissileProjectile extends SkillProjectile {
    constructor(caster, mods) {
        super(caster, mods);
        this.damage = 20 * (mods.damage || 1);
        this.speed = 4 * (mods.speed || 1);  // 慢速追踪
        this.radius = 6 * this.sizeScale;
        this.duration = 240;
        this.homing = true;
        this.turnSpeed = Math.max(0.03, mods.turnSpeed || 0.03);
        this.trailParticles = [];
    }
    
    update() {
        super.update();
        this.trailParticles.push({
            x: this.x - this.dx * 10,
            y: this.y - this.dy * 10,
            life: 12
        });
        this.trailParticles = this.trailParticles.filter(p => p.life-- > 0);
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX, y = this.y - camY;
        const angle = Math.atan2(this.dy, this.dx);
        const s = this.sizeScale;
        
        ctx.save();
        // 尾迹
        this.trailParticles.forEach(p => {
            ctx.fillStyle = `rgba(255,100,0,${p.life/12})`;
            ctx.beginPath();
            ctx.arc(p.x - camX, p.y - camY, 4 * s * p.life / 12, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // 导弹本体
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI / 2);
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.moveTo(0, -10 * s);
        ctx.lineTo(-5 * s, 8 * s);
        ctx.lineTo(5 * s, 8 * s);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ff4400';
        ctx.beginPath();
        ctx.arc(0, -5 * s, 3 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 注册技能
SkillRegistry.registerMagic(new MagicMissileSkill());
