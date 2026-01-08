// --- 敌人生成器 ---

const Spawner = {
    // 敌人类型配置
    ENEMY_TYPES: {
        1: { radius: 18, color: COLORS.enemy_1, hp: 20, speed: 1.5, xp: 1, damage: 10 },
        2: { radius: 14, color: COLORS.enemy_2, hp: 12, speed: 2.5, xp: 2, damage: 8 },
        3: { radius: 30, color: COLORS.enemy_3, hp: 80, speed: 1, xp: 5, damage: 15 }
    },
    
    // 生成敌人
    spawnEnemy(playerX, playerY, time, difficultyMult = { enemy: 1, spawn: 1 }) {
        const angle = Math.random() * Math.PI * 2;
        const dist = CONFIG.ENEMY_SPAWN_DISTANCE + Math.random() * 100;
        const x = playerX + Math.cos(angle) * dist;
        const y = playerY + Math.sin(angle) * dist;
        
        let type = 1;
        if (time > 30 && Math.random() < 0.2) type = 2;
        if (time > 60 && Math.random() < 0.1) type = 3;
        
        // 获取敌人配置
        const baseConfig = this.ENEMY_TYPES[type] || this.ENEMY_TYPES[1];
        
        // 血量随时间增加
        const hpMult = 1 + (time / 60) * 0.1;
        
        const config = {
            ...baseConfig,
            hp: Math.floor(baseConfig.hp * hpMult * (difficultyMult.enemy || 1)),
            damage: Math.floor(baseConfig.damage * (difficultyMult.enemy || 1)),
            type: type
        };
        
        const enemy = new Enemy(x, y, config);
        enemy.type = type; // 保存类型用于绘制
        return enemy;
    },
    
    // 获取生成间隔（帧数）
    getSpawnRate(time, spawnMult = 1) {
        const minRate = 8;
        const baseRate = Math.max(minRate, 40 - Math.floor(time / 10));
        // spawnMult 越高，间隔越短，敌人越多
        return Math.max(minRate, Math.floor(baseRate / spawnMult));
    },
    
    // 检查是否应该生成敌人
    shouldSpawn(frameCount, time, spawnMult = 1) {
        const rate = this.getSpawnRate(time, spawnMult);
        return frameCount % rate === 0;
    }
};
