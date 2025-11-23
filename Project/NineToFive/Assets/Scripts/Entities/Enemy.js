

class Enemy extends Actor {
    constructor() {
        super('Enemy');
        this.type = 'Minion'; // Minion, Elite, Boss

        // Stats initialized in Actor, overridden here or in init
        this.hp = 10;
        this.maxHp = 10;
        this.damage = 10;
        this.speed = 2;

        this.expValue = 10;
        this.target = null;
    }

    /**
     * Initialize enemy state when spawned from pool
     */
    init(x, y, type = 'Minion') {
        this.gameObject.transform.x = x;
        this.gameObject.transform.y = y;
        this.type = type;

        // Config based on type
        switch (type) {
            case 'Boss':
                this.maxHp = 500;
                this.speed = 1.5;
                this.damage = 20;
                this.gameObject.transform.localScale = { x: 3, y: 3 };
                break;
            case 'Elite':
                this.maxHp = 50;
                this.speed = 2.5;
                this.damage = 15;
                this.gameObject.transform.localScale = { x: 1.5, y: 1.5 };
                break;
            default: // Minion
                this.maxHp = 10;
                this.speed = 2;
                this.damage = 5;
                this.gameObject.transform.localScale = { x: 1, y: 1 };
                break;
        }

        this.hp = this.maxHp;
        this.gameObject.active = true;
    }

    start() {
        // Find player as target
        if (window.game && window.game.player) {
            this.target = window.game.player;
        }
    }

    update(dt) {
        if (!this.target) {
            if (window.game && window.game.player) {
                this.target = window.game.player;
            }
            return;
        }

        // Simple Pathfinding: Move towards player
        const tx = this.target.x;
        const ty = this.target.y;
        const mx = this.gameObject.transform.x;
        const my = this.gameObject.transform.y;

        const dx = tx - mx;
        const dy = ty - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            const moveX = (dx / dist) * this.speed;
            const moveY = (dy / dist) * this.speed;

            this.gameObject.transform.x += moveX;
            this.gameObject.transform.y += moveY;
        }
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        // Spawn Loot
        if (window.lootManager) {
            window.lootManager.spawnLoot(this.gameObject.transform.x, this.gameObject.transform.y, 'exp', this.expValue);
        }

        // Spawn Death Effect
        if (window.enemyManager) {
            window.enemyManager.spawnDeathEffect(this.gameObject.transform.x, this.gameObject.transform.y);
        }

        // Destroy self
        this.gameObject.destroy();
    }
}

window.Enemy = Enemy;
