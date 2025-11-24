class EnemyManager extends GameBehaviour {
    constructor() {
        super('EnemyManager');
        this.activeEnemies = [];
        this.spawnTimer = 0;
        this.spawnInterval = 60; // Frames
        this.enemyPrefab = null;
        this.deathEffectPrefab = null;
        window.enemyManager = this;
    }

    start() {
        this.loadPrefab();
    }

    getContainer() {
        if (!this.enemiesContainer || this.enemiesContainer.destroyed) {
            this.enemiesContainer = new GameObject('Enemies');
            if (window.game && window.game.sceneManager && window.game.sceneManager.activeScene) {
                window.game.sceneManager.activeScene.add(this.enemiesContainer);
            }
        }
        return this.enemiesContainer;
    }

    async loadPrefab() {
        // Load Enemy Prefab using its GUID
        // GUID: f281e78241ff46698a68c67f6ad9c413
        try {
            const p1 = window.resourceManager.load('f281e78241ff46698a68c67f6ad9c413')
                .then(p => {
                    this.enemyPrefab = p;
                    console.log("EnemyManager: Enemy Prefab loaded.");
                });

            // Load Death Effect Prefab
            // GUID: 026444e2ade749068f12727648ae4d9c
            const p2 = window.resourceManager.load('026444e2ade749068f12727648ae4d9c')
                .then(p => {
                    this.deathEffectPrefab = p;
                    console.log("EnemyManager: Death Effect Prefab loaded.");
                });

            await Promise.all([p1, p2]);
        } catch (e) {
            console.error("EnemyManager: Failed to load prefabs.", e);
        }
    }

    spawnDeathEffect(x, y) {
        if (this.deathEffectPrefab) {
            // Pass position to instantiate so particles spawn at correct location
            const effectGO = this.deathEffectPrefab.instantiate({ x: x, y: y });
            // Effect handles its own destruction via ParticleSystem duration
        } else {
            console.warn("Death Effect Prefab not loaded!");
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
        const container = this.getContainer();
        const enemyGO = this.enemyPrefab.instantiate(null, container);

        // Determine spawn position (random edge around player)
        // Get player position
        let playerX = 0;
        let playerY = 0;
        if (window.game && window.game.player) {
            playerX = window.game.player.x;
            playerY = window.game.player.y;
        }

        // Spawn at random angle around player, outside camera view
        const angle = Math.random() * Math.PI * 2;
        const dist = 700 + Math.random() * 200; // 700-900 pixels from player
        const spawnX = playerX + Math.cos(angle) * dist;
        const spawnY = playerY + Math.sin(angle) * dist;

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