// --- 敌人基类 ---

class Enemy extends Entity {
    static frameCount = 0; // 由外部更新
    
    constructor(x, y, config = {}) {
        const radius = config.radius || 18;
        const color = config.color || COLORS.enemy_1;
        super(x, y, radius, color);
        
        // 基础属性
        this.maxHp = config.hp || 20;
        this.hp = this.maxHp;
        this.speed = config.speed || 1.5;
        this.damage = config.damage || 10;
        this.xpValue = config.xp || 1;
        this.goldValue = config.gold || 0;
        
        // 状态
        this.knockbackX = 0;
        this.knockbackY = 0;
        this.isBoss = false;
        
        // 状态效果
        this.burnDamage = 0;
        this.burnDuration = 0;
        this.poisonStacks = 0;
        this.poisonDuration = 0;
        this.slowAmount = 0;
        this.slowDuration = 0;
        this.freezeDuration = 0;
        this.weakenAmount = 0;
        this.weakenDuration = 0;
    }
    
    update(player) {
        // 冰冻状态下不能移动
        if (this.freezeDuration > 0) {
            this.freezeDuration--;
            return;
        }
        
        // 更新状态效果
        this.updateStatusEffects();
        
        // 处理击退
        if (this.knockbackX !== 0 || this.knockbackY !== 0) {
            this.x += this.knockbackX;
            this.y += this.knockbackY;
            this.knockbackX *= 0.85;
            this.knockbackY *= 0.85;
            if (Math.abs(this.knockbackX) < 0.1) this.knockbackX = 0;
            if (Math.abs(this.knockbackY) < 0.1) this.knockbackY = 0;
        }
        
        // 向玩家移动
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > this.radius + player.radius) {
            const actualSpeed = this.slowDuration > 0 ? this.speed * (1 - this.slowAmount) : this.speed;
            this.x += (dx / dist) * actualSpeed;
            this.y += (dy / dist) * actualSpeed;
        }
    }
    
    // 更新状态效果
    updateStatusEffects() {
        // 灼烧
        if (this.burnDuration > 0) {
            this.burnDuration--;
            if (Enemy.frameCount % 30 === 0) {
                this.hp -= this.burnDamage;
                Events.emit(EVENT.FLOATING_TEXT, {
                    text: '-' + Math.floor(this.burnDamage) + '🔥',
                    x: this.x, y: this.y - this.radius - 10,
                    color: '#ff6600'
                });
                Events.emit(EVENT.PARTICLES, { x: this.x, y: this.y, color: '#ff6600', count: 3 });
            }
            if (this.hp <= 0) this.die();
        }
        
        // 中毒
        if (this.poisonDuration > 0 && this.poisonStacks > 0) {
            this.poisonDuration--;
            if (Enemy.frameCount % 20 === 0) {
                const poisonDmg = this.poisonStacks * 2;
                this.hp -= poisonDmg;
                Events.emit(EVENT.FLOATING_TEXT, {
                    text: '-' + poisonDmg + '☠️',
                    x: this.x, y: this.y - this.radius - 10,
                    color: '#00ff00'
                });
                Events.emit(EVENT.PARTICLES, { x: this.x, y: this.y, color: '#00ff00', count: 2 });
            }
            if (this.hp <= 0) this.die();
        }
        
        // 减速
        if (this.slowDuration > 0) {
            this.slowDuration--;
        }
        
        // 虚弱
        if (this.weakenDuration > 0) {
            this.weakenDuration--;
        }
    }
    
    // 添加灼烧效果
    addBurn(duration, damagePerSecond) {
        this.burnDamage = Math.max(this.burnDamage, damagePerSecond);
        this.burnDuration = Math.max(this.burnDuration, duration * 60);
    }
    
    // 添加中毒效果
    addPoison(damagePerStack) {
        this.poisonStacks = Math.min(10, this.poisonStacks + 1);
        this.poisonDuration = 300;
    }
    
    // 添加减速效果
    addSlow(amount, duration) {
        this.slowAmount = Math.max(this.slowAmount, amount);
        this.slowDuration = Math.max(this.slowDuration, duration);
    }
    
    // 添加冰冻效果
    freeze(duration) {
        this.freezeDuration = Math.max(this.freezeDuration, duration);
    }
    
    // 添加虚弱效果
    addWeaken(amount, duration) {
        this.weakenAmount = Math.max(this.weakenAmount, amount);
        this.weakenDuration = Math.max(this.weakenDuration, duration);
    }
    
    // 获取受到的伤害倍率（虚弱效果）
    getDamageTakenMult() {
        return this.weakenDuration > 0 ? (1 + this.weakenAmount) : 1;
    }
    
    takeDamage(amount, kbX = 0, kbY = 0, source = null) {
        // 应用虚弱效果
        const finalAmount = Math.floor(amount * this.getDamageTakenMult());
        
        this.hp -= finalAmount;
        this.knockbackX += kbX;
        this.knockbackY += kbY;
        
        Events.emit(EVENT.ENEMY_DAMAGE, {
            enemy: this,
            amount: finalAmount,
            source
        });
        
        Events.emit(EVENT.FLOATING_TEXT, {
            text: '-' + Math.floor(finalAmount),
            x: this.x, y: this.y - this.radius - 10,
            color: '#ff4444'
        });
        
        if (this.hp <= 0) {
            this.die(source);
        }
    }
    
    die(source = null) {
        if (this.markedForDeletion) return;
        this.markedForDeletion = true;
        
        // 发布死亡事件，让 Game 处理后续逻辑
        Events.emit(EVENT.ENEMY_DEATH, {
            enemy: this,
            x: this.x,
            y: this.y,
            xpValue: this.xpValue,
            goldValue: this.goldValue,
            color: this.color,
            source
        });
        
        Audio.play('kill');
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        const r = this.radius;
        const bounce = Math.sin(Enemy.frameCount * 0.15 + this.x) * 2;
        
        ctx.save();
        ctx.translate(x, y + bounce);
        
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        if (this.type === 2) {
            // 飞行敌人
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            const wingFlap = Math.sin(Enemy.frameCount * 0.4) * 6;
            ctx.beginPath();
            ctx.moveTo(-r, -3);
            ctx.lineTo(-r - 12, -15 + wingFlap);
            ctx.lineTo(-r - 6, 0);
            ctx.moveTo(r, -3);
            ctx.lineTo(r + 12, -15 + wingFlap);
            ctx.lineTo(r + 6, 0);
            ctx.fill();
        } else if (this.type === 3) {
            // 大型敌人
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else {
            // 普通敌人
            const wobble = Math.sin(Enemy.frameCount * 0.1 + this.y) * 2;
            ctx.beginPath();
            ctx.ellipse(0, 0, r + wobble, r - wobble, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        // 眼睛
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-r * 0.3, -r * 0.2, r * 0.15, 0, Math.PI * 2);
        ctx.arc(r * 0.3, -r * 0.2, r * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        // 受伤红色闪烁
        ctx.filter = 'none';
        
        // 血条
        if (this.hp < this.maxHp) {
            const barWidth = r * 2;
            const barHeight = 4;
            const hpPct = this.hp / this.maxHp;
            ctx.fillStyle = '#333';
            ctx.fillRect(-barWidth/2, -r - 12, barWidth, barHeight);
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(-barWidth/2, -r - 12, barWidth * hpPct, barHeight);
        }
        
        ctx.restore();
    }
}
