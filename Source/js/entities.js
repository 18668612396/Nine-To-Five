// --- 游戏实体类 (雷霆战机风格) ---

class Entity {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.markedForDeletion = false;
    }
    
    draw(ctx, camX, camY) {
        ctx.beginPath();
        ctx.arc(this.x - camX, this.y - camY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

class Player extends Entity {
    constructor(charType) {
        super(CONFIG.GAME_WIDTH / 2, CONFIG.GAME_HEIGHT * 0.8, 20, '#fff');
        this.charType = charType;
        
        // 基础属性 - 4格血量系统
        this.speed = 5;
        this.maxHp = 4;  // 4格血
        this.hp = 4;
        this.regen = 0;
        this.pickupRange = 80;
        
        // 战斗属性
        this.damageMult = 1.0;
        this.areaMult = 1.0;
        this.cooldownMult = 1.0;
        this.projSpeed = 1.0;
        this.durationMult = 1.0;
        this.critChance = 0.05;
        this.amount = 0;
        this.knockback = 1.0;

        // 法杖系统（组合技能）
        this.wand = new Wand(this, 8); // 8个技能槽

        // 角色特性
        if (charType === 'guagua') {
            this.color = COLORS.guagua;
            this.speed = 6;
            // 瓜瓜初始：急速 + 电火花 装备在槽位
            this.wand.slots[0] = { ...PASSIVE_SKILLS.rapid };
            this.wand.slots[1] = { ...ACTIVE_SKILLS.spark };
        } else {
            this.color = COLORS.kuikui;
            this.maxHp = 5;  // 葵葵多1格血
            this.hp = 5;
            // 葵葵初始：火球 装备在槽位
            this.wand.slots[0] = { ...ACTIVE_SKILLS.fireball };
        }

        // 视觉
        this.facingRight = true;
        
        // 移动边界（不能超出屏幕）
        this.minX = this.radius;
        this.maxX = CONFIG.GAME_WIDTH - this.radius;
        this.minY = this.radius;
        this.maxY = CONFIG.GAME_HEIGHT - this.radius;
    }

    // 解锁/升级武器效果 (保留兼容)
    addSkill(skillId) {
        return this.wand.addSkill(skillId);
    }

    update() {
        const input = Input.getAxis();
        
        // 移动
        this.x += input.x * this.speed;
        this.y += input.y * this.speed;
        
        // 限制在活动区域内
        this.x = Math.max(this.minX, Math.min(this.maxX, this.x));
        this.y = Math.max(this.minY, Math.min(this.maxY, this.y));
        
        if (input.x > 0) this.facingRight = true;
        if (input.x < 0) this.facingRight = false;

        // 生命恢复
        if (this.regen > 0 && this.hp < this.maxHp) {
            this.hp += this.regen / 60;
            if (this.hp > this.maxHp) this.hp = this.maxHp;
        }

        // 法杖更新
        this.wand.update();
    }

    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        const r = this.radius;
        const input = Input.getAxis();
        const isFlipped = !this.facingRight && input.x !== 0;
        
        const tailState = CharacterRenderer.draw(this.charType, ctx, x, y, r, Game.frameCount, {
            input,
            isFlipped,
            lastTailX: this.lastTailX,
            lastTailY: this.lastTailY,
            lastTailAngle: this.lastTailAngle
        });
        
        if (tailState) {
            this.lastTailX = tailState.tailX;
            this.lastTailY = tailState.tailY;
            this.lastTailAngle = tailState.tailBaseAngle;
        }
    }
}

class Enemy extends Entity {
    constructor(x, y, type) {
        let r = 18, c = COLORS.enemy_1, hp = 15, speed = 2, xp = 1;
        let contactDamage = 0.5; // 默认小怪伤害半格
        let isElite = false;
        let isBoss = false;

        if (type === 2) {
            // 快速型
            c = COLORS.enemy_2;
            r = 15;
            speed = 4;
            hp = 8;
            xp = 2;
            contactDamage = 0.5;
        } else if (type === 3) {
            // 重型/精英
            c = COLORS.enemy_3;
            r = 28;
            speed = 1.5;
            hp = 40;
            xp = 5;
            contactDamage = 1; // 精英伤害1格
            isElite = true;
        } else if (type === 4) {
            // Boss
            c = '#ff0000';
            r = 45;
            speed = 1;
            hp = 200;
            xp = 20;
            contactDamage = 1; // Boss伤害1格
            isBoss = true;
        }

        const diffMult = 1 + (Game.time / 60) * 0.15;
        hp *= diffMult;

        super(x, y, r, c);
        this.type = type;
        this.hp = hp;
        this.maxHp = hp;
        this.speed = speed;
        this.baseSpeed = speed;
        this.xpValue = xp;
        this.contactDamage = contactDamage;
        this.isElite = isElite;
        this.isBoss = isBoss;
        this.knockbackX = 0;
        this.knockbackY = 0;
    }

    update(player) {
        // 击退效果
        this.knockbackX *= 0.9;
        this.knockbackY *= 0.9;
        if (Math.abs(this.knockbackX) < 0.1) this.knockbackX = 0;
        if (Math.abs(this.knockbackY) < 0.1) this.knockbackY = 0;

        if (this.knockbackX === 0 && this.knockbackY === 0) {
            // 基础向下移动（跟随地图滚动）
            this.y += Game.scrollSpeed + this.speed;
            
            // 轻微追踪玩家（横向）
            const dx = player.x - this.x;
            if (Math.abs(dx) > 10) {
                this.x += Math.sign(dx) * this.speed * 0.3;
            }
        } else {
            this.x += this.knockbackX;
            this.y += this.knockbackY;
        }
    }

    takeDamage(amt, kbX, kbY) {
        this.hp -= amt;
        this.knockbackX = kbX || 0;
        this.knockbackY = kbY || 0;
        Game.addFloatingText(Math.floor(amt), this.x, this.y, '#fff');

        if (this.hp <= 0) {
            this.markedForDeletion = true;
            Game.spawnGem(this.x, this.y, this.xpValue);
            Game.kills++;
        }
    }

    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        const r = this.radius;
        const bounce = Math.sin(Game.frameCount * 0.2 + this.x) * 2;
        
        ctx.save();
        ctx.translate(x, y + bounce);
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        if (this.type === 2) {
            // 蝙蝠型 - 快速敌人
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            const wingFlap = Math.sin(Game.frameCount * 0.5) * 8;
            ctx.beginPath();
            ctx.moveTo(-r, -5);
            ctx.lineTo(-r - 15, -20 + wingFlap);
            ctx.lineTo(-r - 8, 0);
            ctx.moveTo(r, -5);
            ctx.lineTo(r + 15, -20 + wingFlap);
            ctx.lineTo(r + 8, 0);
            ctx.fill();
            ctx.stroke();
        } else if (this.type === 3) {
            // 岩石怪 - 重型敌人
            ctx.beginPath();
            ctx.rect(-r, -r, r * 2, r * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-r, -r); ctx.lineTo(-r - 8, -r - 8); ctx.lineTo(0, -r);
            ctx.moveTo(r, -r); ctx.lineTo(r + 8, -r - 8); ctx.lineTo(0, -r);
            ctx.stroke();
        } else {
            // 史莱姆 - 普通敌人
            const wobble = Math.sin(Game.frameCount * 0.1 + this.y) * 3;
            ctx.beginPath();
            ctx.ellipse(0, 0, r + wobble, r - wobble, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        // 表情
        if (this.knockbackX !== 0 || this.knockbackY !== 0) {
            // 受伤表情
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-6, -6); ctx.lineTo(-3, -3); ctx.lineTo(-6, 0);
            ctx.moveTo(6, -6); ctx.lineTo(3, -3); ctx.lineTo(6, 0);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 6, 4, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            // 正常表情
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(-5, -3, 3, 0, Math.PI * 2);
            ctx.arc(5, -3, 3, 0, Math.PI * 2);
            ctx.fill();
            // 腮红
            ctx.fillStyle = 'rgba(255, 100, 100, 0.3)';
            ctx.beginPath();
            ctx.arc(-8, 3, 4, 0, Math.PI * 2);
            ctx.arc(8, 3, 4, 0, Math.PI * 2);
            ctx.fill();
            // 嘴巴
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 4, 4, 0, Math.PI, false);
            ctx.stroke();
        }
        
        // 血条
        if (this.hp < this.maxHp) {
            const barWidth = r * 2;
            const barHeight = 4;
            const hpPct = this.hp / this.maxHp;
            ctx.fillStyle = '#333';
            ctx.fillRect(-barWidth/2, -r - 10, barWidth, barHeight);
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(-barWidth/2, -r - 10, barWidth * hpPct, barHeight);
        }
        
        ctx.restore();
    }
}

class Gem extends Entity {
    constructor(x, y, val) {
        super(x, y, 8, COLORS.gem);
        this.val = val;
        this.floatOffset = Math.random() * Math.PI * 2;
    }
    
    update(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < player.pickupRange) {
            this.x += (dx / dist) * 10;
            this.y += (dy / dist) * 10;
            
            if (dist < player.radius) {
                Game.addXp(this.val);
                this.markedForDeletion = true;
            }
        }
    }
    
    draw(ctx, camX, camY) {
        const float = Math.sin(Game.frameCount * 0.1 + this.floatOffset) * 3;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x - camX, this.y - camY - 8 + float);
        ctx.lineTo(this.x - camX + 8, this.y - camY + float);
        ctx.lineTo(this.x - camX, this.y - camY + 8 + float);
        ctx.lineTo(this.x - camX - 8, this.y - camY + float);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // 闪光效果
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.arc(this.x - camX - 2, this.y - camY - 2 + float, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Projectile extends Entity {
    constructor(x, y, dx, dy, speed, duration, damage, knockback, radius, color, penetrate) {
        super(x, y, radius, color);
        this.dx = dx;
        this.dy = dy;
        this.speed = speed;
        this.duration = duration;
        this.damage = damage;
        this.knockback = knockback;
        this.penetrate = penetrate || 1;
        this.hitList = [];
        this.angle = Math.atan2(dy, dx); // 固定朝向移动方向
    }

    update() {
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;
        this.duration--;
        if (this.duration <= 0) this.markedForDeletion = true;
        
        // 超出屏幕边界
        if (this.x < -50 || this.x > CONFIG.GAME_WIDTH + 50 || 
            this.y < -50 || this.y > CONFIG.GAME_HEIGHT + 50) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx, camX, camY) {
        ctx.save();
        ctx.translate(this.x - camX, this.y - camY);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;

        if (this.projectileType === 'laser') {
            // 激光子弹
            ctx.fillStyle = '#00ffff';
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 10;
            ctx.fillRect(-3, -8, 6, 16);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-1, -6, 2, 12);
        } else if (this.projectileType === 'spread') {
            // 散射子弹
            ctx.fillStyle = '#ffff00';
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.projectileType === 'wingman') {
            // 僚机子弹
            ctx.fillStyle = '#ff6600';
            ctx.shadowColor = '#ff6600';
            ctx.shadowBlur = 6;
            ctx.fillRect(-2, -6, 4, 12);
        } else {
            // 普通投射物
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();
    }
}
