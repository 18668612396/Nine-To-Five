// --- 界面基类 ---

// 界面类型
const SCREEN_TYPE = {
    FULL: 'full',       // 全屏界面（标题、大厅、游戏主界面）
    FLOAT: 'float'      // 浮动界面（背包、设置、升级选择）
};

class Screen {
    constructor(config = {}) {
        this.id = config.id || 'screen_' + Math.random().toString(36).substring(2, 11);
        this.type = config.type || SCREEN_TYPE.FULL;
        this.domId = config.domId || null;  // 对应的DOM元素ID
        
        // 状态
        this.visible = false;
        this.active = false;
        
        // 父界面（仅浮动界面有）
        this.parent = null;
        
        // 子浮动界面
        this.floatScreens = [];
        
        // 动画帧ID
        this.animationId = null;
        
        // 回调
        this.onShow = config.onShow || null;
        this.onHide = config.onHide || null;
        this.onUpdate = config.onUpdate || null;
    }
    
    // 获取DOM元素
    getElement() {
        return this.domId ? document.getElementById(this.domId) : null;
    }
    
    // 显示界面
    show() {
        const el = this.getElement();
        if (el) {
            el.classList.remove('hidden');
        }
        this.visible = true;
        this.active = true;
        
        if (this.onShow) this.onShow(this);
        this.onEnter();
    }
    
    // 隐藏界面
    hide() {
        // 先关闭所有子浮动界面
        this.closeAllFloats();
        
        const el = this.getElement();
        if (el) {
            el.classList.add('hidden');
        }
        this.visible = false;
        this.active = false;
        
        if (this.onHide) this.onHide(this);
        this.onExit();
    }
    
    // 进入界面时调用（子类重写）
    onEnter() {}
    
    // 离开界面时调用（子类重写）
    onExit() {}
    
    // 更新（子类重写）
    update(deltaTime) {
        if (!this.active) return;
        if (this.onUpdate) this.onUpdate(this, deltaTime);
    }
    
    // 绘制（子类重写，用于Canvas绘制）
    draw(ctx) {}
    
    // 开始动画循环
    startAnimation(callback) {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        const animate = () => {
            if (!this.active) return;
            callback();
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }
    
    // 停止动画循环
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    // 打开浮动界面
    openFloat(floatScreen) {
        if (floatScreen.type !== SCREEN_TYPE.FLOAT) {
            console.warn('只能打开浮动类型界面');
            return;
        }
        
        floatScreen.parent = this;
        this.floatScreens.push(floatScreen);
        floatScreen.show();
    }
    
    // 关闭浮动界面
    closeFloat(floatScreen) {
        const index = this.floatScreens.indexOf(floatScreen);
        if (index !== -1) {
            floatScreen.hide();
            floatScreen.parent = null;
            this.floatScreens.splice(index, 1);
        }
    }
    
    // 关闭所有浮动界面
    closeAllFloats() {
        [...this.floatScreens].forEach(fs => {
            fs.hide();
            fs.parent = null;
        });
        this.floatScreens = [];
    }
    
    // 关闭自身（浮动界面用）
    close() {
        if (this.parent) {
            this.parent.closeFloat(this);
        } else {
            this.hide();
        }
    }
}

// ========== 全屏界面基类 ==========
class FullScreen extends Screen {
    constructor(config = {}) {
        super({
            ...config,
            type: SCREEN_TYPE.FULL
        });
    }
}

// ========== 浮动界面基类 ==========
class FloatScreen extends Screen {
    constructor(config = {}) {
        super({
            ...config,
            type: SCREEN_TYPE.FLOAT
        });
        
        // 是否点击背景关闭
        this.closeOnBackdrop = config.closeOnBackdrop !== false;
        
        // 是否显示遮罩
        this.showBackdrop = config.showBackdrop !== false;
    }
    
    show() {
        super.show();
        
        // 暂停父界面（可选）
        if (this.parent && this.pauseParent) {
            this.parent.active = false;
        }
    }
    
    hide() {
        // 恢复父界面
        if (this.parent && this.pauseParent) {
            this.parent.active = true;
        }
        
        super.hide();
    }
}

// ========== 界面管理器 ==========
Screen.Manager = {
    // 所有注册的界面
    screens: {},
    
    // 当前全屏界面
    currentFullScreen: null,
    
    // 浮动界面栈
    floatStack: [],
    
    // 初始化
    init() {
        this.screens = {};
        this.currentFullScreen = null;
        this.floatStack = [];
    },
    
    // 注册界面
    register(id, screen) {
        this.screens[id] = screen;
    },
    
    // 获取界面
    get(id) {
        return this.screens[id];
    },
    
    // 切换全屏界面
    switchTo(screenId) {
        const screen = this.screens[screenId];
        if (!screen) {
            console.warn('未找到界面:', screenId);
            return;
        }
        
        if (screen.type !== SCREEN_TYPE.FULL) {
            console.warn('只能切换到全屏界面');
            return;
        }
        
        // 关闭当前全屏界面
        if (this.currentFullScreen) {
            this.currentFullScreen.hide();
        }
        
        // 清空浮动界面栈
        this.closeAllFloats();
        
        // 显示新界面
        this.currentFullScreen = screen;
        screen.show();
    },
    
    // 打开浮动界面
    openFloat(screenId) {
        const screen = this.screens[screenId];
        if (!screen) {
            console.warn('未找到界面:', screenId);
            return;
        }
        
        if (screen.type !== SCREEN_TYPE.FLOAT) {
            console.warn('只能打开浮动界面');
            return;
        }
        
        // 设置父界面
        if (this.floatStack.length > 0) {
            screen.parent = this.floatStack[this.floatStack.length - 1];
        } else {
            screen.parent = this.currentFullScreen;
        }
        
        this.floatStack.push(screen);
        screen.show();
    },
    
    // 关闭最上层浮动界面
    closeTopFloat() {
        if (this.floatStack.length > 0) {
            const screen = this.floatStack.pop();
            screen.hide();
            screen.parent = null;
        }
    },
    
    // 关闭指定浮动界面
    closeFloat(screenId) {
        const index = this.floatStack.findIndex(s => s.id === screenId);
        if (index !== -1) {
            const screen = this.floatStack[index];
            screen.hide();
            screen.parent = null;
            this.floatStack.splice(index, 1);
        }
    },
    
    // 关闭所有浮动界面
    closeAllFloats() {
        [...this.floatStack].reverse().forEach(screen => {
            screen.hide();
            screen.parent = null;
        });
        this.floatStack = [];
    },
    
    // 更新
    update(deltaTime) {
        if (this.currentFullScreen) {
            this.currentFullScreen.update(deltaTime);
        }
        
        this.floatStack.forEach(screen => {
            screen.update(deltaTime);
        });
    },
    
    // 绘制
    draw(ctx) {
        if (this.currentFullScreen) {
            this.currentFullScreen.draw(ctx);
        }
        
        this.floatStack.forEach(screen => {
            screen.draw(ctx);
        });
    },
    
    // 隐藏所有界面（兼容旧代码）
    hideAll() {
        if (this.currentFullScreen) {
            this.currentFullScreen.hide();
            this.currentFullScreen = null;
        }
        this.closeAllFloats();
    }
};

// 界面类型注册表
const SCREEN_TYPES = {};

Screen.register = function(id, screenClass) {
    SCREEN_TYPES[id] = screenClass;
};

Screen.create = function(id, config) {
    const ScreenClass = SCREEN_TYPES[id];
    if (ScreenClass) {
        return new ScreenClass(config);
    }
    console.warn('未知界面类型:', id);
    return null;
};
