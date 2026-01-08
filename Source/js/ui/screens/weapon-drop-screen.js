// --- 武器掉落选择界面（浮动） ---

class WeaponDropScreen extends FloatScreen {
    constructor(config = {}) {
        super({
            id: 'weaponDrop',
            domId: 'weapon-drop-modal',
            closeOnBackdrop: false,
            ...config
        });
        
        this.weapons = [];
        this.pauseParent = true;
        this.domCreated = false;
    }
    
    createDOM() {
        if (this.domCreated) return;
        
        const container = document.getElementById('ui-layer');
        if (!container) return;
        
        const el = document.createElement('div');
        el.id = 'weapon-drop-modal';
        el.className = 'screen hidden';
        el.innerHTML = `
            <div class="weapon-drop-container">
                <h2>🎁 选择武器</h2>
                <p class="weapon-drop-hint">击败Boss获得武器奖励！选择一把或跳过随机获得</p>
                <div id="weapon-drop-options" class="weapon-drop-grid"></div>
                <button class="weapon-skip-btn" onclick="Game.skipWeaponDrop()">🎲 跳过，随机获得</button>
            </div>
        `;
        
        container.appendChild(el);
        this.domCreated = true;
    }
    
    show() {
        this.createDOM();
        super.show();
    }
    
    setWeapons(weapons) {
        this.weapons = weapons;
    }
    
    onEnter() {
        if (typeof Game !== 'undefined') {
            Game.state = 'PAUSED';
        }
        this.renderOptions();
    }
    
    onExit() {
        if (typeof Game !== 'undefined' && Game.state === 'PAUSED') {
            Game.state = 'PLAYING';
        }
    }
    
    renderOptions() {
        const container = document.getElementById('weapon-drop-options');
        if (!container) return;
        
        container.innerHTML = '';
        this.weapons.forEach((weapon, index) => {
            const div = document.createElement('div');
            div.className = 'weapon-drop-option';
            div.innerHTML = `
                <span class="weapon-icon">${weapon.icon || '🪄'}</span>
                <span class="weapon-name">${weapon.name}</span>
                <span class="weapon-desc">${weapon.desc || ''}</span>
            `;
            div.onclick = () => this.selectWeapon(index);
            container.appendChild(div);
        });
    }
    
    selectWeapon(index) {
        if (typeof Game !== 'undefined' && Game.selectWeaponDrop) {
            Game.selectWeaponDrop(index);
        }
        this.close();
    }
    
    skip() {
        if (typeof Game !== 'undefined' && Game.skipWeaponDrop) {
            Game.skipWeaponDrop();
        }
        this.close();
    }
}

Screen.register('weaponDrop', WeaponDropScreen);
