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
        this.domCreated = false;
    }
    
    createDOM() {
        if (this.domCreated) return;
        
        const container = document.getElementById('ui-layer');
        if (!container) return;
        
        const el = document.createElement('div');
        el.id = 'char-select-modal';
        el.className = 'screen hidden';
        el.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h2>👤 选择英雄</h2>
                    <button class="modal-close" onclick="Lobby.closeModal()">✕</button>
                </div>
                <div class="char-select-grid">
                    <div class="char-card selected" data-char="guagua" onclick="Lobby.selectChar('guagua', this)">
                        <canvas class="char-card-canvas" width="80" height="80" data-char="guagua"></canvas>
                        <div class="char-card-info">
                            <h3>瓜瓜</h3>
                            <p>速度+15%</p>
                        </div>
                        <div class="char-card-check">✓</div>
                    </div>
                    <div class="char-card" data-char="kuikui" onclick="Lobby.selectChar('kuikui', this)">
                        <canvas class="char-card-canvas" width="80" height="80" data-char="kuikui"></canvas>
                        <div class="char-card-info">
                            <h3>葵葵</h3>
                            <p>血量+20</p>
                        </div>
                        <div class="char-card-check">✓</div>
                    </div>
                </div>
                <button class="modal-confirm" onclick="Lobby.confirmChar()">确认</button>
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
        this.selectedChar = Lobby.selectedChar || 'guagua';
        this.updateSelection();
        this.startCardAnimation();
    }
    
    onExit() {
        this.stopAnimation();
    }
    
    updateSelection() {
        document.querySelectorAll('.char-card').forEach(card => {
            card.classList.toggle('selected', card.dataset.char === this.selectedChar);
        });
    }
    
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
    
    selectChar(charType, element) {
        document.querySelectorAll('.char-card').forEach(card => card.classList.remove('selected'));
        if (element) element.classList.add('selected');
        this.selectedChar = charType;
    }
    
    confirm() {
        Lobby.selectedChar = this.selectedChar;
        
        const lobbyScreen = Screen.Manager.get('lobby');
        if (lobbyScreen) {
            lobbyScreen.selectChar(this.selectedChar);
        }
        
        this.close();
    }
}

Screen.register('charSelect', CharSelectScreen);
