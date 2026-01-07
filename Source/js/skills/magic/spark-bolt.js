// --- 火花弹 ---

class SparkBoltSkill extends MagicSkill {
    constructor() {
        super({
            id: 'spark_bolt',
            name: '火花弹',
            icon: '✨',
            desc: '快速的小型魔法弹',
            cooldown: 8,
            energyCost: 1
        });
    }
    
    createProjectile(caster, mods) {
        return new SparkProjectile(caster, mods);
    }
}

class SparkProjectile extends SkillProjectile {
    constructor(caster, mods) {
        super(caster, mods);
        this.damage = 5 * (mods.damage || 1);
        this.speed = 14 * (mods.speed || 1);
        this.radius = 4 * this.sizeScale;
        this.color = '#ffff00';
        this.duration = 60;
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX, y = this.y - camY;
        ctx.save();
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 8 * this.sizeScale;
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(x, y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 注册技能
SkillRegistry.registerMagic(new SparkBoltSkill());
