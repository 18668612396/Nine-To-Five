// --- 按钮 ---

class UIButton extends UI {
    constructor(config = {}) {
        super({
            width: config.width || 150,
            height: config.height || 45,
            backgroundColor: config.backgroundColor || 'rgba(100, 100, 100, 0.8)',
            borderRadius: config.borderRadius || 8,
            ...config
        });
        
        this.text = config.text || '按钮';
        this.icon = config.icon || null;
        
        // 文字样式
        this.textStyle = {
            color: config.textColor || '#ffffff',
            font: config.font || 'bold 16px Arial',
            align: config.textAlign || 'center',
            ...config.textStyle
        };
        
        // 状态样式
        this.hoverStyle = {
            backgroundColor: config.hoverBackgroundColor || 'rgba(120, 120, 120, 0.9)',
            ...config.hoverStyle
        };
        
        this.pressedStyle = {
            backgroundColor: config.pressedBackgroundColor || 'rgba(80, 80, 80, 0.9)',
            ...config.pressedStyle
        };
        
        this.disabledStyle = {
            backgroundColor: config.disabledBackgroundColor || 'rgba(60, 60, 60, 0.5)',
            textColor: config.disabledTextColor || '#888888',
            ...config.disabledStyle
        };
    }
    
    draw(ctx) {
        if (!this.visible) return;
        
        const pos = this.getAbsolutePosition();
        
        ctx.save();
        ctx.globalAlpha = this.style.opacity;
        
        // 根据状态选择样式
        let bgColor = this.style.backgroundColor;
        let textColor = this.textStyle.color;
        
        if (!this.enabled) {
            bgColor = this.disabledStyle.backgroundColor;
            textColor = this.disabledStyle.textColor;
        } else if (this.pressed) {
            bgColor = this.pressedStyle.backgroundColor;
        } else if (this.hovered) {
            bgColor = this.hoverStyle.backgroundColor;
        }
        
        // 绘制背景
        ctx.fillStyle = bgColor;
        this.drawRoundedRect(ctx, pos.x, pos.y, this.width, this.height, this.style.borderRadius);
        ctx.fill();
        
        // 绘制边框
        if (this.style.borderWidth > 0) {
            ctx.strokeStyle = this.style.borderColor;
            ctx.lineWidth = this.style.borderWidth;
            this.drawRoundedRect(ctx, pos.x, pos.y, this.width, this.height, this.style.borderRadius);
            ctx.stroke();
        }
        
        // 绘制图标和文字
        ctx.fillStyle = textColor;
        ctx.font = this.textStyle.font;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let textX = pos.x + this.width / 2;
        const textY = pos.y + this.height / 2;
        
        if (this.icon) {
            const iconWidth = 24;
            const totalWidth = iconWidth + 8 + ctx.measureText(this.text).width;
            const startX = pos.x + (this.width - totalWidth) / 2;
            
            // 绘制图标
            ctx.font = '20px Arial';
            ctx.fillText(this.icon, startX + iconWidth / 2, textY);
            
            // 绘制文字
            ctx.font = this.textStyle.font;
            ctx.textAlign = 'left';
            ctx.fillText(this.text, startX + iconWidth + 8, textY);
        } else {
            ctx.fillText(this.text, textX, textY);
        }
        
        ctx.restore();
        
        // 绘制子元素
        this.children.forEach(child => child.draw(ctx));
    }
    
    setText(text) {
        this.text = text;
    }
    
    setIcon(icon) {
        this.icon = icon;
    }
}

UI.register('button', UIButton);
