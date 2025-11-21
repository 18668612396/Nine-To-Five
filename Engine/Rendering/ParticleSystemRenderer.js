class ParticleSystemRenderer extends Renderer {
    constructor() {
        super('ParticleSystemRenderer');
        this.sortingOrder = 100; // Default to be on top of most things
    }

    draw(ctx) {
        // ParticleSystem handles its own drawing usually, 
        // but if we wanted to integrate it into the Scene draw loop strictly:
        const ps = this.gameObject.getComponent('ParticleSystem');
        if (ps) {
            ps.draw(ctx);
        }
    }

    render(pipeline) {
        if (!this.gameObject || !this.gameObject.active) return;

        const t = this.gameObject.transform;
        
        // Submit a CUSTOM command to the pipeline
        pipeline.submit({
            type: 'CUSTOM',
            callback: (ctx) => this.draw(ctx),
            gameObject: this.gameObject,
            x: 0, // Particles are world-space, so we don't want pipeline to translate for us?
            y: 0, // Wait, pipeline usually translates to object position.
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            offsetX: 0,
            offsetY: 0,
            sortingOrder: this.sortingOrder,
            // For sorting, we use the object's Y
            sortY: t.y 
        });
    }
}

window.ParticleSystemRenderer = ParticleSystemRenderer;
