// --- 疾风 ---

class MovementSpeedPerk extends Perk {
    constructor() {
        super({
            id: 'movement_speed',
            name: '疾风',
            icon: '🏃',
            desc: '移动速度+15%',
            stackable: true
        });
    }
    
    apply(player, level) {
        // 基于基础速度4计算加成
        player.speed = 4 * (1 + 0.15 * this.getTotalLevel(player));
    }
    
    getTotalLevel(player) {
        return Perk.Manager.getPerkLevel('movement_speed');
    }
    
    getDesc(level) {
        return `移动速度+${15 * level}%`;
    }
}

// 注册祝福
SkillRegistry.registerPerk(new MovementSpeedPerk());
