// --- UI基类 ---

class UI {
    constructor(config = {}) {
        this.id = config.id || 'ui_' + Math.random().toString(36).substring(2, 11);
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.width = config.width || 100;
        this.height = config.height || 40;
        
        // 状态
        this.visible = config.visible !== false;
        this.enabled = config.enabled !== false;
        this.focused = false;
        this.hovered = false;
        this.pressed = false;
        
        // 层级
        this.zIndex = config.zIndex || 0;
        
        // 父元素
        this.parent = null;
        this.children = [];
        
        // 样式
        this.style = {
            backgroundColor: config.backgroundColor || 'transparent',
            borderColor: config.borderColor || 'transparent',
            borderWidth: config.borderWidth || 0,
            borderRadius: config.borderRadius || 0,
            opacity: config.opacity !== undefined ? config.opacity : 1,
            ...config.style
        };
        
        // 事件回调
        this.onClick = config.onClick || null;
        this.onHover = config.onHover || null;
        this.onPress = config.onPress || null;
        this.onRelease = config.onRelease || null;
    }
    
    // 获取绝对位置
    getAbsolutePosition() {
        let x = this.x;
        let y = this.y;
        let parent = this.parent;
        
        while (parent) {
            x += parent.x;
            y += parent.y;
            parent = parent.parent;
        }
        
        return { x, y };
    }
    
    // 检测点是否在元素内
    containsPoint(px, py) {
        const pos = this.getAbsolutePosition();
        return px >= pos.x && px <= pos.x + this.width &&
               py >= pos.y && py <= pos.y + this.height;
    }
    
    // 添加子元素
    addChild(child) {
        child.parent = this;
        this.children.push(child);
        this.children.sort((a, b) => a.zIndex - b.zIndex);
        return child;
    }
    
    // 移除子元素
    removeChild(child) {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            child.parent = null;
            this.children.splice(index, 1);
        }
    }
    
    // 清空子元素
    clearChildren() {
        this.children.forEach(child => child.parent = null);
        this.children = [];
    }
    
    // 更新（子类重写）
    update(deltaTime) {
        if (!this.visible) return;
        
        // 更新子元素
        this.children.forEach(child => child.update(deltaTime));
    }
    
    // 绘制（子类重写）
    draw(ctx) {
        if (!this.visible) return;
        
        const pos = this.getAbsolutePosition();
        
        ctx.save();
        ctx.globalAlpha = this.style.opacity;
        
        // 绘制背景
        if (this.style.backgroundColor !== 'transparent') {
            ctx.fillStyle = this.style.backgroundColor;
            this.drawRoundedRect(ctx, pos.x, pos.y, this.width, this.height, this.style.borderRadius);
            ctx.fill();
        }
        
        // 绘制边框
        if (this.style.borderWidth > 0 && this.style.borderColor !== 'transparent') {
            ctx.strokeStyle = this.style.borderColor;
            ctx.lineWidth = this.style.borderWidth;
            this.drawRoundedRect(ctx, pos.x, pos.y, this.width, this.height, this.style.borderRadius);
            ctx.stroke();
        }
        
        ctx.restore();
        
        // 绘制子元素
        this.children.forEach(child => child.draw(ctx));
    }
    
    // 绘制圆角矩形
    drawRoundedRect(ctx, x, y, width, height, radius) {
        if (radius === 0) {
            ctx.beginPath();
            ctx.rect(x, y, width, height);
            return;
        }
        
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
    
    // 处理鼠标按下
    handleMouseDown(mx, my) {
        if (!this.visible || !this.enabled) return false;
        
        // 先检查子元素（从上到下）
        for (let i = this.children.length - 1; i >= 0; i--) {
            if (this.children[i].handleMouseDown(mx, my)) {
                return true;
            }
        }
        
        if (this.containsPoint(mx, my)) {
            this.pressed = true;
            if (this.onPress) this.onPress(this);
            return true;
        }
        
        return false;
    }
    
    // 处理鼠标抬起
    handleMouseUp(mx, my) {
        if (!this.visible || !this.enabled) return false;
        
        // 先检查子元素
        for (let i = this.children.length - 1; i >= 0; i--) {
            if (this.children[i].handleMouseUp(mx, my)) {
                return true;
            }
        }
        
        if (this.pressed && this.containsPoint(mx, my)) {
            this.pressed = false;
            if (this.onClick) this.onClick(this);
            if (this.onRelease) this.onRelease(this);
            return true;
        }
        
        this.pressed = false;
        return false;
    }
    
    // 处理鼠标移动
    handleMouseMove(mx, my) {
        if (!this.visible || !this.enabled) return false;
        
        // 先检查子元素
        for (let i = this.children.length - 1; i >= 0; i--) {
            this.children[i].handleMouseMove(mx, my);
        }
        
        const wasHovered = this.hovered;
        this.hovered = this.containsPoint(mx, my);
        
        if (this.hovered && !wasHovered && this.onHover) {
            this.onHover(this, true);
        } else if (!this.hovered && wasHovered && this.onHover) {
            this.onHover(this, false);
        }
        
        return this.hovered;
    }
    
    // 显示
    show() {
        this.visible = true;
    }
    
    // 隐藏
    hide() {
        this.visible = false;
    }
    
    // 设置位置
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    
    // 设置大小
    setSize(width, height) {
        this.width = width;
        this.height = height;
    }
}

// UI类型注册表
const UI_TYPES = {};

UI.register = function(id, uiClass) {
    UI_TYPES[id] = uiClass;
};

UI.create = function(id, config) {
    const UIClass = UI_TYPES[id];
    if (UIClass) {
        return new UIClass(config);
    }
    console.warn('未知UI类型:', id);
    return null;
};

// ========== UI管理器 (静态) ==========
UI.Manager = {
    // 所有UI层
    layers: {
        background: [],  // 背景层
        game: [],        // 游戏UI层（血条等）
        hud: [],         // HUD层
        panel: [],       // 面板层
        popup: [],       // 弹窗层
        tooltip: []      // 提示层
    },
    
    // 当前屏幕
    currentScreen: null,
    screens: {},
    
    // 视口大小
    viewWidth: 800,
    viewHeight: 600,
    
    // 鼠标状态
    mouseX: 0,
    mouseY: 0,

    // 初始化
    init(viewWidth, viewHeight) {
        this.viewWidth = viewWidth || 800;
        this.viewHeight = viewHeight || 600;
        this.clearAll();
    },
    
    // 处理鼠标按下
    handleMouseDown(x, y) {
        this.mouseX = x;
        this.mouseY = y;
        
        // 从上到下检查各层
        const layerOrder = ['tooltip', 'popup', 'panel', 'hud', 'game', 'background'];
        for (const layerName of layerOrder) {
            const layer = this.layers[layerName];
            for (let i = layer.length - 1; i >= 0; i--) {
                if (layer[i].handleMouseDown(x, y)) {
                    return true;
                }
            }
        }
        return false;
    },
    
    // 处理鼠标抬起
    handleMouseUp(x, y) {
        this.mouseX = x;
        this.mouseY = y;
        
        const layerOrder = ['tooltip', 'popup', 'panel', 'hud', 'game', 'background'];
        for (const layerName of layerOrder) {
            const layer = this.layers[layerName];
            for (let i = layer.length - 1; i >= 0; i--) {
                if (layer[i].handleMouseUp(x, y)) {
                    return true;
                }
            }
        }
        return false;
    },
    
    // 处理鼠标移动
    handleMouseMove(x, y) {
        this.mouseX = x;
        this.mouseY = y;
        
        const layerOrder = ['tooltip', 'popup', 'panel', 'hud', 'game', 'background'];
        for (const layerName of layerOrder) {
            const layer = this.layers[layerName];
            for (let i = layer.length - 1; i >= 0; i--) {
                layer[i].handleMouseMove(x, y);
            }
        }
    },
    
    // 添加元素到层
    addToLayer(element, layerName = 'hud') {
        if (this.layers[layerName]) {
            this.layers[layerName].push(element);
            this.layers[layerName].sort((a, b) => a.zIndex - b.zIndex);
        }
        return element;
    },
    
    // 从层移除元素
    removeFromLayer(element, layerName) {
        if (layerName) {
            const layer = this.layers[layerName];
            const index = layer.indexOf(element);
            if (index !== -1) {
                layer.splice(index, 1);
            }
        } else {
            // 从所有层查找并移除
            for (const layer of Object.values(this.layers)) {
                const index = layer.indexOf(element);
                if (index !== -1) {
                    layer.splice(index, 1);
                    break;
                }
            }
        }
    },
    
    // 清空指定层
    clearLayer(layerName) {
        if (this.layers[layerName]) {
            this.layers[layerName] = [];
        }
    },
    
    // 清空所有层
    clearAll() {
        for (const layerName of Object.keys(this.layers)) {
            this.layers[layerName] = [];
        }
    },
    
    // 注册屏幕
    registerScreen(id, screen) {
        this.screens[id] = screen;
    },
    
    // 切换屏幕
    switchScreen(screenId) {
        if (this.currentScreen) {
            this.currentScreen.hide();
        }
        
        this.currentScreen = this.screens[screenId];
        
        if (this.currentScreen) {
            this.currentScreen.show();
        }
    },
    
    // 更新
    update(deltaTime) {
        for (const layer of Object.values(this.layers)) {
            layer.forEach(element => element.update(deltaTime));
        }
    },
    
    // 绘制
    draw(ctx) {
        const layerOrder = ['background', 'game', 'hud', 'panel', 'popup', 'tooltip'];
        for (const layerName of layerOrder) {
            const layer = this.layers[layerName];
            layer.forEach(element => element.draw(ctx));
        }
    },
    
    // 创建并添加元素
    create(type, config, layerName = 'hud') {
        const element = UI.create(type, config);
        if (element) {
            this.addToLayer(element, layerName);
        }
        return element;
    },
    
    // 显示面板
    showPanel(panel) {
        panel.centerOn(this.viewWidth, this.viewHeight);
        panel.show();
        this.addToLayer(panel, 'panel');
    },
    
    // 关闭所有面板
    closeAllPanels() {
        this.layers.panel.forEach(panel => panel.hide());
        this.layers.panel = [];
    },
    
    // 显示提示
    showTooltip(text, x, y) {
        const tooltip = UI.create('label', {
            x: x,
            y: y - 30,
            text: text,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderRadius: 5
        });
        if (tooltip) {
            this.addToLayer(tooltip, 'tooltip');
        }
        return tooltip;
    },
    
    // 隐藏所有提示
    hideTooltips() {
        this.layers.tooltip = [];
    }
};

// 兼容别名
const UIElement = UI;
const UIManager = UI.Manager;
