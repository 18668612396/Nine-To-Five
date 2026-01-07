// --- 分裂 ---

class SplitModifier extends ModifierSkill {
    constructor() {
        super({
            id: 'split',
            name: '分裂',
            icon: '✴️',
            desc: '命中敌人后分裂3个小弹(30%伤害)'
        });
    }
    
    modify(mods, star) {
        mods.splitOnHit = true;
        mods.splitAmount = (mods.splitAmount || 0) + 3;
        mods.splitDamageMult = 0.3;
    }
}

// 注册技能
SkillRegistry.registerModifier(new SplitModifier());
