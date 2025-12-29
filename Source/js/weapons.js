// --- 武器类 (雷霆战机风格 - 向前方攻击) ---

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

// ========== 基础武器 ==========

// 直线射击 - 基础主武器，向前方发射子弹
class WeaponBasicShot extends Weapon {
    constructor(player) { 
        super(player, 'basicshot', 12); 
    }
    
    fire() {
        const stats = this.getStats();
        const count = 1 + stats.amount;
        
        // 多发子弹时左右分布
        const spacing = 15;
        const startX = -(count - 1) * spacing / 2;
        
        for (let i = 0; i < count; i++) {
            const offsetX = startX + i * spacing;
            const p = new Projectile(
                this.player.x + offsetX, 
                this.player.y - 15,
                0, -1,  // 固定向上
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
}

// 散射攻击 - 扇形发射多发子弹
class WeaponSpread extends Weapon {
    constructor(player) { 
        super(player, 'spread', 20); 
    }
    
    fire() {
        const stats = this.getStats();
        const baseCount = 3 + Math.floor(this.level / 2);
        const count = baseCount + stats.amount;
        const spreadAngle = Math.PI / 4; // 45度扇形
        
        for (let i = 0; i < count; i++) {
            const angle = -Math.PI / 2 + (i - (count - 1) / 2) * (spreadAngle / (count - 1 || 1));
            const dx = Math.cos(angle);
            const dy = Math.sin(angle);
            
            const p = new Projectile(
                this.player.x, 
                this.player.y - 10,
                dx, dy,
                12 * stats.speed,
                60,
                8 * stats.dmg,
                2 * stats.kb,
                5, '#ffff00', 1
            );
            p.projectileType = 'spread';
            Game.projectiles.push(p);
        }
    }
}

// 闪电链 - 攻击敌人后会跳跃到附近敌人
class WeaponLightning extends Weapon {
    constructor(player) { 
        super(player, 'lightning', 35); 
    }
    
    fire() {
        const stats = this.getStats();
        const chainCount = 3 + Math.floor(this.level / 2); // 跳跃次数
        
        // 找到前方最近的敌人
        let target = null;
        let minDist = 600;
        
        Game.enemies.forEach(e => {
            if (e.y < this.player.y) { // 只攻击前方敌人
                const dist = Math.sqrt((e.x - this.player.x) ** 2 + (e.y - this.player.y) ** 2);
                if (dist < minDist) {
                    minDist = dist;
                    target = e;
                }
            }
        });
        
        if (target) {
            this.chainLightning(this.player.x, this.player.y - 10, target, chainCount, stats, []);
        } else {
            // 没有目标时向前发射闪电
            const p = new LightningProjectile(
                this.player.x, this.player.y - 10,
                0, -1,
                18 * stats.speed,
                40,
                15 * stats.dmg,
                1 * stats.kb
            );
            Game.projectiles.push(p);
        }
    }
    
    chainLightning(fromX, fromY, target, remainingChains, stats, hitList) {
        if (!target || remainingChains <= 0) return;
        
        // 创建闪电效果
        Game.lightningEffects = Game.lightningEffects || [];
        Game.lightningEffects.push({
            x1: fromX, y1: fromY,
            x2: target.x, y2: target.y,
            life: 15
        });
        
        // 造成伤害
        const damage = 20 * stats.dmg * (1 - (3 - remainingChains) * 0.15); // 每次跳跃伤害递减
        target.takeDamage(damage, 0, 0);
        hitList.push(target);
        
        // 寻找下一个目标
        let nextTarget = null;
        let minDist = 200; // 跳跃范围
        
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
                this.chainLightning(target.x, target.y, nextTarget, remainingChains - 1, stats, hitList);
            }, 50);
        }
    }
}

// 导弹 - 追踪敌人的导弹
class WeaponMissile extends Weapon {
    constructor(player) { 
        super(player, 'missile', 45); 
    }
    
    fire() {
        const stats = this.getStats();
        const count = 1 + Math.floor(stats.amount / 2);
        
        for (let i = 0; i < count; i++) {
            const offsetX = (i - (count - 1) / 2) * 20;
            const p = new MissileProjectile(
                this.player.x + offsetX, 
                this.player.y - 10,
                25 * stats.dmg,
                3 * stats.kb,
                stats.speed
            );
            Game.projectiles.push(p);
        }
    }
}

// 激光束 - 持续伤害的激光
class WeaponLaserBeam extends Weapon {
    constructor(player) { 
        super(player, 'laserbeam', 1); // 每帧更新
        this.isActive = false;
        this.beamWidth = 20;
    }
    
    fire() {
        const stats = this.getStats();
        this.beamWidth = 20 + this.level * 5;
        
        // 激光束从玩家位置向上延伸到屏幕顶部
        const beamX = this.player.x;
        const beamTop = 0;
        const beamBottom = this.player.y - 20;
        
        // 检测激光范围内的敌人
        Game.enemies.forEach(e => {
            if (e.y < beamBottom && e.y > beamTop) {
                if (Math.abs(e.x - beamX) < (this.beamWidth / 2 + e.radius)) {
                    // 每帧造成少量伤害
                    e.takeDamage(0.5 * stats.dmg, 0, 0);
                }
            }
        });
        
        // 存储激光状态用于绘制
        this.isActive = true;
        this.beamX = beamX;
        this.beamTop = beamTop;
        this.beamBottom = beamBottom;
    }
}

// 护盾 - 环绕玩家的防护罩，接触敌人造成伤害
class WeaponShield extends Weapon {
    constructor(player) { 
        super(player, 'shield', 8); 
        this.shieldAngle = 0;
    }
    
    fire() {
        const stats = this.getStats();
        const radius = 60 * stats.area;
        this.shieldAngle += 0.1;
        
        // 检测护盾范围内的敌人
        Game.enemies.forEach(e => {
            const dist = Math.sqrt((e.x - this.player.x) ** 2 + (e.y - this.player.y) ** 2);
            if (dist < radius + e.radius) {
                const kx = (e.x - this.player.x) / dist * stats.kb * 2;
                const ky = (e.y - this.player.y) / dist * stats.kb * 2;
                e.takeDamage(5 * stats.dmg, kx, ky);
            }
        });
    }
}

// 等离子炮 - 发射大型能量球，穿透敌人
class WeaponPlasma extends Weapon {
    constructor(player) { 
        super(player, 'plasma', 50); 
    }
    
    fire() {
        const stats = this.getStats();
        
        const p = new PlasmaProjectile(
            this.player.x, 
            this.player.y - 15,
            0, -1,
            8 * stats.speed,
            120,
            35 * stats.dmg,
            5 * stats.kb,
            20 * stats.area
        );
        Game.projectiles.push(p);
    }
}

// 侧翼机 - 两侧的僚机同时开火
class WeaponWingman extends Weapon {
    constructor(player) { 
        super(player, 'wingman', 15); 
        this.wingOffset = 50;
    }
    
    fire() {
        const stats = this.getStats();
        const wingCount = 1 + Math.floor(this.level / 3);
        
        for (let w = 0; w < wingCount; w++) {
            const offset = this.wingOffset + w * 30;
            
            // 左侧僚机
            const pLeft = new Projectile(
                this.player.x - offset, 
                this.player.y - 5,
                0, -1,
                12 * stats.speed,
                70,
                8 * stats.dmg,
                1 * stats.kb,
                4, '#ff6600', 1
            );
            pLeft.projectileType = 'wingman';
            Game.projectiles.push(pLeft);
            
            // 右侧僚机
            const pRight = new Projectile(
                this.player.x + offset, 
                this.player.y - 5,
                0, -1,
                12 * stats.speed,
                70,
                8 * stats.dmg,
                1 * stats.kb,
                4, '#ff6600', 1
            );
            pRight.projectileType = 'wingman';
            Game.projectiles.push(pRight);
        }
    }
}

// ========== 特殊投射物类 ==========

// 闪电投射物
class LightningProjectile extends Projectile {
    constructor(x, y, dx, dy, speed, duration, damage, knockback) {
        super(x, y, dx, dy, speed, duration, damage, knockback, 8, '#00ffff', 3);
        this.projectileType = 'lightning';
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        
        ctx.save();
        
        // 闪电光晕
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
        gradient.addColorStop(0, 'rgba(100, 200, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(100, 200, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(100, 200, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // 闪电核心
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// 导弹投射物 - 追踪敌人
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
        
        // 追踪目标
        if (this.target && !this.target.markedForDeletion) {
            const targetAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
            const currentAngle = Math.atan2(this.dy, this.dx);
            let angleDiff = targetAngle - currentAngle;
            
            // 归一化角度差
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            
            const turn = Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), this.turnSpeed);
            const newAngle = currentAngle + turn;
            
            this.dx = Math.cos(newAngle);
            this.dy = Math.sin(newAngle);
        }
        
        // 添加尾焰粒子
        this.trailParticles.push({
            x: this.x,
            y: this.y + 5,
            life: 10
        });
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
        
        // 导弹身体
        ctx.fillStyle = '#888888';
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(-5, 8);
        ctx.lineTo(5, 8);
        ctx.closePath();
        ctx.fill();
        
        // 导弹头部
        ctx.fillStyle = '#ff4400';
        ctx.beginPath();
        ctx.arc(0, -8, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// 等离子投射物 - 大型穿透能量球
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
        
        // 外层光晕
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, this.radius + 15 + pulse);
        gradient.addColorStop(0, 'rgba(255, 0, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 100, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 0, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, this.radius + 15 + pulse, 0, Math.PI * 2);
        ctx.fill();
        
        // 核心
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, this.radius - 5, 0, Math.PI * 2);
        ctx.fill();
        
        // 中层
        ctx.fillStyle = '#ff88ff';
        ctx.beginPath();
        ctx.arc(x, y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}
