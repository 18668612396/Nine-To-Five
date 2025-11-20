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
    }

    update(target) {
        super.update(1/60);
        const angle = Math.atan2(target.y - this.y, target.x - this.x);
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;
    }

    draw(ctx) {
        super.draw(ctx);
        ctx.fillStyle = this.color;
        // 简单的方形代表文件怪/经理
        ctx.fillRect(this.x - this.r, this.y - this.r, this.r*2, this.r*2);
        
        // 血条
        const hpPct = this.hp / this.maxHp;
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - this.r, this.y - this.r - 10, this.r*2, 5);
        ctx.fillStyle = '#0f0';
        ctx.fillRect(this.x - this.r, this.y - this.r - 10, this.r*2 * hpPct, 5);
    }
}
