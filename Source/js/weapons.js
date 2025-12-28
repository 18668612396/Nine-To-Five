// --- 武器类 (垂直滚动版 - 主要向上射击) ---

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
        } else if (CONFIG.AUTO_BATTLE) {
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
    constructor(player) { super(player, 'fishbone', 25); }
    
    // 检查角度是否在允许的攻击范围内（前方130度，即上方为中心左右各65度）
    isAngleAllowed(dirX, dirY) {
        // 计算角度（以向上为0度，顺时针为正）
        const angle = Math.atan2(dirX, -dirY); // 向上时angle=0
        const angleDeg = angle * 180 / Math.PI;
        // 允许范围：-65度到+65度（前方130度）
        // 禁止范围：下方左右各25度之外，即角度绝对值大于65度
        return Math.abs(angleDeg) <= 65;
    }
    
    // 将角度限制在允许范围内
    clampDirection(dirX, dirY) {
        const angle = Math.atan2(dirX, -dirY);
        const angleDeg = angle * 180 / Math.PI;
        const maxAngle = 65 * Math.PI / 180; // 65度转弧度
        
        if (Math.abs(angle) <= maxAngle) {
            return { x: dirX, y: dirY };
        }
        
        // 限制到边界角度
        const clampedAngle = angle > 0 ? maxAngle : -maxAngle;
        return {
            x: Math.sin(clampedAngle),
            y: -Math.cos(clampedAngle)
        };
    }
    
    fire() {
        const stats = this.getStats();
        const count = 1 + stats.amount;
        
        // 主要向上射击，但会瞄准最近的敌人
        let dirX = 0;
        let dirY = -1; // 默认向上
        
        // 只有开启自动战斗时才追踪敌人
        if (CONFIG.AUTO_BATTLE) {
            let closest = null;
            let minDist = 500;
            Game.enemies.forEach(e => {
                // 计算敌人相对于玩家的方向
                const dx = e.x - this.player.x;
                const dy = e.y - this.player.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                if (len > 0) {
                    const normX = dx / len;
                    const normY = dy / len;
                    // 只瞄准在允许攻击范围内的敌人
                    if (this.isAngleAllowed(normX, normY)) {
                        if (len < minDist) {
                            minDist = len;
                            closest = e;
                        }
                    }
                }
            });

            if (closest) {
                const dx = closest.x - this.player.x;
                const dy = closest.y - this.player.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                dirX = dx / len;
                dirY = dy / len;
                // 确保方向在允许范围内
                const clamped = this.clampDirection(dirX, dirY);
                dirX = clamped.x;
                dirY = clamped.y;
            }
        }

        for (let i = 0; i < count; i++) {
            // 扇形散射
            const spreadAngle = (i - (count - 1) / 2) * 0.15;
            const cos = Math.cos(spreadAngle);
            const sin = Math.sin(spreadAngle);
            let fx = dirX * cos - dirY * sin;
            let fy = dirX * sin + dirY * cos;
            
            // 确保散射后的方向也在允许范围内
            const clamped = this.clampDirection(fx, fy);
            fx = clamped.x;
            fy = clamped.y;

            const p = new Projectile(
                this.player.x, this.player.y - 10,
                fx, fy,
                12 * stats.speed,  // 子弹速度从8提升到12
                80,
                18 * stats.dmg,
                4 * stats.kb,
                8, '#fff', 1 + Math.floor(this.level / 2)
            );
            Game.projectiles.push(p);
        }
    }
}

class WeaponAura extends Weapon {
    constructor(player) { super(player, 'aura', 12); }
    
    fire() {
        const stats = this.getStats();
        const r = 70 * stats.area;
        Game.enemies.forEach(e => {
            const dx = e.x - this.player.x;
            const dy = e.y - this.player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < r + e.radius) {
                const kx = (dx / dist) * stats.kb;
                const ky = (dy / dist) * stats.kb;
                e.takeDamage(2 * stats.dmg, kx, ky);
            }
        });
    }
}

class WeaponGarlic extends Weapon {
    constructor(player) { super(player, 'garlic', 45); }
    
    fire() {
        const stats = this.getStats();
        const r = 100 * stats.area;

        Game.enemies.forEach(e => {
            const dx = e.x - this.player.x;
            const dy = e.y - this.player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < r + e.radius) {
                const kx = (dx / dist) * 3;
                const ky = (dy / dist) * 3;
                e.x += kx;
                e.y += ky;
                e.takeDamage(10 * stats.dmg, kx * stats.kb, ky * stats.kb);
            }
        });
    }
}

class WeaponAxe extends Weapon {
    constructor(player) { super(player, 'axe', 40); }
    
    fire() {
        const stats = this.getStats();
        const count = 1 + stats.amount;
        for (let i = 0; i < count; i++) {
            // 向上抛出，带有横向随机
            const vx = (Math.random() - 0.5) * 3;
            const vy = -8 * stats.speed;
            const p = new Projectile(
                this.player.x, this.player.y - 10,
                vx, vy,
                1, 150,
                25 * stats.dmg,
                3 * stats.kb,
                12, '#d35400', 999
            );
            // 重力效果
            p.update = function() {
                this.dx *= 0.98;
                this.dy += 0.15;
                this.x += this.dx;
                this.y += this.dy;
                this.angle += 0.2;
                this.duration--;
                if (this.duration <= 0 || this.y > CONFIG.GAME_HEIGHT + 50) {
                    this.markedForDeletion = true;
                }
            };
            Game.projectiles.push(p);
        }
    }
}

class WeaponWand extends Weapon {
    constructor(player) { super(player, 'wand', 30); }
    
    // 检查角度是否在允许的攻击范围内（前方130度）
    isAngleAllowed(dirX, dirY) {
        const angle = Math.atan2(dirX, -dirY);
        const angleDeg = angle * 180 / Math.PI;
        return Math.abs(angleDeg) <= 65;
    }
    
    // 将角度限制在允许范围内
    clampDirection(dirX, dirY) {
        const angle = Math.atan2(dirX, -dirY);
        const maxAngle = 65 * Math.PI / 180;
        
        if (Math.abs(angle) <= maxAngle) {
            return { x: dirX, y: dirY };
        }
        
        const clampedAngle = angle > 0 ? maxAngle : -maxAngle;
        return {
            x: Math.sin(clampedAngle),
            y: -Math.cos(clampedAngle)
        };
    }
    
    fire() {
        const stats = this.getStats();
        const count = 1 + stats.amount;
        
        let targets = [];
        
        // 只有开启自动战斗时才追踪敌人
        if (CONFIG.AUTO_BATTLE) {
            targets = Game.enemies
                .filter(e => {
                    const dx = e.x - this.player.x;
                    const dy = e.y - this.player.y;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    if (len === 0) return false;
                    return this.isAngleAllowed(dx / len, dy / len);
                })
                .sort((a, b) => {
                    const da = Math.sqrt((a.x - this.player.x) ** 2 + (a.y - this.player.y) ** 2);
                    const db = Math.sqrt((b.x - this.player.x) ** 2 + (b.y - this.player.y) ** 2);
                    return da - db;
                })
                .slice(0, count);
        }
        
        targets.forEach(target => {
            const dx = target.x - this.player.x;
            const dy = target.y - this.player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            let dirX = dx / dist;
            let dirY = dy / dist;
            
            // 确保方向在允许范围内
            const clamped = this.clampDirection(dirX, dirY);
            dirX = clamped.x;
            dirY = clamped.y;
            
            const p = new Projectile(
                this.player.x, this.player.y - 10,
                dirX, dirY,
                14 * stats.speed,  // 子弹速度从10提升到14
                60,
                15 * stats.dmg,
                2 * stats.kb,
                6, '#9b59b6', 1
            );
            Game.projectiles.push(p);
        });
        
        // 如果没有目标或关闭自动战斗，向上射击
        if (targets.length === 0) {
            for (let i = 0; i < count; i++) {
                const angle = -Math.PI / 2 + (i - (count - 1) / 2) * 0.3;
                // 限制角度在允许范围内
                const maxAngle = 65 * Math.PI / 180;
                const clampedAngle = Math.max(-Math.PI/2 - maxAngle, Math.min(-Math.PI/2 + maxAngle, angle));
                
                const p = new Projectile(
                    this.player.x, this.player.y - 10,
                    Math.cos(clampedAngle), Math.sin(clampedAngle),
                    14 * stats.speed,  // 子弹速度从10提升到14
                    60,
                    15 * stats.dmg,
                    2 * stats.kb,
                    6, '#9b59b6', 1
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
        this.orbitAngle += 0.06 * stats.speed;

        Game.projectiles = Game.projectiles.filter(p => p.ownerId !== 'orbit');

        const count = 2 + stats.amount;
        for (let i = 0; i < count; i++) {
            const angle = this.orbitAngle + (Math.PI * 2 * i) / count;
            const p = new Projectile(0, 0, 0, 0, 0, 2, 12 * stats.dmg, 3 * stats.kb, 8, '#f1c40f', 999);
            p.ownerId = 'orbit';
            
            const dist = 80 * stats.area;
            p.x = this.player.x + Math.cos(angle) * dist;
            p.y = this.player.y + Math.sin(angle) * dist;
            
            Game.projectiles.push(p);
        }
    }
}

// 弹射球武器 - 发射会在屏幕边缘弹射的圆球
class WeaponBounceBall extends Weapon {
    constructor(player, ballColor) {
        super(player, 'bounceball', 50);
        this.ballColor = ballColor || '#4fc3f7';
    }
    
    fire() {
        const stats = this.getStats();
        const count = 1 + stats.amount;
        
        for (let i = 0; i < count; i++) {
            // 在前方130度范围内随机发射（上方为中心，左右各65度）
            // 角度范围：-155度到-25度（以标准坐标系，向右为0度）
            // 即向上为-90度，左右各65度
            const maxAngleDeg = 65;
            const randomOffset = (Math.random() - 0.5) * 2 * maxAngleDeg; // -65到+65度
            const angle = (-90 + randomOffset) * Math.PI / 180; // 转换为弧度
            const dx = Math.cos(angle);
            const dy = Math.sin(angle);
            
            const p = new BouncingProjectile(
                this.player.x, this.player.y,
                dx, dy,
                9 * stats.speed,  // 子弹速度从6提升到9
                300 * stats.duration, // 持续时间较长
                15 * stats.dmg,
                3 * stats.kb,
                12 * stats.area,
                this.ballColor,
                999 // 高穿透
            );
            Game.projectiles.push(p);
        }
    }
}
