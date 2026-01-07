// --- 冒险选择界面（浮动） ---

class AdventureScreen extends FloatScreen {
    constructor(config = {}) {
        super({
            id: 'adventure',
            domId: 'adventure-screen',
            closeOnBackdrop: false,
            ...config
        });
        
        this.selectedDifficulty = 'easy';
        this.selectedMap = 'random';
    }
    
    onEnter() {
        // 检查预装技能
        const hasMagicSkill = Lobby.preloadedSkills.some(skillId => 
            typeof MAGIC_SKILLS !== 'undefined' && MAGIC_SKILLS[skillId] !== undefined
        );
        
        if (!hasMagicSkill) {
            alert('请至少预装一个主动技能！');
            this.close();
            return;
        }
        
        this.selectedDifficulty = Lobby.selectedDifficulty || 'easy';
        this.selectedMap = Lobby.selectedMap || 'random';
        this.updateSelection();
    }
    
    // 更新选中状态
    updateSelection() {
        document.querySelectorAll('.difficulty-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.diff === this.selectedDifficulty);
        });
        
        document.querySelectorAll('.map-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.map === this.selectedMap);
        });
    }
    
    // 选择难度
    selectDifficulty(diff, element) {
        document.querySelectorAll('.difficulty-option').forEach(opt => opt.classList.remove('selected'));
        if (element) element.classList.add('selected');
        this.selectedDifficulty = diff;
        Lobby.selectedDifficulty = diff;
    }
    
    // 选择地图
    selectMap(map, element) {
        document.querySelectorAll('.map-option').forEach(opt => opt.classList.remove('selected'));
        if (element) element.classList.add('selected');
        this.selectedMap = map;
        Lobby.selectedMap = map;
    }
    
    // 开始冒险
    start() {
        this.close();
        Screen.Manager.closeAllFloats();
        
        if (typeof Lobby !== 'undefined') {
            Lobby.startAdventure();
        }
    }
    
    // 返回
    back() {
        this.close();
    }
}

Screen.register('adventure', AdventureScreen);
