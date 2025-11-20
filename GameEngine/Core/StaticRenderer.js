class StaticRenderer extends Renderer {
    constructor(imageOrColor, width, height) {
        super('StaticRenderer');
        this.image = null;
        this.color = null;
        this.width = width || 0;
        this.height = height || 0;
        
        if (typeof imageOrColor === 'string' && (imageOrColor.startsWith('#') || imageOrColor.startsWith('rgb') || imageOrColor.startsWith('hsl'))) {
            this.color = imageOrColor;
        } else if (imageOrColor instanceof Image) {
            this.image = imageOrColor;
        } else if (typeof imageOrColor === 'string') {
             const img = new Image();
             img.src = imageOrColor;
             this.image = img;
        }
    }

    draw(ctx) {
        if (!this.visible) return;
        
        const t = this.gameObject.transform;
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.rotate(t.rotation);
        ctx.scale(t.scale.x, t.scale.y);

        if (this.image && this.image.complete) {
            // If width/height not specified, use image natural size
            const w = this.width || this.image.width;
            const h = this.height || this.image.height;
            ctx.drawImage(this.image, -w/2, -h/2, w, h);
        } else if (this.color) {
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        }

        ctx.restore();
    }
}
