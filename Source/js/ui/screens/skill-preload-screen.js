// --- 技能预装界面（浮动） ---

class SkillPreloadScreen extends FloatScreen {
    constructor(config = {}) {
        super({
            id: 'skillPreload',
            domId: 'skill-preload-modal',
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
        el.id = 'skill-preload-modal';
        el.className = 'screen hidden';
        el.innerHTML = `
            <div class="modal-container wide">
                <div class="modal-header">
                    <h2>🔮 预装技能</h2>
                    <button class="modal-close" onclick="Lobby.closeModal()">✕</button>
                </div>
                <div class="preload-content">
                    <p class="preload-hint">选择开局携带的技能（1星）</p>
                    <div class="preload-slots-container">
                        <h4>技能槽位</h4>
                        <div id="preload-slots" class="preload-slots"></div>
                    </div>
                    <div class="preload-skills-container">
                        <h4>可选技能</h4>
                        <div id="preload-skills-grid" class="preload-skills-grid"></div>
                    </div>
                </div>
                <button class="modal-confirm" onclick="Lobby.confirmSkillPreload()">确认</button>
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
        this.render();
    }
    
    render() {
        if (typeof Lobby !== 'undefined') {
            Lobby.renderSkillPreload();
        }
    }
    
    addSkill(skillId) {
        if (typeof Lobby !== 'undefined') {
            Lobby.addPreloadSkill(skillId);
            this.render();
        }
    }
    
    removeSkill(index) {
        if (typeof Lobby !== 'undefined') {
            Lobby.removePreloadSkill(index);
            this.render();
        }
    }
    
    confirm() {
        if (typeof Lobby !== 'undefined') {
            Lobby.confirmSkillPreload();
        }
        this.close();
    }
}

Screen.register('skillPreload', SkillPreloadScreen);
