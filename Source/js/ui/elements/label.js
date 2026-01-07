// --- 文本标签 ---

class UILabel extends UI {
    constructor(config = {}) {
        super({
            width: config.width || 200,
            height: config.height || 30,
            backgroundColor: 'transparent',
            ...config
        });
        
        this.text = config.text || '';
        
        // 文字样式
        this.textStyle = {
            color: config.color || '#ffffff',
            font: config.font || '16px Arial',
            align: config.align || 'left',
            baseline: config.baseline || 'middle',
            shadow: config.shadow || false,
            shadowColor: config.shadowColor || 'rgba(0,0,0,0.5)',
            shadowBlur: config.shadowBlur || 4,
            ...config.textStyle
        };
        
        // 多行支持
        this.multiline = config.multiline || false;
        this.lineHeight = config.lineHeight || 1.2;
    }
    
    draw(ctx) {
        if (!this.visible || !this.text) return;
        
        const pos = this.getAbsolutePosition();
        
        ctx.save();
        ctx.globalAlpha = this.style.opacity;
        
        // 绘制背景（如果有）
        if (this.style.backgroundColor !== 'transparent') {
            ctx.fillStyle = this.style.backgroundColor;
            this.drawRoundedRect(ctx, pos.x, pos.y, this.width, this.height, this.style.borderRadius);
            ctx.fill();
        }
        
        // 设置文字样式
        ctx.fillStyle = this.textStyle.color;
        ctx.font = this.textStyle.font;
        ctx.textAlign = this.textStyle.align;
        ctx.textBaseline = this.textStyle.baseline;
        
        // 阴影
        if (this.textStyle.shadow) {
            ctx.shadowColor = this.textStyle.shadowColor;
            ctx.shadowBlur = this.textStyle.shadowBlur;
        }
        
        // 计算文字位置
        let textX = pos.x;
        if (this.textStyle.align === 'center') {
            textX = pos.x + this.width / 2;
        } else if (this.textStyle.align === 'right') {
            textX = pos.x + this.width;
        }
        
        const textY = pos.y + this.height / 2;
        
        if (this.multiline) {
            this.drawMultilineText(ctx, textX, pos.y);
        } else {
            ctx.fillText(this.text, textX, textY);
        }
        
        ctx.restore();
        
        // 绘制子元素
        this.children.forEach(child => child.draw(ctx));
    }
    
    drawMultilineText(ctx, x, y) {
        const lines = this.text.split('\n');
        const fontSize = parseInt(this.textStyle.font) || 16;
        const lineHeight = fontSize * this.lineHeight;
        
        lines.forEach((line, index) => {
            ctx.fillText(line, x, y + fontSize / 2 + index * lineHeight);
        });
    }
    
    setText(text) {
        this.text = text;
    }
    
    setColor(color) {
        this.textStyle.color = color;
    }
}

UI.register('label', UILabel);
