// --- 背包界面（浮动） ---

class InventoryScreen extends FloatScreen {
    constructor(config = {}) {
        super({
            id: 'inventory',
            domId: 'inventory-screen',
            closeOnBackdrop: false,
            ...config
        });
        
        this.pauseParent = true;  // 打开时暂停游戏
    }
    
    onEnter() {
        // 暂停游戏
        if (typeof Game !== 'undefined') {
            Game.state = 'PAUSED';
        }
        this.refresh();
    }
    
    onExit() {
        // 恢复游戏
        if (typeof Game !== 'undefined' && Game.state === 'PAUSED') {
            Game.state = 'PLAYING';
        }
    }
    
    // 刷新背包显示
    refresh() {
        if (typeof Game !== 'undefined' && Game.renderInventory) {
            Game.renderInventory();
        }
    }
    
    // 打开设置
    openSettings() {
        Screen.Manager.openFloat('settings');
    }
}

Screen.register('inventory', InventoryScreen);
