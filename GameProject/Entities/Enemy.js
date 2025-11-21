// import { rand } from '../core/Utils.js';

class Enemy extends GameObject {
    constructor(x, y, isBoss = false) {
        super(isBoss ? 'Boss' : 'Enemy', x, y);
        // this.id is already set by EngineObject, but existing code uses string ID.
        // We can keep using string ID or migrate. Let's keep string ID for safety if used elsewhere as string.
        // Actually, let's override it or just let it be.
        this.id = Math.random().toString(36).substr(2, 9); 
        
        this.isBoss = isBoss;
        this.r = isBoss ? 60 : 15;
        this.hp = isBoss ? 500 : 30;
        this.maxHp = this.hp;
        this.speed = isBoss ? 1.5 : rand(2, 4);
        this.color = isBoss ? '#d32f2f' : '#f44336'; // 红色系
        this.active = true;
        this.damage = isBoss ? 20 : 5;
        
        // Add Renderer
        this.addComponent(new CanvasRenderer((ctx) => {
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.r, -this.r, this.r * 2, this.r * 2);
        }));
        
        // Add Collider
        this.collider = new CircleCollider(this.r);
        this.addComponent(this.collider);
    }

    update(target) {
        super.update(1/60);
        const angle = Math.atan2(target.y - this.y, target.x - this.x);
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;
    }

    draw(ctx) {
        super.draw(ctx);
        
        // Draw Health Bar (UI) - Keep this custom for now as it's UI attached to object
        ctx.save();
        ctx.translate(this.x, this.y);
        const hpPct = this.hp / this.maxHp;
        ctx.fillStyle = 'red';
        ctx.fillRect(-this.r, -this.r - 10, this.r*2, 5);
        ctx.fillStyle = '#0f0';
        ctx.fillRect(-this.r, -this.r - 10, this.r*2 * hpPct, 5);
        ctx.restore();
    }
}
