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

    render(pipeline) {
        if (!this.gameObject) return;

        // 1. Sync Sprite to Material
        this.material.setTexture('_MainTex', this._sprite);

        // 2. Read from Material
        const tex = this.material.getTexture('_MainTex');
        const color = this.material.getColor('_Color');

        if (!tex) return;

        const t = this.gameObject.transform;
        
        // 3. Submit to Pipeline
        pipeline.submit({
            type: 'SPRITE',
            shader: this.material.shader,
            texture: tex,
            x: t.x,
            y: t.y,
            rotation: t.rotation,
            scaleX: t.scale.x * (this.flipX ? -1 : 1),
            scaleY: t.scale.y * (this.flipY ? -1 : 1),
            width: this.width,
            height: this.height,
            color: color,
            opacity: this.opacity,
            offsetX: this.offsetX,
            offsetY: this.offsetY,
            sortingOrder: this.sortingOrder,
            // For secondary sorting
            y: t.y 
        });
    }
}
window.SpriteRenderer = SpriteRenderer;
