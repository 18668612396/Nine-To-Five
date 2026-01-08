// --- 生命再生 ---

class RegenerationPerk extends Perk {
    constructor() {
        super({
            id: 'regeneration',
            name: '生命再生',
            icon: '💚',
            desc: '每秒恢复0.5生命',
            stackable: true
        });
    }
    
    apply(player, level) {
        player.regen += 0.5 * level;
    }
    
    getDesc(level) {
        return `每秒恢复${0.5 * level}生命`;
    }
}

// 注册祝福
SkillRegistry.registerPerk(new RegenerationPerk());
