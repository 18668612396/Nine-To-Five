class ParticleSystem extends Component {
    constructor(config = {}) {
        super('ParticleSystem');
        this.particles = [];
        this.modules = [];
        
        // Initialize Modules
        // We pass the specific config section if available, otherwise fallback to root config for backward compatibility
        this.main = new MainModule(config.main || config); 
        this.emission = new EmissionModule(config.emission || config);
        this.shape = new ShapeModule(config.shape || config);
        this.colorOverLifetime = new ColorOverLifetimeModule(config.colorOverLifetime || {});
        this.sizeOverLifetime = new SizeOverLifetimeModule(config.sizeOverLifetime || {});
        
        // Order matters for onEmit dependencies
        // Main (sets speed) -> Shape (uses speed to set velocity)
        this.modules.push(this.main, this.emission, this.shape, this.colorOverLifetime, this.sizeOverLifetime);
        
        this.modules.forEach(m => m.init(this));

        // Runtime State
        this.time = 0;
        this.isStopped = false;
        this.isPlaying = this.main.playOnAwake;
        
        // Texture
        this.texture = config.texture || null;
    }

    onLoad(config) {
        // Re-initialize modules with loaded config
        this.main = new MainModule(config.main || config); 
        console.log("ParticleSystem MainModule loop:", this.main.loop);
        this.emission = new EmissionModule(config.emission || config);
        this.shape = new ShapeModule(config.shape || config);
        this.colorOverLifetime = new ColorOverLifetimeModule(config.colorOverLifetime || {});
        this.sizeOverLifetime = new SizeOverLifetimeModule(config.sizeOverLifetime || {});
        
        this.modules = [this.main, this.emission, this.shape, this.colorOverLifetime, this.sizeOverLifetime];
        this.modules.forEach(m => m.init(this));
        
        this.isPlaying = this.main.playOnAwake;
        if (config.texture) this.texture = config.texture;
    }

    update(dt) {
        if (this.gameObject && !this.gameObject.active) return;
        
        if (this.isPlaying) {
            this.time += dt;
            
            // Update Modules (System level)
            this.modules.forEach(m => {
                if (m.enabled) m.update(dt);
            });

            // Check Duration/Looping
            if (this.time >= this.main.duration) {
                if (this.main.loop) {
                    this.time = 0;
                    // Reset modules if needed?
                    this.modules.forEach(m => {
                        if (m.reset) m.reset();
                    });
                } else {
                    // If not looping, we stop emitting but let particles die out
                    this.stop();
                }
            }
        }

        // Update Particles
        let activeCount = 0;
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            if (p.active) {
                // Module Particle Updates
                this.modules.forEach(m => {
                    if (m.enabled) m.updateParticle(p, dt);
                });
                
                // Physics Integration (if not fully handled by modules)
                p.update(dt); 
                
                activeCount++;
            } else {
                this.particles.splice(i, 1);
            }
        }
        
        if (!this.isPlaying && activeCount === 0 && this.main.destroyOnStop) {
             if (this.gameObject) this.gameObject.destroy();
        }
    }

    emit(count) {
        if (this.particles.length + count > this.main.maxParticles) {
            count = this.main.maxParticles - this.particles.length;
            if (count <= 0) return;
        }

        const transform = this.gameObject ? this.gameObject.transform : { x: 0, y: 0 };

        for (let i = 0; i < count; i++) {
            const p = new Particle({});
            
            // Set initial transform from system
            p.x = transform.x; 
            p.y = transform.y;
            p.texture = this.texture;
            
            // Initialize via Modules
            this.modules.forEach(m => {
                if (m.enabled) m.onEmit(p);
            });
            
            this.particles.push(p);
        }
    }
    
    play() {
        this.isPlaying = true;
        this.isStopped = false;
        this.time = 0;
    }
    
    stop() {
        this.isPlaying = false;
        this.isStopped = true;
    }

    draw(ctx) {
        for (const p of this.particles) {
            if (p.active) {
                p.draw(ctx);
            }
        }
    }
}

window.ParticleSystem = ParticleSystem;
