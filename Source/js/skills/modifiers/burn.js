// --- 灼烧 ---

class BurnModifier extends ModifierSkill {
    constructor() {
        super({
            id: 'burn',
            name: '灼烧',
            icon: '🔶',
            desc: '附带灼烧效果，持续伤害'
        });
    }
    
    modify(mods, star) {
        mods.burning = true;
        mods.burnDamage = (mods.burnDamage || 0) + 3;
    }
}

// 注册技能
SkillRegistry.registerModifier(new BurnModifier());
