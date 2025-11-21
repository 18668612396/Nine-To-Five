class CardManager {
    constructor() {
        this.pool = [
            new AttackUp(),
            new SpeedUp(),
            new Heal(),
            new MultiShot()
        ];
    }

    // Get n random cards
    getChoices(n = 3) {
        const choices = [];
        const poolCopy = [...this.pool]; // Shallow copy
        
        for (let i = 0; i < n; i++) {
            if (poolCopy.length === 0) break;
            const idx = Math.floor(Math.random() * poolCopy.length);
            choices.push(poolCopy[idx]);
            // For now, we don't remove from pool so duplicates are possible in choices? 
            // Usually in survivors you get 3 different choices.
            poolCopy.splice(idx, 1); 
        }
        
        // If we ran out of unique cards (pool small), just return what we have
        return choices;
    }
}
