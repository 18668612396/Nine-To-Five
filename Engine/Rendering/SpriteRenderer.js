class SpriteRenderer extends Renderer {
    constructor(source = null) {
        super('SpriteRenderer');
        this._sprite = null;
        this.flipX = false;
        this.flipY = false;
        this.opacity = 1.0;
        this.width = 0; // 0 means use sprite width
        this.height = 0;

        if (typeof source === 'string') {
            this.imagePath = source;
        } else if (source instanceof Image) {
            this.sprite = source;
        }
    }

    get sprite() { return this._sprite; }
    set sprite(value) {
        this._sprite = value;
    }

    // Compatibility for StaticRenderer's imagePath
    get imagePath() { return this._sprite ? this._sprite.src : ''; }
    set imagePath(url) {
        if (!url) {
            this._sprite = null;
            return;
        }
        if (window.resourceManager) {
            window.resourceManager.load(url).then(img => {
                if (img instanceof Image) this._sprite = img;
            });
        } else {
            const img = new Image();
            img.src = url;
            this._sprite = img;
        }
    }

    draw(ctx) {
        if (!this._sprite || !this.gameObject) return;
        // Check if image is loaded
        if (this._sprite.complete === false && this._sprite.naturalWidth === 0) return;

        const t = this.gameObject.transform;
        
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.rotate(t.rotation);
        const scaleX = t.scale.x * (this.flipX ? -1 : 1);
        const scaleY = t.scale.y * (this.flipY ? -1 : 1);
        ctx.scale(scaleX, scaleY);
        ctx.globalAlpha = this.opacity;

        const w = this.width || this._sprite.width;
        const h = this.height || this._sprite.height;
        
        ctx.drawImage(
            this._sprite,
            -w / 2 + this.offsetX,
            -h / 2 + this.offsetY,
            w,
            h
        );
        
        ctx.restore();
    }
}
window.SpriteRenderer = SpriteRenderer;
