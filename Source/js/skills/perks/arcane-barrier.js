// --- 奥术屏障 ---

class ArcaneBarrierPerk extends Perk {
    constructor() {
        super({
            id: 'arcane_barrier',
            name: '奥术屏障',
            icon: '🛡️',
            desc: '击杀敌人时获得1护盾',
            stackable: true
        });
    }
    
    apply(player, level) {
        player.shieldOnKill = (player.shieldOnKill || 0) + 1 * level;
    }
}

// 注册祝福
SkillRegistry.registerPerk(new ArcaneBarrierPerk());
