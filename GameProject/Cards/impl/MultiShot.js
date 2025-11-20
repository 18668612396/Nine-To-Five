class MultiShot extends Card {
    constructor() {
        super('multi_shot', '多重影分身', '武器发射数量 +1 (稀有)', 'rare');
        this.icon = '👥';
    }

    apply(game) {
        if (game.player && game.player.equipment.weapon) {
            if (!game.player.equipment.weapon.count) game.player.equipment.weapon.count = 1;
            game.player.equipment.weapon.count += 1;
            
            // Add some spread if not present
            if (!game.player.equipment.weapon.spread) game.player.equipment.weapon.spread = 0.2;
            else game.player.equipment.weapon.spread += 0.2;

            console.log('Applied MultiShot');
        }
    }
}
