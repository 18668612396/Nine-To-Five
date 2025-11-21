class ParticleSystemRenderer extends Renderer {
    constructor() {
        super('ParticleSystemRenderer');
    }

    draw(ctx) {
        // ParticleSystem handles its own drawing usually, 
        // but if we wanted to integrate it into the Scene draw loop strictly:
        const ps = this.gameObject.getComponent('ParticleSystem');
        if (ps) {
            ps.draw(ctx);
        }
    }
}

window.ParticleSystemRenderer = ParticleSystemRenderer;
