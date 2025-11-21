class ParticleSystem extends Component {
    constructor(config) {
        super('ParticleSystem');
        this.particles = [];
        
        // Main Module
        this.duration = config.duration || 1.0;
        this.looping = config.looping !== undefined ? config.looping : false;
        this.startDelay = config.startDelay || 0;
        this.startLifetime = config.startLifetime || { min: 0.5, max: 1.0 };
        this.startSpeed = config.startSpeed || { min: 1, max: 3 };
        this.startSize = config.startSize || { min: 5, max: 10 };
        this.startColor = config.startColor || [1, 1, 1, 1]; // [r,g,b,a] 0-1
        this.texture = config.texture || null;

        // Emission Module
        this.emission = {
            rateOverTime: config.emission?.rateOverTime || 0,
            bursts: config.emission?.bursts || [] // Array of { time: 0, count: 10 }
        };
        
        // Backward compatibility for old config style
        if (config.burstCount) {
            this.emission.bursts.push({ time: 0, count: config.burstCount });
        }
        if (config.emissionRate) {
            this.emission.rateOverTime = config.emissionRate;
        }
        if (config.loop !== undefined) this.looping = config.loop;
        if (config.particleLife) this.startLifetime = config.particleLife;
        if (config.particleSpeed) this.startSpeed = config.particleSpeed;
        if (config.particleSize) this.startSize = config.particleSize;
        if (config.particleColor) this.startColor = config.particleColor;

        // Shape Module
        this.shape = {
            angle: config.shape?.angle || 0,
            arc: config.shape?.arc || Math.PI * 2
        };
        if (config.angle !== undefined) this.shape.angle = config.angle;
        if (config.spread !== undefined) this.shape.arc = config.spread;

        // Runtime State
        this.time = 0;
        this.emitTimer = 0;
        this.isStopped = false;
        this.burstsTriggered = new Set();

        // Initial Burst check (time 0)
        this.checkBursts(0);
    }

    update(dt) {
        // If attached to a GameObject, use its active state
        if (this.gameObject && !this.gameObject.active) return;

        this.time += dt;
        
        // Handle Loop / End
        if (this.time >= this.duration) {
            if (this.looping) {
                this.time = 0;
                this.burstsTriggered.clear();
                this.checkBursts(0);
            } else {
                // Stop emitting, but don't deactivate component yet as particles need to live out
            }
        }

        // Handle Bursts
        if (this.time < this.duration || this.looping) {
            this.checkBursts(this.time);
        }

        // Handle Continuous Emission
        if ((this.time < this.duration || this.looping) && this.emission.rateOverTime > 0) {
            const interval = 1.0 / this.emission.rateOverTime;
            this.emitTimer += dt;
            while (this.emitTimer >= interval) {
                this.emit(1);
                this.emitTimer -= interval;
            }
        }

        // Update Particles
        let activeCount = 0;
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            if (p.active) {
                p.update(dt);
                activeCount++;
            } else {
                this.particles.splice(i, 1);
            }
        }

        // Check if system is completely finished (no particles left and not emitting)
        if (!this.looping && this.time >= this.duration && activeCount === 0) {
            this.isStopped = true;
            // Optionally destroy the game object if it was just for this effect
            if (this.gameObject && this.gameObject.name === 'ParticleEffect') {
                this.gameObject.active = false;
            }
        }
    }

    checkBursts(currentTime) {
        this.emission.bursts.forEach((burst, index) => {
            if (currentTime >= burst.time && !this.burstsTriggered.has(index)) {
                this.emit(burst.count);
                this.burstsTriggered.add(index);
            }
        });
    }

    emit(count) {
        const transform = this.gameObject ? this.gameObject.transform : { x: 0, y: 0 };
        
        for (let i = 0; i < count; i++) {
            const angle = this.shape.angle + (Math.random() - 0.5) * this.shape.arc;
            const speed = this.randomRange(this.startSpeed.min, this.startSpeed.max);
            const life = this.randomRange(this.startLifetime.min, this.startLifetime.max);
            const size = this.randomRange(this.startSize.min, this.startSize.max);

            const pConfig = {
                x: transform.x,
                y: transform.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: life,
                size: size,
                color: this.startColor,
                texture: this.texture
            };

            this.particles.push(new Particle(pConfig));
        }
    }

    randomRange(min, max) {
        return min + Math.random() * (max - min);
    }
}
