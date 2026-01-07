// --- 穿透 ---

class PiercingModifier extends ModifierSkill {
    constructor() {
        super({
            id: 'piercing',
            name: '穿透',
            icon: '📍',
            desc: '穿透多个敌人(1星+3/2星+6/3星+10)'
        });
    }
    
    modify(mods, star) {
        const penetrateValues = { 1: 3, 2: 6, 3: 10 };
        mods.penetrate = (mods.penetrate || 1) + (penetrateValues[star] || 3);
    }
}

// 注册技能
SkillRegistry.registerModifier(new PiercingModifier());
