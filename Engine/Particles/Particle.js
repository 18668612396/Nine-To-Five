class Particle {
    constructor(config) {
        this.reset(config);
    }

    reset(config) {
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.vx = config.vx || 0;
        this.vy = config.vy || 0;
        
        this.startLifetime = config.life || 1.0;
        this.remainingLifetime = this.startLifetime;
        this.life = this.remainingLifetime; // Backwards compatibility
        
        this.startSize = config.size || 5;
        this.size = this.startSize;

        // Color should be [r, g, b, a] with 0-1 values
        this.startColor = config.color || [1, 1, 1, 1];
        this.color = [...this.startColor];
        this.texture = config.texture || null;
        
        this.rotation = config.rotation || 0;
        this.rotationSpeed = config.rotationSpeed || 0;
        
        this.alpha = 1.0;
        this.active = true;
        this.speed = 0; // Used by modules
    }

    update(dt) {
        if (!this.active) return;

        // Modules will handle life, color, size updates
        // We just handle basic physics here if not handled by a module
        // But wait, if we move everything to modules, this update might become empty
        // or just integration of position.
        
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        
        // Sync legacy property for rendering
        this.life = this.remainingLifetime;
        this.alpha = this.color[3];
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        try {
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            
            // Calculate final alpha
            const finalAlpha = this.color[3] * this.alpha;
            ctx.globalAlpha = finalAlpha;

            let isDrawable = false;
            if (this.texture) {
                if (this.texture instanceof HTMLImageElement) {
                    isDrawable = this.texture.complete && this.texture.naturalWidth > 0;
                } else if (this.texture instanceof HTMLCanvasElement) {
                    isDrawable = this.texture.width > 0 && this.texture.height > 0;
                }
            }

            if (isDrawable) {
                ctx.drawImage(this.texture, -this.size / 2, -this.size / 2, this.size, this.size);
            } else {
                // Convert 0-1 color to 0-255 for Canvas
                const r = Math.floor(this.color[0] * 255);
                const g = Math.floor(this.color[1] * 255);
                const b = Math.floor(this.color[2] * 255);
                
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`; // Alpha handled by globalAlpha
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            }
        } catch (e) {
            console.error("Particle draw error:", e);
        } finally {
            ctx.restore();
        }
    }
}
