// --- 投射物基类 ---

class SkillProjectile {
    static enemies = []; // 由外部设置
    static bosses = []; // 由外部设置
    
    constructor(caster, mods) {
        this.x = caster.x;
        this.y = caster.y;
        this.caster = caster;
        this.angle = mods.angle || 0;
        this.dx = Math.cos(this.angle);
        this.dy = Math.sin(this.angle);

        // 体积缩放
        this.sizeScale = mods.sizeScale || 1;

        this.speed = 10 * (mods.speed || 1);
        this.damage = 10 * (mods.damage || 1);
        this.knockback = mods.knockback || 1;
        this.penetrate = mods.penetrate || 1;
        this.hitList = [];

        this.homing = mods.homing || false;
        this.turnSpeed = mods.turnSpeed || 0.05;
        this.target = null;

        this.chainCount = mods.chainCount || 0;
        this.explosiveOnKill = mods.explosiveOnKill || false;
        this.explosionRadius = mods.explosionRadius || 30;
        this.bounceCount = mods.bounceCount || 0;
        this.bounceRange = mods.bounceRange || 200;

        // 状态效果属性
        this.burning = mods.burning || false;
        this.burnDamage = mods.burnDamage || 0;
        this.critChance = mods.critChance || 0;
        this.lightning = mods.lightning || false;
        this.lightningDamageMult = mods.lightningDamageMult || 0.5;
        this.poison = mods.poison || false;
        this.poisonStacks = mods.poisonStacks || 0;
        this.shieldOnHit = mods.shieldOnHit || false;
        this.shieldAmount = mods.shieldAmount || 0;
        this.pull = mods.pull || false;
        this.pullRange = mods.pullRange || 0;
        this.pullStrength = mods.pullStrength || 0;
        this.rampingDamage = mods.rampingDamage || false;
        this.rampingRate = mods.rampingRate || 0;
        this.rampingBonus = 0;
        this.reflect = mods.reflect || false;
        this.reflectCount = mods.reflectCount || 0;
        this.reflectDamageDecay = mods.reflectDamageDecay || 0.8;
        this.splitOnDeath = mods.splitOnDeath || false;
        this.splitOnHit = mods.splitOnHit || false;
        this.splitAmount = mods.splitAmount || 0;
        this.splitDamageMult = mods.splitDamageMult || 0.3;
        this.hover = mods.hover || false;
        this.hoverDuration = mods.hoverDuration || 0;
        this.isHovering = false;
        this.hoverTimer = 0;
        this.lightPillar = mods.lightPillar || false;
        this.pillarDamage = mods.pillarDamage || 0;
        
        // 冰霜减速
        this.frostSlow = mods.frostSlow || 0;
        
        // 狂暴
        this.frenzy = mods.frenzy || false;
        this.frenzyReduction = mods.frenzyReduction || 0;
        
        // 符文战锤 - 螺旋飞出效果
        this.orbital = mods.orbital || false;
        this.orbitalRadius = mods.orbitalRadius || 20;  // 初始半径较小
        this.orbitalExpandSpeed = mods.orbitalExpandSpeed || 1.5;  // 扩展速度
        this.orbitalSpeed = 0.12;  // 旋转速度
        this.orbitalAngle = mods.angle || 0;
        
        // 环绕模式下立即设置正确的初始方向（切线方向+90度）
        if (this.orbital) {
            this.dx = -Math.cos(this.orbitalAngle);
            this.dy = -Math.sin(this.orbitalAngle);
        }

        this.duration = 180;
        this.radius = 6;
        this.color = '#fff';
        this.markedForDeletion = false;
    }

    update() {
        const enemies = SkillProjectile.enemies;
        
        // 悬停状态
        if (this.isHovering) {
            this.hoverTimer--;
            if (this.hoverTimer <= 0) {
                this.isHovering = false;
                this.markedForDeletion = true;
            }
            // 悬停时持续伤害周围敌人
            enemies.forEach(e => {
                if (!e.markedForDeletion) {
                    const dist = Math.sqrt((e.x - this.x) ** 2 + (e.y - this.y) ** 2);
                    if (dist < this.radius + e.radius + 10) {
                        e.takeDamage(this.damage * 0.1, 0, 0);
                    }
                }
            });
            return;
        }
        
        // 螺旋飞出模式 - 跟随玩家，螺旋向外飞出
        if (this.orbital) {
            this.orbitalAngle += this.orbitalSpeed;
            this.orbitalRadius += this.orbitalExpandSpeed;  // 半径持续增大，无上限
            
            // 跟随玩家位置
            this.x = this.caster.x + Math.cos(this.orbitalAngle) * this.orbitalRadius;
            this.y = this.caster.y + Math.sin(this.orbitalAngle) * this.orbitalRadius;
            
            // 更新弹道方向（切线方向+90度对齐弹道朝向）
            this.dx = -Math.cos(this.orbitalAngle);
            this.dy = -Math.sin(this.orbitalAngle);
            
            // 飞出屏幕范围后消失 (距离玩家超过1200)
            if (this.orbitalRadius > 1200) {
                this.markedForDeletion = true;
            }
            // 不再 return，继续执行后续逻辑（如棱镜核心等）
        } else {
            // 非环绕模式的正常移动
            if (this.homing) this.updateHoming();
            this.x += this.dx * this.speed;
            this.y += this.dy * this.speed;
            this.duration--;
            
            if (this.duration <= 0) {
                if (this.splitOnDeath && this.splitAmount > 0) {
                    this.spawnSplitProjectiles();
                }
                this.markedForDeletion = true;
            }
        }
        
        // 棱镜核心 - 持续增加伤害
        if (this.rampingDamage) {
            this.rampingBonus += this.rampingRate;
        }
    }

    updateHoming() {
        if (!this.target || this.target.markedForDeletion) this.findTarget();
        if (this.target && !this.target.markedForDeletion) {
            const targetAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
            const currentAngle = Math.atan2(this.dy, this.dx);
            let angleDiff = targetAngle - currentAngle;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            const turn = Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), this.turnSpeed);
            const newAngle = currentAngle + turn;
            this.dx = Math.cos(newAngle);
            this.dy = Math.sin(newAngle);
        }
    }

    findTarget() {
        let minDist = 500;
        this.target = null;
        const enemies = SkillProjectile.enemies;
        const bosses = SkillProjectile.bosses;
        
        enemies.forEach(e => {
            if (!e.markedForDeletion && !this.hitList.includes(e)) {
                const dist = Math.sqrt((e.x - this.x) ** 2 + (e.y - this.y) ** 2);
                if (dist < minDist) { minDist = dist; this.target = e; }
            }
        });
        
        bosses.forEach(boss => {
            if (!boss.markedForDeletion && !this.hitList.includes(boss)) {
                const dist = Math.sqrt((boss.x - this.x) ** 2 + (boss.y - this.y) ** 2);
                if (dist < minDist) { minDist = dist; this.target = boss; }
            }
        });
    }

    getFinalDamage() {
        let dmg = this.damage;
        if (this.rampingDamage) {
            dmg *= (1 + this.rampingBonus);
        }
        if (Math.random() < this.critChance) {
            dmg *= 2;
            Events.emit(EVENT.PARTICLES, { x: this.x, y: this.y, color: '#ffff00', count: 5 });
        }
        return dmg;
    }

    onHit(enemy) {
        // 能量虹吸
        if (this.caster && this.caster.energyOnHit > 0 && this.caster.weapon) {
            this.caster.weapon.energy = Math.min(
                this.caster.weapon.maxEnergy,
                this.caster.weapon.energy + this.caster.energyOnHit
            );
        }
        
        // 连锁攻击
        if (this.chainCount > 0) this.chainToNext(enemy);
        
        // 弹射
        if (this.bounceCount > 0) this.bounceToEnemy(enemy);
        
        // 分裂效果（命中时）
        if (this.splitOnHit && this.splitAmount > 0) {
            this.spawnSplitProjectiles();
            Events.emit(EVENT.PARTICLES, { x: enemy.x, y: enemy.y, color: '#ffaaff', count: 5 });
        }
        
        // 灼烧效果
        if (this.burning && this.burnDamage > 0) {
            enemy.addBurn(this.burnDamage, 180);
            Events.emit(EVENT.PARTICLES, { x: enemy.x, y: enemy.y, color: '#ff6600', count: 3 });
        }
        
        // 雷霆效果 - 必定触发
        if (this.lightning) {
            this.spawnLightning(enemy);
        }
        
        // 中毒效果
        if (this.poison && this.poisonStacks > 0) {
            enemy.addPoison(this.poisonStacks);
            Events.emit(EVENT.PARTICLES, { x: enemy.x, y: enemy.y, color: '#00ff00', count: 3 });
        }
        
        // 护盾效果
        if (this.shieldOnHit && this.shieldAmount > 0) {
            const maxShield = this.caster.maxHp * 0.5;
            this.caster.shield = Math.min((this.caster.shield || 0) + this.shieldAmount, maxShield);
            Events.emit(EVENT.FLOATING_TEXT, {
                text: '+🛡️',
                x: this.caster.x, y: this.caster.y - 20,
                color: '#66ccff'
            });
        }
        
        // 牵引效果
        if (this.pull && this.pullRange > 0) {
            this.pullNearbyEnemies(enemy);
        }
        
        // 光之柱
        if (this.lightPillar && this.pillarDamage > 0) {
            Events.emit(EVENT.SKILL_CAST, {
                type: 'lightPillar',
                x: enemy.x,
                y: enemy.y,
                damage: this.pillarDamage,
                life: 60,
                radius: 40
            });
        }
        
        // 悬停效果
        if (this.hover && this.hoverDuration > 0 && !this.isHovering) {
            this.isHovering = true;
            this.hoverTimer = this.hoverDuration;
            this.speed = 0;
        }
        
        // 冰霜减速效果
        if (this.frostSlow > 0 && enemy.addSlow) {
            enemy.addSlow(this.frostSlow, 120); // 减速2秒
            Events.emit(EVENT.PARTICLES, { x: enemy.x, y: enemy.y, color: '#00ffff', count: 3 });
        }
        
        // 反弹效果
        if (this.reflect && this.reflectCount > 0) {
            this.dx = -this.dx + (Math.random() - 0.5) * 0.5;
            this.dy = -this.dy + (Math.random() - 0.5) * 0.5;
            const len = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
            this.dx /= len;
            this.dy /= len;
            this.reflectCount--;
            this.damage *= this.reflectDamageDecay;
            this.duration += 30;
            this.penetrate++;
            Events.emit(EVENT.PARTICLES, { x: this.x, y: this.y, color: '#aaaaff', count: 5 });
        }
    }

    onKill(enemy) {
        if (this.explosiveOnKill && this.explosionRadius > 0) {
            const oldX = this.x;
            const oldY = this.y;
            this.x = enemy.x;
            this.y = enemy.y;
            this.explode();
            this.x = oldX;
            this.y = oldY;
        }
    }

    spawnLightning(enemy) {
        const enemies = SkillProjectile.enemies;
        const lightningDamage = this.damage * (this.lightningDamageMult || 0.5);
        
        Events.emit(EVENT.SKILL_CAST, {
            type: 'lightning',
            x1: enemy.x, y1: enemy.y - 200,
            x2: enemy.x, y2: enemy.y,
            life: 25, color: '#ffdd00'
        });
        
        enemies.forEach(e => {
            if (!e.markedForDeletion) {
                const dist = Math.sqrt((e.x - enemy.x) ** 2 + (e.y - enemy.y) ** 2);
                if (dist < 60) {
                    e.takeDamage(lightningDamage, 0, 0);
                }
            }
        });
        
        Events.emit(EVENT.PARTICLES, { x: enemy.x, y: enemy.y, color: '#ffdd00', count: 12 });
        Events.emit(EVENT.PARTICLES, { x: enemy.x, y: enemy.y, color: '#ffffff', count: 5 });
    }

    pullNearbyEnemies(enemy) {
        const enemies = SkillProjectile.enemies;
        
        enemies.forEach(e => {
            if (!e.markedForDeletion && e !== enemy) {
                const dx = enemy.x - e.x;
                const dy = enemy.y - e.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < this.pullRange && dist > 10) {
                    const pullForce = this.pullStrength / dist * 10;
                    e.x += dx / dist * pullForce;
                    e.y += dy / dist * pullForce;
                    
                    Events.emit(EVENT.SKILL_CAST, {
                        type: 'distort',
                        x: e.x, y: e.y,
                        targetX: enemy.x, targetY: enemy.y,
                        life: 15
                    });
                }
            }
        });
        Events.emit(EVENT.PARTICLES, { x: enemy.x, y: enemy.y, color: '#9966ff', count: 8 });
    }

    spawnSplitProjectiles() {
        for (let i = 0; i < this.splitAmount; i++) {
            const angle = (Math.PI * 2 / this.splitAmount) * i;
            const proj = new SplitProjectile(this, angle, this.splitDamageMult);
            Events.emit(EVENT.PROJECTILE_FIRE, { projectile: proj });
        }
    }

    explode() {
        const x = this.x;
        const y = this.y;
        const radius = this.explosionRadius;
        const enemies = SkillProjectile.enemies;
        const bosses = SkillProjectile.bosses;
        
        enemies.forEach(e => {
            if (!e.markedForDeletion) {
                const dist = Math.sqrt((e.x - x) ** 2 + (e.y - y) ** 2);
                if (dist < radius) {
                    const dmgMult = 1 - dist / radius * 0.5;
                    e.takeDamage(this.damage * 0.5 * dmgMult, (e.x - x) / dist * 3, (e.y - y) / dist * 3);
                }
            }
        });
        
        bosses.forEach(boss => {
            if (!boss.markedForDeletion) {
                const dist = Math.sqrt((boss.x - x) ** 2 + (boss.y - y) ** 2);
                if (dist < radius) {
                    const dmgMult = 1 - dist / radius * 0.5;
                    boss.takeDamage(this.damage * 0.5 * dmgMult, 0, 0);
                }
            }
        });
        
        Events.emit(EVENT.SKILL_CAST, {
            type: 'explosion',
            x: x, y: y,
            radius: radius,
            life: 30, maxLife: 30
        });
        
        Events.emit(EVENT.PARTICLES, {
            x: x, y: y,
            count: 20,
            color: '#ff6600',
            altColor: '#ffaa00',
            spread: 4, size: 6
        });
        
        Events.emit(EVENT.PARTICLES, {
            x: x, y: y,
            count: 15,
            color: '#444444',
            spread: 1.5, size: 10,
            vy: -3
        });
        
        Events.emit(EVENT.SCREEN_SHAKE, { intensity: 8, duration: 12 });
    }

    chainToNext(fromEnemy) {
        const enemies = SkillProjectile.enemies;
        let nextTarget = null, minDist = 200;
        
        enemies.forEach(e => {
            if (!e.markedForDeletion && e !== fromEnemy && !this.hitList.includes(e)) {
                const dist = Math.sqrt((e.x - fromEnemy.x) ** 2 + (e.y - fromEnemy.y) ** 2);
                if (dist < minDist) { minDist = dist; nextTarget = e; }
            }
        });
        
        if (nextTarget) {
            Events.emit(EVENT.SKILL_CAST, {
                type: 'lightning',
                x1: fromEnemy.x, y1: fromEnemy.y,
                x2: nextTarget.x, y2: nextTarget.y,
                life: 15, color: '#ffdd00'
            });
            nextTarget.takeDamage(this.damage * 0.7, 0, 0);
            this.hitList.push(nextTarget);
            this.chainCount--;
            if (this.chainCount > 0) setTimeout(() => this.chainToNext(nextTarget), 50);
        }
    }

    bounceToEnemy(fromEnemy) {
        const enemies = SkillProjectile.enemies || [];
        const bosses = SkillProjectile.bosses || [];
        const candidates = [];
        
        // 收集范围内的敌人
        enemies.forEach(e => {
            if (!e.markedForDeletion && e !== fromEnemy && !this.hitList.includes(e)) {
                const dist = Math.sqrt((e.x - this.x) ** 2 + (e.y - this.y) ** 2);
                if (dist < this.bounceRange) {
                    candidates.push(e);
                }
            }
        });
        
        // 也检查Boss
        bosses.forEach(b => {
            if (!b.markedForDeletion && b !== fromEnemy && !this.hitList.includes(b)) {
                const dist = Math.sqrt((b.x - this.x) ** 2 + (b.y - this.y) ** 2);
                if (dist < this.bounceRange) {
                    candidates.push(b);
                }
            }
        });
        
        if (candidates.length > 0) {
            // 随机选择一个敌人
            const nextTarget = candidates[Math.floor(Math.random() * candidates.length)];
            const dx = nextTarget.x - this.x;
            const dy = nextTarget.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // 设置新方向朝向目标
            this.dx = dx / dist;
            this.dy = dy / dist;
            this.bounceCount--;
            this.penetrate++;
            
            // 弹射特效
            Events.emit(EVENT.PARTICLES, {
                x: this.x, y: this.y,
                count: 3,
                color: '#ffaa00',
                spread: 3
            });
        } else {
            // 没有找到目标，消耗弹射次数但不改变方向
            this.bounceCount--;
        }
    }

    draw(ctx, camX, camY) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x - camX, this.y - camY, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        if (this.isHovering) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x - camX, this.y - camY, this.radius + 10, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }
}


// 分裂小弹
class SplitProjectile extends SkillProjectile {
    constructor(parent, angle, damageMult = 0.3) {
        const mods = {
            angle: angle,
            damage: (parent.baseDamage || parent.damage) * damageMult / 10,
            speed: parent.speed * 0.8,
            penetrate: parent.penetrate,
            homing: parent.homing,
            turnSpeed: parent.turnSpeed,
            bounceCount: parent.bounceCount,
            chainCount: parent.chainCount,
            reflect: parent.reflect,
            reflectCount: parent.reflectCount,
            reflectDamageDecay: parent.reflectDamageDecay,
            splitOnHit: false,
            splitOnDeath: false,
            splitAmount: 0
        };
        
        super({ x: parent.x, y: parent.y }, mods);
        
        this.damage = (parent.baseDamage || parent.damage) * damageMult;
        this.speed = parent.speed * 0.8;
        this.radius = Math.max(2, parent.radius * 0.5);
        this.color = parent.color || '#fff';
        this.duration = 45;
        this.penetrate = parent.penetrate;
        this.scale = 0.5;
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX, y = this.y - camY;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(this.scale, this.scale);
        ctx.translate(-x, -y);
        
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 6;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x, y, this.radius / this.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, this.radius * 0.4 / this.scale, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}
