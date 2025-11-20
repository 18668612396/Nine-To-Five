class Card {
    constructor(id, name, description, rarity = 'common') {
        this.id = id;
        this.name = name;
        this.description = description;
        this.rarity = rarity; // common, rare, epic, legendary
        this.icon = '🃏'; // Default icon
    }

    // Apply effect to the player or game state
    apply(game) {
        console.warn('Card apply method not implemented');
    }
}
