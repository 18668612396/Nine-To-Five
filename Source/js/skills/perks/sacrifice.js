// --- 献祭 ---

class SacrificePerk extends Perk {
    constructor() {
        super({
            id: 'sacrifice',
            name: '献祭',
            icon: '🔥',
            desc: '周围产生献祭火焰，每秒5伤害',
            stackable: true
        });
    }
    
    apply(player, level) {
        player.damageAura = (player.damageAura || 0) + 5 * level;
    }
    
    getDesc(level) {
        return `周围产生献祭火焰，每秒${5 * level}伤害`;
    }
}

// 注册祝福
SkillRegistry.registerPerk(new SacrificePerk());
