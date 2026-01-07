// --- 能量球 ---

class EnergyOrbSkill extends MagicSkill {
    constructor() {
        super({
            id: 'energy_orb',
            name: '能量球',
            icon: '💠',
            desc: '缓慢但强力的能量球',
            cooldown: 40,
            energyCost: 1
        });
    }
    
    createProjectile(caster, mods) {
        return new PlasmaProjectile(caster, mods);
    }
}

class PlasmaProjectile extends SkillProjectile {
    constructor(caster, mods) {
        super(caster, mods);
        this.damage = 35 * (mods.damage || 1);
        this.speed = 6 * (mods.speed || 1);
        this.radius = 14 * this.sizeScale;
        this.color = '#ff00ff';
        this.duration = 150;
        this.penetrate = Math.max(5, mods.penetrate || 5);
        this.pulsePhase = 0;
    }
    
    update() {
        super.update();
        this.pulsePhase += 0.2;
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX, y = this.y - camY;
        const pulse = Math.sin(this.pulsePhase) * 3 * this.sizeScale;
        ctx.save();
        const g = ctx.createRadialGradient(x, y, 0, x, y, this.radius + 10 * this.sizeScale + pulse);
        g.addColorStop(0, 'rgba(255,100,255,0.9)');
        g.addColorStop(0.5, 'rgba(255,0,255,0.4)');
        g.addColorStop(1, 'rgba(200,0,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, this.radius + 10 * this.sizeScale + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 注册技能
SkillRegistry.registerMagic(new EnergyOrbSkill());
