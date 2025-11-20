class UIManager {
    constructor(game) {
        this.game = game;
        
        // Cache DOM elements
        this.townUI = document.getElementById('townUI');
        this.levelSelectUI = document.getElementById('levelSelectUI');
        this.talentUI = document.getElementById('talentUI');
        this.inventoryUI = document.getElementById('inventoryUI');
        this.settingsUI = document.getElementById('settingsUI');
        
        this.hud = document.getElementById('hud');
        this.hpBar = document.getElementById('hpBar');
        this.hpText = document.getElementById('hpText');
        this.progBar = document.getElementById('progBar');
        this.bossLabel = document.getElementById('bossLabel');
        this.lootMsg = document.getElementById('lootMsg');

        // Buttons
        this.btnOpenLevelSelect = document.getElementById('btnOpenLevelSelect');
        this.btnBackToTown = document.getElementById('btnBackToTown');
        
        this.btnOpenTalents = document.getElementById('btnOpenTalents');
        this.btnOpenInventory = document.getElementById('btnOpenInventory');
        this.btnCloseTalents = document.getElementById('btnCloseTalents');
        this.btnCloseInventory = document.getElementById('btnCloseInventory');

        this.btnOpenSettings = document.getElementById('btnOpenSettings');
        this.btnCloseSettings = document.getElementById('btnCloseSettings');
        this.btnClearTalents = document.getElementById('btnClearTalents');
        this.btnClearInventory = document.getElementById('btnClearInventory');
        this.btnClearLevels = document.getElementById('btnClearLevels');

        this.levelList = document.getElementById('levelList');

        // Pause Menu Elements
        this.pauseMenu = document.getElementById('pauseMenu');
        this.btnResume = document.getElementById('btnResume');
        this.btnPauseBackToTown = document.getElementById('btnPauseBackToTown');
        this.btnOpenGM = document.getElementById('btnOpenGM');
        this.btnCloseGM = document.getElementById('btnCloseGM');

        // Game Over UI
        this.gameOverUI = document.getElementById('gameOverUI');
        this.btnGameOverBack = document.getElementById('btnGameOverBack');

        // Victory UI
        this.victoryUI = document.getElementById('victoryUI');
        this.btnVictoryBack = document.getElementById('btnVictoryBack');

        // Level Up UI
        this.levelUpUI = document.getElementById('levelUpUI');
        this.cardContainer = document.getElementById('cardContainer');
        this.lvlUpLevel = document.getElementById('lvlUpLevel');
        this.expBar = document.getElementById('expBar');
        this.expText = document.getElementById('expText');
        this.timerLabel = document.getElementById('timerLabel');
        this.btnHudSettings = document.getElementById('btnHudSettings');

        this.initListeners();
    }

    initListeners() {
        if (this.btnOpenLevelSelect) this.btnOpenLevelSelect.addEventListener('click', () => this.showLevelSelect());
        if (this.btnBackToTown) this.btnBackToTown.addEventListener('click', () => this.showTown());

        if (this.btnOpenTalents) this.btnOpenTalents.addEventListener('click', () => this.showTalents());
        if (this.btnOpenInventory) this.btnOpenInventory.addEventListener('click', () => this.showInventory());
        if (this.btnCloseTalents) this.btnCloseTalents.addEventListener('click', () => this.showTown());
        if (this.btnCloseInventory) this.btnCloseInventory.addEventListener('click', () => this.showTown());

        if (this.btnOpenSettings) this.btnOpenSettings.addEventListener('click', () => this.showSettings());
        if (this.btnCloseSettings) this.btnCloseSettings.addEventListener('click', () => this.showTown());
        
        if (this.btnClearTalents) this.btnClearTalents.addEventListener('click', () => this.game.clearData('talents'));
        if (this.btnClearInventory) this.btnClearInventory.addEventListener('click', () => this.game.clearData('inventory'));
        if (this.btnClearLevels) this.btnClearLevels.addEventListener('click', () => {
            this.game.clearData('levels');
            this.updateLevelList(); // Refresh UI immediately
        });

        // Pause Menu Listeners
        if (this.btnResume) this.btnResume.addEventListener('click', () => this.game.togglePause(false));
        if (this.btnPauseBackToTown) this.btnPauseBackToTown.addEventListener('click', () => {
            this.game.togglePause(false);
            this.game.backToTown();
        });
        if (this.btnOpenGM) this.btnOpenGM.addEventListener('click', () => this.game.gmManager.show());
        if (this.btnCloseGM) this.btnCloseGM.addEventListener('click', () => this.game.gmManager.hide());

        if (this.btnGameOverBack) this.btnGameOverBack.addEventListener('click', () => this.game.backToTown());
        if (this.btnVictoryBack) this.btnVictoryBack.addEventListener('click', () => this.game.backToTown());

        // HUD Settings Button
        if (this.btnHudSettings) {
            this.btnHudSettings.addEventListener('click', () => {
                this.game.togglePause(true);
            });
        }
    }

    showTown() {
        this.townUI.style.display = 'block';
        this.townUI.classList.remove('blurred');
        
        this.levelSelectUI.style.display = 'none';
        this.talentUI.style.display = 'none';
        this.inventoryUI.style.display = 'none';
        this.settingsUI.style.display = 'none';
        this.hud.style.display = 'none';
        this.gameOverUI.style.display = 'none'; // Ensure hidden
        this.victoryUI.style.display = 'none'; // Ensure hidden
    }

    showLevelSelect() {
        this.townUI.style.display = 'block';
        this.townUI.classList.add('blurred');
        
        this.updateLevelList();
        this.levelSelectUI.style.display = 'block';
    }

    showSettings() {
        this.townUI.style.display = 'block';
        this.townUI.classList.add('blurred');
        this.settingsUI.style.display = 'block';
    }

    showTalents() {
        this.townUI.style.display = 'block';
        this.townUI.classList.add('blurred');
        this.talentUI.style.display = 'block';
    }

    showInventory() {
        this.townUI.style.display = 'block';
        this.townUI.classList.add('blurred');
        this.inventoryUI.style.display = 'block';
    }

    showHUD() {
        this.townUI.style.display = 'none';
        this.levelSelectUI.style.display = 'none';
        this.talentUI.style.display = 'none';
        this.inventoryUI.style.display = 'none';
        this.settingsUI.style.display = 'none';

        this.hud.style.display = 'block';
        this.bossLabel.style.display = 'none';
    }

    showBossLabel() {
        this.bossLabel.style.display = 'block';
    }

    showLootMsg(text) {
        this.lootMsg.innerText = text;
        this.lootMsg.style.opacity = 1;
        setTimeout(() => this.lootMsg.style.opacity = 0, 2000);
    }

    showPauseMenu() {
        this.pauseMenu.style.display = 'block';
    }

    hidePauseMenu() {
        this.pauseMenu.style.display = 'none';
    }

    showGameOver() {
        this.gameOverUI.style.display = 'block';
    }

    hideGameOver() {
        this.gameOverUI.style.display = 'none';
    }

    showVictory() {
        this.victoryUI.style.display = 'block';
    }

    hideVictory() {
        this.victoryUI.style.display = 'none';
    }

    showLevelUp(level, cards, onSelect) {
        this.levelUpUI.style.display = 'block';
        this.lvlUpLevel.innerText = level;
        this.cardContainer.innerHTML = '';

        cards.forEach(card => {
            const cardEl = document.createElement('div');
            cardEl.className = 'card-choice';
            cardEl.style.cssText = `
                background: #333; 
                border: 2px solid #fff; 
                border-radius: 10px; 
                padding: 20px; 
                width: 200px; 
                cursor: pointer; 
                text-align: center;
                transition: transform 0.2s;
            `;
            cardEl.onmouseover = () => cardEl.style.transform = 'scale(1.05)';
            cardEl.onmouseout = () => cardEl.style.transform = 'scale(1)';

            // Rarity Color
            let borderColor = '#fff';
            if (card.rarity === 'rare') borderColor = '#4fc3f7';
            if (card.rarity === 'epic') borderColor = '#9c27b0';
            if (card.rarity === 'legendary') borderColor = '#ffeb3b';
            cardEl.style.borderColor = borderColor;

            cardEl.innerHTML = `
                <div style="font-size: 48px; margin-bottom: 10px;">${card.icon}</div>
                <h3 style="color: ${borderColor}; margin-bottom: 10px;">${card.name}</h3>
                <p style="font-size: 14px; color: #ccc;">${card.description}</p>
                <div style="margin-top: 10px; font-size: 12px; color: #888;">${card.rarity.toUpperCase()}</div>
            `;

            cardEl.onclick = () => {
                onSelect(card);
                this.levelUpUI.style.display = 'none';
            };

            this.cardContainer.appendChild(cardEl);
        });
    }

    hideLevelUp() {
        this.levelUpUI.style.display = 'none';
    }

    updateLevelList() {
        this.levelList.innerHTML = '';
        // Generate buttons for levels. Let's say we show maxLevel + 2 locked levels for preview
        const showCount = Math.max(3, this.game.maxLevel + 1); 
        
        for (let i = 1; i <= showCount; i++) {
            const btn = document.createElement('button');
            btn.className = 'btn level-btn';
            btn.innerText = `Day ${i}`;
            
            if (i > this.game.maxLevel) {
                btn.classList.add('locked');
                btn.innerText += ' (未解锁)';
            } else {
                btn.onclick = () => this.game.startLevel(i);
            }
            
            this.levelList.appendChild(btn);
        }
    }

    update(player, time, maxTime) {
        if (this.hpBar && player) {
            this.hpBar.style.width = (player.hp / player.maxHp * 100) + '%';
            this.hpText.innerText = Math.floor(player.hp) + '/' + player.maxHp;
            
            if (this.expBar) {
                this.expBar.style.width = (player.exp / player.maxExp * 100) + '%';
                this.expText.innerText = Math.floor(player.exp) + '/' + player.maxExp;
            }
        }
        if (this.progBar) {
            this.progBar.style.width = (time / maxTime * 100) + '%';
        }
        if (this.timerLabel) {
            const remaining = Math.max(0, maxTime - time);
            const m = Math.floor(remaining / 60);
            const s = Math.floor(remaining % 60);
            this.timerLabel.innerText = `距离下班: ${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
    }
}
