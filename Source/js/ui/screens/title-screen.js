// --- 标题界面 ---

class TitleScreen extends FullScreen {
    constructor(config = {}) {
        super({
            id: 'title',
            domId: 'title-screen',
            ...config
        });
        
        this.animationFrame = 0;
    }
    
    onEnter() {
        this.startCharacterAnimation();
    }
    
    onExit() {
        this.stopAnimation();
    }
    
    // 角色动画
    startCharacterAnimation() {
        const canvas1 = document.getElementById('title-char-1');
        const canvas2 = document.getElementById('title-char-2');
        if (!canvas1 || !canvas2) return;
        
        const ctx1 = canvas1.getContext('2d');
        const ctx2 = canvas2.getContext('2d');
        
        this.startAnimation(() => {
            this.animationFrame++;
            ctx1.clearRect(0, 0, 120, 120);
            ctx2.clearRect(0, 0, 120, 120);
            
            GuaguaPlayer.drawCharacter(ctx1, 60, 70, 30, this.animationFrame);
            KuikuiPlayer.drawCharacter(ctx2, 60, 70, 30, this.animationFrame);
        });
    }
    
    // 进入大厅
    enterLobby() {
        Screen.Manager.switchTo('lobby');
    }
}

Screen.register('title', TitleScreen);
