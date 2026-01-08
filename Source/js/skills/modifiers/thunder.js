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
        // 必定触发，星级影响伤害倍率
        mods.lightningDamageMult = (mods.lightningDamageMult || 0) + 0.3 + star * 0.2;
    }
}

// 注册技能
SkillRegistry.registerModifier(new ThunderModifier());
