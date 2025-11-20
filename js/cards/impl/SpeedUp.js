class SpeedUp extends Card {
    constructor() {
        super('spd_up', '猫步轻俏', '增加 10% 移动速度', 'common');
        this.icon = '👟';
    }

    apply(game) {
        if (game.player) {
            game.player.baseStats.speed += 0.5;
            game.player.recalcStats();
            console.log('Applied SpeedUp');
        }
    }
}
