// --- 进度条 ---

class UIProgressBar extends UI {
    constructor(config = {}) {
        super({
            width: config.width || 200,
            height: config.height || 20,
            backgroundColor: config.backgroundColor || 'rgba(0, 0, 0, 0.5)',
            borderRadius: config.borderRadius || 5,
            ...config
        });
        
        this.value = config.value || 0; // 0-1
        this.maxValue = config.maxValue || 1;
        
        // 填充样式
        this.fillColor = config.fillColor || '#4CAF50';
        this.fillGradient = config.fillGradient || null; // [startColor, endColor]
        
        // 显示文字
        this.showText = config.showText || false;
        this.textFormat = config.textFormat || 'percent'; // 'percent', 'value', 'custom'
        this.customText = config.customText || '';
        this.textStyle = {
            color: config.textColor || '#ffffff',
            font: config.textFont || 'bold 12px Arial',
            ...config.textStyle
        };
    }
    
    draw(ctx) {
        if (!this.visible) return;
        
        const pos = this.getAbsolutePosition();
        const percent = Math.max(0, Math.min(1, this.value / this.maxValue));
        
        ctx.save();
        ctx.globalAlpha = this.style.opacity;
        
        // 绘制背景
        ctx.fillStyle = this.style.backgroundColor;
        this.drawRoundedRect(ctx, pos.x, pos.y, this.width, this.height, this.style.borderRadius);
        ctx.fill();
        
        // 绘制填充
        if (percent > 0) {
            const fillWidth = this.width * percent;
            
            if (this.fillGradient) {
                const gradient = ctx.createLinearGradient(pos.x, pos.y, pos.x + fillWidth, pos.y);
                gradient.addColorStop(0, this.fillGradient[0]);
                gradient.addColorStop(1, this.fillGradient[1]);
                ctx.fillStyle = gradient;
            } else {
                ctx.fillStyle = this.fillColor;
            }
            
            // 裁剪圆角
            ctx.save();
            this.drawRoundedRect(ctx, pos.x, pos.y, this.width, this.height, this.style.borderRadius);
            ctx.clip();
            ctx.fillRect(pos.x, pos.y, fillWidth, this.height);
            ctx.restore();
        }
        
        // 绘制边框
        if (this.style.borderWidth > 0) {
            ctx.strokeStyle = this.style.borderColor;
            ctx.lineWidth = this.style.borderWidth;
            this.drawRoundedRect(ctx, pos.x, pos.y, this.width, this.height, this.style.borderRadius);
            ctx.stroke();
        }
        
        // 绘制文字
        if (this.showText) {
            let text = '';
            switch (this.textFormat) {
                case 'percent':
                    text = Math.floor(percent * 100) + '%';
                    break;
                case 'value':
                    text = Math.floor(this.value) + '/' + Math.floor(this.maxValue);
                    break;
                case 'custom':
                    text = this.customText;
                    break;
            }
            
            ctx.fillStyle = this.textStyle.color;
            ctx.font = this.textStyle.font;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, pos.x + this.width / 2, pos.y + this.height / 2);
        }
        
        ctx.restore();
        
        // 绘制子元素
        this.children.forEach(child => child.draw(ctx));
    }
    
    setValue(value) {
        this.value = value;
    }
    
    setMaxValue(maxValue) {
        this.maxValue = maxValue;
    }
    
    setFillColor(color) {
        this.fillColor = color;
    }
}

UI.register('progressBar', UIProgressBar);
