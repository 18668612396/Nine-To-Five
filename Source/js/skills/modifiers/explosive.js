// --- 爆炸 ---

class ExplosiveModifier extends ModifierSkill {
    constructor() {
        super({
            id: 'explosive',
            name: '爆炸',
            icon: '💥',
            desc: '击杀敌人时产生爆炸'
        });
    }
    
    modify(mods, star) {
        mods.explosiveOnKill = true;
        mods.explosionRadius = (mods.explosionRadius || 30) + 30;
    }
}

// 注册技能
SkillRegistry.registerModifier(new ExplosiveModifier());
