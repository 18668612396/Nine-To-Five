// --- 急速施法 ---

class ReduceCooldownModifier extends ModifierSkill {
    constructor() {
        super({
            id: 'reduce_cooldown',
            name: '急速施法',
            icon: '⏱️',
            desc: '冷却时间-30%'
        });
    }
    
    modify(mods, star) {
        mods.cooldownMult = (mods.cooldownMult || 1) * 0.7;
    }
}

// 注册技能
SkillRegistry.registerModifier(new ReduceCooldownModifier());
