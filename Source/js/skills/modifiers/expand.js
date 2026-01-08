// --- 拓展 ---

class ExpandModifier extends ModifierSkill {
    constructor() {
        super({
            id: 'expand',
            name: '拓展',
            icon: '📦',
            desc: '增加4个技能槽，但伤害降低(1星-50%/2星-40%/3星-30%)'
        });
    }
    
    modify(mods, star) {
        // 伤害降低
        const damageReduction = { 1: 0.5, 2: 0.6, 3: 0.7 };
        mods.damage *= (damageReduction[star] || 0.5);
        // 标记需要扩展槽位
        mods.expandSlots = (mods.expandSlots || 0) + 4;
    }
}

// 注册技能
SkillRegistry.registerModifier(new ExpandModifier());
