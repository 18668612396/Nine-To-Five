// --- 伤害增幅 ---

class DamagePlusModifier extends ModifierSkill {
    constructor() {
        super({
            id: 'damage_plus',
            name: '伤害增幅',
            icon: '💪',
            desc: '伤害+50%'
        });
    }
    
    modify(mods, star) {
        mods.damage = (mods.damage || 1) * 1.5;
    }
}

// 注册技能
SkillRegistry.registerModifier(new DamagePlusModifier());
