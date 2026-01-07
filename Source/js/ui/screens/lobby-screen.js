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
    }
    
    onEnter() {
        this.updateCharDisplay();
        this.updateGoldDisplay();
        this.startCharacterAnimation();
    }
    
    onExit() {
        this.stopAnimation();
    }
    
    // 角色动画
    startCharacterAnimation() {
        const canvas = document.getElementById('lobby-char-canvas');
        const avatarCanvas = document.getElementById('lobby-avatar');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const avatarCtx = avatarCanvas ? avatarCanvas.getContext('2d') : null;
        
        this.startAnimation(() => {
            this.animationFrame++;
            
            // 主角色
            ctx.clearRect(0, 0, 300, 350);
            if (typeof CharacterRenderer !== 'undefined') {
                if (this.selectedChar === 'guagua') {
                    CharacterRenderer.drawGuagua(ctx, 150, 200, 80, this.animationFrame);
                } else {
                    CharacterRenderer.drawKuikui(ctx, 150, 200, 80, this.animationFrame);
                }
            }
            
            // 头像
            if (avatarCtx && typeof CharacterRenderer !== 'undefined') {
                avatarCtx.clearRect(0, 0, 50, 50);
                if (this.selectedChar === 'guagua') {
                    CharacterRenderer.drawGuagua(avatarCtx, 25, 30, 15, this.animationFrame);
                } else {
                    CharacterRenderer.drawKuikui(avatarCtx, 25, 30, 15, this.animationFrame);
                }
            }
        });
    }
    
    // 更新角色展示
    updateCharDisplay() {
        const name = document.getElementById('lobby-char-name');
        const stats = document.getElementById('lobby-char-stats');
        
        if (this.selectedChar === 'guagua') {
            if (name) name.textContent = '瓜瓜';
            if (stats) stats.textContent = '速度+10%';
        } else {
            if (name) name.textContent = '葵葵';
            if (stats) stats.textContent = '血量+20%';
        }
    }
    
    // 更新金币显示
    updateGoldDisplay() {
        const lobbyGold = document.getElementById('lobby-gold');
        const talentGold = document.getElementById('talent-gold');
        const gold = Lobby.playerData?.gold || 0;
        if (lobbyGold) lobbyGold.textContent = gold;
        if (talentGold) talentGold.textContent = gold;
    }
    
    // 选择角色
    selectChar(charType) {
        this.selectedChar = charType;
        Lobby.selectedChar = charType;
        this.updateCharDisplay();
    }
    
    // 选择难度
    selectDifficulty(diff) {
        this.selectedDifficulty = diff;
        Lobby.selectedDifficulty = diff;
    }
    
    // 选择地图
    selectMap(map) {
        this.selectedMap = map;
        Lobby.selectedMap = map;
    }
    
    // 返回标题
    backToTitle() {
        Screen.Manager.switchTo('title');
    }
    
    // 打开角色选择
    showCharSelect() {
        Screen.Manager.openFloat('charSelect');
    }
    
    // 打开技能预装
    showSkillPreload() {
        Screen.Manager.openFloat('skillPreload');
    }
    
    // 打开天赋树
    showTalentTree() {
        Screen.Manager.openFloat('talent');
    }
    
    // 打开图鉴
    showCollection() {
        Screen.Manager.openFloat('collection');
    }
    
    // 打开冒险选择
    showAdventure() {
        Screen.Manager.openFloat('adventure');
    }
}

Screen.register('lobby', LobbyScreen);
