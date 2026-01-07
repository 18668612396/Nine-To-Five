// --- 牵引 ---

class PullModifier extends ModifierSkill {
    constructor() {
        super({
            id: 'pull',
            name: '牵引',
            icon: '🌀',
            desc: '击中敌人时拉扯周围敌人'
        });
    }
    
    modify(mods, star) {
        mods.pull = true;
        mods.pullRange = (mods.pullRange || 80) + 40;
        mods.pullStrength = (mods.pullStrength || 0) + 5;
    }
}

// 注册技能
SkillRegistry.registerModifier(new PullModifier());
