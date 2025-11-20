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
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Floating animation
        const floatY = Math.sin(Date.now() / 300 + this.floatOffset) * 3;
        ctx.translate(0, floatY);

        if (this.type === 'exp') {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();
        } else {
            ctx.rotate(Date.now() / 500);
            ctx.fillStyle = this.color;
            ctx.fillRect(-8, -8, 16, 16);
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(-8, -8, 16, 16);
        }
        
        ctx.restore();
    }
}
