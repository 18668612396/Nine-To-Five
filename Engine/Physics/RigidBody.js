class RigidBody extends Component {
    constructor() {
        super('RigidBody');
        this.mass = 1.0;
        this.drag = 0.1; // Air resistance
        this.angularDrag = 0.1;
        this.useGravity = false; // Top-down game usually doesn't use gravity
        
        this.velocity = { x: 0, y: 0 };
        this.angularVelocity = 0;
        
        this.force = { x: 0, y: 0 };
        this.torque = 0;
        
        this.isKinematic = false; // If true, not affected by forces
    }

    onLoad(props) {
        if (props.mass !== undefined) this.mass = props.mass;
        if (props.drag !== undefined) this.drag = props.drag;
        if (props.useGravity !== undefined) this.useGravity = props.useGravity;
        if (props.isKinematic !== undefined) this.isKinematic = props.isKinematic;
    }

    addForce(x, y) {
        if (this.isKinematic) return;
        this.force.x += x;
        this.force.y += y;
    }

    update(dt) {
        // Physics update usually happens in a fixed time step, but for now we use dt
        if (this.isKinematic || !this.gameObject) return;

        const t = this.gameObject.transform;

        // Apply Gravity (if enabled)
        if (this.useGravity) {
            this.addForce(0, 9.8 * this.mass);
        }

        // F = ma -> a = F/m
        const ax = this.force.x / this.mass;
        const ay = this.force.y / this.mass;

        // v = v0 + at
        this.velocity.x += ax * dt;
        this.velocity.y += ay * dt;

        // Apply Drag
        // Drag force is usually proportional to velocity squared, but linear drag is simpler and often sufficient
        // v = v * (1 - drag * dt)
        const dragFactor = Math.max(0, 1 - this.drag * dt);
        this.velocity.x *= dragFactor;
        this.velocity.y *= dragFactor;

        // x = x0 + vt
        t.x += this.velocity.x; // Note: This assumes 1 unit = 1 meter roughly
        t.y += this.velocity.y;

        // Reset forces
        this.force.x = 0;
        this.force.y = 0;
    }
}

window.RigidBody = RigidBody;
