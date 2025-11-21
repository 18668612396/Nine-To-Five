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

    draw(ctx) {
        if (!this.gameObject || !this.gameObject.active) return;

        ctx.save();
        const t = this.gameObject.transform;
        ctx.translate(t.x, t.y);
        ctx.rotate(t.rotation);
        ctx.scale(t.scale.x, t.scale.y);
        ctx.translate(this.offsetX, this.offsetY);

        ctx.fillStyle = this.color;
        if (this.stroke) {
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = this.lineWidth;
        }

        ctx.beginPath();
        if (this.type === 'rect') {
            if (this.cornerRadius > 0) {
                this.roundRect(ctx, -this.width/2, -this.height/2, this.width, this.height, this.cornerRadius);
            } else {
                ctx.rect(-this.width/2, -this.height/2, this.width, this.height);
            }
        } else if (this.type === 'circle') {
            ctx.arc(0, 0, this.width/2, 0, Math.PI * 2);
        }

        ctx.fill();
        if (this.stroke) ctx.stroke();

        ctx.restore();
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
