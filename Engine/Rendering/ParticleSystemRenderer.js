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

        const ps = this.gameObject.getComponent('ParticleSystem');
        if (!ps) return;

        // Get Material from Renderer Module
        let material = null;
        if (ps.renderer && ps.renderer.material) {
            // If it's a GUID, we might need to load it, but render loop is synchronous usually.
            // Assuming material is already loaded or is a Material object.
            // If it's a GUID string, we can't use it directly in draw.
            // Ideally, ParticleSystem should have loaded it.
            material = ps.renderer.material;
        }

        const t = this.gameObject.transform;
        
        // Submit a CUSTOM command to the pipeline
        pipeline.submit({
            type: 'CUSTOM',
            callback: (ctx) => {
                // Pass material to draw if needed, or set context state
                // For now, ParticleSystem.draw handles context, but we can enhance it
                ps.draw(ctx, material);
            },
            gameObject: this.gameObject,
            x: 0, 
            y: 0, 
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            offsetX: 0,
            offsetY: 0,
            sortingOrder: this.sortingOrder,
            sortY: t.y 
        });
    }
}

window.ParticleSystemRenderer = ParticleSystemRenderer;
