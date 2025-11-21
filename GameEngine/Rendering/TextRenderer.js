class TextRenderer extends Renderer {
    constructor(text = '', font = '20px Arial', color = '#fff') {
        super('TextRenderer');
        this.text = text;
        this.font = font;
        this.color = color;
        this.align = 'left';
        this.baseline = 'top';
        this.stroke = false;
        this.strokeColor = '#000';
        this.lineWidth = 1;
    }

    draw(ctx) {
        if (!this.gameObject || !this.gameObject.active) return;

        ctx.save();
        const t = this.gameObject.transform;
        ctx.translate(t.x, t.y);
        ctx.rotate(t.rotation);
        ctx.scale(t.scale.x, t.scale.y);
        ctx.translate(this.offsetX, this.offsetY);

        ctx.font = this.font;
        ctx.fillStyle = this.color;
        ctx.textAlign = this.align;
        ctx.textBaseline = this.baseline;
        
        ctx.fillText(this.text, 0, 0);
        
        if (this.stroke) {
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = this.lineWidth;
            ctx.strokeText(this.text, 0, 0);
        }

        ctx.restore();
    }
}

window.TextRenderer = TextRenderer;
