// --- 标题界面 ---

class TitleScreen extends FullScreen {
    constructor(config = {}) {
        super({
            id: 'title',
            domId: 'title-screen',
            ...config
        });
        
        this.animationFrame = 0;
        this.domCreated = false;
    }
    
    createDOM() {
        if (this.domCreated) return;
        
        const container = document.getElementById('ui-layer');
        if (!container) return;
        
        const el = document.createElement('div');
        el.id = 'title-screen';
        el.className = 'screen hidden';
        el.innerHTML = `
            <div class="title-content">
                <h1 class="game-title">葵瓜幸存者</h1>
                <p class="game-subtitle">KuiGua Survivors</p>
                <div class="title-char-display">
                    <canvas id="title-char-1" width="120" height="120"></canvas>
                    <canvas id="title-char-2" width="120" height="120"></canvas>
                </div>
                <button class="title-btn" onclick="Lobby.enter()">进入游戏</button>
                <div class="title-hint">
                    <p>WASD / 方向键 移动 | 自动攻击</p>
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
        this.startCharacterAnimation();
    }
    
    onExit() {
        this.stopAnimation();
    }
    
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
    
    enterLobby() {
        Screen.Manager.switchTo('lobby');
    }
}

Screen.register('title', TitleScreen);
