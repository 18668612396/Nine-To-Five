// --- 火球术 ---

class FireballSkill extends MagicSkill {
    constructor() {
        super({
            id: 'fireball',
            name: '火球术',
            icon: '🔥',
            desc: '燃烧的火球，伤害18',
            cooldown: 25,
            energyCost: 2
        });
    }
    
    createProjectile(caster, mods) {
        return new FireballProjectile(caster, mods);
    }
}

class FireballProjectile extends SkillProjectile {
    constructor(caster, mods) {
        super(caster, mods);
        this.damage = 18 * (mods.damage || 1);
        this.speed = 7 * (mods.speed || 1);  // 中速
        this.radius = 8 * this.sizeScale;
        this.color = '#ff6600';
        this.duration = 120;
        this.trailTimer = 0;
    }
    
    update() {
        super.update();
        this.trailTimer++;
        if (this.trailTimer % 3 === 0) {
            Events.emit(EVENT.PARTICLES, {
                x: this.x, y: this.y,
                count: 1,
                color: '#ff6600',
                altColor: '#ffaa00',
                spread: 2,
                size: (3 + Math.random() * 3) * this.sizeScale
            });
        }
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX, y = this.y - camY;
        ctx.save();
        const g = ctx.createRadialGradient(x, y, 0, x, y, this.radius * 2);
        g.addColorStop(0, 'rgba(255,150,0,0.8)');
        g.addColorStop(0.5, 'rgba(255,100,0,0.3)');
        g.addColorStop(1, 'rgba(255,50,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, this.radius * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(x, y, this.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 注册技能
SkillRegistry.registerMagic(new FireballSkill());
