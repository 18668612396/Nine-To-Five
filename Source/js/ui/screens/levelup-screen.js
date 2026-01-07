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
    }
    
    // 设置等级
    setLevel(level) {
        this.level = level;
    }
    
    onEnter() {
        // 暂停游戏
        if (typeof Game !== 'undefined') {
            Game.state = 'LEVELUP';
        }
        
        // 更新等级显示
        const levelEl = document.getElementById('levelup-level');
        if (levelEl) levelEl.textContent = this.level;
        
        // 生成选项卡片
        this.generateCards();
    }
    
    onExit() {
        // 恢复游戏
        if (typeof Game !== 'undefined' && Game.state === 'LEVELUP') {
            Game.state = 'PLAYING';
        }
    }
    
    // 生成选项卡片
    generateCards() {
        if (typeof Game !== 'undefined' && Game.showLevelUpCards) {
            Game.showLevelUpCards();
        }
    }
    
    // 选择卡片
    selectCard(index) {
        if (typeof Game !== 'undefined' && Game.selectLevelUpCard) {
            Game.selectLevelUpCard(index);
        }
        this.close();
    }
}

Screen.register('levelUp', LevelUpScreen);
