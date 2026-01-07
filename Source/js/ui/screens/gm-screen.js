// --- GM面板（浮动） ---

class GMScreen extends FloatScreen {
    constructor(config = {}) {
        super({
            id: 'gm',
            domId: 'gm-modal',
            closeOnBackdrop: true,
            ...config
        });
    }
    
    onEnter() {
        if (typeof GM !== 'undefined' && GM.renderLists) {
            GM.renderLists();
        }
    }
    
    // 添加金币
    addGold(amount) {
        if (typeof GM !== 'undefined') {
            GM.addGold(amount);
        }
    }
    
    // 召唤Boss
    spawnBoss(bossId) {
        if (typeof GM !== 'undefined') {
            GM.spawnBoss(bossId);
        }
    }
    
    // 添加技能
    addSkill(skillId) {
        if (typeof GM !== 'undefined') {
            GM.addSkill(skillId);
        }
    }
    
    // 添加祝福
    addPerk(perkId) {
        if (typeof GM !== 'undefined') {
            GM.addPerk(perkId);
        }
    }
}

Screen.register('gm', GMScreen);
