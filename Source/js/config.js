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

// 升级卡牌 - 属性强化 + 技能获取
const UPGRADES = [
    // 属性强化
    { id: 'speed', name: '推进器强化', desc: '移动速度 +10%', type: 'stat', stat: 'speed', val: 1.1 },
    { id: 'max_hp', name: '装甲强化', desc: '最大生命值 +20', type: 'stat', stat: 'maxHp', val: 20 },
    { id: 'regen', name: '纳米修复', desc: '每秒恢复 +1', type: 'stat', stat: 'regen', val: 1 },
    { id: 'might', name: '火力增幅', desc: '伤害 +10%', type: 'stat', stat: 'damageMult', val: 0.1 },
    { id: 'haste', name: '射速提升', desc: '冷却 -10%', type: 'stat', stat: 'cooldownMult', val: 0.9 },
    { id: 'proj_speed', name: '弹道加速', desc: '弹速 +15%', type: 'stat', stat: 'projSpeed', val: 1.15 },
    { id: 'knockback', name: '冲击波', desc: '击退 +20%', type: 'stat', stat: 'knockback', val: 1.2 },
    
    // 主动技能卡牌
    { id: 'skill_fireball', name: '🔥 火球术', desc: '获得火球技能', type: 'skill', skillId: 'fireball' },
    { id: 'skill_laser', name: '⚡ 激光', desc: '获得激光技能', type: 'skill', skillId: 'laser' },
    { id: 'skill_missile', name: '🚀 导弹', desc: '获得追踪导弹', type: 'skill', skillId: 'missile' },
    { id: 'skill_spark', name: '✨ 电火花', desc: '获得电火花技能', type: 'skill', skillId: 'spark' },
    { id: 'skill_plasma', name: '💠 等离子', desc: '获得等离子炮', type: 'skill', skillId: 'plasma' },
    
    // 被动技能卡牌
    { id: 'skill_split', name: '🔀 分裂', desc: '投射物分裂成3个', type: 'skill', skillId: 'split' },
    { id: 'skill_homing', name: '🎯 追踪', desc: '投射物追踪敌人', type: 'skill', skillId: 'homing' },
    { id: 'skill_pierce', name: '📍 穿透', desc: '穿透多个敌人', type: 'skill', skillId: 'pierce' },
    { id: 'skill_chain', name: '⛓️ 连锁', desc: '命中后跳跃攻击', type: 'skill', skillId: 'chain' },
    { id: 'skill_rapid', name: '💨 急速', desc: '减少冷却时间', type: 'skill', skillId: 'rapid' },
    { id: 'skill_heavy', name: '💪 重击', desc: '伤害翻倍速度减半', type: 'skill', skillId: 'heavy' },
    { id: 'skill_explosive', name: '💥 爆炸', desc: '命中时产生爆炸', type: 'skill', skillId: 'explosive' },
    { id: 'skill_bounce', name: '🔄 弹射', desc: '碰到边界反弹', type: 'skill', skillId: 'bounce' },
    
    // 高级属性
    { id: 'speed_2', name: '超级推进', desc: '移动速度 +15%', type: 'stat', stat: 'speed', val: 1.15 },
    { id: 'max_hp_2', name: '重型装甲', desc: '最大生命值 +30', type: 'stat', stat: 'maxHp', val: 30 },
    { id: 'might_2', name: '超载火力', desc: '伤害 +15%', type: 'stat', stat: 'damageMult', val: 0.15 },
    { id: 'regen_2', name: '高级修复', desc: '每秒恢复 +2', type: 'stat', stat: 'regen', val: 2 },
];
