class ParticleSystemManager extends EngineObject {
    constructor() {
        super('ParticleSystemManager');
        this.systems = [];
    }

    addSystem(config) {
        const ps = new ParticleSystem(config);
        this.systems.push(ps);
        return ps;
    }

    update(dt) {
        for (let i = this.systems.length - 1; i >= 0; i--) {
            const ps = this.systems[i];
            ps.update(dt);
            if (ps.isStopped) {
                this.systems.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        this.systems.forEach(ps => ps.draw(ctx));
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
