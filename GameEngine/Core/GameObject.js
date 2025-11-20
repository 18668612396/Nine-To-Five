class GameObject extends EngineObject {
    constructor(name = 'GameObject', x = 0, y = 0) {
        super(name);
        this.components = [];
        this.active = true;
        
        // Add default Transform
        this.transform = new Transform(x, y);
        this.addComponent(this.transform);
    }

    // Proxy x and y to transform for backward compatibility
    get x() { return this.transform.x; }
    set x(value) { this.transform.x = value; }

    get y() { return this.transform.y; }
    set y(value) { this.transform.y = value; }

    addComponent(component) {
        component.gameObject = this;
        this.components.push(component);
        if (component.start) component.start();
        return component;
    }

    getComponent(nameOrType) {
        if (typeof nameOrType === 'string') {
            return this.components.find(c => c.name === nameOrType);
        } else {
            return this.components.find(c => c instanceof nameOrType);
        }
    }
    
    removeComponent(component) {
        const index = this.components.indexOf(component);
        if (index > -1) {
            this.components.splice(index, 1);
            component.gameObject = null;
        }
    }

    update(dt) {
        if (!this.active) return;
        for (const component of this.components) {
            if (component.enabled && component.update) {
                component.update(dt);
            }
        }
    }

    draw(ctx) {
        if (!this.active) return;
        for (const component of this.components) {
            if (component.enabled && component.draw) {
                component.draw(ctx);
            }
        }
    }
}
