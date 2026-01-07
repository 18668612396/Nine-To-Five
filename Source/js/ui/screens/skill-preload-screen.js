// --- 技能预装界面（浮动） ---

class SkillPreloadScreen extends FloatScreen {
    constructor(config = {}) {
        super({
            id: 'skillPreload',
            domId: 'skill-preload-modal',
            closeOnBackdrop: true,
            ...config
        });
    }
    
    onEnter() {
        this.render();
    }
    
    // 渲染界面
    render() {
        if (typeof Lobby !== 'undefined') {
            Lobby.renderSkillPreload();
        }
    }
    
    // 添加技能
    addSkill(skillId) {
        if (typeof Lobby !== 'undefined') {
            Lobby.addPreloadSkill(skillId);
            this.render();
        }
    }
    
    // 移除技能
    removeSkill(index) {
        if (typeof Lobby !== 'undefined') {
            Lobby.removePreloadSkill(index);
            this.render();
        }
    }
    
    // 确认
    confirm() {
        if (typeof Lobby !== 'undefined') {
            Lobby.confirmSkillPreload();
        }
        this.close();
    }
}

Screen.register('skillPreload', SkillPreloadScreen);
