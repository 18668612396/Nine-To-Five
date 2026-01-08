// --- 伤害提升 ---

class DamageBoostPerk extends Perk {
    constructor() {
        super({
            id: 'damage_boost',
            name: '伤害提升',
            icon: '⚔️',
            desc: '所有伤害+15%',
            stackable: true
        });
    }
    
    apply(player, level) {
        player.damageMult += 0.15 * level;
    }
    
    getDesc(level) {
        return `所有伤害+${15 * level}%`;
    }
}

// 注册祝福
SkillRegistry.registerPerk(new DamageBoostPerk());
