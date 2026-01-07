// --- 光之柱 ---

class LightPillarModifier extends ModifierSkill {
    constructor() {
        super({
            id: 'light_pillar',
            name: '光之柱',
            icon: '🌟',
            desc: '召唤光柱1秒，冷却+20%'
        });
    }
    
    modify(mods, star) {
        mods.lightPillar = true;
        mods.pillarDamage = (mods.pillarDamage || 0) + 8;
        mods.cooldownMult = (mods.cooldownMult || 1) * 1.2;
    }
}

// 注册技能
SkillRegistry.registerModifier(new LightPillarModifier());
