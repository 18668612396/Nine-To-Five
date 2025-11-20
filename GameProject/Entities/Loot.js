class Loot extends GameObject {
    constructor(x, y, type = 'exp', value = 10) {
        super('Loot', x, y);
        this.r = 8;
        this.active = true;
        this.type = type; // 'exp', 'item'
        this.value = value;
        
        if (this.type === 'exp') {
            this.color = '#4fc3f7'; // Light Blue for EXP
            this.r = 6;
        } else {
            this.color = `hsl(${Math.random()*360}, 70%, 60%)`; // Random for items
        }
        
        // Animation
        this.floatOffset = Math.random() * Math.PI * 2;
        
        // Add Renderer
        this.renderer = new StaticRenderer(this.color, this.r * 2, this.r * 2, this.type === 'exp' ? 'circle' : 'rect');
        this.addComponent(this.renderer);
        
        // Add Collider
        this.collider = new CircleCollider(this.r);
        this.addComponent(this.collider);
    }

    update(dt) {
        super.update(dt || 1/60);
        // Floating animation logic moved to update to affect renderer offset
        const floatY = Math.sin(Date.now() / 300 + this.floatOffset) * 3;
        this.renderer.offsetY = floatY;
        
        if (this.type !== 'exp') {
            this.transform.rotation += 0.05;
        }
    }

    draw(ctx) {
        super.draw(ctx);
        // Custom border for loot (optional)
        /*
        ctx.save();
        ctx.translate(this.x, this.y + this.renderer.offsetY);
        if (this.type === 'exp') {
            ctx.beginPath(); ctx.arc(0, 0, this.r, 0, Math.PI * 2); ctx.strokeStyle = '#fff'; ctx.stroke();
        } else {
            ctx.rotate(this.transform.rotation);
            ctx.strokeStyle = '#fff'; ctx.strokeRect(-8, -8, 16, 16);
        }
        ctx.restore();
        */
    }
}
