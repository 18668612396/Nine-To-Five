class EnemyManager extends GameBehaviour {
    constructor() {
        super('EnemyManager');
        this.activeEnemies = [];
        this.spawnTimer = 0;
        this.spawnInterval = 60; // Frames
        this.enemyPrefab = null;
        window.enemyManager = this;
    }

    start() {
        // Create Container for Enemies
        this.enemiesContainer = new GameObject('Enemies');
        if (window.game && window.game.sceneManager && window.game.sceneManager.activeScene) {
            window.game.sceneManager.activeScene.add(this.enemiesContainer);
        }

        this.loadPrefab();
    }

    async loadPrefab() {
        // Load Enemy Prefab using its GUID
        // GUID: 34112fa27d384daeb390a75f16a426e2
        try {
            this.enemyPrefab = await window.resourceManager.load('34112fa27d384daeb390a75f16a426e2');
            console.log("EnemyManager: Prefab loaded.");
        } catch (e) {
            console.error("EnemyManager: Failed to load prefab.", e);
        }
    }

    update(dt) {
        // Clean up destroyed enemies from list
        for (let i = this.activeEnemies.length - 1; i >= 0; i--) {
            if (this.activeEnemies[i].destroyed) {
                this.activeEnemies.splice(i, 1);
            }
        }

        if (!this.enemyPrefab) return;

        this.spawnTimer++;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnEnemy();
        }
    }

    spawnEnemy() {
        if (!this.enemyPrefab) return;

        // Instantiate under the container
        const enemyGO = this.enemyPrefab.instantiate(null, this.enemiesContainer);
        
        // Determine spawn position (random edge of screen)
        // Assuming 800x600 resolution for now
        // Better: Get camera bounds. For now, hardcode somewhat outside center.
        const angle = Math.random() * Math.PI * 2;
        const dist = 400; // Radius from center
        const spawnX = Math.cos(angle) * dist;
        const spawnY = Math.sin(angle) * dist;
        
        // Initialize
        const enemyScript = enemyGO.getComponent('Enemy');
        if (enemyScript) {
            // Random type for variety
            const rand = Math.random();
            let type = 'Minion';
            if (rand > 0.95) type = 'Boss';
            else if (rand > 0.8) type = 'Elite';
            
            enemyScript.init(spawnX, spawnY, type);
        }

        this.activeEnemies.push(enemyGO);
    }
}

window.EnemyManager = EnemyManager;