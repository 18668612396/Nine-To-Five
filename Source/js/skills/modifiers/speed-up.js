// --- 加速 ---

class SpeedUpModifier extends ModifierSkill {
    constructor() {
        super({
            id: 'speed_up',
            name: '加速',
            icon: '💨',
            desc: '投射物速度+50%'
        });
    }
    
    modify(mods, star) {
        mods.speed = (mods.speed || 1) * 1.5;
    }
}

// 注册技能
SkillRegistry.registerModifier(new SpeedUpModifier());
