// --- 拓展 ---

class ExpandModifier extends ModifierSkill {
    constructor() {
        super({
            id: 'expand',
            name: '拓展',
            icon: '📦',
            desc: '增加4个技能槽'
        });
    }
    
    // 获取当前星级的描述
    getDesc(star) {
        const damageReduction = { 1: 50, 2: 40, 3: 30 };
        return `增加4个技能槽，伤害-${damageReduction[star] || 50}%`;
    }
    
    modify(mods, star) {
        // 伤害降低
        const damageReduction = { 1: 0.5, 2: 0.6, 3: 0.7 };
        mods.damage *= (damageReduction[star] || 0.5);
    }
}

// 注册技能
SkillRegistry.registerModifier(new ExpandModifier());
