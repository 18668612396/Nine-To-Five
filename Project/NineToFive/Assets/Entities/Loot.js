class Loot extends GameBehaviour {
    constructor() {
        super('Loot');
        this.r = 6;
        this.type = 'exp';
        this.value = 10;
        this.color = '#4fc3f7';
        this.floatOffset = Math.random() * Math.PI * 2;
    }

    init(type, value) {
        this.type = type;
        this.value = value;
        this.floatOffset = Math.random() * Math.PI * 2;
        
        if (this.type === 'exp') {
            this.color = '#4fc3f7'; // Light Blue for EXP
            this.r = 6;
        } else {
            this.color = `hsl(${Math.random()*360}, 70%, 60%)`; // Random for items
            this.r = 8;
        }
    }

    start() {
        // Add Renderer
        this.renderer = new CanvasRenderer((ctx) => {
            ctx.fillStyle = this.color;
            if (this.type === 'exp') {
                ctx.beginPath();
                ctx.arc(0, 0, this.r, 0, Math.PI * 2);
                ctx.fill();
                // Glow effect
                ctx.shadowBlur = 5;
                ctx.shadowColor = this.color;
                ctx.stroke();
                ctx.shadowBlur = 0;
            } else {
                ctx.fillRect(-this.r, -this.r, this.r * 2, this.r * 2);
            }
        });
        this.gameObject.addComponent(this.renderer);
        
        // Add Collider (for physics if needed, but LootManager handles pickup)
        // this.collider = new CircleCollider(this.r);
        // this.gameObject.addComponent(this.collider);
    }

    update(dt) {
        // Floating animation
        const floatY = Math.sin(Date.now() / 300 + this.floatOffset) * 3;
        if (this.renderer) {
            this.renderer.offsetY = floatY;
        }
    }
}
