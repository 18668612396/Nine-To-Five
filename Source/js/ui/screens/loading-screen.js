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
        
        // DOM 元素
        this.barEl = null;
        this.textEl = null;
    }
    
    onEnter() {
        this.barEl = document.querySelector('.loading-bar');
        this.textEl = document.querySelector('.loading-text');
        this.progress = 0;
        this.targetProgress = 0;
        this.loadingComplete = false;
        this.fadeOutStarted = false;
        
        // 开始模拟加载
        this.simulateLoading();
    }
    
    onExit() {
        // 清理
    }
    
    // 模拟加载进度
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
    
    // 设置真实加载进度
    setProgress(value) {
        this.targetProgress = Math.min(100, value);
        if (this.targetProgress >= 100) {
            this.loadingComplete = true;
        }
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        // 平滑进度条
        if (this.progress < this.targetProgress) {
            this.progress += (this.targetProgress - this.progress) * 0.1;
            if (this.targetProgress - this.progress < 0.5) {
                this.progress = this.targetProgress;
            }
        }
        
        // 更新 DOM
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
        
        // 加载完成后淡出
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
                
                // 切换到标题界面
                if (typeof Screen !== 'undefined' && Screen.Manager) {
                    Screen.Manager.switchTo('title');
                }
            }, 500);
        }
    }
}

// 注册界面
Screen.register('loading', LoadingScreen);
