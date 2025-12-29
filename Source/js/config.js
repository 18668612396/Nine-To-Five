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
    ENEMY_DESPAWN_Y: 1.1  // 超过屏幕下方110%消失
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

// 升级卡牌数据 - 雷霆战机风格
const UPGRADES = [
    // 属性升级
    { id: 'speed', name: '推进器强化', desc: '移动速度 +10%', type: 'stat', stat: 'speed', val: 1.1 },
    { id: 'max_hp', name: '装甲强化', desc: '最大生命值 +20', type: 'stat', stat: 'maxHp', val: 20 },
    { id: 'regen', name: '纳米修复', desc: '每秒生命恢复 +1', type: 'stat', stat: 'regen', val: 1 },
    { id: 'might', name: '火力增幅', desc: '伤害 +10%', type: 'stat', stat: 'damageMult', val: 0.1 },
    { id: 'area', name: '弹头扩展', desc: '攻击范围 +10%', type: 'stat', stat: 'areaMult', val: 0.1 },
    { id: 'haste', name: '射速提升', desc: '攻击冷却 -10%', type: 'stat', stat: 'cooldownMult', val: 0.9 },
    { id: 'proj_speed', name: '弹道加速', desc: '投射物速度 +15%', type: 'stat', stat: 'projSpeed', val: 1.15 },
    { id: 'duration', name: '能量持续', desc: '效果持续时间 +15%', type: 'stat', stat: 'durationMult', val: 1.15 },
    { id: 'multishot', name: '多管炮塔', desc: '投射物数量 +1', type: 'stat', stat: 'amount', val: 1 },
    { id: 'knockback', name: '冲击波', desc: '击退效果 +20%', type: 'stat', stat: 'knockback', val: 1.2 },
    
    // 武器升级 - 雷霆战机经典武器
    { id: 'spread', name: '散射炮', desc: '扇形发射多发子弹', type: 'weapon', weaponId: 'spread' },
    { id: 'lightning', name: '闪电链', desc: '闪电在敌人间跳跃', type: 'weapon', weaponId: 'lightning' },
    { id: 'missile', name: '追踪导弹', desc: '发射追踪敌人的导弹', type: 'weapon', weaponId: 'missile' },
    { id: 'laserbeam', name: '激光束', desc: '持续伤害的激光柱', type: 'weapon', weaponId: 'laserbeam' },
    { id: 'shield', name: '能量护盾', desc: '环绕的防护罩', type: 'weapon', weaponId: 'shield' },
    { id: 'plasma', name: '等离子炮', desc: '大型穿透能量球', type: 'weapon', weaponId: 'plasma' },
    { id: 'wingman', name: '僚机系统', desc: '两侧僚机同时开火', type: 'weapon', weaponId: 'wingman' },
    
    // 高级属性升级
    { id: 'speed_2', name: '超级推进', desc: '移动速度 +15%', type: 'stat', stat: 'speed', val: 1.15 },
    { id: 'max_hp_2', name: '重型装甲', desc: '最大生命值 +30', type: 'stat', stat: 'maxHp', val: 30 },
    { id: 'might_2', name: '超载火力', desc: '伤害 +15%', type: 'stat', stat: 'damageMult', val: 0.15 },
    { id: 'regen_2', name: '高级修复', desc: '每秒生命恢复 +2', type: 'stat', stat: 'regen', val: 2 },
];
