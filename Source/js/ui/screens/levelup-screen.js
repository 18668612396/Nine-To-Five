// --- 升级选择界面（浮动） ---

class LevelUpScreen extends FloatScreen {
    constructor(config = {}) {
        super({
            id: 'levelUp',
            domId: 'levelup-screen',
            closeOnBackdrop: false,
            canCloseByEsc: false,
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
    
    generateOptions(player, level) {
        this.level = level;
        this.createDOM();
        
        const container = document.getElementById('cards-container');
        if (!container) return;
        container.innerHTML = '';
        
        const options = [];
        const pool = typeof UPGRADES !== 'undefined' ? [...UPGRADES] : [];
        
        for (let i = 0; i < 3; i++) {
            if (pool.length === 0) break;
            const idx = Math.floor(Math.random() * pool.length);
            const opt = pool[idx];
            const currentLevel = player && player.perkManager ? player.perkManager.getPerkLevel(opt.perkId) : 0;
            options.push({ ...opt, currentLevel });
            pool.splice(idx, 1);
        }
        
        options.forEach(opt => {
            const div = document.createElement('div');
            div.className = 'upgrade-card';
            const levelText = opt.currentLevel > 0 ? ` (Lv.${opt.currentLevel + 1})` : '';
            div.innerHTML = `<h3>${opt.name}${levelText}</h3><p>${opt.desc}</p>`;
            div.onclick = () => Game.selectUpgrade(opt);
            container.appendChild(div);
        });
    }
    
    onEnter() {
        if (typeof Game !== 'undefined') {
            Game.state = 'LEVEL_UP';
        }
        
        const levelEl = document.getElementById('levelup-level');
        if (levelEl) levelEl.textContent = this.level;
    }
    
    onExit() {
        if (typeof Game !== 'undefined' && Game.state === 'LEVEL_UP') {
            Game.state = 'PLAYING';
        }
    }
}

Screen.register('levelUp', LevelUpScreen);
