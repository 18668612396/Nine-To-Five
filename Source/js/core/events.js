// --- 事件系统 ---

const Events = {
    listeners: {},
    
    // 订阅事件
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
        return () => this.off(event, callback); // 返回取消订阅函数
    },
    
    // 取消订阅
    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    },
    
    // 发布事件
    emit(event, data = {}) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(callback => {
            try {
                callback(data);
            } catch (e) {
                console.error(`Event handler error for "${event}":`, e);
            }
        });
    },
    
    // 清除所有监听器
    clear() {
        this.listeners = {};
    }
};

// 预定义事件名称常量
const EVENT = {
    // 敌人相关
    ENEMY_DEATH: 'enemy:death',
    ENEMY_DAMAGE: 'enemy:damage',
    ENEMY_SPAWN: 'enemy:spawn',
    
    // Boss相关
    BOSS_DEATH: 'boss:death',
    BOSS_DAMAGE: 'boss:damage',
    BOSS_SPAWN: 'boss:spawn',
    
    // 玩家相关
    PLAYER_DAMAGE: 'player:damage',
    PLAYER_DEATH: 'player:death',
    PLAYER_HEAL: 'player:heal',
    PLAYER_LEVELUP: 'player:levelup',
    
    // 战斗相关
    PROJECTILE_FIRE: 'projectile:fire',
    PROJECTILE_HIT: 'projectile:hit',
    SKILL_CAST: 'skill:cast',
    EXPLOSION_DAMAGE: 'explosion:damage',
    
    // 拾取相关
    XP_GAIN: 'xp:gain',
    GOLD_GAIN: 'gold:gain',
    ITEM_PICKUP: 'item:pickup',
    
    // 效果相关
    FLOATING_TEXT: 'effect:floatingText',
    PARTICLES: 'effect:particles',
    SCREEN_SHAKE: 'effect:screenShake'
};
