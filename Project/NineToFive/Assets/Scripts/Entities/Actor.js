class Actor extends GameBehaviour {
    constructor(name) {
        super(name);
        this.hp = 100;
        this.maxHp = 100;
        this.speed = 5;
        this.damage = 10;
        this.isDead = false;
    }

    // Proxy Transform properties for convenience
    get x() { return this.gameObject ? this.gameObject.transform.x : 0; }
    set x(v) { if (this.gameObject) this.gameObject.transform.x = v; }
    get y() { return this.gameObject ? this.gameObject.transform.y : 0; }
    set y(v) { if (this.gameObject) this.gameObject.transform.y = v; }

    takeDamage(amount) {
        if (this.isDead) return;
        this.hp -= amount;
        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        this.isDead = true;
        // Override in subclasses
    }
}

window.Actor = Actor;
