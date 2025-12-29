// --- 主武器系统 (单一武器 + 效果卡牌) ---

// 主武器类 - 玩家唯一的武器，通过卡牌解锁不同效果
class MainWeapon {
    constructor(player) {
        this.player = player;
        this.baseCooldown = 12;
        this.timer = 0;
        
        // 效果开关和等级（通过卡牌解锁/升级）
        this.effects = {
            spread: { unlocked: false, level: 0 },      // 散射
            lightning: { unlocked: false, level: 0 },   // 闪电链
            missile: { unlocked: false, level: 0 },     // 追踪导弹
            laser: { unlocked: false, level: 0 },       // 激光束
            shield: { unlocked: false, level: 0 },      // 护盾
            plasma: { unlocked: false, level: 0 },      // 等离子
            wingman: { unlocked: false, level: 0 }      // 僚机
        };
        
        // 护盾相关
        this.shieldAngle = 0;
        
        // 激光相关
        this.laserActive = false;
        this.laserWidth = 20;
        
        // 僚机位置
        this.wingOffset = 50;
        
        // 各效果独立计时器
        this.timers = {
            missile: 0,
            lightning: 0,
            plasma: 0
        };
    }
    
    // 解锁或升级效果
    unlockEffect(effectId) {
        if (this.effects[effectId]) {
            if (!this.effects[effectId].unlocked) {
                this.effects[effectId].unlocked = true;
                this.effects[effectId].level = 1;
            } else {
                this.effects[effectId].level++;
            }
        }
    }
    
    getStats() {
        return {
            dmg: this.player.damageMult,
            area: this.player.areaMult,
            speed: this.player.projSpeed,
            duration: this.player.durationMult,
            kb: this.player.knockback,
            amount: this.player.amount
        };
    }
    
    update() {
        const stats = this.getStats();
        
        // 主射击计时
        if (this.timer > 0) {
            this.timer--;
        } else {
            this.fireBasic(stats);
            this.timer = this.baseCooldown * this.player.cooldownMult;
        }
        
        // 各效果更新
        this.updateSpread(stats);
        this.updateLightning(stats);
        this.updateMissile(stats);
        this.updateLaser(stats);
        this.updateShield(stats);
        this.updatePlasma(stats);
        this.updateWingman(stats);
    }
    
    // ========== 基础射击 ==========
    fireBasic(stats) {
        const count = 1 + stats.amount;
        const spacing = 15;
        const startX = -(count - 1) * spacing / 2;
        
        for (let i = 0; i < count; i++) {
            const offsetX = startX + i * spacing;
            const p = new Projectile(
                this.player.x + offsetX, 
                this.player.y - 15,
                0, -1,
                14 * stats.speed,
                80,
                12 * stats.dmg,
                2 * stats.kb,
                6, '#00ffff', 1
            );
            p.projectileType = 'laser';
            Game.projectiles.push(p);
        }
    }
    
    // ========== 散射效果 ==========
    updateSpread(stats) {
        if (!this.effects.spread.unlocked) return;
        
        // 散射跟随主射击一起发射
        if (this.timer === 0) {
            const level = this.effects.spread.level;
            const count = 2 + level; // 2-5发散射
            const spreadAngle = Math.PI / 5; // 36度扇形
            
            for (let i = 0; i < count; i++) {
                const angle = -Math.PI / 2 + (i - (count - 1) / 2) * (spreadAngle / (count - 1 || 1));
                const dx = Math.cos(angle);
                const dy = Math.sin(angle);
                
                const p = new Projectile(
                    this.player.x, 
                    this.player.y - 10,
                    dx, dy,
                    10 * stats.speed,
                    50,
                    6 * stats.dmg * (1 + level * 0.1),
                    1.5 * stats.kb,
                    4, '#ffff00', 1
                );
                p.projectileType = 'spread';
                Game.projectiles.push(p);
            }
        }
    }
    
    // ========== 闪电链效果 ==========
    updateLightning(stats) {
        if (!this.effects.lightning.unlocked) return;
        
        this.timers.lightning--;
        if (this.timers.lightning > 0) return;
        
        const level = this.effects.lightning.level;
        this.timers.lightning = Math.max(20, 35 - level * 3);
        
        const chainCount = 2 + level;
        
        // 找前方最近敌人
        let target = null;
        let minDist = 600;
        
        Game.enemies.forEach(e => {
            if (e.y < this.player.y) {
                const dist = Math.sqrt((e.x - this.player.x) ** 2 + (e.y - this.player.y) ** 2);
                if (dist < minDist) {
                    minDist = dist;
                    target = e;
                }
            }
        });
        
        if (target) {
            this.chainLightning(this.player.x, this.player.y - 10, target, chainCount, stats, []);
        }
    }
    
    chainLightning(fromX, fromY, target, remaining, stats, hitList) {
        if (!target || remaining <= 0) return;
        
        Game.lightningEffects = Game.lightningEffects || [];
        Game.lightningEffects.push({
            x1: fromX, y1: fromY,
            x2: target.x, y2: target.y,
            life: 15
        });
        
        const level = this.effects.lightning.level;
        const damage = 18 * stats.dmg * (1 + level * 0.15);
        target.takeDamage(damage, 0, 0);
        hitList.push(target);
        
        // 找下一个目标
        let nextTarget = null;
        let minDist = 180 + level * 20;
        
        Game.enemies.forEach(e => {
            if (!hitList.includes(e) && !e.markedForDeletion) {
                const dist = Math.sqrt((e.x - target.x) ** 2 + (e.y - target.y) ** 2);
                if (dist < minDist) {
                    minDist = dist;
                    nextTarget = e;
                }
            }
        });
        
        if (nextTarget) {
            setTimeout(() => {
                this.chainLightning(target.x, target.y, nextTarget, remaining - 1, stats, hitList);
            }, 50);
        }
    }
    
    // ========== 追踪导弹效果 ==========
    updateMissile(stats) {
        if (!this.effects.missile.unlocked) return;
        
        this.timers.missile--;
        if (this.timers.missile > 0) return;
        
        const level = this.effects.missile.level;
        this.timers.missile = Math.max(30, 50 - level * 5);
        
        const count = Math.ceil(level / 2);
        
        for (let i = 0; i < count; i++) {
            const offsetX = (i - (count - 1) / 2) * 20;
            const p = new MissileProjectile(
                this.player.x + offsetX, 
                this.player.y - 10,
                22 * stats.dmg * (1 + level * 0.1),
                3 * stats.kb,
                stats.speed
            );
            Game.projectiles.push(p);
        }
    }
    
    // ========== 激光束效果 ==========
    updateLaser(stats) {
        if (!this.effects.laser.unlocked) {
            this.laserActive = false;
            return;
        }
        
        const level = this.effects.laser.level;
        this.laserWidth = 15 + level * 8;
        this.laserActive = true;
        
        const beamX = this.player.x;
        const beamTop = 0;
        const beamBottom = this.player.y - 20;
        
        // 检测激光范围内敌人
        Game.enemies.forEach(e => {
            if (e.y < beamBottom && e.y > beamTop) {
                if (Math.abs(e.x - beamX) < (this.laserWidth / 2 + e.radius)) {
                    e.takeDamage(0.4 * stats.dmg * (1 + level * 0.2), 0, 0);
                }
            }
        });
        
        this.laserX = beamX;
        this.laserTop = beamTop;
        this.laserBottom = beamBottom;
    }
    
    // ========== 护盾效果 ==========
    updateShield(stats) {
        if (!this.effects.shield.unlocked) return;
        
        const level = this.effects.shield.level;
        const radius = (50 + level * 10) * stats.area;
        this.shieldAngle += 0.08;
        this.shieldRadius = radius;
        
        // 检测护盾范围内敌人
        Game.enemies.forEach(e => {
            const dist = Math.sqrt((e.x - this.player.x) ** 2 + (e.y - this.player.y) ** 2);
            if (dist < radius + e.radius) {
                const kx = (e.x - this.player.x) / dist * stats.kb * 2;
                const ky = (e.y - this.player.y) / dist * stats.kb * 2;
                e.takeDamage(4 * stats.dmg * (1 + level * 0.15), kx, ky);
            }
        });
    }
    
    // ========== 等离子炮效果 ==========
    updatePlasma(stats) {
        if (!this.effects.plasma.unlocked) return;
        
        this.timers.plasma--;
        if (this.timers.plasma > 0) return;
        
        const level = this.effects.plasma.level;
        this.timers.plasma = Math.max(35, 55 - level * 5);
        
        const p = new PlasmaProjectile(
            this.player.x, 
            this.player.y - 15,
            0, -1,
            7 * stats.speed,
            120,
            30 * stats.dmg * (1 + level * 0.15),
            5 * stats.kb,
            16 + level * 4
        );
        Game.projectiles.push(p);
    }
    
    // ========== 僚机效果 ==========
    updateWingman(stats) {
        if (!this.effects.wingman.unlocked) return;
        
        // 僚机跟随主射击
        if (this.timer === 0) {
            const level = this.effects.wingman.level;
            const wingCount = Math.ceil(level / 2);
            
            for (let w = 0; w < wingCount; w++) {
                const offset = this.wingOffset + w * 25;
                
                // 左僚机
                const pLeft = new Projectile(
                    this.player.x - offset, 
                    this.player.y - 5,
                    0, -1,
                    12 * stats.speed,
                    70,
                    7 * stats.dmg * (1 + level * 0.1),
                    1 * stats.kb,
                    4, '#ff6600', 1
                );
                pLeft.projectileType = 'wingman';
                Game.projectiles.push(pLeft);
                
                // 右僚机
                const pRight = new Projectile(
                    this.player.x + offset, 
                    this.player.y - 5,
                    0, -1,
                    12 * stats.speed,
                    70,
                    7 * stats.dmg * (1 + level * 0.1),
                    1 * stats.kb,
                    4, '#ff6600', 1
                );
                pRight.projectileType = 'wingman';
                Game.projectiles.push(pRight);
            }
        }
    }
}

// ========== 特殊投射物类 ==========

// 导弹 - 追踪敌人
class MissileProjectile extends Projectile {
    constructor(x, y, damage, knockback, speedMult) {
        super(x, y, 0, -1, 6, 180, damage, knockback, 8, '#ff4400', 1);
        this.projectileType = 'missile';
        this.speedMult = speedMult;
        this.target = null;
        this.turnSpeed = 0.08;
        this.trailParticles = [];
    }
    
    update() {
        // 寻找目标
        if (!this.target || this.target.markedForDeletion) {
            let minDist = 400;
            Game.enemies.forEach(e => {
                const dist = Math.sqrt((e.x - this.x) ** 2 + (e.y - this.y) ** 2);
                if (dist < minDist) {
                    minDist = dist;
                    this.target = e;
                }
            });
        }
        
        // 追踪
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
        
        // 尾焰
        this.trailParticles.push({ x: this.x, y: this.y + 5, life: 10 });
        this.trailParticles = this.trailParticles.filter(p => p.life-- > 0);
        
        this.x += this.dx * this.speed * this.speedMult;
        this.y += this.dy * this.speed * this.speedMult;
        this.duration--;
        
        if (this.duration <= 0 || this.y < -50 || this.y > CONFIG.GAME_HEIGHT + 50) {
            this.markedForDeletion = true;
        }
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        
        ctx.save();
        
        // 尾焰
        this.trailParticles.forEach(p => {
            const alpha = p.life / 10;
            ctx.fillStyle = `rgba(255, 100, 0, ${alpha})`;
            ctx.beginPath();
            ctx.arc(p.x - camX, p.y - camY, 4 * alpha, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // 导弹本体
        const angle = Math.atan2(this.dy, this.dx);
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI / 2);
        
        ctx.fillStyle = '#888888';
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(-5, 8);
        ctx.lineTo(5, 8);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#ff4400';
        ctx.beginPath();
        ctx.arc(0, -8, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// 等离子 - 大型穿透
class PlasmaProjectile extends Projectile {
    constructor(x, y, dx, dy, speed, duration, damage, knockback, size) {
        super(x, y, dx, dy, speed, duration, damage, knockback, size, '#ff00ff', 999);
        this.projectileType = 'plasma';
        this.pulsePhase = 0;
    }
    
    update() {
        super.update();
        this.pulsePhase += 0.2;
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        const pulse = Math.sin(this.pulsePhase) * 3;
        
        ctx.save();
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, this.radius + 15 + pulse);
        gradient.addColorStop(0, 'rgba(255, 0, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 100, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 0, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, this.radius + 15 + pulse, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ff88ff';
        ctx.beginPath();
        ctx.arc(x, y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, this.radius - 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}
