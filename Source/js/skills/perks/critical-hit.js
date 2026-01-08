// --- 暴击 ---

class CriticalHitPerk extends Perk {
    constructor() {
        super({
            id: 'critical_hit',
            name: '暴击',
            icon: '💢',
            desc: '10%几率双倍伤害',
            stackable: true
        });
    }
    
    apply(player, level) {
        player.critChance = (player.critChance || 0) + 0.1 * level;
    }
    
    getDesc(level) {
        return `${10 * level}%几率双倍伤害`;
    }
}

// 注册祝福
SkillRegistry.registerPerk(new CriticalHitPerk());
