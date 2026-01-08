// --- 升级选择界面（浮动） ---

class LevelUpScreen extends FloatScreen {
    constructor(config = {}) {
        super({
            id: 'levelUp',
            domId: 'levelup-screen',
            closeOnBackdrop: false,
            ...config
        });
        
        this.level = 1;
        this.pauseParent = true;
        this.domCreated = false;
    }
    
    createDOM() {
        if (this.domCreated) return;
        
        const container = document.getElementById('ui-layer');
        if (!container) return;
        
        const el = document.createElement('div');
        el.id = 'levelup-screen';
        el.className = 'screen hidden';
        el.innerHTML = `
            <h2>升级! Lv.<span id="levelup-level"></span></h2>
            <p>选择一个强化</p>
            <div id="cards-container"></div>
        `;
        
        container.appendChild(el);
        this.domCreated = true;
    }
    
    show() {
        this.createDOM();
        super.show();
    }
    
    setLevel(level) {
        this.level = level;
    }
    
    onEnter() {
        if (typeof Game !== 'undefined') {
            Game.state = 'LEVELUP';
        }
        
        const levelEl = document.getElementById('levelup-level');
        if (levelEl) levelEl.textContent = this.level;
        
        this.generateCards();
    }
    
    onExit() {
        if (typeof Game !== 'undefined' && Game.state === 'LEVELUP') {
            Game.state = 'PLAYING';
        }
    }
    
    generateCards() {
        if (typeof Game !== 'undefined' && Game.showLevelUpCards) {
            Game.showLevelUpCards();
        }
    }
    
    selectCard(index) {
        if (typeof Game !== 'undefined' && Game.selectLevelUpCard) {
            Game.selectLevelUpCard(index);
        }
        this.close();
    }
}

Screen.register('levelUp', LevelUpScreen);
