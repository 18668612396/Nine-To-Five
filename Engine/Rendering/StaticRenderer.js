class StaticRenderer extends Renderer {
    constructor(imagePath) {
        super('StaticRenderer');
        this.image = new Image();
        this._imagePath = null;
        
        if (imagePath) {
            this.imagePath = imagePath;
        }
        
        this.loaded = false;
        this.image.onload = () => { this.loaded = true; };
    }

    get imagePath() { return this._imagePath; }
    set imagePath(value) {
        this._imagePath = value;
        if (value) {
            this.image.src = value;
        }
    }

    draw(ctx) {
        if (!this.loaded || !this.gameObject) return;
        
        const t = this.gameObject.transform;
        
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.rotate(t.rotation);
        ctx.scale(t.scale.x, t.scale.y);
        
        // Draw centered
        ctx.drawImage(this.image, -this.image.width/2 + this.offsetX, -this.image.height/2 + this.offsetY);
        
        ctx.restore();
    }
}

window.StaticRenderer = StaticRenderer;
