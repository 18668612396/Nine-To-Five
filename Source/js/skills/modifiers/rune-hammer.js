// --- 环绕 ---

class RuneHammerModifier extends ModifierSkill {
    constructor() {
        super({
            id: 'rune_hammer',
            name: '环绕',
            icon: '🔄',
            desc: '法术环绕角色攻击'
        });
    }
    
    modify(mods, star) {
        // 环绕是移动类效果，会被其他移动类效果覆盖
        mods.orbital = true;
        mods.orbitalCount = (mods.orbitalCount || 0) + 1;
        // 禁用与环绕冲突的效果
        mods.reflect = false;
        mods.reflectCount = 0;
        mods.bounceCount = 0;
        mods.homing = false;
    }
}

// 注册技能
SkillRegistry.registerModifier(new RuneHammerModifier());
