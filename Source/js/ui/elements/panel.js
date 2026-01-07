// --- 面板容器 ---

class UIPanel extends UI {
    constructor(config = {}) {
        super({
            width: config.width || 400,
            height: config.height || 300,
            backgroundColor: config.backgroundColor || 'rgba(30, 30, 40, 0.95)',
            borderRadius: config.borderRadius || 15,
            borderColor: config.borderColor || 'rgba(255, 255, 255, 0.1)',
            borderWidth: config.borderWidth || 1,
            ...config
        });
        
        this.title = config.title || '';
        this.closable = config.closable !== false;
        this.draggable = config.draggable || false;
        
        // 标题样式
        this.titleStyle = {
            color: config.titleColor || '#ffffff',
            font: config.titleFont || 'bold 20px Arial',
            height: config.titleHeight || 50,
            ...config.titleStyle
        };
        
        // 拖拽状态
        this.isDragging = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        
        // 关闭按钮
        if (this.closable) {
            this.closeButton = new UIButton({
                x: this.width - 40,
                y: 10,
                width: 30,
                height: 30,
                text: '×',
                font: 'bold 20px Arial',
                backgroundColor: 'transparent',
                hoverBackgroundColor: 'rgba(255, 100, 100, 0.3)',
                borderRadius: 15,
                onClick: () => this.close()
            });
            this.addChild(this.closeButton);
        }
        
        // 关闭回调
        this.onClose = config.onClose || null;
    }
    
    draw(ctx) {
        if (!this.visible) return;
        
        const pos = this.getAbsolutePosition();
        
        ctx.save();
        ctx.globalAlpha = this.style.opacity;
        
        // 绘制阴影
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 5;
        
        // 绘制背景
        ctx.fillStyle = this.style.backgroundColor;
        this.drawRoundedRect(ctx, pos.x, pos.y, this.width, this.height, this.style.borderRadius);
        ctx.fill();
        
        // 清除阴影
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        
        // 绘制边框
        if (this.style.borderWidth > 0) {
            ctx.strokeStyle = this.style.borderColor;
            ctx.lineWidth = this.style.borderWidth;
            this.drawRoundedRect(ctx, pos.x, pos.y, this.width, this.height, this.style.borderRadius);
            ctx.stroke();
        }
        
        // 绘制标题
        if (this.title) {
            ctx.fillStyle = this.titleStyle.color;
            ctx.font = this.titleStyle.font;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.title, pos.x + this.width / 2, pos.y + this.titleStyle.height / 2);
            
            // 标题分隔线
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pos.x + 20, pos.y + this.titleStyle.height);
            ctx.lineTo(pos.x + this.width - 20, pos.y + this.titleStyle.height);
            ctx.stroke();
        }
        
        ctx.restore();
        
        // 绘制子元素
        this.children.forEach(child => child.draw(ctx));
    }
    
    // 获取内容区域位置
    getContentPosition() {
        return {
            x: 20,
            y: this.title ? this.titleStyle.height + 20 : 20
        };
    }
    
    // 获取内容区域大小
    getContentSize() {
        const contentY = this.title ? this.titleStyle.height + 20 : 20;
        return {
            width: this.width - 40,
            height: this.height - contentY - 20
        };
    }
    
    close() {
        this.hide();
        if (this.onClose) this.onClose(this);
    }
    
    setTitle(title) {
        this.title = title;
    }
    
    // 居中显示
    centerOn(viewWidth, viewHeight) {
        this.x = (viewWidth - this.width) / 2;
        this.y = (viewHeight - this.height) / 2;
    }
}

UI.register('panel', UIPanel);
