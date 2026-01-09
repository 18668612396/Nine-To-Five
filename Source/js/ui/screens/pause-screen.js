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
        this.domCreated = false;
    }
    
    createDOM() {
        if (this.domCreated) return;
        
        const container = document.getElementById('ui-layer');
        if (!container) return;
        
        const el = document.createElement('div');
        el.id = 'pause-modal';
        el.className = 'screen hidden';
        el.innerHTML = `
            <div class="pause-container">
                <h2>⏸️ 暂停</h2>
                <div class="pause-content">
                    <button class="pause-item" onclick="Game.resumeGame()">
                        <span>▶️ 继续游戏</span>
                    </button>
                    <button class="pause-item" onclick="Game.openInventoryFromPause()">
                        <span>📦 背包</span>
                    </button>
                    <button class="pause-item" onclick="Game.openGMFromPause()">
                        <span>🛠️ GM指令</span>
                    </button>
                    <button class="pause-item" onclick="Game.openSettingsFromPause()">
                        <span>⚙️ 设置</span>
                    </button>
                    <button class="pause-item danger" onclick="Game.surrenderGame()">
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
    
    onEnter() {
        if (typeof Game !== 'undefined') {
            Game.pauseGame();
        }
    }
    
    onExit() {
        if (typeof Game !== 'undefined') {
            Game.unpauseGame();
        }
    }
    
    resume() {
        this.close();
    }
    
    openInventory() {
        this.close();
        Screen.Manager.openFloat('inventory');
    }
    
    openSettings() {
        Screen.Manager.openFloat('settings');
    }
    
    openGM() {
        Screen.Manager.openFloat('gm');
    }
    
    surrender() {
        this.close();
        if (typeof Game !== 'undefined') {
            Game.surrenderGame();
        }
    }
}

Screen.register('pause', PauseScreen);
