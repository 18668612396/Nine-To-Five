// --- 中毒 ---

class PoisonModifier extends ModifierSkill {
    constructor() {
        super({
            id: 'poison',
            name: '中毒',
            icon: '☠️',
            desc: '附带中毒效果，叠加伤害'
        });
    }
    
    modify(mods, star) {
        mods.poison = true;
        mods.poisonStacks = (mods.poisonStacks || 0) + 4;
    }
}

// 注册技能
SkillRegistry.registerModifier(new PoisonModifier());
