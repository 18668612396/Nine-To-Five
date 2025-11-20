class Bullet {
    constructor(x, y, angle, stats, worldWidth, worldHeight) {
        this.x = x;
        this.y = y;
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
    }

    update() {
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
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        if (this.isFlame) {
            ctx.fillStyle = `rgba(255, 87, 34, ${1 - this.distTraveled/this.range})`; // Fade out
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ff5722';
        } else {
            ctx.fillStyle = '#ffeb3b';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ffeb3b';
        }
        ctx.fill();
    }
}
