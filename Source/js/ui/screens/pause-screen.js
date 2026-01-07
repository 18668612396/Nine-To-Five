// --- 暂停菜单（浮动） ---

class PauseScreen extends FloatScreen {
    constructor(config = {}) {
        super({
            id: 'pause',
            domId: 'pause-modal',
            closeOnBackdrop: true,
            ...config
        });
        
        this.pauseParent = true;
    }
    
    onEnter() {
        // 暂停游戏
        if (typeof Game !== 'undefined') {
            Game.state = 'PAUSED';
        }
    }
    
    onExit() {
        // 恢复游戏
        if (typeof Game !== 'undefined' && Game.state === 'PAUSED') {
            Game.state = 'PLAYING';
        }
    }
    
    // 继续游戏
    resume() {
        this.close();
    }
    
    // 打开背包
    openInventory() {
        this.close();
        Screen.Manager.openFloat('inventory');
    }
    
    // 打开设置
    openSettings() {
        Screen.Manager.openFloat('settings');
    }
    
    // 打开GM
    openGM() {
        Screen.Manager.openFloat('gm');
    }
    
    // 放弃战斗
    surrender() {
        this.close();
        if (typeof Game !== 'undefined') {
            Game.surrenderGame();
        }
    }
}

Screen.register('pause', PauseScreen);
