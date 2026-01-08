// --- 游戏主界面 ---

class GameScreen extends FullScreen {
    constructor(config = {}) {
        super({
            id: 'game',
            domId: 'hud',
            ...config
        });
        
        this.domCreated = false;
    }
    
    createDOM() {
        if (this.domCreated) return;
        
        const container = document.getElementById('ui-layer');
        if (!container) return;
        
        const el = document.createElement('div');
        el.id = 'hud';
        el.className = 'hidden';
        el.innerHTML = `
            <div class="hud-top">
                <div class="hud-left">
                    <button class="settings-btn" onclick="Game.openSettings()">⚙️</button>
                    <div id="hp-bar-container">
                        <div id="hp-bar-bg">
                            <div id="hp-bar-fill"></div>
                        </div>
                        <div id="hp-text">100/100</div>
                    </div>
                    <div id="xp-bar-container">
                        <div id="xp-bar-bg">
                            <div id="xp-bar-fill"></div>
                        </div>
                        <div id="level-text">Lv.1</div>
                    </div>
                    <div class="weapon-info-row">
                        <div class="weapon-info-display">
                            <span class="weapon-info-icon" id="weapon-icon">🪄</span>
                            <span class="weapon-info-name" id="weapon-name">学徒法杖</span>
                        </div>
                        <div id="weapon-energy-bar-container">
                            <div id="weapon-energy-bar-bg">
                                <div id="weapon-energy-bar-fill"></div>
                            </div>
                            <div id="weapon-energy-text">100/100</div>
                        </div>
                    </div>
                </div>
                <div class="hud-center">
                    <div id="boss-hp-container" class="hidden">
                        <div id="boss-name">Boss</div>
                        <div id="boss-hp-bar-bg">
                            <div id="boss-hp-bar-fill"></div>
                        </div>
                    </div>
                </div>
                <div class="hud-right">
                    <div id="timer">00:00</div>
                    <div id="kill-count">击杀: 0</div>
                    <div id="gold-count">💰 0</div>
                    <button class="inventory-btn" onclick="Game.openInventory()">📦 背包</button>
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
        const hud = document.getElementById('hud');
        if (hud) hud.classList.remove('hidden');
    }
    
    onExit() {
        const hud = document.getElementById('hud');
        if (hud) hud.classList.add('hidden');
    }
    
    openInventory() {
        Screen.Manager.openFloat('inventory');
    }
    
    openSettings() {
        Screen.Manager.openFloat('settings');
    }
    
    openPause() {
        Screen.Manager.openFloat('pause');
    }
    
    openLevelUp(level) {
        const levelUpScreen = Screen.Manager.get('levelUp');
        if (levelUpScreen) {
            levelUpScreen.setLevel(level);
        }
        Screen.Manager.openFloat('levelUp');
    }
}

Screen.register('game', GameScreen);
