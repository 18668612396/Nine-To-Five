// --- 天赋树界面（浮动） ---

class TalentScreen extends FloatScreen {
    constructor(config = {}) {
        super({
            id: 'talent',
            domId: 'talent-modal',
            closeOnBackdrop: true,
            ...config
        });
    }
    
    onEnter() {
        this.updateGoldDisplay();
        this.renderGrid();
    }
    
    // 更新金币显示
    updateGoldDisplay() {
        const talentGold = document.getElementById('talent-gold');
        if (talentGold && typeof Lobby !== 'undefined') {
            talentGold.textContent = Lobby.playerData.gold;
        }
    }
    
    // 渲染天赋格子
    renderGrid() {
        if (typeof Lobby !== 'undefined') {
            Lobby.renderTalentGrid();
        }
    }
    
    // 升级天赋
    upgradeTalent(talentId) {
        if (typeof Lobby !== 'undefined') {
            Lobby.upgradeTalent(talentId);
            this.updateGoldDisplay();
            this.renderGrid();
        }
    }
}

Screen.register('talent', TalentScreen);
