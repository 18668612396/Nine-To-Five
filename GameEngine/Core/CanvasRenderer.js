class CanvasRenderer extends Renderer {
    constructor(width, height) {
        super('CanvasRenderer');
        this.width = width;
        this.height = height;
        this.elements = []; // UI Elements to draw
        this.sortingOrder = 1000; // High sorting order to draw on top
    }

    /**
     * Add a UI element to be rendered
     * @param {Object} element - { type: 'text'|'rect'|'image', ...props }
     */
    addElement(element) {
        this.elements.push(element);
    }

    clearElements() {
        this.elements = [];
    }

    draw(ctx) {
        if (!this.visible) return;

        // UI is usually drawn in screen space, ignoring camera transform
        // But since Renderer.draw is called within world transform context in Scene.draw,
        // we might need to reset transform or handle it differently.
        // However, standard Renderer pattern assumes world space.
        // If we want Screen Space UI, we should probably handle it in a separate pass or 
        // use inverse camera transform.
        
        // For now, let's assume this renderer is attached to a GameObject that moves with the camera
        // OR we simply reset the transform to draw in screen coordinates.
        
        ctx.save();
        
        // Reset Transform to Identity to draw in Screen Space
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Sort elements by z-index if needed, or just draw in order
        
        for (const el of this.elements) {
            this.drawElement(ctx, el);
        }

        ctx.restore();
    }

    drawElement(ctx, el) {
        ctx.save();
        
        if (el.x !== undefined && el.y !== undefined) {
            ctx.translate(el.x, el.y);
        }

        if (el.rotation) ctx.rotate(el.rotation);
        if (el.scale) ctx.scale(el.scale.x, el.scale.y);
        if (el.alpha !== undefined) ctx.globalAlpha = el.alpha;

        if (el.type === 'rect') {
            ctx.fillStyle = el.color || '#fff';
            if (el.stroke) {
                ctx.strokeStyle = el.strokeColor || '#000';
                ctx.lineWidth = el.lineWidth || 1;
            }
            
            ctx.beginPath();
            if (el.cornerRadius) {
                // Simple rounded rect
                this.roundRect(ctx, 0, 0, el.width, el.height, el.cornerRadius);
            } else {
                ctx.rect(0, 0, el.width, el.height);
            }
            
            if (el.fill !== false) ctx.fill();
            if (el.stroke) ctx.stroke();

        } else if (el.type === 'text') {
            ctx.font = el.font || '20px Arial';
            ctx.fillStyle = el.color || '#fff';
            ctx.textAlign = el.align || 'left';
            ctx.textBaseline = el.baseline || 'top';
            ctx.fillText(el.text, 0, 0);
            if (el.stroke) {
                ctx.strokeStyle = el.strokeColor || '#000';
                ctx.lineWidth = el.lineWidth || 1;
                ctx.strokeText(el.text, 0, 0);
            }

        } else if (el.type === 'image') {
            if (el.image && el.image.complete) {
                const w = el.width || el.image.width;
                const h = el.height || el.image.height;
                ctx.drawImage(el.image, 0, 0, w, h);
            }
        }

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
