// --- Boss基类 (继承Enemy) ---

// Boss 配置注册表
const BOSS_TYPES = {};

class Boss extends Enemy {
    static difficultyMult = { enemy: 1, reward: 1 }; // 由外部设置
    static goldMult = 1; // 由外部设置
    
    constructor(x, y, config, scaleMult = 1) {
        // 调用Enemy构造函数
        super(x, y, {
            radius: config.radius,
            color: config.color,
            hp: config.hp * (Boss.difficultyMult?.enemy || 1) * scaleMult,
            damage: config.damage * (Boss.difficultyMult?.enemy || 1) * scaleMult,
            speed: config.speed,
            xp: config.xp,
            gold: config.gold * (Boss.difficultyMult?.reward || 1)
        });
        
        // Boss特有属性
        this.type = config.id;
        this.name = config.name;
        this.isBoss = true;
        this.phase = 1;
        this.attackCooldown = 0;
        this.specialCooldown = 0;
        this.animationFrame = 0;
        this.scaleMult = scaleMult; // 保存难度倍率
        
        // 特殊状态
        this.isEnraged = false;
        this.shield = 0;
        this.summonCooldown = 0;
    }
    
    // 注册Boss类型
    static register(id, config, bossClass) {
        BOSS_TYPES[id] = { config, bossClass };
    }
    
    // 创建Boss实例
    static create(id, x, y, diffMult = 1) {
        const entry = BOSS_TYPES[id];
        if (!entry) {
            console.error('未知Boss类型:', id);
            return null;
        }
        return new entry.bossClass(x, y, diffMult);
    }
    
    // 获取所有Boss类型ID
    static getAllTypes() {
        return Object.keys(BOSS_TYPES);
    }
    
    update(player) {
        this.animationFrame++;
        
        // 调用父类更新（状态效果、击退、移动）
        super.update(player);
        
        // 更新冷却
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.specialCooldown > 0) this.specialCooldown--;
        if (this.summonCooldown > 0) this.summonCooldown--;
        
        // 检查阶段转换
        this.checkPhaseTransition();
        
        // 执行攻击
        this.performAttacks(player);
    }
    
    checkPhaseTransition() {
        const hpPercent = this.hp / this.maxHp;
        if (hpPercent <= 0.3 && this.phase < 3) {
            this.phase = 3;
            this.onPhaseChange(3);
        } else if (hpPercent <= 0.5 && this.phase < 2) {
            this.phase = 2;
            this.onPhaseChange(2);
        }
    }
    
    onPhaseChange(phase) {
        // 子类重写
    }
    
    performAttacks(player) {
        // 子类重写
    }
    
    takeDamage(amount, kbX = 0, kbY = 0, source = null) {
        // 护盾吸收
        if (this.shield > 0) {
            const absorbed = Math.min(this.shield, amount);
            this.shield -= absorbed;
            amount -= absorbed;
            Events.emit(EVENT.FLOATING_TEXT, {
                text: '护盾 -' + absorbed,
                x: this.x, y: this.y - this.radius - 20,
                color: '#00ffff'
            });
        }
        
        if (amount > 0) {
            // Boss击退减少
            super.takeDamage(amount, kbX * 0.3, kbY * 0.3, source);
        }
    }
    
    die(source = null) {
        if (this.markedForDeletion) return;
        this.markedForDeletion = true;
        
        // 发布Boss死亡事件
        Events.emit(EVENT.BOSS_DEATH, {
            boss: this,
            x: this.x,
            y: this.y,
            xpValue: this.xpValue,
            goldValue: this.goldValue,
            name: this.name,
            color: this.color,
            level: this.level || 1,
            source
        });
        
        // 粒子效果
        Events.emit(EVENT.PARTICLES, {
            x: this.x, y: this.y,
            count: 30,
            color: this.color,
            spread: 10,
            size: 6
        });
        
        Events.emit(EVENT.FLOATING_TEXT, {
            text: '💀 ' + this.name + ' 被击败!',
            x: this.x, y: this.y - 60,
            color: '#ffd700'
        });
        
        Audio.play('kill');
    }
    
    drawHealthBar(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        const barWidth = 100;
        const barHeight = 10;
        const barY = y - this.radius - 25;
        
        // 背景
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(x - barWidth/2 - 2, barY - 2, barWidth + 4, barHeight + 4);
        
        // 血条背景
        ctx.fillStyle = '#333';
        ctx.fillRect(x - barWidth/2, barY, barWidth, barHeight);
        
        // 血条
        const hpPercent = this.hp / this.maxHp;
        const hpColor = hpPercent > 0.5 ? '#ff4444' : hpPercent > 0.25 ? '#ff8800' : '#ff0000';
        ctx.fillStyle = hpColor;
        ctx.fillRect(x - barWidth/2, barY, barWidth * hpPercent, barHeight);
        
        // 护盾条
        if (this.shield > 0) {
            const shieldPercent = Math.min(this.shield / (this.maxHp * 0.3), 1);
            ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
            ctx.fillRect(x - barWidth/2, barY, barWidth * shieldPercent, barHeight);
        }
        
        // Boss名字
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, x, barY - 8);
    }
}

// ========== Boss管理器 (静态) ==========
Boss.Manager = {
    bosses: [],
    bossSpawnTimer: 0,
    bossSpawnInterval: 60 * 120, // 初始2分钟
    minSpawnInterval: 60 * 10,   // 最低10秒
    intervalDecay: 60 * 10,      // 每次减少10秒
    bossCount: 0, // 已生成的Boss数量
    player: null, // 由外部设置
    
    init() {
        this.bosses = [];
        this.bossSpawnTimer = 0;
        this.bossSpawnInterval = 60 * 120; // 重置为2分钟
        this.bossCount = 0;
    },
    
    setPlayer(player) {
        this.player = player;
    },
    
    // 根据Boss数量计算难度倍率
    getDifficultyMult() {
        // 第1个Boss: 0.5x, 第2个: 0.7x, 第3个: 0.9x, 第4个: 1.0x, 之后每个+0.15x
        const baseMult = 0.5;
        const increment = 0.2;
        const mult = Math.min(baseMult + this.bossCount * increment, 2.0); // 最高2倍
        return mult;
    },
    
    update() {
        if (!this.player) return;
        
        // 只有当前没有Boss时才计时
        if (this.bosses.length === 0) {
            this.bossSpawnTimer++;
            if (this.bossSpawnTimer >= this.bossSpawnInterval) {
                this.spawnRandomBoss();
                this.bossSpawnTimer = 0;
            }
        }
        
        this.bosses.forEach(boss => boss.update(this.player));
        this.bosses = this.bosses.filter(b => !b.markedForDeletion);
    },
    
    draw(ctx, camX, camY) {
        this.bosses.forEach(boss => boss.draw(ctx, camX, camY));
    },
    
    spawnRandomBoss() {
        const types = Boss.getAllTypes();
        if (types.length === 0) return;
        const randomType = types[Math.floor(Math.random() * types.length)];
        this.spawnBoss(randomType);
        
        // 每次生成后减少下次间隔
        this.bossSpawnInterval = Math.max(this.minSpawnInterval, this.bossSpawnInterval - this.intervalDecay);
    },
    
    spawnBoss(type) {
        if (!this.player) return null;
        
        const angle = Math.random() * Math.PI * 2;
        const dist = (typeof CONFIG !== 'undefined' ? CONFIG.ENEMY_SPAWN_DISTANCE : 600) + 100;
        const x = this.player.x + Math.cos(angle) * dist;
        const y = this.player.y + Math.sin(angle) * dist;
        
        // 计算当前难度倍率
        const diffMult = this.getDifficultyMult();
        
        const boss = Boss.create(type, x, y, diffMult);
        if (boss) {
            this.bosses.push(boss);
            this.bossCount++;
            Events.emit(EVENT.BOSS_SPAWN, { boss });
            Events.emit(EVENT.FLOATING_TEXT, {
                text: '⚠️ ' + boss.name + ' 出现了!',
                x: this.player.x, y: this.player.y - 100,
                color: '#ff0000'
            });
        }
        return boss;
    },
    
    checkProjectileCollision(projectile) {
        for (const boss of this.bosses) {
            if (!boss.markedForDeletion && !projectile.markedForDeletion) {
                const dx = projectile.x - boss.x;
                const dy = projectile.y - boss.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < projectile.radius + boss.radius) {
                    return boss;
                }
            }
        }
        return null;
    },
    
    // 获取所有Boss（包括普通敌人列表中的Boss）
    getAllTargets() {
        return this.bosses;
    }
};

// 兼容旧代码
const BossManager = Boss.Manager;

// ========== Boss投射物 ==========
class BossProjectile {
    constructor(x, y, vx, vy, radius, color, damage, type = 'normal') {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
        this.damage = damage;
        this.type = type;
        this.markedForDeletion = false;
        this.isBossProjectile = true;
        this.life = 300;
        this.rotation = 0;
    }
    
    update(player) {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.rotation += 0.1;
        
        if (this.life <= 0) {
            this.markedForDeletion = true;
            return;
        }
        
        if (!player) return;
        
        // 检测与玩家碰撞
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < this.radius + player.radius) {
            player.takeDamage(this.damage);
            this.markedForDeletion = true;
            
            Events.emit(EVENT.PARTICLES, {
                x: this.x, y: this.y,
                count: 5,
                color: this.color,
                spread: 4
            });
        }
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.rotation);
        
        if (this.type === 'petal') {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.radius, this.radius * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.ellipse(-2, -2, this.radius * 0.4, this.radius * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'lava') {
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
            gradient.addColorStop(0, '#ffff00');
            gradient.addColorStop(0.5, '#ff6600');
            gradient.addColorStop(1, '#ff0000');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'icicle') {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(this.radius, 0);
            ctx.lineTo(-this.radius * 0.5, -this.radius * 0.5);
            ctx.lineTo(-this.radius * 0.5, this.radius * 0.5);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.moveTo(this.radius * 0.5, 0);
            ctx.lineTo(-this.radius * 0.3, -this.radius * 0.3);
            ctx.lineTo(-this.radius * 0.3, this.radius * 0.3);
            ctx.closePath();
            ctx.fill();
        } else if (this.type === 'bullet') {
            // 子弹样式
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.radius * 1.5, this.radius * 0.8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.ellipse(this.radius * 0.3, -this.radius * 0.2, this.radius * 0.4, this.radius * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}
