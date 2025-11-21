class Heal extends Card {
    constructor() {
        super('heal', '午睡时间', '立即恢复 30% 最大生命值', 'common');
        this.icon = '💤';
    }

    apply(game) {
        if (game.player) {
            const healAmount = game.player.maxHp * 0.3;
            game.player.hp = Math.min(game.player.hp + healAmount, game.player.maxHp);
            console.log('Applied Heal');
        }
    }
}
