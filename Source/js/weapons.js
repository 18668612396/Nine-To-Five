// --- 魔法工艺风格组合技能系统 ---

// ========== 技能定义 ==========

// 主动技能 - 产生投射物
const ACTIVE_SKILLS = {
    fireball: {
        id: 'fireball',
        name: '火球',
        type: 'active',
        icon: '🔥',
        cooldown: 25,
        manaCost: 5,
        create: (caster, mods) => new FireballProjectile(caster, mods)
    },
    laser: {
        id: 'laser',
        name: '激光',
        type: 'active',
        icon: '⚡',
        cooldown: 15,
        manaCost: 3,
        create: (caster, mods) => new LaserProjectile(caster, mods)
    },
    missile: {
        id: 'missile',
        name: '导弹',
        type: 'active',
        icon: '🚀',
        cooldown: 40,
        manaCost: 8,
        create: (caster, mods) => new MissileProjectile(caster, mods)
    },
    spark: {
        id: 'spark',
        name: '电火花',
        type: 'active',
        icon: '✨',
        cooldown: 8,
        manaCost: 2,
        create: (caster, mods) => new SparkProjectile(caster, mods)
    },
    plasma: {
        id: 'plasma',
        name: '等离子',
        type: 'active',
        icon: '💠',
        cooldown: 50,
        manaCost: 12,
        create: (caster, mods) => new PlasmaProjectile(caster, mods)
    }
};

// 被动技能 - 修饰投射物
const PASSIVE_SKILLS = {
    split: {
        id: 'split',
        name: '分裂',
        type: 'passive',
        icon: '🔀',
        desc: '投射物分裂成3个',
        modify: (mods) => { mods.splitCount = (mods.splitCount || 1) * 3; mods.damage *= 0.5; }
    },
    homing: {
        id: 'homing',
        name: '追踪',
        type: 'passive',
        icon: '🎯',
        desc: '投射物追踪敌人',
        modify: (mods) => { mods.homing = true; mods.turnSpeed = (mods.turnSpeed || 0) + 0.05; }
    },
    pierce: {
        id: 'pierce',
        name: '穿透',
        type: 'passive',
        icon: '📍',
        desc: '穿透多个敌人',
        modify: (mods) => { mods.penetrate = (mods.penetrate || 1) + 3; }
    },
    chain: {
        id: 'chain',
        name: '连锁',
        type: 'passive',
        icon: '⛓️',
        desc: '命中后跳跃到附近敌人',
        modify: (mods) => { mods.chainCount = (mods.chainCount || 0) + 2; }
    },
    rapid: {
        id: 'rapid',
        name: '急速',
        type: 'passive',
        icon: '💨',
        desc: '减少冷却时间',
        modify: (mods) => { mods.cooldownMult = (mods.cooldownMult || 1) * 0.6; }
    },
    heavy: {
        id: 'heavy',
        name: '重击',
        type: 'passive',
        icon: '💪',
        desc: '伤害翻倍但速度减半',
        modify: (mods) => { mods.damage *= 2; mods.speed *= 0.5; }
    },
    explosive: {
        id: 'explosive',
        name: '爆炸',
        type: 'passive',
        icon: '💥',
        desc: '命中时产生爆炸',
        modify: (mods) => { mods.explosive = true; mods.explosionRadius = (mods.explosionRadius || 30) + 20; }
    },
    bounce: {
        id: 'bounce',
        name: '弹射',
        type: 'passive',
        icon: '🔄',
        desc: '碰到边界反弹',
        modify: (mods) => { mods.bounceCount = (mods.bounceCount || 0) + 2; }
    }
};

// 合并所有技能供掉落使用
const ALL_SKILLS = { ...ACTIVE_SKILLS, ...PASSIVE_SKILLS };

// ========== 法杖/技能槽系统 ==========

class Wand {
    constructor(player, slotCount = 8) {
        this.player = player;
        this.slots = new Array(slotCount).fill(null); // 技能槽
        this.slotCount = slotCount;
        this.currentIndex = 0; // 当前执行位置
        this.cooldownTimer = 0;
        this.baseCooldown = 5; // 基础施法间隔
        
        // 背包 - 存放未装备的技能
        this.inventory = [];
    }
    
    // 添加技能到背包
    addSkillToInventory(skillId) {
        const skill = ALL_SKILLS[skillId];
        if (!skill) return false;
        this.inventory.push({ ...skill });
        return true;
    }
    
    // 从背包装备技能到指定槽位
    equipSkill(inventoryIndex, slotIndex) {
        if (inventoryIndex < 0 || inventoryIndex >= this.inventory.length) return false;
        if (slotIndex < 0 || slotIndex >= this.slotCount) return false;
        
        const skill = this.inventory[inventoryIndex];
        
        // 如果槽位有技能，先放回背包
        if (this.slots[slotIndex] !== null) {
            this.inventory.push(this.slots[slotIndex]);
        }
        
        // 装备技能
        this.slots[slotIndex] = skill;
        this.inventory.splice(inventoryIndex, 1);
        return true;
    }
    
    // 从槽位卸下技能到背包
    unequipSkill(slotIndex) {
        if (slotIndex < 0 || slotIndex >= this.slotCount) return false;
        if (this.slots[slotIndex] === null) return false;
        
        this.inventory.push(this.slots[slotIndex]);
        this.slots[slotIndex] = null;
        return true;
    }
    
    // 交换两个槽位
    swapSlots(i, j) {
        if (i >= 0 && i < this.slotCount && j >= 0 && j < this.slotCount) {
            [this.slots[i], this.slots[j]] = [this.slots[j], this.slots[i]];
        }
    }
    
    // 添加技能（兼容旧接口，现在放入背包）
    addSkill(skillId) {
        return this.addSkillToInventory(skillId);
    }
    
    update() {
        if (this.cooldownTimer > 0) {
            this.cooldownTimer--;
            return;
        }
        
        // 从当前位置执行一次施法
        const result = this.castFromIndex(this.currentIndex);
        if (result.fired) {
            this.currentIndex = result.nextIndex;
            this.cooldownTimer = result.cooldown;
        } else {
            // 没有可用技能，重置到开头
            this.currentIndex = 0;
        }
    }
    
    // 从指定位置开始施法，返回 { fired, nextIndex, cooldown }
    castFromIndex(startIndex) {
        const mods = this.getDefaultMods();
        let index = startIndex;
        let loopCount = 0;
        
        // 从左到右扫描：收集被动，遇到主动就发射
        while (loopCount < this.slotCount) {
            const slot = this.slots[index];
            
            if (slot === null) {
                // 空槽，跳过
                index = (index + 1) % this.slotCount;
                loopCount++;
                continue;
            }
            
            if (slot.type === 'passive') {
                // 被动：累积修饰效果，继续往右
                slot.modify(mods);
                index = (index + 1) % this.slotCount;
                loopCount++;
            } else if (slot.type === 'active') {
                // 主动：用累积的被动发射，然后停止
                this.fireSkill(slot, mods);
                const cooldown = Math.max(this.baseCooldown, slot.cooldown * (mods.cooldownMult || 1));
                const nextIndex = (index + 1) % this.slotCount;
                return { fired: true, nextIndex, cooldown };
            }
        }
        
        // 遍历完没找到主动技能
        return { fired: false, nextIndex: 0, cooldown: this.baseCooldown };
    }
    
    getDefaultMods() {
        return {
            damage: 1.0 * this.player.damageMult,
            speed: 1.0 * this.player.projSpeed,
            penetrate: 1,
            splitCount: 1,
            homing: false,
            turnSpeed: 0,
            chainCount: 0,
            cooldownMult: this.player.cooldownMult,
            explosive: false,
            explosionRadius: 0,
            bounceCount: 0,
            knockback: this.player.knockback
        };
    }
    
    fireSkill(skill, mods) {
        const projectiles = [];
        const baseAngle = -Math.PI / 2; // 向上
        
        // 处理分裂
        const count = mods.splitCount || 1;
        const spreadAngle = count > 1 ? Math.PI / 6 : 0; // 分裂时扩散30度
        
        for (let i = 0; i < count; i++) {
            let angle = baseAngle;
            if (count > 1) {
                angle = baseAngle + (i - (count - 1) / 2) * (spreadAngle / (count - 1));
            }
            
            const proj = skill.create(this.player, { ...mods, angle });
            if (proj) {
                Game.projectiles.push(proj);
            }
        }
    }
}

// ========== 投射物基类 ==========

class SkillProjectile {
    constructor(caster, mods) {
        this.x = caster.x;
        this.y = caster.y - 15;
        this.angle = mods.angle || -Math.PI / 2;
        this.dx = Math.cos(this.angle);
        this.dy = Math.sin(this.angle);
        
        this.speed = 10 * (mods.speed || 1);
        this.damage = 10 * (mods.damage || 1);
        this.knockback = mods.knockback || 1;
        this.penetrate = mods.penetrate || 1;
        this.hitList = [];
        
        this.homing = mods.homing || false;
        this.turnSpeed = mods.turnSpeed || 0.05;
        this.target = null;
        
        this.chainCount = mods.chainCount || 0;
        this.explosive = mods.explosive || false;
        this.explosionRadius = mods.explosionRadius || 30;
        this.bounceCount = mods.bounceCount || 0;
        
        this.duration = 120;
        this.radius = 6;
        this.color = '#fff';
        this.markedForDeletion = false;
    }
    
    update() {
        // 追踪逻辑
        if (this.homing) {
            this.updateHoming();
        }
        
        // 移动
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;
        this.duration--;
        
        // 边界检测
        if (this.bounceCount > 0) {
            if (this.x < this.radius || this.x > CONFIG.GAME_WIDTH - this.radius) {
                this.dx = -this.dx;
                this.bounceCount--;
                this.x = Math.max(this.radius, Math.min(CONFIG.GAME_WIDTH - this.radius, this.x));
            }
            if (this.y < this.radius) {
                this.dy = -this.dy;
                this.bounceCount--;
                this.y = Math.max(this.radius, this.y);
            }
        } else {
            if (this.x < -50 || this.x > CONFIG.GAME_WIDTH + 50 || 
                this.y < -50 || this.y > CONFIG.GAME_HEIGHT + 50) {
                this.markedForDeletion = true;
            }
        }
        
        if (this.duration <= 0) {
            this.markedForDeletion = true;
        }
    }
    
    updateHoming() {
        if (!this.target || this.target.markedForDeletion) {
            this.findTarget();
        }
        
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
        let minDist = 400;
        this.target = null;
        Game.enemies.forEach(e => {
            if (!e.markedForDeletion && !this.hitList.includes(e)) {
                const dist = Math.sqrt((e.x - this.x) ** 2 + (e.y - this.y) ** 2);
                if (dist < minDist) {
                    minDist = dist;
                    this.target = e;
                }
            }
        });
    }
    
    onHit(enemy) {
        // 爆炸效果
        if (this.explosive) {
            this.explode();
        }
        
        // 连锁效果
        if (this.chainCount > 0) {
            this.chainToNext(enemy);
        }
    }
    
    explode() {
        Game.enemies.forEach(e => {
            if (!e.markedForDeletion) {
                const dist = Math.sqrt((e.x - this.x) ** 2 + (e.y - this.y) ** 2);
                if (dist < this.explosionRadius) {
                    const dmgMult = 1 - (dist / this.explosionRadius) * 0.5;
                    e.takeDamage(this.damage * 0.5 * dmgMult, 0, 0);
                }
            }
        });
        
        // 爆炸特效
        Game.spawnParticles(this.x, this.y, '#ff6600', 15);
        Game.spawnParticles(this.x, this.y, '#ffff00', 10);
    }
    
    chainToNext(fromEnemy) {
        let nextTarget = null;
        let minDist = 150;
        
        Game.enemies.forEach(e => {
            if (!e.markedForDeletion && e !== fromEnemy && !this.hitList.includes(e)) {
                const dist = Math.sqrt((e.x - fromEnemy.x) ** 2 + (e.y - fromEnemy.y) ** 2);
                if (dist < minDist) {
                    minDist = dist;
                    nextTarget = e;
                }
            }
        });
        
        if (nextTarget) {
            // 创建连锁闪电效果
            Game.lightningEffects.push({
                x1: fromEnemy.x, y1: fromEnemy.y,
                x2: nextTarget.x, y2: nextTarget.y,
                life: 15
            });
            
            nextTarget.takeDamage(this.damage * 0.7, 0, 0);
            this.hitList.push(nextTarget);
            this.chainCount--;
            
            if (this.chainCount > 0) {
                setTimeout(() => this.chainToNext(nextTarget), 50);
            }
        }
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x, y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}


// ========== 具体投射物类型 ==========

// 火球 - 中等伤害，带爆炸潜力
class FireballProjectile extends SkillProjectile {
    constructor(caster, mods) {
        super(caster, mods);
        this.damage = 15 * (mods.damage || 1);
        this.speed = 8 * (mods.speed || 1);
        this.radius = 8;
        this.color = '#ff6600';
        this.duration = 90;
        this.trailTimer = 0;
    }
    
    update() {
        super.update();
        // 火焰尾迹
        this.trailTimer++;
        if (this.trailTimer % 3 === 0) {
            Game.particles.push({
                x: this.x, y: this.y,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 15,
                color: Math.random() > 0.5 ? '#ff6600' : '#ffaa00',
                size: 3 + Math.random() * 3
            });
        }
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        
        ctx.save();
        // 光晕
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, this.radius * 2);
        gradient.addColorStop(0, 'rgba(255, 150, 0, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, this.radius * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 核心
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(x, y, this.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 激光 - 快速直线
class LaserProjectile extends SkillProjectile {
    constructor(caster, mods) {
        super(caster, mods);
        this.damage = 8 * (mods.damage || 1);
        this.speed = 18 * (mods.speed || 1);
        this.radius = 4;
        this.color = '#00ffff';
        this.duration = 60;
        this.length = 20;
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        const angle = Math.atan2(this.dy, this.dx);
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        
        // 光束
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(-this.length, -2, this.length * 2, 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-this.length + 2, -1, this.length * 2 - 4, 2);
        
        ctx.restore();
    }
}

// 导弹 - 慢速高伤害，自带追踪
class MissileProjectile extends SkillProjectile {
    constructor(caster, mods) {
        super(caster, mods);
        this.damage = 25 * (mods.damage || 1);
        this.speed = 5 * (mods.speed || 1);
        this.radius = 6;
        this.color = '#ff4400';
        this.duration = 180;
        this.homing = true; // 导弹默认追踪
        this.turnSpeed = Math.max(0.03, mods.turnSpeed || 0.03);
        this.trailParticles = [];
    }
    
    update() {
        super.update();
        // 尾焰
        this.trailParticles.push({ 
            x: this.x - this.dx * 10, 
            y: this.y - this.dy * 10, 
            life: 12 
        });
        this.trailParticles = this.trailParticles.filter(p => p.life-- > 0);
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        const angle = Math.atan2(this.dy, this.dx);
        
        ctx.save();
        
        // 尾焰
        this.trailParticles.forEach(p => {
            const alpha = p.life / 12;
            ctx.fillStyle = `rgba(255, 100, 0, ${alpha})`;
            ctx.beginPath();
            ctx.arc(p.x - camX, p.y - camY, 4 * alpha, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // 导弹本体
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI / 2);
        
        ctx.fillStyle = '#666666';
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(-5, 8);
        ctx.lineTo(5, 8);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#ff4400';
        ctx.beginPath();
        ctx.arc(0, -5, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// 电火花 - 快速低伤害
class SparkProjectile extends SkillProjectile {
    constructor(caster, mods) {
        super(caster, mods);
        this.damage = 5 * (mods.damage || 1);
        this.speed = 14 * (mods.speed || 1);
        this.radius = 3;
        this.color = '#ffff00';
        this.duration = 45;
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        
        ctx.save();
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(x, y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 等离子 - 大型穿透
class PlasmaProjectile extends SkillProjectile {
    constructor(caster, mods) {
        super(caster, mods);
        this.damage = 35 * (mods.damage || 1);
        this.speed = 6 * (mods.speed || 1);
        this.radius = 14;
        this.color = '#ff00ff';
        this.duration = 120;
        this.penetrate = Math.max(5, mods.penetrate || 5); // 等离子默认高穿透
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
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, this.radius + 10 + pulse);
        gradient.addColorStop(0, 'rgba(255, 100, 255, 0.9)');
        gradient.addColorStop(0.5, 'rgba(255, 0, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(200, 0, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, this.radius + 10 + pulse, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// ========== 技能掉落系统 ==========

class SkillDrop {
    constructor(x, y, skillId) {
        this.x = x;
        this.y = y;
        this.skillId = skillId;
        this.skill = ALL_SKILLS[skillId];
        this.radius = 12;
        this.floatOffset = Math.random() * Math.PI * 2;
        this.markedForDeletion = false;
        this.life = 600; // 10秒后消失
    }
    
    update(player) {
        this.y += Game.scrollSpeed * 0.5;
        this.life--;
        
        if (this.life <= 0 || this.y > CONFIG.GAME_HEIGHT + 50) {
            this.markedForDeletion = true;
            return;
        }
        
        // 检测玩家拾取
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < player.pickupRange) {
            // 吸引效果
            this.x += (dx / dist) * 6;
            this.y += (dy / dist) * 6;
            
            if (dist < player.radius + this.radius) {
                // 拾取到背包
                if (player.wand.addSkillToInventory(this.skillId)) {
                    Game.addFloatingText('+' + this.skill.name, this.x, this.y, '#00ff00');
                    this.markedForDeletion = true;
                }
            }
        }
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        const float = Math.sin(Game.frameCount * 0.08 + this.floatOffset) * 4;
        const flash = this.life < 120 ? (Math.sin(Game.frameCount * 0.3) > 0 ? 1 : 0.3) : 1;
        
        ctx.save();
        ctx.globalAlpha = flash;
        
        // 背景光晕
        const isActive = this.skill.type === 'active';
        const glowColor = isActive ? 'rgba(255, 200, 0, 0.4)' : 'rgba(100, 200, 255, 0.4)';
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.arc(x, y + float, this.radius + 6, 0, Math.PI * 2);
        ctx.fill();
        
        // 主体
        ctx.fillStyle = isActive ? '#ffcc00' : '#66ccff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y + float, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // 图标
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000';
        ctx.fillText(this.skill.icon, x, y + float);
        
        ctx.restore();
    }
}

// 技能掉落生成函数
function trySpawnSkillDrop(x, y, dropChance = 0.08) {
    if (Math.random() > dropChance) return;
    
    const skillIds = Object.keys(ALL_SKILLS);
    const randomSkillId = skillIds[Math.floor(Math.random() * skillIds.length)];
    
    Game.skillDrops = Game.skillDrops || [];
    Game.skillDrops.push(new SkillDrop(x, y, randomSkillId));
}
