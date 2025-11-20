class Loot {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.r = 10;
        this.active = true;
        this.color = `hsl(${Math.random()*360}, 70%, 60%)`; // 随机颜色装备
    }
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Date.now() / 500);
        ctx.fillStyle = this.color;
        ctx.fillRect(-8, -8, 16, 16);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(-8, -8, 16, 16);
        ctx.restore();
    }
}
