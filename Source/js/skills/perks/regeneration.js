// --- 生命再生 ---

class RegenerationPerk extends Perk {
    constructor() {
        super({
            id: 'regeneration',
            name: '生命再生',
            icon: '💚',
            desc: '每秒恢复生命',
            stackable: true
        });
    }
    
    apply(player, level) {
        player.regen += 0.5 * level;
    }
}

// 注册祝福
SkillRegistry.registerPerk(new RegenerationPerk());
