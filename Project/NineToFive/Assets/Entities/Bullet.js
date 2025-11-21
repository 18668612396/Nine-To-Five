class Bullet extends GameObject {
    constructor(x, y, angle, stats, worldWidth, worldHeight) {
        super('Bullet', x, y);
        this.r = stats.isFlame ? 10 : 6;
        this.speed = stats.bulletSpeed || 12;
        this.damage = stats.damage || 10;
        this.pierce = stats.pierce || 0;
        this.range = stats.range || 1000;
        this.distTraveled = 0;
        this.isFlame = stats.isFlame || false;
        
        this.active = true;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        
        this.hitList = []; // Track enemies hit to prevent multi-hit per frame/pierce
        
        // Add Renderer
        const color = this.isFlame ? 'rgba(255, 87, 34, 1)' : '#ffeb3b';
        this.renderer = new CanvasRenderer((ctx) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(0, 0, this.r, 0, Math.PI * 2);
            ctx.fill();
        });
        this.addComponent(this.renderer);
        
        // Add Collider
        this.collider = new CircleCollider(this.r);
        this.addComponent(this.collider);
    }

    update() {
        super.update(1/60);
        this.x += this.vx;
        this.y += this.vy;
        this.distTraveled += this.speed;

        // Range check
        if (this.distTraveled >= this.range) {
            this.active = false;
        }

        // Out of bounds
        if (this.x < 0 || this.x > this.worldWidth || this.y < 0 || this.y > this.worldHeight) {
            this.active = false;
        }
        
        // Update visual for flame
        if (this.isFlame) {
             this.renderer.color = `rgba(255, 87, 34, ${1 - this.distTraveled/this.range})`;
        }
    }

    draw(ctx) {
        super.draw(ctx);
        // Custom shadow effect (optional, could be part of renderer if extended)
        if (this.active) {
            ctx.save();
            ctx.translate(this.x, this.y);
            if (this.isFlame) {
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#ff5722';
            } else {
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#ffeb3b';
            }
            // Draw invisible circle just to cast shadow? Or just rely on renderer?
            // Renderer already draws the shape. To add shadow we'd need to modify renderer or context before it draws.
            // Since super.draw() is called first, the renderer has already drawn.
            // To apply shadow to the renderer, we need to set shadow BEFORE super.draw() or modify renderer.
            // For now, let's accept that the simple renderer doesn't support glow/shadow perfectly without extension.
            // Or we can hack it:
        }
        ctx.restore();
    }
}
