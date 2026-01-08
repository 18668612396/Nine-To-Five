// --- 追踪 ---

class HomingModifier extends ModifierSkill {
    constructor() {
        super({
            id: 'homing',
            name: '追踪',
            icon: '🎯',
            desc: '投射物追踪敌人'
        });
    }
    
    modify(mods, star) {
        mods.homing = true;
        mods.turnSpeed = (mods.turnSpeed || 0) + 0.05;
        // 追踪是移动类效果，会覆盖环绕
        mods.orbital = false;
    }
}

// 注册技能
SkillRegistry.registerModifier(new HomingModifier());
