// --- 设置界面（浮动） ---

class SettingsScreen extends FloatScreen {
    constructor(config = {}) {
        super({
            id: 'settings',
            domId: 'settings-modal',
            closeOnBackdrop: true,
            ...config
        });
    }
    
    onEnter() {
        // 设置界面进入
    }
    
    onExit() {
        // 设置界面退出
    }
    
    // 打开GM面板
    openGM() {
        Screen.Manager.openFloat('gm');
    }
}

Screen.register('settings', SettingsScreen);
