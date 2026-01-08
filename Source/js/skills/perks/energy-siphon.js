// --- 能量虹吸 ---

class EnergySiphonPerk extends Perk {
    constructor() {
        super({
            id: 'energy_siphon',
            name: '能量虹吸',
            icon: '🔋',
            desc: '击中敌人恢复1点能量',
            stackable: true,
            maxLevel: 10
        });
    }
    
    apply(player, level) {
        player.energyOnHit = (player.energyOnHit || 0) + 1 * level;
    }
    
    getDesc(level) {
        return `击中敌人恢复${level}点能量`;
    }
}

// 注册祝福
SkillRegistry.registerPerk(new EnergySiphonPerk());
