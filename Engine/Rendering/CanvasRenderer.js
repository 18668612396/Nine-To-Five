class CanvasRenderer extends Renderer {
    constructor(drawCallback) {
        super('CanvasRenderer');
        this.drawCallback = drawCallback;
        this.elements = [];
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

    render(pipeline) {
        if (!this.gameObject || !this.gameObject.active) return;

        // CanvasRenderer is tricky because it allows arbitrary JS drawing via callback.
        // For a strict pipeline, we should convert these to commands.
        // But for now, we can submit a "CUSTOM" command or just execute immediately if we break the purity.
        // To keep it clean, let's assume we only support the 'elements' list for now, 
        // OR we pass the callback to the pipeline to execute later.
        
        const t = this.gameObject.transform;

        // If we have a callback, we submit a CUSTOM command
        if (this.drawCallback) {
            pipeline.submit({
                type: 'CUSTOM',
                callback: this.drawCallback,
                gameObject: this.gameObject,
                x: t.x,
                y: t.y,
                rotation: t.rotation,
                scaleX: t.scale.x,
                scaleY: t.scale.y,
                offsetX: this.offsetX,
                offsetY: this.offsetY,
                sortingOrder: this.sortingOrder,
                y: t.y
            });
        }

        // Elements
        if (this.elements && this.elements.length > 0) {
            for (const el of this.elements) {
                // Convert element to command
                // This is a simplification. Ideally we map each element type to a command.
                // For now, let's assume elements are simple rects/texts
                if (el.type === 'rect') {
                    // RenderPipeline draws rects centered, but el.x/y are usually top-left relative to object
                    // We need to calculate the center position in world space
                    const worldLeft = t.x + (el.x || 0);
                    const worldTop = t.y + (el.y || 0);
                    
                    pipeline.submit({
                        type: 'RECT',
                        x: worldLeft + el.width / 2,
                        y: worldTop + el.height / 2,
                        width: el.width,
                        height: el.height,
                        color: el.color,
                        rotation: t.rotation,
                        opacity: 1.0,
                        sortingOrder: this.sortingOrder,
                        y: t.y
                    });
                }
                // ... other types
            }
        }
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
        } else if (el.type === 'circle') {
            ctx.fillStyle = el.color || '#fff';
            ctx.beginPath();
            ctx.arc(0, 0, el.radius || 10, 0, Math.PI * 2);
            ctx.fill();
            if (el.stroke) {
                ctx.strokeStyle = el.strokeColor || '#000';
                ctx.lineWidth = el.lineWidth || 1;
                ctx.stroke();
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

window.CanvasRenderer = CanvasRenderer;
