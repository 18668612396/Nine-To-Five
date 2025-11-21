class EnemyManager extends GameBehaviour {
    constructor() {
        super('EnemyManager');
        this.pool = [];
        this.spawnTimer = 0;
        this.spawnInterval = 60; // Frames
        this.enemyPrefab = null;
        window.enemyManager = this;
    }

    start() {
        this.loadAndPool();
    }

    async loadAndPool() {
        // Load Enemy Prefab using its GUID
        // GUID: 34112fa27d384daeb390a75f16a426e2
        try {
            this.enemyPrefab = await window.resourceManager.load('34112fa27d384daeb390a75f16a426e2');
            console.log("EnemyManager: Prefab loaded.");
            
            // Pre-warm pool
            for (let i = 0; i < 20; i++) {
                this.createEnemyInPool();
            }
        } catch (e) {
            console.error("EnemyManager: Failed to load prefab.", e);
        }
    }

    createEnemyInPool() {
        if (!this.enemyPrefab) return null;
        
        const go = this.enemyPrefab.instantiate();
        go.active = false;
        
        // Ensure it's in the scene (instantiate adds it to active scene automatically)
        // But we want to keep track of it
        this.pool.push(go);
        
        return go;
    }

    update(dt) {
        if (!this.enemyPrefab) return;

        this.spawnTimer++;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnEnemy();
        }
    }

    spawnEnemy() {
        let enemyGO = null;
        
        // Find inactive in pool
        for (const go of this.pool) {
            if (!go.active) {
                enemyGO = go;
                break;
            }
        }
        
        // If no inactive, create new
        if (!enemyGO) {
            enemyGO = this.createEnemyInPool();
        }
        
        if (!enemyGO) return;

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
        
        enemyGO.active = true;
    }

    returnEnemy(enemyGO) {
        enemyGO.active = false;
    }
}

window.EnemyManager = EnemyManager;