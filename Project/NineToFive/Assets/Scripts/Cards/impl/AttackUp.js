class AttackUp extends Card {
    constructor() {
        super('atk_up', '磨锋利爪', '增加 10% 基础攻击力', 'common');
        this.icon = '⚔️';
    }

    apply(game) {
        if (game.player) {
            game.player.baseStats.damage += 2; // Flat increase for now or percentage
            game.player.recalcStats();
            console.log('Applied AttackUp');
        }
    }
}
