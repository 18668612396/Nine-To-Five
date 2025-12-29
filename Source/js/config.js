// --- 游戏配置和常量 ---

const CONFIG = {
    GAME_WIDTH: 720,
    GAME_HEIGHT: 1280,
    FPS: 60,
    SCROLL_SPEED: 3,
    ENEMY_SPAWN_Y: -100,
    ENEMY_DESPAWN_Y: 1.1
};

const COLORS = {
    guagua: '#fff8e1',
    guagua_dark: '#8d6e63',
    kuikui: '#90a4ae',
    kuikui_dark: '#607d8b',
    enemy_1: '#ac92ec',
    enemy_2: '#ec87c0',
    enemy_3: '#ffce54',
    gem: '#48cfad',
    damage: '#ed5565'
};

// 升级卡牌 - 效果型
const UPGRADES = [
    // 属性强化
    { id: 'speed', name: '推进器强化', desc: '移动速度 +10%', type: 'stat', stat: 'speed', val: 1.1 },
    { id: 'max_hp', name: '装甲强化', desc: '最大生命值 +20', type: 'stat', stat: 'maxHp', val: 20 },
    { id: 'regen', name: '纳米修复', desc: '每秒恢复 +1', type: 'stat', stat: 'regen', val: 1 },
    { id: 'might', name: '火力增幅', desc: '伤害 +10%', type: 'stat', stat: 'damageMult', val: 0.1 },
    { id: 'area', name: '弹头扩展', desc: '范围 +10%', type: 'stat', stat: 'areaMult', val: 0.1 },
    { id: 'haste', name: '射速提升', desc: '冷却 -10%', type: 'stat', stat: 'cooldownMult', val: 0.9 },
    { id: 'proj_speed', name: '弹道加速', desc: '弹速 +15%', type: 'stat', stat: 'projSpeed', val: 1.15 },
    { id: 'multishot', name: '多管炮塔', desc: '子弹数 +1', type: 'stat', stat: 'amount', val: 1 },
    { id: 'knockback', name: '冲击波', desc: '击退 +20%', type: 'stat', stat: 'knockback', val: 1.2 },
    
    // 效果卡牌 - 解锁/升级武器效果
    { id: 'spread', name: '散射弹幕', desc: '额外发射扇形子弹', type: 'effect', effectId: 'spread' },
    { id: 'lightning', name: '闪电链', desc: '闪电在敌人间跳跃', type: 'effect', effectId: 'lightning' },
    { id: 'missile', name: '追踪导弹', desc: '自动追踪敌人', type: 'effect', effectId: 'missile' },
    { id: 'laser', name: '激光束', desc: '持续伤害光柱', type: 'effect', effectId: 'laser' },
    { id: 'shield', name: '能量护盾', desc: '环绕防护罩', type: 'effect', effectId: 'shield' },
    { id: 'plasma', name: '等离子炮', desc: '穿透能量球', type: 'effect', effectId: 'plasma' },
    { id: 'wingman', name: '僚机系统', desc: '两侧僚机开火', type: 'effect', effectId: 'wingman' },
    
    // 高级属性
    { id: 'speed_2', name: '超级推进', desc: '移动速度 +15%', type: 'stat', stat: 'speed', val: 1.15 },
    { id: 'max_hp_2', name: '重型装甲', desc: '最大生命值 +30', type: 'stat', stat: 'maxHp', val: 30 },
    { id: 'might_2', name: '超载火力', desc: '伤害 +15%', type: 'stat', stat: 'damageMult', val: 0.15 },
    { id: 'regen_2', name: '高级修复', desc: '每秒恢复 +2', type: 'stat', stat: 'regen', val: 2 },
];
