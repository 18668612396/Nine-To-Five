// --- 落雷 ---

class ThunderModifier extends ModifierSkill {
    constructor() {
        super({
            id: 'thunder',
            name: '落雷',
            icon: '⚡',
            desc: '击中敌人时落下金色闪电'
        });
    }
    
    modify(mods, star) {
        mods.lightning = true;
        mods.lightningChance = (mods.lightningChance || 0) + 0.2;
    }
}

// 注册技能
SkillRegistry.registerModifier(new ThunderModifier());
