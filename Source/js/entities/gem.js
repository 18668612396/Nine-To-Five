// --- 经验宝石 ---

class Gem extends Entity {
    constructor(x, y, val) {
        super(x, y, 10, COLORS.gem);
        this.val = val;
        this.floatOffset = Math.random() * Math.PI * 2;
    }
    
    update(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < player.pickupRange) {
            const speed = 8;
            this.x += (dx / dist) * speed;
            this.y += (dy / dist) * speed;
            
            if (dist < player.radius + this.radius) {
                this.markedForDeletion = true;
                Events.emit(EVENT.XP_GAIN, { amount: this.val });
                Audio.play('pickup');
            }
        }
    }
    
    draw(ctx, camX, camY, frameCount = 0) {
        const x = this.x - camX;
        const y = this.y - camY;
        const float = Math.sin(frameCount * 0.1 + this.floatOffset) * 3;
        
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y - 10 + float);
        ctx.lineTo(x + 8, y + float);
        ctx.lineTo(x, y + 10 + float);
        ctx.lineTo(x - 8, y + float);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.arc(x - 2, y - 3 + float, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}
