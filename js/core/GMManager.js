class GMManager {
    constructor(game) {
        this.game = game;
        this.initUI();
    }

    initUI() {
        // Create GM UI container if not exists (though we will add it to HTML)
        this.gmPanel = document.getElementById('gmPanel');
        this.btnWin = document.getElementById('btnGmWin');
        this.btnUnlockLevels = document.getElementById('btnGmUnlockLevels');
        this.btnGodMode = document.getElementById('btnGmGodMode');
        this.inputLevel = document.getElementById('inputGmLevel');

        this.initListeners();
    }

    initListeners() {
        if (this.btnWin) {
            this.btnWin.addEventListener('click', () => {
                if (this.game.state === 'PAUSED' || this.game.state === 'PLAYING') {
                    this.game.togglePause(false); // Unpause first
                    this.game.victory();
                }
            });
        }

        if (this.btnUnlockLevels) {
            this.btnUnlockLevels.addEventListener('click', () => {
                const lvl = parseInt(this.inputLevel.value);
                if (lvl > 0) {
                    this.game.maxLevel = lvl;
                    this.game.saveData();
                    alert(`已解锁至第 ${lvl} 关`);
                    if (this.game.uiManager) this.game.uiManager.updateLevelList();
                }
            });
        }

        if (this.btnGodMode) {
            this.btnGodMode.addEventListener('click', () => {
                if (this.game.player) {
                    this.game.player.isGod = !this.game.player.isGod;
                    this.btnGodMode.innerText = this.game.player.isGod ? "无敌模式: ON" : "无敌模式: OFF";
                    this.btnGodMode.style.background = this.game.player.isGod ? "#4caf50" : "#f44336";
                }
            });
        }

        // Add Weapon Switcher for testing
        const weaponTypes = ['rifle', 'smg', 'sniper', 'shotgun', 'flame'];
        weaponTypes.forEach(type => {
            const btn = document.createElement('button');
            btn.className = 'btn';
            btn.style.fontSize = '12px';
            btn.style.padding = '5px';
            btn.style.marginTop = '5px';
            btn.innerText = `装备: ${type}`;
            btn.onclick = () => {
                if (this.game.player) {
                    this.game.player.equipment.weapon = ItemFactory.createWeapon(type);
                    this.game.player.recalcStats();
                    this.game.player.ammo = this.game.player.maxAmmo;
                    console.log(`Equipped ${type}`);
                }
            };
            this.gmPanel.querySelector('.settings-group').appendChild(btn);
        });
    }

    show() {
        if (this.gmPanel) this.gmPanel.style.display = 'block';
    }

    hide() {
        if (this.gmPanel) this.gmPanel.style.display = 'none';
    }
}
