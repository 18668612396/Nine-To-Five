// --- 魔法箭 ---

class MagicArrowSkill extends MagicSkill {
    constructor() {
        super({
            id: 'magic_arrow',
            name: '魔法箭',
            icon: '➤',
            desc: '精准的魔法箭矢',
            cooldown: 12,
            energyCost: 1
        });
    }
    
    createProjectile(caster, mods) {
        return new LaserProjectile(caster, mods);
    }
}

class LaserProjectile extends SkillProjectile {
    constructor(caster, mods) {
        super(caster, mods);
        this.damage = 8 * (mods.damage || 1);
        this.speed = 18 * (mods.speed || 1);
        this.radius = 4 * this.sizeScale;
        this.color = '#00ffff';
        this.duration = 90;
        this.length = 20 * this.sizeScale;
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX, y = this.y - camY;
        const angle = Math.atan2(this.dy, this.dx);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 10 * this.sizeScale;
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(-this.length, -2 * this.sizeScale, this.length * 2, 4 * this.sizeScale);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-this.length + 2, -1 * this.sizeScale, this.length * 2 - 4, 2 * this.sizeScale);
        ctx.restore();
    }
}

// 注册技能
SkillRegistry.registerMagic(new MagicArrowSkill());
