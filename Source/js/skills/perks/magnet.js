// --- 磁铁 ---

class MagnetPerk extends Perk {
    constructor() {
        super({
            id: 'magnet',
            name: '磁铁',
            icon: '🧲',
            desc: '拾取范围+30%',
            stackable: true
        });
    }
    
    apply(player, level) {
        // 基于基础拾取范围100计算加成
        player.pickupRange = 100 * (1 + 0.3 * Perk.Manager.getPerkLevel('magnet'));
    }
    
    getDesc(level) {
        return `拾取范围+${30 * level}%`;
    }
}

// 注册祝福
SkillRegistry.registerPerk(new MagnetPerk());
