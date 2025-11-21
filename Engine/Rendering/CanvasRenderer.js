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
                    // Calculate World Position of the Element's Center
                    // WorldCenter = WorldPivot + (LocalOffset + HalfSize) * WorldScale
                    // Note: We need to rotate the offset vector if rotation exists, but let's handle scale first.
                    
                    const scaleX = t.scale.x;
                    const scaleY = t.scale.y;
                    
                    const localCenterX = (el.x || 0) + el.width / 2;
                    const localCenterY = (el.y || 0) + el.height / 2;

                    // Simple scale application (ignoring rotation of the offset vector for now)
                    const worldX = t.x + localCenterX * scaleX;
                    const worldY = t.y + localCenterY * scaleY;
                    
                    pipeline.submit({
                        type: 'RECT',
                        x: worldX,
                        y: worldY,
                        width: el.width,
                        height: el.height,
                        color: el.color,
                        rotation: t.rotation,
                        opacity: 1.0,
                        sortingOrder: this.sortingOrder,
                        y: t.y
                    });
                } else if (el.type === 'circle') {
                    const scaleX = t.scale.x;
                    const scaleY = t.scale.y;
                    
                    // Apply scale to offset
                    const worldX = t.x + (el.x || 0) * scaleX;
                    const worldY = t.y + (el.y || 0) * scaleY;

                    // For ellipse effect (shadow), we might need non-uniform scale
                    // But RenderPipeline.drawCircle only supports uniform radius.
                    // If we want flattened circle (ellipse), we need a new command or use CUSTOM.
                    // Or we can use RECT with rounded corners? No.
                    // Let's use CUSTOM for now if it's an ellipse, OR add ELLIPSE command.
                    // But wait, RenderPipeline has drawCircle.
                    
                    // If scaleY is provided in element, we can't easily pass it to drawCircle unless we add scale support there.
                    // Let's use CUSTOM for complex shapes or add ELLIPSE support.
                    // Actually, let's just use drawCircle for now and ignore flattening, OR implement ELLIPSE.
                    
                    // Let's implement ELLIPSE in RenderPipeline later. For now, let's use CUSTOM callback for this specific shadow style?
                    // No, we want data-driven.
                    
                    // Let's submit a CUSTOM command that draws an ellipse
                    pipeline.submit({
                        type: 'CUSTOM',
                        callback: (ctx) => {
                            ctx.fillStyle = el.color;
                            ctx.beginPath();
                            // Apply element specific scale (e.g. for flattening shadow)
                            const r = el.radius;
                            const sy = el.scaleY || 1.0;
                            ctx.ellipse(0, 0, r, r * sy, 0, 0, Math.PI * 2);
                            ctx.fill();
                        },
                        gameObject: this.gameObject,
                        x: worldX,
                        y: worldY,
                        rotation: t.rotation,
                        scaleX: 1, // We handle scale in callback or world pos
                        scaleY: 1,
                        offsetX: 0,
                        offsetY: 0,
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
