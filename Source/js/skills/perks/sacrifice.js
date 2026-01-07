// --- 献祭 ---

class SacrificePerk extends Perk {
    constructor() {
        super({
            id: 'sacrifice',
            name: '献祭',
            icon: '🔥',
            desc: '周围产生献祭火焰',
            stackable: true
        });
    }
    
    apply(player, level) {
        player.damageAura = (player.damageAura || 0) + 5 * level;
    }
}

// 注册祝福
SkillRegistry.registerPerk(new SacrificePerk());
