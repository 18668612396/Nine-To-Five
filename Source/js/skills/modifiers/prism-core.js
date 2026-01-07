// --- 棱镜核心 ---

class PrismCoreModifier extends ModifierSkill {
    constructor() {
        super({
            id: 'prism_core',
            name: '棱镜核心',
            icon: '💎',
            desc: '持续命中伤害递增'
        });
    }
    
    modify(mods, star) {
        mods.rampingDamage = true;
        mods.rampingRate = (mods.rampingRate || 0) + 0.1;
    }
}

// 注册技能
SkillRegistry.registerModifier(new PrismCoreModifier());
