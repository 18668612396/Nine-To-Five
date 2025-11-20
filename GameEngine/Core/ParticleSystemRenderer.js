class ParticleSystemRenderer extends Renderer {
    constructor() {
        super('ParticleSystemRenderer');
        this.system = null;
    }

    start() {
        this.system = this.gameObject.getComponent('ParticleSystem');
    }

    draw(ctx) {
        if (!this.visible) return;
        if (!this.system) {
            this.system = this.gameObject.getComponent('ParticleSystem');
            if (!this.system) return;
        }
        
        // Draw particles from the system
        this.system.particles.forEach(p => p.draw(ctx));
    }
}
