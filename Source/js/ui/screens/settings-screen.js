// --- 设置界面（浮动） ---

class SettingsScreen extends FloatScreen {
    constructor(config = {}) {
        super({
            id: 'settings',
            domId: 'settings-modal',
            closeOnBackdrop: true,
            ...config
        });
        
        this.domCreated = false;
    }
    
    createDOM() {
        if (this.domCreated) return;
        
        const container = document.getElementById('ui-layer');
        if (!container) return;
        
        const el = document.createElement('div');
        el.id = 'settings-modal';
        el.className = 'screen hidden';
        el.innerHTML = `
            <div class="settings-container">
                <div class="settings-header">
                    <h2>⚙️ 设置</h2>
                    <button class="modal-close" onclick="Game.closeSettings()">✕</button>
                </div>
                <div class="settings-content">
                    <button class="settings-item" onclick="GM.openPanel(); Game.closeSettingsOnly();">
                        <span>🛠️ GM指令</span>
                    </button>
                    <button class="settings-item danger" onclick="Game.surrenderGame()">
                        <span>🏳️ 放弃战斗</span>
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(el);
        this.domCreated = true;
    }
    
    show() {
        this.createDOM();
        super.show();
    }
    
    onEnter() {}
    
    onExit() {}
    
    openGM() {
        Screen.Manager.openFloat('gm');
    }
}

Screen.register('settings', SettingsScreen);
