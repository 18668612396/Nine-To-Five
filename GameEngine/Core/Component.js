class Component extends EngineObject {
    constructor(name) {
        super(name);
        this.gameObject = null;
        this.enabled = true;
    }

    start() {}
    update(dt) {}
    draw(ctx) {}
}
