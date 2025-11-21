class ShapeRenderer extends Renderer {
    constructor(type = 'rect', width = 100, height = 100, color = '#fff') {
        super('ShapeRenderer');
        this.type = type; // 'rect', 'circle'
        this.width = width;
        this.height = height;
        this.color = color;
        this.stroke = false;
        this.strokeColor = '#000';
        this.lineWidth = 1;
        this.cornerRadius = 0;
    }

    render(pipeline) {
        if (!this.gameObject || !this.gameObject.active) return;

        const t = this.gameObject.transform;
        
        if (this.type === 'rect') {
            pipeline.submit({
                type: 'RECT',
                x: t.x,
                y: t.y,
                width: this.width,
                height: this.height,
                color: this.color,
                rotation: t.rotation,
                opacity: 1.0, // TODO: Support opacity
                sortingOrder: this.sortingOrder,
                y: t.y
            });
        } else if (this.type === 'circle') {
            pipeline.submit({
                type: 'CIRCLE',
                x: t.x,
                y: t.y,
                radius: this.width / 2,
                color: this.color,
                opacity: 1.0,
                sortingOrder: this.sortingOrder,
                y: t.y
            });
        }
    }

    roundRect(ctx, x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }
}

window.ShapeRenderer = ShapeRenderer;
