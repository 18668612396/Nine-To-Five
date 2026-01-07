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
        player.pickupRange *= Math.pow(1.3, level);
    }
}

// 注册祝福
SkillRegistry.registerPerk(new MagnetPerk());
