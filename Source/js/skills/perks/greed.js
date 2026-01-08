// --- 贪婪 ---

class GreedPerk extends Perk {
    constructor() {
        super({
            id: 'greed',
            name: '贪婪',
            icon: '💰',
            desc: '经验获取+20%',
            stackable: true
        });
    }
    
    apply(player, level) {
        player.xpMult = (player.xpMult || 1) + 0.2 * level;
    }
    
    getDesc(level) {
        return `经验获取+${20 * level}%`;
    }
}

// 注册祝福
SkillRegistry.registerPerk(new GreedPerk());
