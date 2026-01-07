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
        player.speed *= Math.pow(1.15, level);
    }
}

// 注册祝福
SkillRegistry.registerPerk(new MovementSpeedPerk());
