// import { rand } from '../core/Utils.js';

class Enemy extends GameBehaviour {
    constructor() {
        super('Enemy');
        this.id = Math.random().toString(36).substr(2, 9);
        this.active = true;
    }

    onLoad(props) {
        this.isBoss = props.isBoss || false;
        this.r = this.isBoss ? 60 : 15;
        this.hp = this.isBoss ? 500 : 30;
        this.maxHp = this.hp;
        this.speed = this.isBoss ? 1.5 : rand(2, 4);
        this.color = this.isBoss ? '#d32f2f' : '#f44336'; // 红色系
        this.damage = this.isBoss ? 20 : 5;

        // Set initial position
        if (props.x !== undefined && this.gameObject) this.gameObject.transform.x = props.x;
        if (props.y !== undefined && this.gameObject) this.gameObject.transform.y = props.y;
    }

    start() {
        // Add Renderer
        this.gameObject.addComponent(new CanvasRenderer((ctx) => {
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.r, -this.r, this.r * 2, this.r * 2);

            // Draw Health Bar (UI)
            const hpPct = this.hp / this.maxHp;
            ctx.fillStyle = 'red';
            ctx.fillRect(-this.r, -this.r - 10, this.r*2, 5);
            ctx.fillStyle = '#0f0';
            ctx.fillRect(-this.r, -this.r - 10, this.r*2 * hpPct, 5);
        }));
        
        // Add Collider
        this.collider = new CircleCollider(this.r);
        this.gameObject.addComponent(this.collider);
    }

    update(dt) {
        if (!window.game || !window.game.player) return;
        
        const target = window.game.player;
        const angle = Math.atan2(target.y - this.y, target.x - this.x);
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;
    }

    get x() { return this.gameObject ? this.gameObject.transform.x : 0; }
    set x(val) { if (this.gameObject) this.gameObject.transform.x = val; }
    get y() { return this.gameObject ? this.gameObject.transform.y : 0; }
    set y(val) { if (this.gameObject) this.gameObject.transform.y = val; }
}
