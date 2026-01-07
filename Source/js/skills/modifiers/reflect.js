// --- 反弹 ---

class ReflectModifier extends ModifierSkill {
    constructor() {
        super({
            id: 'reflect',
            name: '反弹',
            icon: '↩️',
            desc: '反弹3次，每次伤害-20%'
        });
    }
    
    modify(mods, star) {
        mods.reflect = true;
        mods.reflectCount = (mods.reflectCount || 0) + 3;
        mods.reflectDamageDecay = 0.8;
    }
}

// 注册技能
SkillRegistry.registerModifier(new ReflectModifier());
