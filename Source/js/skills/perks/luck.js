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
        player.dropRate = (player.dropRate || 1) * Math.pow(1.25, level);
    }
}

// 注册祝福
SkillRegistry.registerPerk(new LuckPerk());
