// --- 武器掉落选择界面（浮动） ---

class WeaponDropScreen extends FloatScreen {
    constructor(config = {}) {
        super({
            id: 'weaponDrop',
            domId: 'weapon-drop-modal',
            closeOnBackdrop: false,
            canCloseByEsc: false,
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
            Game.pauseGame();
        }
        this.renderOptions();
    }
    
    onExit() {
        if (typeof Game !== 'undefined') {
            Game.unpauseGame();
        }
    }
    
    renderOptions() {
        const container = document.getElementById('weapon-drop-options');
        if (!container) return;
        
        container.innerHTML = '';
        this.weapons.forEach((weapon, index) => {
            const card = document.createElement('div');
            card.className = `weapon-drop-card rarity-${weapon.rarity}`;
            card.onclick = () => Game.selectWeaponDrop(index);
            
            let affixesHtml = '';
            if (weapon.affixes && typeof WEAPON_AFFIXES !== 'undefined') {
                weapon.affixes.forEach(affix => {
                    const def = WEAPON_AFFIXES[affix.id];
                    if (def) {
                        const desc = def.desc.replace('{value}', affix.value);
                        affixesHtml += `<div class="weapon-affix">✦ ${desc}</div>`;
                    }
                });
            }
            
            let specialHtml = '';
            if (weapon.specialSlot && typeof SPECIAL_TRIGGERS !== 'undefined') {
                const trigger = SPECIAL_TRIGGERS[weapon.specialSlot.trigger];
                if (trigger) {
                    const desc = trigger.desc.replace('{value}', weapon.specialSlot.value);
                    specialHtml = `<div class="weapon-card-special">⚡ 特殊槽(${weapon.specialSlot.slots}): ${desc}</div>`;
                }
            }
            
            const rarityNames = { common: '普通', uncommon: '优秀', rare: '稀有', epic: '史诗' };
            
            card.innerHTML = `
                <div class="weapon-card-header">
                    <span class="weapon-card-icon">${weapon.icon}</span>
                    <div>
                        <div class="weapon-card-name">${weapon.name}</div>
                        <span class="weapon-card-rarity">${rarityNames[weapon.rarity]}</span>
                    </div>
                </div>
                <div class="weapon-card-stats">
                    <div>⚡ 能量: ${weapon.maxEnergy} | 回复: ${weapon.baseEnergyRegen}/s</div>
                    <div>⏱️ 间隔: ${(weapon.baseCastInterval / 60).toFixed(2)}s | 槽位: ${weapon.slotCount}</div>
                </div>
                <div class="weapon-card-affixes">${affixesHtml || '<div class="weapon-affix" style="color:#888">无词条</div>'}</div>
                ${specialHtml}
            `;
            container.appendChild(card);
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
