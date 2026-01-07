// --- 攻击速度 ---

class AttackSpeedPerk extends Perk {
    constructor() {
        super({
            id: 'attack_speed',
            name: '攻击速度',
            icon: '⚡',
            desc: '施法冷却-10%',
            stackable: true
        });
    }
    
    apply(player, level) {
        player.cooldownMult *= Math.pow(0.9, level);
    }
}

// 注册祝福
SkillRegistry.registerPerk(new AttackSpeedPerk());
