// --- 游戏配置和常量 ---

// 游戏配置
const CONFIG = {
    // 游戏画布尺寸（竖屏比例 9:16）
    GAME_WIDTH: 720,
    GAME_HEIGHT: 1280,
    
    // 实际显示会根据屏幕缩放
    FPS: 60,
    
    // 地图滚动速度
    SCROLL_SPEED: 3,
    
    // 敌人生成区域
    ENEMY_SPAWN_Y: -100,  // 屏幕上方生成
    ENEMY_DESPAWN_Y: 1.1, // 超过屏幕下方110%消失
    
    // 战斗设置
    AUTO_BATTLE: true     // 自动战斗（自动瞄准+自动开火）
};

// 颜色配置
const COLORS = {
    guagua: '#fff8e1',      // 布偶猫奶油色
    guagua_dark: '#8d6e63', // 布偶猫棕色
    kuikui: '#90a4ae',      // 英短蓝灰色
    kuikui_dark: '#607d8b', // 英短深灰色
    enemy_1: '#ac92ec',     // 紫色史莱姆
    enemy_2: '#ec87c0',     // 粉色蝙蝠
    enemy_3: '#ffce54',     // 黄色岩石怪
    gem: '#48cfad',         // 经验宝石
    damage: '#ed5565'       // 伤害颜色
};

// 升级卡牌数据
const UPGRADES = [
    { id: 'speed', name: '神速喵喵', desc: '移动速度 +10%', type: 'stat', stat: 'speed', val: 1.1 },
    { id: 'max_hp', name: '大橘为重', desc: '最大生命值 +20', type: 'stat', stat: 'maxHp', val: 20 },
    { id: 'regen', name: '呼噜治愈', desc: '每秒生命恢复 +1', type: 'stat', stat: 'regen', val: 1 },
    { id: 'pickup', name: '磁吸肉垫', desc: '拾取范围 +20%', type: 'stat', stat: 'pickupRange', val: 1.2 },
    { id: 'might', name: '锋利猫爪', desc: '伤害 +10%', type: 'stat', stat: 'damageMult', val: 0.1 },
    { id: 'area', name: '胖胖威压', desc: '攻击范围 +10%', type: 'stat', stat: 'areaMult', val: 0.1 },
    { id: 'haste', name: '猫猫拳', desc: '攻击冷却 -10%', type: 'stat', stat: 'cooldownMult', val: 0.9 },
    { id: 'proj_speed', name: '超声波', desc: '投射物速度 +15%', type: 'stat', stat: 'projSpeed', val: 1.15 },
    { id: 'duration', name: '持久耐力', desc: '效果持续时间 +15%', type: 'stat', stat: 'durationMult', val: 1.15 },
    { id: 'crit', name: '幸运猫', desc: '暴击率 +5%', type: 'stat', stat: 'critChance', val: 0.05 },
    { id: 'garlic', name: '臭豆腐光环', desc: '周围产生持续伤害区域', type: 'weapon', weaponId: 'garlic' },
    { id: 'axe', name: '抛抛球', desc: '向上抛出毛线球', type: 'weapon', weaponId: 'axe' },
    { id: 'wand', name: '激光笔', desc: '发射激光攻击最近的敌人', type: 'weapon', weaponId: 'wand' },
    { id: 'orbit', name: '护体小鱼干', desc: '小鱼干围绕你旋转', type: 'weapon', weaponId: 'orbit' },
    { id: 'multishot', name: '多重影分身', desc: '投射物数量 +1', type: 'stat', stat: 'amount', val: 1 },
    { id: 'knockback', name: '大力金刚掌', desc: '击退效果 +20%', type: 'stat', stat: 'knockback', val: 1.2 },
    { id: 'speed_2', name: '风行者', desc: '移动速度 +15%', type: 'stat', stat: 'speed', val: 1.15 },
    { id: 'max_hp_2', name: '九命猫', desc: '最大生命值 +30', type: 'stat', stat: 'maxHp', val: 30 },
    { id: 'might_2', name: '猛虎下山', desc: '伤害 +15%', type: 'stat', stat: 'damageMult', val: 0.15 },
    { id: 'regen_2', name: '深度睡眠', desc: '每秒生命恢复 +2', type: 'stat', stat: 'regen', val: 2 },
];
