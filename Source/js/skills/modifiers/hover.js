// --- 悬停 ---

class HoverModifier extends ModifierSkill {
    constructor() {
        super({
            id: 'hover',
            name: '悬停',
            icon: '⏸️',
            desc: '命中后停留0.5秒，伤害-30%'
        });
    }
    
    modify(mods, star) {
        mods.hover = true;
        mods.hoverDuration = (mods.hoverDuration || 0) + 30;
        mods.damage = (mods.damage || 1) * 0.7;
    }
}

// 注册技能
SkillRegistry.registerModifier(new HoverModifier());
