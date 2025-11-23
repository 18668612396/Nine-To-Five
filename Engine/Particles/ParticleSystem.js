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
        this.rotationOverLifetime = new RotationOverLifetimeModule(config.rotationOverLifetime || {});
        this.renderer = new RendererModule(config.renderer || {});

        // Order matters for onEmit dependencies
        // Main (sets speed) -> Shape (uses speed to set velocity)
        this.modules.push(this.main, this.emission, this.shape, this.colorOverLifetime, this.sizeOverLifetime, this.rotationOverLifetime, this.renderer);

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
        this.emission = new EmissionModule(config.emission || config);
        this.shape = new ShapeModule(config.shape || config);
        this.colorOverLifetime = new ColorOverLifetimeModule(config.colorOverLifetime || {});
        this.sizeOverLifetime = new SizeOverLifetimeModule(config.sizeOverLifetime || {});
        this.rotationOverLifetime = new RotationOverLifetimeModule(config.rotationOverLifetime || {});
        this.renderer = new RendererModule(config.renderer || {});

        // Resolve Material if it's a GUID
        if (this.renderer.material && typeof this.renderer.material === 'string') {
            const matGuid = this.renderer.material;
            if (window.resourceManager) {
                window.resourceManager.load(matGuid).then(mat => {
                    this.renderer.material = mat;
                });
            }
        }

        this.modules = [this.main, this.emission, this.shape, this.colorOverLifetime, this.sizeOverLifetime, this.rotationOverLifetime, this.renderer];
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
        const isLocal = this.main.simulationSpace === 'Local';

        for (let i = 0; i < count; i++) {
            const p = new Particle({});

            // Set initial transform from system
            if (isLocal) {
                p.x = 0;
                p.y = 0;
            } else {
                p.x = transform.x;
                p.y = transform.y;
            }
            p.texture = this.texture;

            // Initialize via Modules
            this.modules.forEach(m => {
                if (m.enabled) m.onEmit(p);
            });

            this.particles.push(p);
        }
    }

    play() {
        console.log("ParticleSystem: Play called");
        this.isPlaying = true;
        this.isStopped = false;
        this.time = 0;
    }

    stop() {
        this.isPlaying = false;
        this.isStopped = true;
    }

    draw(ctx, material) {
        // console.log("ParticleSystem: Draw. Active particles:", this.particles.length);
        const isLocal = this.main.simulationSpace === 'Local';

        // Use material if provided, otherwise fallback to internal texture
        // Note: Material support in Particle.draw needs to be implemented or handled here
        // For now, let's assume we just want to use the texture from the material if available
        let texture = this.texture;
        if (material && material.getTexture) {
            const matTex = material.getTexture('_MainTex');
            if (matTex) texture = matTex;
        }

        if (isLocal && this.gameObject) {
            const t = this.gameObject.transform;
            ctx.save();
            ctx.translate(t.x, t.y);
            ctx.rotate(t.rotation);
            // Note: Scale might distort particles if non-uniform, but let's support it
            ctx.scale(t.scale.x, t.scale.y);

            for (const p of this.particles) {
                if (p.active) {
                    if (material) {
                        material.setColor('_Color', {
                            r: p.color[0] * 255,
                            g: p.color[1] * 255,
                            b: p.color[2] * 255,
                            a: p.color[3]
                        });
                    }

                    const oldTex = p.texture;
                    if (texture) p.texture = texture;
                    p.draw(ctx);
                    p.texture = oldTex;
                }
            }
            ctx.restore();
        } else {
            for (const p of this.particles) {
                if (p.active) {
                    if (material) {
                        material.setColor('_Color', {
                            r: p.color[0] * 255,
                            g: p.color[1] * 255,
                            b: p.color[2] * 255,
                            a: p.color[3]
                        });
                    }

                    const oldTex = p.texture;
                    if (texture) p.texture = texture;
                    p.draw(ctx);
                    p.texture = oldTex;
                }
            }
        }
    }
}

window.ParticleSystem = ParticleSystem;
