// --- 角色选择界面（浮动） ---

class CharSelectScreen extends FloatScreen {
    constructor(config = {}) {
        super({
            id: 'charSelect',
            domId: 'char-select-modal',
            closeOnBackdrop: true,
            ...config
        });
        
        this.selectedChar = 'guagua';
        this.animationFrame = 0;
    }
    
    onEnter() {
        this.selectedChar = Lobby.selectedChar || 'guagua';
        this.updateSelection();
        this.startCardAnimation();
    }
    
    onExit() {
        this.stopAnimation();
    }
    
    // 更新选中状态
    updateSelection() {
        document.querySelectorAll('.char-card').forEach(card => {
            card.classList.toggle('selected', card.dataset.char === this.selectedChar);
        });
    }
    
    // 角色卡片动画
    startCardAnimation() {
        const canvases = document.querySelectorAll('.char-card-canvas');
        
        this.startAnimation(() => {
            this.animationFrame++;
            canvases.forEach(canvas => {
                const ctx = canvas.getContext('2d');
                const charType = canvas.dataset.char;
                ctx.clearRect(0, 0, 80, 80);
                
                if (charType === 'guagua') {
                    GuaguaPlayer.drawCharacter(ctx, 40, 45, 22, this.animationFrame);
                } else {
                    KuikuiPlayer.drawCharacter(ctx, 40, 45, 22, this.animationFrame);
                }
            });
        });
    }
    
    // 选择角色
    selectChar(charType, element) {
        document.querySelectorAll('.char-card').forEach(card => card.classList.remove('selected'));
        if (element) element.classList.add('selected');
        this.selectedChar = charType;
    }
    
    // 确认选择
    confirm() {
        Lobby.selectedChar = this.selectedChar;
        
        // 更新大厅显示
        const lobbyScreen = Screen.Manager.get('lobby');
        if (lobbyScreen) {
            lobbyScreen.selectChar(this.selectedChar);
        }
        
        this.close();
    }
}

Screen.register('charSelect', CharSelectScreen);
