// --- 生命强化 ---

class ExtraHpPerk extends Perk {
    constructor() {
        super({
            id: 'extra_hp',
            name: '生命强化',
            icon: '❤️',
            desc: '最大生命+20',
            stackable: true
        });
    }
    
    apply(player, level) {
        player.maxHp += 20 * level;
        player.hp += 20 * level;
    }
}

// 注册祝福
SkillRegistry.registerPerk(new ExtraHpPerk());
