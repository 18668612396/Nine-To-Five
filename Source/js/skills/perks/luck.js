// --- 幸运 ---

class LuckPerk extends Perk {
    constructor() {
        super({
            id: 'luck',
            name: '幸运',
            icon: '🍀',
            desc: '技能掉落率+25%',
            stackable: true
        });
    }
    
    apply(player, level) {
        player.dropRate = (player.dropRate || 1) + 0.25 * level;
    }
    
    getDesc(level) {
        return `技能掉落率+${25 * level}%`;
    }
}

// 注册祝福
SkillRegistry.registerPerk(new LuckPerk());
