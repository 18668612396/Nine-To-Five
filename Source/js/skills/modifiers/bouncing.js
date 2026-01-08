// --- 弹射 ---

class BouncingModifier extends ModifierSkill {
    constructor() {
        super({
            id: 'bouncing',
            name: '弹射',
            icon: '🔀',
            desc: '弹射到范围内随机敌人(1星+2次/2星+4次/3星+6次，范围300/450/600)'
        });
    }
    
    modify(mods, star) {
        const bounceValues = { 1: 2, 2: 4, 3: 6 };
        const rangeValues = { 1: 300, 2: 450, 3: 600 };
        mods.bounceCount = (mods.bounceCount || 0) + (bounceValues[star] || 2);
        mods.bounceRange = (mods.bounceRange || 0) + (rangeValues[star] || 300);
        // 弹射是移动类效果，会覆盖环绕
        mods.orbital = false;
    }
}

// 注册技能
SkillRegistry.registerModifier(new BouncingModifier());
