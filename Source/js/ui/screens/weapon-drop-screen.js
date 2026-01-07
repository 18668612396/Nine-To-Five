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
    }
    
    // 设置可选武器
    setWeapons(weapons) {
        this.weapons = weapons;
    }
    
    onEnter() {
        // 暂停游戏
        if (typeof Game !== 'undefined') {
            Game.state = 'PAUSED';
        }
        this.renderOptions();
    }
    
    onExit() {
        // 恢复游戏
        if (typeof Game !== 'undefined' && Game.state === 'PAUSED') {
            Game.state = 'PLAYING';
        }
    }
    
    // 渲染选项
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
    
    // 选择武器
    selectWeapon(index) {
        if (typeof Game !== 'undefined' && Game.selectWeaponDrop) {
            Game.selectWeaponDrop(index);
        }
        this.close();
    }
    
    // 跳过（随机获得）
    skip() {
        if (typeof Game !== 'undefined' && Game.skipWeaponDrop) {
            Game.skipWeaponDrop();
        }
        this.close();
    }
}

Screen.register('weaponDrop', WeaponDropScreen);
