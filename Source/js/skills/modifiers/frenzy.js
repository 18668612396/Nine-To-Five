// --- 狂暴 ---

class FrenzyModifier extends ModifierSkill {
    constructor() {
        super({
            id: 'frenzy',
            name: '狂暴',
            icon: '😈',
            desc: '持续攻击同一敌人时冷却递减'
        });
    }
    
    modify(mods, star) {
        mods.frenzy = true;
        mods.frenzyReduction = (mods.frenzyReduction || 0) + 0.05;
    }
}

// 注册技能
SkillRegistry.registerModifier(new FrenzyModifier());
