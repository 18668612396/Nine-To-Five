// --- 符文战锤 ---

class RuneHammerModifier extends ModifierSkill {
    constructor() {
        super({
            id: 'rune_hammer',
            name: '符文战锤',
            icon: '🔨',
            desc: '法术环绕角色攻击'
        });
    }
    
    modify(mods, star) {
        mods.orbital = true;
        mods.orbitalCount = (mods.orbitalCount || 0) + 1;
    }
}

// 注册技能
SkillRegistry.registerModifier(new RuneHammerModifier());
