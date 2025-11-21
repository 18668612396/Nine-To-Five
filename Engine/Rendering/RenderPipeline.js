class RenderPipeline {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
        this.canvas = game.canvas;
        this._renderQueue = [];
    }

    /**
     * Called at the beginning of a frame
     */
    beginFrame() {
        this._renderQueue = [];
        // Clear canvas is handled by Camera usually, but we can do a default clear here
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Submit a render command to the pipeline
     * @param {Object} data - The render data packet
     */
    submit(data) {
        this._renderQueue.push(data);
    }

    /**
     * Execute all submitted render commands
     */
    endFrame() {
        // Sort by sorting order
        this._renderQueue.sort((a, b) => {
            if (a.sortingOrder !== b.sortingOrder) {
                return a.sortingOrder - b.sortingOrder;
            }
            // Secondary sort by Y for top-down 2D depth
            return a.y - b.y;
        });

        // Execute
        for (const cmd of this._renderQueue) {
            this.executeCommand(cmd);
        }
    }

    executeCommand(cmd) {
        if (cmd.shader) {
            cmd.shader.render(this.ctx, cmd);
            return;
        }

        // Fallback / Legacy / Non-Shader commands
        if (cmd.type === 'SPRITE') {
            // Should be handled by shader now, but keep as fallback
            this.drawSprite(cmd);
        } else if (cmd.type === 'RECT') {
            this.drawRect(cmd);
        } else if (cmd.type === 'TEXT') {
            this.drawText(cmd);
        } else if (cmd.type === 'CIRCLE') {
            this.drawCircle(cmd);
        } else if (cmd.type === 'CUSTOM') {
            this.drawCustom(cmd);
        }
    }

    drawCustom(cmd) {
        const { callback, gameObject, x, y, rotation, scaleX, scaleY, offsetX, offsetY } = cmd;
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);
        this.ctx.scale(scaleX, scaleY);
        this.ctx.translate(offsetX, offsetY);
        callback(this.ctx, gameObject);
        this.ctx.restore();
    }

    drawSprite(cmd) {
        const { texture, x, y, rotation, scaleX, scaleY, width, height, color, offsetX, offsetY, opacity } = cmd;
        
        if (!texture) return;
        if (texture.complete === false && texture.naturalWidth === 0) return;

        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);
        this.ctx.scale(scaleX, scaleY);
        
        // Combine opacity
        this.ctx.globalAlpha = (color.a !== undefined ? color.a : 1.0) * opacity;

        const w = width || texture.width;
        const h = height || texture.height;
        
        this.ctx.drawImage(
            texture,
            -w / 2 + offsetX,
            -h / 2 + offsetY,
            w,
            h
        );
        
        this.ctx.restore();
    }

    drawRect(cmd) {
        const { x, y, width, height, color, rotation, opacity } = cmd;
        this.ctx.save();
        this.ctx.translate(x, y);
        if (rotation) this.ctx.rotate(rotation);
        this.ctx.globalAlpha = opacity;
        this.ctx.fillStyle = color; // Expecting string or hex for now, or we convert {r,g,b,a}
        this.ctx.fillRect(-width/2, -height/2, width, height);
        this.ctx.restore();
    }

    drawCircle(cmd) {
        const { x, y, radius, color, opacity } = cmd;
        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }

    drawText(cmd) {
        const { text, x, y, font, color, align, baseline, opacity } = cmd;
        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        this.ctx.font = font;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = baseline;
        this.ctx.fillText(text, x, y);
        this.ctx.restore();
    }
}

window.RenderPipeline = RenderPipeline;
