class ParticleSystemRenderer extends Renderer {
    constructor() {
        super('ParticleSystemRenderer');
        this.sortingOrder = 100; // Default to be on top of most things

        if (!ParticleSystemRenderer.defaultMaterial && window.resourceManager) {
            window.resourceManager.load('Assets/DefaultParticleMaterial.mat').then(mat => {
                ParticleSystemRenderer.defaultMaterial = mat;
            });
        }
    }

    render(pipeline) {
        if (!this.gameObject || !this.gameObject.active) return;

        const ps = this.gameObject.getComponent('ParticleSystem');
        if (!ps) return;

        // Get Material from Renderer Module
        let material = null;
        if (ps.renderer && ps.renderer.material) {
            material = ps.renderer.material;
        }

        if (!material) {
            material = ParticleSystemRenderer.defaultMaterial;
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
