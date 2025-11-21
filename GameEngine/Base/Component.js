class Component extends EngineObject {
    constructor(name) {
        super(name);
        this.gameObject = null;
        this._enabled = true;
    }

    get enabled() { return this._enabled; }
    set enabled(value) {
        if (this._enabled !== value) {
            this._enabled = value;
            if (this._enabled) {
                if (this.onEnable) this.onEnable();
            } else {
                if (this.onDisable) this.onDisable();
            }
        }
    }

    start() {}
    update(dt) {}
    draw(ctx) {}
    onEnable() {}
    onDisable() {}
    onDestroy() {}
}

window.Component = Component;
