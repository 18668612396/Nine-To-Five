// --- 武器类 ---

class Weapon {
    constructor(player, id, cooldown) {
        this.player = player;
        this.id = id;
        this.baseCooldown = cooldown;
        this.timer = 0;
        this.level = 1;
    }
    
    levelUp() { this.level++; }
    
    update() {
        if (this.timer > 0) {
            this.timer--;
        } else {
            this.fire();
            this.timer = this.baseCooldown * this.player.cooldownMult;
        }
    }
    
    fire() {}
    
    getStats() {
        return {
            dmg: 10 * this.player.damageMult,
            area: 1 * this.player.areaMult,
            speed: 1 * this.player.projSpeed,
            duration: 60 * this.player.durationMult,
            kb: 2 * this.player.knockback,
            amount: this.player.amount
        };
    }
}

class WeaponFishbone extends Weapon {
    constructor(player) { super(player, 'fishbone', 40); }
    
    fire() {
        const stats = this.getStats();
        let dirX = this.player.facingRight ? 1 : -1;
        let dirY = 0;
        
        let closest = null;
        let minDist = 400;
        Game.enemies.forEach(e => {
            const d = Math.sqrt((e.x - this.player.x) ** 2 + (e.y - this.player.y) ** 2);
            if (d < minDist) {
                minDist = d;
                closest = e;
            }
        });

        if (closest) {
            const dx = closest.x - this.player.x;
            const dy = closest.y - this.player.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            dirX = dx / len;
            dirY = dy / len;
        }

        const count = 1 + stats.amount;
        for (let i = 0; i < count; i++) {
            const angle = (Math.random() - 0.5) * 0.2;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const fx = dirX * cos - dirY * sin;
            const fy = dirX * sin + dirY * cos;

            const p = new Projectile(
                this.player.x, this.player.y,
                fx, fy,
                5 * stats.speed,
                60 * stats.duration,
                15 * stats.dmg,
                3 * stats.kb,
                6, '#fff', 1 + Math.floor(this.level / 2)
            );
            Game.projectiles.push(p);
        }
    }
}

class WeaponAura extends Weapon {
    constructor(player) { super(player, 'aura', 15); }
    
    fire() {
        const stats = this.getStats();
        const r = 60 * stats.area;
        Game.enemies.forEach(e => {
            const dx = e.x - this.player.x;
            const dy = e.y - this.player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < r + e.radius) {
                const kx = (dx / dist) * stats.kb;
                const ky = (dy / dist) * stats.kb;
                e.takeDamage(1.5 * stats.dmg, kx, ky);
            }
        });
    }
}

class WeaponGarlic extends Weapon {
    constructor(player) { super(player, 'garlic', 60); }
    
    fire() {
        const stats = this.getStats();
        const r = 80 * stats.area;

        Game.enemies.forEach(e => {
            const dx = e.x - this.player.x;
            const dy = e.y - this.player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < r + e.radius) {
                const kx = (dx / dist) * 2;
                const ky = (dy / dist) * 2;
                e.x += kx;
                e.y += ky;
                e.takeDamage(8 * stats.dmg, kx * stats.kb, ky * stats.kb);
            }
        });
    }
}

class WeaponAxe extends Weapon {
    constructor(player) { super(player, 'axe', 50); }
    
    fire() {
        const stats = this.getStats();
        const count = 1 + stats.amount;
        for (let i = 0; i < count; i++) {
            const vx = (Math.random() - 0.5) * 2;
            const vy = -6 * stats.speed;
            const p = new Projectile(
                this.player.x, this.player.y,
                vx, vy,
                1, 120,
                20 * stats.dmg,
                2 * stats.kb,
                8, '#d35400', 999
            );
            p.update = function() {
                this.dx *= 0.98;
                this.dy += 0.2;
                this.x += this.dx;
                this.y += this.dy;
                this.duration--;
                if (this.duration <= 0) this.markedForDeletion = true;
            };
            Game.projectiles.push(p);
        }
    }
}

class WeaponWand extends Weapon {
    constructor(player) { super(player, 'wand', 45); }
    
    fire() {
        const stats = this.getStats();
        const count = 1 + stats.amount;
        
        for (let i = 0; i < count; i++) {
            let closest = null;
            let minDist = 300;
            Game.enemies.forEach(e => {
                const d = Math.sqrt((e.x - this.player.x) ** 2 + (e.y - this.player.y) ** 2);
                if (d < minDist) { minDist = d; closest = e; }
            });

            if (closest) {
                const dx = closest.x - this.player.x;
                const dy = closest.y - this.player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const p = new Projectile(
                    this.player.x, this.player.y,
                    dx / dist, dy / dist,
                    6 * stats.speed,
                    60,
                    12 * stats.dmg,
                    1 * stats.kb,
                    4, '#9b59b6', 1
                );
                Game.projectiles.push(p);
            }
        }
    }
}

class WeaponOrbit extends Weapon {
    constructor(player) {
        super(player, 'orbit', 1);
        this.orbitAngle = 0;
    }
    
    fire() {
        const stats = this.getStats();
        this.orbitAngle += 0.05 * stats.speed;

        Game.projectiles = Game.projectiles.filter(p => p.ownerId !== 'orbit');

        const count = 1 + stats.amount;
        for (let i = 0; i < count; i++) {
            const angle = this.orbitAngle + (Math.PI * 2 * i) / count;
            const p = new Projectile(0, 0, 0, 0, 0, 2, 10 * stats.dmg, 2 * stats.kb, 6, '#f1c40f', 999);
            p.ownerId = 'orbit';
            
            const dist = 70 * stats.area;
            p.x = this.player.x + Math.cos(angle) * dist;
            p.y = this.player.y + Math.sin(angle) * dist;
            
            Game.projectiles.push(p);
        }
    }
}
