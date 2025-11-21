class LootManager extends GameBehaviour {
    constructor() {
        super('LootManager');
        this.activeLoots = [];
        this.lootContainer = null;
        window.lootManager = this;
    }

    start() {
        // Create Container for Loot
        this.lootContainer = new GameObject('LootContainer');
        if (window.game && window.game.sceneManager && window.game.sceneManager.activeScene) {
            window.game.sceneManager.activeScene.add(this.lootContainer);
        }
    }

    spawnLoot(x, y, type = 'exp', value = 10) {
        const go = new GameObject('Loot');
        
        // Set Parent
        if (this.lootContainer) {
            go.transform.setParent(this.lootContainer.transform);
        }

        const lootScript = new Loot();
        go.addComponent(lootScript);
        
        // Add to scene
        if (window.game && window.game.sceneManager && window.game.sceneManager.activeScene) {
            window.game.sceneManager.activeScene.add(go);
        }
        
        go.transform.x = x;
        go.transform.y = y;
        
        lootScript.init(type, value);
        
        this.activeLoots.push(go);
    }
    
    update(dt) {
        // Check for magnet effect
        if (!window.game || !window.game.player) return;
        
        const player = window.game.player;
        const magnetRadius = 100; // Pickup radius
        const magnetSpeed = 8;
        
        // Iterate backwards to safely remove
        for (let i = this.activeLoots.length - 1; i >= 0; i--) {
            const lootGO = this.activeLoots[i];
            
            if (lootGO.destroyed) {
                this.activeLoots.splice(i, 1);
                continue;
            }
            
            const dx = player.x - lootGO.transform.x;
            const dy = player.y - lootGO.transform.y;
            const distSq = dx*dx + dy*dy;
            
            // Magnet range
            if (distSq < magnetRadius * magnetRadius) {
                const dist = Math.sqrt(distSq);
                if (dist < 10) { // Collected
                    const lootScript = lootGO.getComponent('Loot');
                    if (lootScript) {
                        player.gainExp(lootScript.value);
                    }
                    lootGO.destroy();
                    this.activeLoots.splice(i, 1);
                } else {
                    // Move towards player
                    lootGO.transform.x += (dx / dist) * magnetSpeed;
                    lootGO.transform.y += (dy / dist) * magnetSpeed;
                }
            }
        }
    }
}

window.LootManager = LootManager;