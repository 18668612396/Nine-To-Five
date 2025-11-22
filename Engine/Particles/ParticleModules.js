class ParticleModule {
    constructor() {
        this.enabled = true;
        this.system = null;
    }

    init(system) {
        this.system = system;
    }

    // Called once per frame for the system
    update(dt) {}

    // Called when a particle is initialized
    onEmit(particle) {}

    // Called for each active particle every frame
    updateParticle(particle, dt) {}

    getValue(param) {
        if (typeof param === 'number') return param;
        if (param && param.min !== undefined && param.max !== undefined) {
            return param.min + Math.random() * (param.max - param.min);
        }
        return param; 
    }
}

class MainModule extends ParticleModule {
    constructor(config = {}) {
        super();
        this.duration = config.duration || 5.0;
        this.loop = config.loop !== undefined ? config.loop : true;
        this.startDelay = config.startDelay || 0;
        this.startLifetime = config.startLifetime || { min: 1.0, max: 1.0 }; // Constant or Random Range
        this.startSpeed = config.startSpeed || { min: 5.0, max: 5.0 };
        this.startSize = config.startSize || { min: 1.0, max: 1.0 };
        this.startColor = config.startColor || [1, 1, 1, 1]; // [r,g,b,a]
        this.startRotation = config.startRotation || { min: 0, max: 0 };
        this.gravityModifier = config.gravityModifier || 0;
        this.maxParticles = config.maxParticles || 1000;
        this.playOnAwake = config.playOnAwake !== undefined ? config.playOnAwake : true;
        this.destroyOnStop = config.destroyOnStop !== undefined ? config.destroyOnStop : false;
        this.simulationSpace = config.simulationSpace || 'World'; // 'World', 'Local'
    }

    onEmit(particle) {
        particle.startLifetime = this.getValue(this.startLifetime);
        particle.remainingLifetime = particle.startLifetime;
        particle.startSize = this.getValue(this.startSize);
        particle.size = particle.startSize;
        particle.startColor = [...this.startColor]; // Copy array
        particle.color = [...this.startColor];
        particle.rotation = this.getValue(this.startRotation);
        
        const speed = this.getValue(this.startSpeed);
        // Velocity direction is usually set by ShapeModule, but we can set a default here if needed
        // For now, assume ShapeModule or System sets direction, MainModule sets speed magnitude
        // But if velocity is already set (e.g. by Shape), we might just normalize and scale?
        // Let's assume ShapeModule runs AFTER MainModule or cooperates. 
        // Actually, usually Shape determines Position and Direction. Main determines Speed.
        
        particle.speed = speed;
    }

    updateParticle(particle, dt) {
        particle.remainingLifetime -= dt;
        if (particle.remainingLifetime <= 0) {
            particle.active = false;
        }
        
        // Simple gravity
        if (this.gravityModifier !== 0) {
            particle.vy += 9.8 * this.gravityModifier * dt; // Simple gravity approximation
        }
    }
}

class EmissionModule extends ParticleModule {
    constructor(config = {}) {
        super();
        this.rateOverTime = config.rateOverTime !== undefined ? config.rateOverTime : 10;
        this.bursts = config.bursts || []; // [{ time: 0, count: 10, cycleCount: 1, interval: 0 }]
        
        this.rateTimer = 0;
    }

    update(dt) {
        if (!this.system.isPlaying) return;

        const time = this.system.time;
        const prevTime = time - dt;

        // Rate Over Time
        if (this.rateOverTime > 0) {
            const interval = 1.0 / this.rateOverTime;
            this.rateTimer += dt;
            while (this.rateTimer >= interval) {
                this.system.emit(1);
                this.rateTimer -= interval;
            }
        }

        // Bursts (Time-based and Interval-based)
        for (let i = 0; i < this.bursts.length; i++) {
            const burst = this.bursts[i];
            
            // 1. Time-based Burst (One Shot)
            // If interval is not set or 0, treat as one-shot at specific time
            if (!burst.interval || burst.interval <= 0) {
                const burstTime = burst.time || 0;
                // Check if we crossed the burst time in this frame
                // Special case: if burstTime is 0 and prevTime < 0 (start of system), fire.
                // Since system.time starts at 0 and increments by dt, prevTime is time-dt.
                // If time=dt, prevTime=0.
                // If burstTime=0.
                // We want to fire if prevTime <= burstTime && time > burstTime?
                // Or if time >= burstTime and not fired yet?
                
                // Let's use a simple "fired" flag for one-shots, reset on loop
                if (!burst._fired && time >= burstTime) {
                    this.system.emit(burst.count || 10);
                    burst._fired = true;
                }
            } 
            // 2. Interval-based Pulse (Repeating)
            else {
                // Initialize timer if needed
                if (burst._timer === undefined) burst._timer = 0;
                
                burst._timer += dt;
                if (burst._timer >= burst.interval) {
                    this.system.emit(burst.count || 10);
                    burst._timer -= burst.interval;
                }
            }
        }
    }

    init(system) {
        super.init(system);
        this.reset();
    }

    reset() {
        this.rateTimer = 0;
        this.bursts.forEach(b => {
            b._fired = false;
            b._timer = 0;
        });
    }
    
    // Custom method to add a pulse
    addBurst(count, interval) {
        this.bursts.push({ count, interval, _timer: 0 });
    }
}

class ShapeModule extends ParticleModule {
    constructor(config = {}) {
        super();
        this.shapeType = config.shapeType || 'circle'; // circle, box, cone
        this.radius = config.radius || 1.0;
        this.angle = config.angle || 0; // Cone angle
        this.arc = config.arc || 360;
    }

    onEmit(particle) {
        // Set position relative to system transform
        // Set velocity direction
        
        // Simplified Circle Shape
        const angle = (Math.random() * this.arc * (Math.PI / 180)); // Convert to radians
        const r = this.radius * Math.sqrt(Math.random()); // Uniform distribution in circle
        
        // Position offset
        const offsetX = Math.cos(angle) * r;
        const offsetY = Math.sin(angle) * r;
        
        // Apply to particle (assuming particle is in World Space or Local Space)
        // If Local, just set x/y. If World, add System.x/y.
        // Let's assume ParticleSystem handles the World/Local transform.
        // We just set the local offset and direction.
        
        particle.x += offsetX;
        particle.y += offsetY;
        
        // Velocity Direction (Outwards)
        particle.vx = Math.cos(angle);
        particle.vy = Math.sin(angle);
        
        // Apply Speed from MainModule (which was stored in particle.speed)
        particle.vx *= particle.speed;
        particle.vy *= particle.speed;
    }
}

class ColorOverLifetimeModule extends ParticleModule {
    constructor(config = {}) {
        super();
        // gradient: { [0.0]: [1,1,1,1], [1.0]: [1,0,0,0] }
        this.gradient = config.gradient || { 0: [1,1,1,1], 1: [1,1,1,0] }; 
    }

    updateParticle(particle, dt) {
        const t = 1.0 - (particle.remainingLifetime / particle.startLifetime);
        particle.color = this.evaluateGradient(t);
    }

    evaluateGradient(t) {
        // Find keys surrounding t
        const keys = Object.keys(this.gradient).map(parseFloat).sort((a,b) => a-b);
        
        if (t <= keys[0]) return this.gradient[keys[0]];
        if (t >= keys[keys.length-1]) return this.gradient[keys[keys.length-1]];

        for (let i = 0; i < keys.length - 1; i++) {
            if (t >= keys[i] && t <= keys[i+1]) {
                const t1 = keys[i];
                const t2 = keys[i+1];
                const localT = (t - t1) / (t2 - t1);
                
                const c1 = this.gradient[t1];
                const c2 = this.gradient[t2];
                
                return [
                    c1[0] + (c2[0] - c1[0]) * localT,
                    c1[1] + (c2[1] - c1[1]) * localT,
                    c1[2] + (c2[2] - c1[2]) * localT,
                    c1[3] + (c2[3] - c1[3]) * localT
                ];
            }
        }
        return [1,1,1,1];
    }
}

class SizeOverLifetimeModule extends ParticleModule {
    constructor(config = {}) {
        super();
        // curve: { [0.0]: 1.0, [1.0]: 0.0 }
        this.curve = config.curve || { 0: 1.0, 1: 0.0 }; 
    }

    updateParticle(particle, dt) {
        const t = 1.0 - (particle.remainingLifetime / particle.startLifetime);
        const scale = this.evaluateCurve(t);
        particle.size = particle.startSize * scale;
    }

    evaluateCurve(t) {
        const keys = Object.keys(this.curve).map(parseFloat).sort((a,b) => a-b);
        
        if (t <= keys[0]) return this.curve[keys[0]];
        if (t >= keys[keys.length-1]) return this.curve[keys[keys.length-1]];

        for (let i = 0; i < keys.length - 1; i++) {
            if (t >= keys[i] && t <= keys[i+1]) {
                const t1 = keys[i];
                const t2 = keys[i+1];
                const localT = (t - t1) / (t2 - t1);
                
                const v1 = this.curve[t1];
                const v2 = this.curve[t2];
                
                return v1 + (v2 - v1) * localT;
            }
        }
        return 1.0;
    }
}

class RotationOverLifetimeModule extends ParticleModule {
    constructor(config = {}) {
        super();
        this.angularVelocity = config.angularVelocity || 0; 
    }

    onEmit(particle) {
        particle.rotationSpeed = this.getValue(this.angularVelocity);
    }
}

class RendererModule extends ParticleModule {
    constructor(config = {}) {
        super();
        this.material = config.material || null; // GUID or Material Object
    }
}

window.ParticleModule = ParticleModule;
window.MainModule = MainModule;
window.EmissionModule = EmissionModule;
window.ShapeModule = ShapeModule;
window.ColorOverLifetimeModule = ColorOverLifetimeModule;
window.SizeOverLifetimeModule = SizeOverLifetimeModule;
window.RotationOverLifetimeModule = RotationOverLifetimeModule;
window.RendererModule = RendererModule;
