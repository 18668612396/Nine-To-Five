// --- 吸血 ---

class VampirismPerk extends Perk {
    constructor() {
        super({
            id: 'vampirism',
            name: '吸血',
            icon: '🧛',
            desc: '击杀敌人恢复生命',
            stackable: true
        });
    }
    
    apply(player, level) {
        player.vampirism = (player.vampirism || 0) + 2 * level;
    }
}

// 注册祝福
SkillRegistry.registerPerk(new VampirismPerk());
