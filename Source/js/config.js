// --- 游戏配置和常量 (类幸存者风格) ---

// 平台检测
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
    || (navigator.maxTouchPoints > 0 && window.innerWidth < 1024);

// 环境检测（GitHub Pages为生产环境）
const isProduction = window.location.hostname.includes('github.io');

const CONFIG = {
    // 游戏区域会动态适应屏幕
    GAME_WIDTH: 1920,
    GAME_HEIGHT: 1080,
    FPS: 60,
    
    // 敌人生成
    ENEMY_SPAWN_DISTANCE: 600, // 敌人在玩家周围多远生成
    
    // 自动战斗
    AUTO_BATTLE: true
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

// 升级选项在 weapons.js 中定义（依赖 PERKS）
