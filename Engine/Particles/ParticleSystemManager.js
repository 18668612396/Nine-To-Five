class ParticleSystemManager extends EngineObject {
    constructor() {
        super('ParticleSystemManager');
        this.systems = []; // Stores GameObjects
    }

    addSystem(config) {
        const go = new GameObject('ParticleEffect', config.x || 0, config.y || 0);
        
        const ps = new ParticleSystem(config);
        go.addComponent(ps);
        
        const renderer = new ParticleSystemRenderer();
        go.addComponent(renderer);
        
        this.systems.push(go);
        return ps; // Return the component for reference if needed
    }

    update(dt) {
        for (let i = this.systems.length - 1; i >= 0; i--) {
            const go = this.systems[i];
            go.update(dt);
            
            // Check if system is stopped (hacky access to component)
            const ps = go.getComponent('ParticleSystem');
            if (ps && ps.isStopped) {
                this.systems.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        this.systems.forEach(go => go.draw(ctx));
    }
    
    // Helper to create common effects
    createExplosion(x, y, color = [1, 1, 0, 1]) {
        this.addSystem({
            x: x, y: y,
            duration: 0.5,
            looping: false,
            emission: {
                bursts: [{ time: 0, count: 20 }]
            },
            shape: {
                angle: 0,
                arc: Math.PI * 2
            },
            startLifetime: { min: 0.3, max: 0.6 },
            startSpeed: { min: 2, max: 5 },
            startSize: { min: 3, max: 8 },
            startColor: color
        });
    }

    createHitEffect(x, y) {
        this.addSystem({
            x: x, y: y,
            duration: 0.2,
            looping: false,
            emission: {
                bursts: [{ time: 0, count: 5 }]
            },
            shape: {
                angle: 0,
                arc: Math.PI * 2
            },
            startLifetime: { min: 0.1, max: 0.3 },
            startSpeed: { min: 1, max: 3 },
            startSize: { min: 2, max: 4 },
            startColor: [1, 1, 1, 1]
        });
    }
}
