class Item {
    constructor(id, name, type, stats = {}, desc = "") {
        this.id = id;
        this.name = name;
        this.type = type; // 'weapon', 'armor', 'gloves', 'shoes'
        this.stats = stats;
        this.desc = desc;
    }
}

class Weapon extends Item {
    constructor(id, name, stats, weaponType, desc) {
        super(id, name, 'weapon', stats, desc);
        this.weaponType = weaponType; // 'rifle', 'smg', 'sniper', 'flame', 'shotgun'
        
        // Default weapon stats if not provided
        this.fireRate = stats.fireRate || 20; // Frames between shots
        this.reloadTime = stats.reloadTime || 60; // Frames to reload
        this.clipSize = stats.clipSize || 30;
        this.damage = stats.damage || 10;
        this.bulletSpeed = stats.bulletSpeed || 12;
        this.spread = stats.spread || 0; // Angle variance in radians
        this.count = stats.count || 1; // Bullets per shot
        this.pierce = stats.pierce || 0; // How many enemies it can pass through
        this.range = stats.range || 1000; // Max distance/lifetime
        this.isFlame = weaponType === 'flame';
    }
}

const ItemFactory = {
    createWeapon: (type) => {
        switch(type) {
            case 'rifle':
                return new Weapon('w_rifle', '标准步枪', {
                    damage: 15, fireRate: 15, reloadTime: 60, clipSize: 30, 
                    bulletSpeed: 15, spread: 0.05, range: 800
                }, 'rifle', '均衡的自动步枪');
            case 'smg':
                return new Weapon('w_smg', '轻型冲锋枪', {
                    damage: 6, fireRate: 5, reloadTime: 40, clipSize: 60, 
                    bulletSpeed: 14, spread: 0.15, range: 500
                }, 'smg', '射速极快，但伤害较低');
            case 'sniper':
                return new Weapon('w_sniper', '反器材狙击枪', {
                    damage: 80, fireRate: 80, reloadTime: 150, clipSize: 5, 
                    bulletSpeed: 25, spread: 0, pierce: 10, range: 1500
                }, 'sniper', '高伤害，自带贯穿，但射速慢');
            case 'shotgun':
                return new Weapon('w_shotgun', '战术霰弹枪', {
                    damage: 10, fireRate: 50, reloadTime: 90, clipSize: 8, 
                    bulletSpeed: 12, spread: 0.4, count: 6, range: 400
                }, 'shotgun', '一次发射多枚弹丸，近战利器');
            case 'flame':
                return new Weapon('w_flame', '工业喷火器', {
                    damage: 3, fireRate: 3, reloadTime: 180, clipSize: 100, 
                    bulletSpeed: 7, spread: 0.3, count: 1, pierce: 999, range: 250
                }, 'flame', '持续喷射火焰，需要冷却');
            default:
                return ItemFactory.createWeapon('rifle');
        }
    },

    createArmor: (level = 1) => {
        return new Item(`a_vest_${level}`, '防弹背心', 'armor', { hp: 20 * level, def: 2 * level }, '增加生存能力');
    },

    createGloves: (level = 1) => {
        return new Item(`g_tac_${level}`, '战术手套', 'gloves', { reloadSpeed: 0.1 * level, fireRate: 0.05 * level }, '加快换弹和射速');
    },

    createShoes: (level = 1) => {
        return new Item(`s_run_${level}`, '运动跑鞋', 'shoes', { moveSpeed: 1 * level }, '跑得比谁都快');
    }
};
