class Particle {
    constructor(config) {
        this.reset(config);
    }

    reset(config) {
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.vx = config.vx || 0;
        this.vy = config.vy || 0;
        
        this.life = config.life || 1.0;
        this.startLife = config.life || 1.0;
        
        this.size = config.size || 5;
        // Color should be [r, g, b, a] with 0-1 values
        this.startColor = config.color || [1, 1, 1, 1];
        this.color = [...this.startColor];
        this.texture = config.texture || null;
        
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
        
        this.alpha = 1.0;
        this.active = true;
    }

    update(dt) {
        if (!this.active) return;

        this.life -= dt;
        if (this.life <= 0) {
            this.active = false;
            return;
        }

        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;

        // Fade out based on life
        this.alpha = this.life / this.startLife;
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

            if (this.texture && this.texture.complete && this.texture.naturalWidth > 0) {
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
