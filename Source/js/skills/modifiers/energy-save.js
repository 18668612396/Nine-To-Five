// --- 节能 ---

class EnergySaveModifier extends ModifierSkill {
    constructor() {
        super({
            id: 'energy_save',
            name: '节能',
            icon: '🔋',
            desc: '减少能量消耗(1星-15%/2星-25%/3星-35%)'
        });
    }
    
    modify(mods, star) {
        const reductionValues = { 1: 0.15, 2: 0.25, 3: 0.35 };
        mods.costReductionPercent = (mods.costReductionPercent || 0) + (reductionValues[star] || 0.15);
    }
}

// 注册技能
SkillRegistry.registerModifier(new EnergySaveModifier());
