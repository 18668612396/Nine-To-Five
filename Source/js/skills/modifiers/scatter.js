// --- 散射 ---

class ScatterModifier extends ModifierSkill {
    constructor() {
        super({
            id: 'scatter',
            name: '散射',
            icon: '🔱',
            desc: '同时发射3个投射物'
        });
    }
    
    modify(mods, star) {
        mods.splitCount = (mods.splitCount || 1) + 2;
    }
}

// 注册技能
SkillRegistry.registerModifier(new ScatterModifier());
