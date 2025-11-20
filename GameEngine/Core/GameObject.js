class GameObject extends EngineObject {
    constructor(name = 'GameObject', x = 0, y = 0) {
        super(name);
        this.x = x;
        this.y = y;
        this.active = true;
    }

    update(dt) {
        // To be implemented by subclasses
    }

    draw(ctx) {
        // To be implemented by subclasses
    }
}
