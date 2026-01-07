// --- 图片/Canvas ---

class UIImage extends UI {
    constructor(config = {}) {
        super({
            width: config.width || 100,
            height: config.height || 100,
            ...config
        });
        
        this.src = config.src || null; // 图片URL或Image对象
        this.image = null;
        this.loaded = false;
        
        // Canvas模式（用于动态绘制）
        this.useCanvas = config.useCanvas || false;
        this.canvas = null;
        this.canvasCtx = null;
        
        // 绘制回调（Canvas模式）
        this.onDraw = config.onDraw || null;
        
        if (this.useCanvas) {
            this.initCanvas();
        } else if (this.src) {
            this.loadImage(this.src);
        }
    }
    
    initCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvasCtx = this.canvas.getContext('2d');
    }
    
    loadImage(src) {
        if (typeof src === 'string') {
            this.image = new Image();
            this.image.onload = () => {
                this.loaded = true;
            };
            this.image.src = src;
        } else if (src instanceof Image) {
            this.image = src;
            this.loaded = src.complete;
        }
    }
    
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
        
        // Canvas模式
        if (this.useCanvas && this.canvasCtx) {
            // 清空canvas
            this.canvasCtx.clearRect(0, 0, this.width, this.height);
            
            // 调用绘制回调
            if (this.onDraw) {
                this.onDraw(this.canvasCtx, this.width, this.height);
            }
            
            // 绘制canvas到主ctx
            ctx.drawImage(this.canvas, pos.x, pos.y, this.width, this.height);
        }
        // 图片模式
        else if (this.image && this.loaded) {
            // 裁剪圆角
            if (this.style.borderRadius > 0) {
                ctx.save();
                this.drawRoundedRect(ctx, pos.x, pos.y, this.width, this.height, this.style.borderRadius);
                ctx.clip();
                ctx.drawImage(this.image, pos.x, pos.y, this.width, this.height);
                ctx.restore();
            } else {
                ctx.drawImage(this.image, pos.x, pos.y, this.width, this.height);
            }
        }
        
        // 绘制边框
        if (this.style.borderWidth > 0) {
            ctx.strokeStyle = this.style.borderColor;
            ctx.lineWidth = this.style.borderWidth;
            this.drawRoundedRect(ctx, pos.x, pos.y, this.width, this.height, this.style.borderRadius);
            ctx.stroke();
        }
        
        ctx.restore();
        
        // 绘制子元素
        this.children.forEach(child => child.draw(ctx));
    }
    
    setImage(src) {
        this.loadImage(src);
    }
    
    getCanvasContext() {
        return this.canvasCtx;
    }
    
    // 调整canvas大小
    resizeCanvas(width, height) {
        this.width = width;
        this.height = height;
        if (this.canvas) {
            this.canvas.width = width;
            this.canvas.height = height;
        }
    }
}

UI.register('image', UIImage);
