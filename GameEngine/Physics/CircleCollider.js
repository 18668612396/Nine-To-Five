class CircleCollider extends Collider {
    constructor(radius = 10) {
        super('CircleCollider');
        this.radius = radius;
        this.offset = { x: 0, y: 0 };
    }

    checkCollision(other) {
        if (!this.gameObject || !other.gameObject) return false;
        
        if (other instanceof CircleCollider) {
            const p1 = this.gameObject.transform;
            const p2 = other.gameObject.transform;
            
            const dx = (p1.x + this.offset.x) - (p2.x + other.offset.x);
            const dy = (p1.y + this.offset.y) - (p2.y + other.offset.y);
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            return dist < (this.radius + other.radius);
        }
        return false;
    }
}

window.CircleCollider = CircleCollider;
