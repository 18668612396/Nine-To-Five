// --- 天赋树界面（浮动） ---

class TalentScreen extends FloatScreen {
    constructor(config = {}) {
        super({
            id: 'talent',
            domId: 'talent-modal',
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
        el.id = 'talent-modal';
        el.className = 'screen hidden';
        el.innerHTML = `
            <div class="modal-container wide">
                <div class="modal-header">
                    <h2>🌟 天赋树</h2>
                    <div class="talent-gold">💰 <span id="talent-gold">0</span></div>
                    <button class="modal-close" onclick="Lobby.closeModal()">✕</button>
                </div>
                <div class="talent-grid" id="talent-grid"></div>
                <p class="talent-hint">消耗金币永久强化角色属性</p>
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
        this.updateGoldDisplay();
        this.renderGrid();
    }
    
    updateGoldDisplay() {
        const talentGold = document.getElementById('talent-gold');
        if (talentGold && typeof Lobby !== 'undefined') {
            talentGold.textContent = Lobby.playerData.gold;
        }
    }
    
    renderGrid() {
        if (typeof Lobby !== 'undefined') {
            Lobby.renderTalentGrid();
        }
    }
    
    upgradeTalent(talentId) {
        if (typeof Lobby !== 'undefined') {
            Lobby.upgradeTalent(talentId);
            this.updateGoldDisplay();
            this.renderGrid();
        }
    }
}

Screen.register('talent', TalentScreen);
