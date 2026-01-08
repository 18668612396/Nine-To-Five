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
        this.domCreated = false;
    }
    
    createDOM() {
        if (this.domCreated) return;
        
        const container = document.getElementById('ui-layer');
        if (!container) return;
        
        const el = document.createElement('div');
        el.id = 'adventure-screen';
        el.className = 'screen hidden';
        el.innerHTML = `
            <div class="adventure-container">
                <div class="adventure-header">
                    <h2>⚔️ 冒险</h2>
                    <button class="adventure-back" onclick="Lobby.closeAdventure()">← 返回</button>
                </div>
                <div class="adventure-content">
                    <div class="adventure-section">
                        <h3>难度</h3>
                        <div class="difficulty-options">
                            <div class="difficulty-option selected" data-diff="easy" onclick="Lobby.selectDifficulty('easy', this)">
                                <span class="diff-icon">🌱</span>
                                <span class="diff-name">简单</span>
                            </div>
                            <div class="difficulty-option" data-diff="normal" onclick="Lobby.selectDifficulty('normal', this)">
                                <span class="diff-icon">⚔️</span>
                                <span class="diff-name">普通</span>
                            </div>
                            <div class="difficulty-option" data-diff="hard" onclick="Lobby.selectDifficulty('hard', this)">
                                <span class="diff-icon">💀</span>
                                <span class="diff-name">困难</span>
                            </div>
                        </div>
                    </div>
                    <div class="adventure-section">
                        <h3>地图</h3>
                        <div class="map-options">
                            <div class="map-option selected" data-map="random" onclick="Lobby.selectMap('random', this)">
                                <span class="map-icon">🎲</span>
                                <span class="map-name">随机</span>
                            </div>
                            <div class="map-option" data-map="forest" onclick="Lobby.selectMap('forest', this)">
                                <span class="map-icon">🌲</span>
                                <span class="map-name">森林</span>
                            </div>
                            <div class="map-option" data-map="desert" onclick="Lobby.selectMap('desert', this)">
                                <span class="map-icon">🏜️</span>
                                <span class="map-name">沙漠</span>
                            </div>
                            <div class="map-option" data-map="snow" onclick="Lobby.selectMap('snow', this)">
                                <span class="map-icon">❄️</span>
                                <span class="map-name">雪地</span>
                            </div>
                        </div>
                    </div>
                    <button class="adventure-start-btn" onclick="Lobby.startAdventure()">🚀 出发！</button>
                </div>
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
    
    updateSelection() {
        document.querySelectorAll('.difficulty-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.diff === this.selectedDifficulty);
        });
        
        document.querySelectorAll('.map-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.map === this.selectedMap);
        });
    }
    
    selectDifficulty(diff, element) {
        document.querySelectorAll('.difficulty-option').forEach(opt => opt.classList.remove('selected'));
        if (element) element.classList.add('selected');
        this.selectedDifficulty = diff;
        Lobby.selectedDifficulty = diff;
    }
    
    selectMap(map, element) {
        document.querySelectorAll('.map-option').forEach(opt => opt.classList.remove('selected'));
        if (element) element.classList.add('selected');
        this.selectedMap = map;
        Lobby.selectedMap = map;
    }
    
    start() {
        this.close();
        Screen.Manager.closeAllFloats();
        
        if (typeof Lobby !== 'undefined') {
            Lobby.startAdventure();
        }
    }
    
    back() {
        this.close();
    }
}

Screen.register('adventure', AdventureScreen);
