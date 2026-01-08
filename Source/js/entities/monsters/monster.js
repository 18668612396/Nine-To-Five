// --- Monster基类 (继承Enemy) ---

// Monster 配置注册表
const MONSTER_TYPES = {};

class Monster extends Enemy {
    static difficultyMult = { enemy: 1, spawn: 1 }; // 由外部设置
    
    constructor(x, y, config, scaleMult = 1) {
        // 调用Enemy构造函数
        super(x, y, {
            radius: config.radius,
            color: config.color,
            hp: config.hp * (Monster.difficultyMult?.enemy || 1) * scaleMult,
            damage: config.damage * (Monster.difficultyMult?.enemy || 1) * scaleMult,
            speed: config.speed,
            xp: config.xp,
            gold: config.gold || 0
        });
        
        // Monster特有属性
        this.type = config.id;
        this.name = config.name;
        this.monsterType = config.id;
        this.animationFrame = 0;
        this.scaleMult = scaleMult;
    }
    
    // 注册Monster类型
    static register(id, config, monsterClass) {
        MONSTER_TYPES[id] = { config, monsterClass };
    }
    
    // 创建Monster实例
    static create(id, x, y, scaleMult = 1) {
        const entry = MONSTER_TYPES[id];
        if (!entry) {
            console.error('未知Monster类型:', id);
            return null;
        }
        return new entry.monsterClass(x, y, scaleMult);
    }
    
    // 获取所有Monster类型ID
    static getAllTypes() {
        return Object.keys(MONSTER_TYPES);
    }
    
    // 随机获取一个Monster类型
    static getRandomType() {
        const types = this.getAllTypes();
        if (types.length === 0) return null;
        return types[Math.floor(Math.random() * types.length)];
    }
    
    update(player) {
        this.animationFrame++;
        super.update(player);
    }
    
    draw(ctx, camX, camY) {
        // 子类重写
        super.draw(ctx, camX, camY);
    }
}
