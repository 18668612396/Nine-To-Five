// --- 膨胀 ---

class EnlargeModifier extends ModifierSkill {
    constructor() {
        super({
            id: 'enlarge',
            name: '膨胀',
            icon: '🎈',
            desc: '技能体积+25%'
        });
    }
    
    modify(mods, star) {
        mods.sizeScale = (mods.sizeScale || 1) * 1.25;
    }
}

// 注册技能
SkillRegistry.registerModifier(new EnlargeModifier());
