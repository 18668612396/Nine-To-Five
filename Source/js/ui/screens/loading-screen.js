// --- 加载界面 ---

class LoadingScreen extends FullScreen {
    constructor() {
        super({
            id: 'loading',
            domId: 'loading-screen'
        });
        
        this.progress = 0;
        this.targetProgress = 0;
        this.loadingComplete = false;
        this.fadeOutStarted = false;
        this.domCreated = false;
        
        this.barEl = null;
        this.textEl = null;
    }
    
    createDOM() {
        if (this.domCreated) return;
        
        const el = document.createElement('div');
        el.id = 'loading-screen';
        el.innerHTML = `
            <div class="loading-content">
                <div class="loading-icon">🌻</div>
                <h1 class="loading-title">小葵瓜幸存者</h1>
                <div class="loading-bar-container">
                    <div class="loading-bar"></div>
                </div>
                <p class="loading-text">正在加载...</p>
            </div>
        `;
        
        document.body.insertBefore(el, document.body.firstChild);
        this.domCreated = true;
    }
    
    show() {
        this.createDOM();
        super.show();
    }
    
    onEnter() {
        this.barEl = document.querySelector('.loading-bar');
        this.textEl = document.querySelector('.loading-text');
        this.progress = 0;
        this.targetProgress = 0;
        this.loadingComplete = false;
        this.fadeOutStarted = false;
        
        this.simulateLoading();
    }
    
    simulateLoading() {
        const interval = setInterval(() => {
            this.targetProgress += Math.random() * 15 + 5;
            
            if (this.targetProgress >= 100) {
                this.targetProgress = 100;
                clearInterval(interval);
                this.loadingComplete = true;
            }
        }, 100);
    }
    
    setProgress(value) {
        this.targetProgress = Math.min(100, value);
        if (this.targetProgress >= 100) {
            this.loadingComplete = true;
        }
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        if (this.progress < this.targetProgress) {
            this.progress += (this.targetProgress - this.progress) * 0.1;
            if (this.targetProgress - this.progress < 0.5) {
                this.progress = this.targetProgress;
            }
        }
        
        if (this.barEl) {
            this.barEl.style.width = this.progress + '%';
        }
        
        if (this.textEl) {
            if (this.loadingComplete && this.progress >= 99) {
                this.textEl.textContent = '加载完成!';
            } else {
                this.textEl.textContent = '正在加载... ' + Math.floor(this.progress) + '%';
            }
        }
        
        if (this.loadingComplete && this.progress >= 100 && !this.fadeOutStarted) {
            this.fadeOutStarted = true;
            this.fadeOut();
        }
    }
    
    fadeOut() {
        const el = this.getElement();
        if (el) {
            el.classList.add('fade-out');
            
            setTimeout(() => {
                this.hide();
                el.style.display = 'none';
                
                if (typeof Screen !== 'undefined' && Screen.Manager) {
                    Screen.Manager.switchTo('title');
                }
            }, 500);
        }
    }
}

Screen.register('loading', LoadingScreen);
