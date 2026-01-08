// --- 大厅界面 ---

class LobbyScreen extends FullScreen {
    constructor(config = {}) {
        super({
            id: 'lobby',
            domId: 'lobby-screen',
            ...config
        });
        
        this.animationFrame = 0;
        this.selectedChar = 'guagua';
        this.selectedDifficulty = 'easy';
        this.selectedMap = 'random';
        this.domCreated = false;
    }
    
    createDOM() {
        if (this.domCreated) return;
        
        const container = document.getElementById('ui-layer');
        if (!container) return;
        
        const el = document.createElement('div');
        el.id = 'lobby-screen';
        el.className = 'screen hidden';
        el.innerHTML = `
            <div class="lobby-bg"></div>
            
            <div class="lobby-top-bar">
                <div class="player-info">
                    <div class="player-avatar">
                        <canvas id="lobby-avatar" width="50" height="50"></canvas>
                    </div>
                    <div class="player-details">
                        <span class="player-name">玩家</span>
                        <span class="player-level">Lv.1</span>
                    </div>
                </div>
                <div class="currency-display">
                    <div class="currency-item">
                        <span class="currency-icon">💰</span>
                        <span class="currency-value" id="lobby-gold">0</span>
                    </div>
                </div>
            </div>
            
            <div class="lobby-center">
                <canvas id="lobby-char-canvas" width="300" height="350"></canvas>
                <div class="char-info-panel">
                    <h2 id="lobby-char-name">瓜瓜</h2>
                    <p id="lobby-char-stats">速度+15%</p>
                </div>
            </div>
            
            <div class="lobby-bottom-bar">
                <div class="lobby-nav">
                    <button class="nav-btn" onclick="Lobby.showCharSelect()">
                        <span class="nav-icon">👤</span>
                        <span class="nav-text">英雄</span>
                    </button>
                    <button class="nav-btn" onclick="Lobby.showSkillPreload()">
                        <span class="nav-icon">🔮</span>
                        <span class="nav-text">装备</span>
                    </button>
                    <button class="nav-btn primary" onclick="Lobby.showAdventure()">
                        <span class="nav-icon">⚔️</span>
                        <span class="nav-text">开始</span>
                    </button>
                    <button class="nav-btn" onclick="Lobby.showTalentTree()">
                        <span class="nav-icon">🌟</span>
                        <span class="nav-text">天赋</span>
                    </button>
                    <button class="nav-btn" onclick="Lobby.showCollection()">
                        <span class="nav-icon">📖</span>
                        <span class="nav-text">图鉴</span>
                    </button>
                </div>
            </div>
            
            <button class="lobby-back-btn" onclick="Lobby.backToTitle()">🚪 退出</button>
        `;
        
        container.appendChild(el);
        this.domCreated = true;
    }
    
    show() {
        this.createDOM();
        super.show();
    }
    
    onEnter() {
        this.updateCharDisplay();
        this.updateGoldDisplay();
        this.startCharacterAnimation();
    }
    
    onExit() {
        this.stopAnimation();
    }
    
    startCharacterAnimation() {
        const canvas = document.getElementById('lobby-char-canvas');
        const avatarCanvas = document.getElementById('lobby-avatar');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const avatarCtx = avatarCanvas ? avatarCanvas.getContext('2d') : null;
        
        this.startAnimation(() => {
            this.animationFrame++;
            
            ctx.clearRect(0, 0, 300, 350);
            if (this.selectedChar === 'guagua') {
                GuaguaPlayer.drawCharacter(ctx, 150, 200, 80, this.animationFrame);
            } else {
                KuikuiPlayer.drawCharacter(ctx, 150, 200, 80, this.animationFrame);
            }
            
            if (avatarCtx) {
                avatarCtx.clearRect(0, 0, 50, 50);
                if (this.selectedChar === 'guagua') {
                    GuaguaPlayer.drawCharacter(avatarCtx, 25, 30, 15, this.animationFrame);
                } else {
                    KuikuiPlayer.drawCharacter(avatarCtx, 25, 30, 15, this.animationFrame);
                }
            }
        });
    }
    
    updateCharDisplay() {
        const name = document.getElementById('lobby-char-name');
        const stats = document.getElementById('lobby-char-stats');
        
        if (this.selectedChar === 'guagua') {
            if (name) name.textContent = '瓜瓜';
            if (stats) stats.textContent = '速度+15%';
        } else {
            if (name) name.textContent = '葵葵';
            if (stats) stats.textContent = '血量+20';
        }
    }
    
    updateGoldDisplay() {
        const lobbyGold = document.getElementById('lobby-gold');
        const talentGold = document.getElementById('talent-gold');
        const gold = Lobby.playerData?.gold || 0;
        if (lobbyGold) lobbyGold.textContent = gold;
        if (talentGold) talentGold.textContent = gold;
    }
    
    selectChar(charType) {
        this.selectedChar = charType;
        Lobby.selectedChar = charType;
        this.updateCharDisplay();
    }
    
    selectDifficulty(diff) {
        this.selectedDifficulty = diff;
        Lobby.selectedDifficulty = diff;
    }
    
    selectMap(map) {
        this.selectedMap = map;
        Lobby.selectedMap = map;
    }
    
    backToTitle() {
        Screen.Manager.switchTo('title');
    }
    
    showCharSelect() {
        Screen.Manager.openFloat('charSelect');
    }
    
    showSkillPreload() {
        Screen.Manager.openFloat('skillPreload');
    }
    
    showTalentTree() {
        Screen.Manager.openFloat('talent');
    }
    
    showCollection() {
        Screen.Manager.openFloat('collection');
    }
    
    showAdventure() {
        Screen.Manager.openFloat('adventure');
    }
}

Screen.register('lobby', LobbyScreen);
