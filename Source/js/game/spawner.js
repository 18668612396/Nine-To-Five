// --- 敌人生成器 ---

const Spawner = {
    // 旧版敌人类型配置 (保留兼容)
    ENEMY_TYPES: {
        1: { radius: 18, color: COLORS.enemy_1, hp: 20, speed: 1.5, xp: 1, damage: 10 },
        2: { radius: 14, color: COLORS.enemy_2, hp: 12, speed: 2.5, xp: 2, damage: 8 },
        3: { radius: 30, color: COLORS.enemy_3, hp: 80, speed: 1, xp: 5, damage: 15 }
    },
    
    // 僵尸出现概率配置 (根据游戏时间)
    ZOMBIE_SPAWN_WEIGHTS: {
        zombie_normal: { weight: 50, minTime: 0 },      // 普通僵尸，一开始就有
        zombie_flag: { weight: 20, minTime: 30 },       // 旗帜僵尸，30秒后
        zombie_cone: { weight: 15, minTime: 60 },       // 路障僵尸，1分钟后
        zombie_newspaper: { weight: 10, minTime: 90 },  // 读报僵尸，1.5分钟后
        zombie_bucket: { weight: 5, minTime: 120 }      // 铁桶僵尸，2分钟后
    },
    
    // 选择僵尸类型
    selectZombieType(time) {
        const availableTypes = [];
        let totalWeight = 0;
        
        for (const [type, config] of Object.entries(this.ZOMBIE_SPAWN_WEIGHTS)) {
            if (time >= config.minTime) {
                availableTypes.push({ type, weight: config.weight });
                totalWeight += config.weight;
            }
        }
        
        if (availableTypes.length === 0) return 'zombie_normal';
        
        let random = Math.random() * totalWeight;
        for (const entry of availableTypes) {
            random -= entry.weight;
            if (random <= 0) return entry.type;
        }
        
        return availableTypes[0].type;
    },
    
    // 生成敌人
    spawnEnemy(playerX, playerY, time, difficultyMult = { enemy: 1, spawn: 1 }) {
        const angle = Math.random() * Math.PI * 2;
        const dist = CONFIG.ENEMY_SPAWN_DISTANCE + Math.random() * 100;
        const x = playerX + Math.cos(angle) * dist;
        const y = playerY + Math.sin(angle) * dist;
        
        // 血量随时间增加的倍率
        const scaleMult = 1 + (time / 60) * 0.1;
        
        // 优先使用Monster系统生成僵尸
        if (typeof Monster !== 'undefined' && Monster.getAllTypes().length > 0) {
            const zombieType = this.selectZombieType(time);
            Monster.difficultyMult = difficultyMult;
            const monster = Monster.create(zombieType, x, y, scaleMult);
            if (monster) return monster;
        }
        
        // 回退到旧版敌人系统
        let type = 1;
        if (time > 30 && Math.random() < 0.2) type = 2;
        if (time > 60 && Math.random() < 0.1) type = 3;
        
        const baseConfig = this.ENEMY_TYPES[type] || this.ENEMY_TYPES[1];
        
        const config = {
            ...baseConfig,
            hp: Math.floor(baseConfig.hp * scaleMult * (difficultyMult.enemy || 1)),
            damage: Math.floor(baseConfig.damage * (difficultyMult.enemy || 1)),
            type: type
        };
        
        const enemy = new Enemy(x, y, config);
        enemy.type = type;
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
