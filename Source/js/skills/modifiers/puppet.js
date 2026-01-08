// --- 傀儡娃娃 ---
// 使非主法杖可以自动发射，但有减益效果

class PuppetModifier extends ModifierSkill {
    constructor() {
        super({
            id: 'puppet',
            name: '傀儡娃娃',
            icon: '🎎',
            desc: '使该法杖可由傀儡自动释放，伤害-50%，能量回复-50%'
        });
    }
    
    getDesc(star) {
        const damageReduction = { 1: 50, 2: 40, 3: 30 };
        const energyReduction = { 1: 50, 2: 40, 3: 30 };
        return `使该法杖可由傀儡自动释放，伤害-${damageReduction[star]}%，能量回复-${energyReduction[star]}%`;
    }
    
    modify(mods, star) {
        // 伤害降低
        const damageReduction = { 1: 0.5, 2: 0.6, 3: 0.7 };
        mods.damage *= (damageReduction[star] || 0.5);
        
        // 标记为傀儡技能（用于能量回复减益）
        mods.isPuppetCast = true;
        mods.puppetEnergyMult = damageReduction[star] || 0.5;
    }
}

// 注册技能
SkillRegistry.registerModifier(new PuppetModifier());
