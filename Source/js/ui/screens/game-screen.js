// --- 游戏主界面 ---

class GameScreen extends FullScreen {
    constructor(config = {}) {
        super({
            id: 'game',
            domId: 'hud',
            ...config
        });
    }
    
    onEnter() {
        // HUD显示
        const hud = document.getElementById('hud');
        if (hud) hud.classList.remove('hidden');
    }
    
    onExit() {
        // HUD隐藏
        const hud = document.getElementById('hud');
        if (hud) hud.classList.add('hidden');
    }
    
    // 打开背包
    openInventory() {
        Screen.Manager.openFloat('inventory');
    }
    
    // 打开设置
    openSettings() {
        Screen.Manager.openFloat('settings');
    }
    
    // 打开暂停菜单
    openPause() {
        Screen.Manager.openFloat('pause');
    }
    
    // 打开升级选择
    openLevelUp(level) {
        const levelUpScreen = Screen.Manager.get('levelUp');
        if (levelUpScreen) {
            levelUpScreen.setLevel(level);
        }
        Screen.Manager.openFloat('levelUp');
    }
}

Screen.register('game', GameScreen);
