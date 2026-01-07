// --- 游戏实体类 (类幸存者风格 + 魔法工艺技能系统) ---

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
    }
}

class Player extends Entity {
    constructor(charType) {
        super(0, 0, 20, '#fff');
        this.charType = charType;
        
        // 基础属性
        this.speed = 4;
        this.maxHp = 100;
        this.hp = 100;
        this.regen = 0;
        this.pickupRange = 100;
        
        // 战斗属性
        this.damageMult = 1.0;
        this.cooldownMult = 1.0;
        this.projSpeed = 1.0;
        this.knockback = 1.0;

        // 法杖系统（组合技能）
        this.wand = new Wand(this, 8);
        
        // 祝福系统
        this.perkManager = new PerkManager(this);
        
        // 额外属性
        this.vampirism = 0;
        this.critChance = 0;
        this.xpMult = 1;
        this.damageAura = 0;
        this.extraProjectiles = 0;
        this.dropRate = 1;
        this.projSpeed = 1;
        this.knockback = 1;

        // 角色特性 + 初始技能
        if (charType === 'guagua') {
            this.color = COLORS.guagua;
            this.speed = 4.5;
            // 瓜瓜初始：急速施法 + 火花弹
            this.wand.slots[0] = { ...MODIFIER_SKILLS.reduce_cooldown, star: 1 };
            this.wand.slots[1] = { ...MAGIC_SKILLS.spark_bolt, star: 1 };
        } else {
            this.color = COLORS.kuikui;
            this.maxHp = 120;
            this.hp = 120;
            // 葵葵初始：火球术
            this.wand.slots[0] = { ...MAGIC_SKILLS.fireball, star: 1 };
        }

        this.facingRight = true;
    }

    update() {
        const input = Input.getAxis();
        
        this.x += input.x * this.speed;
        this.y += input.y * this.speed;
        
        if (input.x > 0) this.facingRight = true;
        if (input.x < 0) this.facingRight = false;

        // 生命恢复
        if (this.regen > 0 && this.hp < this.maxHp) {
            this.hp += this.regen / 60;
            if (this.hp > this.maxHp) this.hp = this.maxHp;
        }

        // 法杖更新（自动施法）
        this.wand.update();
    }

    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        const r = this.radius;
        const input = Input.getAxis();
        const isFlipped = !this.facingRight;
        
        CharacterRenderer.draw(this.charType, ctx, x, y, r, Game.frameCount, {
            input,
            isFlipped,
            lastTailX: this.lastTailX,
            lastTailY: this.lastTailY,
            lastTailAngle: this.lastTailAngle
        });
    }
}

class Enemy extends Entity {
    constructor(x, y, type) {
        let r = 18, c = COLORS.enemy_1, hp = 20, speed = 1.5, xp = 1, damage = 10;

        if (type === 2) {
            c = COLORS.enemy_2;
            r = 14;
            speed = 2.5;
            hp = 12;
            xp = 2;
            damage = 8;
        } else if (type === 3) {
            c = COLORS.enemy_3;
            r = 30;
            speed = 1;
            hp = 80;
            xp = 5;
            damage = 15;
        }

        const diffMult = 1 + (Game.time / 60) * 0.2;
        hp *= diffMult;

        super(x, y, r, c);
        this.type = type;
        this.hp = hp;
        this.maxHp = hp;
        this.speed = speed;
        this.xpValue = xp;
        this.damage = damage;
        this.knockbackX = 0;
        this.knockbackY = 0;
        
        // 状态效果
        this.burnDamage = 0;
        this.burnDuration = 0;
        this.poisonStacks = 0;
        this.poisonTimer = 0;
    }

    addBurn(damage, duration) {
        this.burnDamage = Math.max(this.burnDamage, damage);
        this.burnDuration = Math.max(this.burnDuration, duration);
    }

    addPoison(stacks) {
        this.poisonStacks += stacks;
        this.poisonTimer = 60; // 每秒触发一次
    }

    update(player) {
        this.knockbackX *= 0.9;
        this.knockbackY *= 0.9;
        if (Math.abs(this.knockbackX) < 0.1) this.knockbackX = 0;
        if (Math.abs(this.knockbackY) < 0.1) this.knockbackY = 0;

        if (this.knockbackX === 0 && this.knockbackY === 0) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
                this.x += (dx / dist) * this.speed;
                this.y += (dy / dist) * this.speed;
            }
        } else {
            this.x += this.knockbackX;
            this.y += this.knockbackY;
        }

        // 灼烧伤害
        if (this.burnDuration > 0) {
            this.burnDuration--;
            if (Game.frameCount % 20 === 0) {
                this.hp -= this.burnDamage;
                Game.addFloatingText(Math.floor(this.burnDamage), this.x, this.y - 30, '#ff6600');
                Game.spawnParticles(this.x, this.y, '#ff6600', 2);
                if (this.hp <= 0 && !this.markedForDeletion) {
                    this.die();
                }
            }
        }

        // 中毒伤害
        if (this.poisonStacks > 0) {
            this.poisonTimer--;
            if (this.poisonTimer <= 0) {
                const poisonDmg = this.poisonStacks * 2;
                this.hp -= poisonDmg;
                Game.addFloatingText(Math.floor(poisonDmg), this.x, this.y - 30, '#00ff00');
                Game.spawnParticles(this.x, this.y, '#00ff00', 2);
                this.poisonStacks = Math.max(0, this.poisonStacks - 1);
                this.poisonTimer = 60;
                if (this.hp <= 0 && !this.markedForDeletion) {
                    this.die();
                }
            }
        }
    }

    die(killerProjectile) {
        this.markedForDeletion = true;
        Game.spawnGem(this.x, this.y, this.xpValue);
        Game.kills++;
        
        // 播放击杀音效
        Audio.play('kill');
        
        // 掉落金币
        const goldAmount = Math.floor((1 + Math.random() * 2) * (Game.goldMult || 1) * (Game.difficultyMult?.reward || 1));
        Game.gold += goldAmount;
        
        // 吸血效果
        if (Game.player.vampirism > 0) {
            Game.player.hp = Math.min(Game.player.maxHp, Game.player.hp + Game.player.vampirism);
        }
        
        // 掉落技能
        trySpawnSkillDrop(this.x, this.y, Game.player);
        
        // 触发击杀效果
        if (killerProjectile && killerProjectile.onKill) {
            killerProjectile.onKill(this);
        }
    }

    takeDamage(amt, kbX, kbY, projectile) {
        this.hp -= amt;
        this.knockbackX = kbX || 0;
        this.knockbackY = kbY || 0;
        Game.addFloatingText(Math.floor(amt), this.x, this.y - 20, '#fff');
        Game.damageDealt += amt;
        Audio.play('hit');

        if (this.hp <= 0 && !this.markedForDeletion) {
            this.die(projectile);
        }
    }

    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        const r = this.radius;
        const bounce = Math.sin(Game.frameCount * 0.15 + this.x) * 2;
        
        ctx.save();
        ctx.translate(x, y + bounce);
        
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        if (this.type === 2) {
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            const wingFlap = Math.sin(Game.frameCount * 0.4) * 6;
            ctx.beginPath();
            ctx.moveTo(-r, -3);
            ctx.lineTo(-r - 12, -15 + wingFlap);
            ctx.lineTo(-r - 6, 0);
            ctx.moveTo(r, -3);
            ctx.lineTo(r + 12, -15 + wingFlap);
            ctx.lineTo(r + 6, 0);
            ctx.fill();
        } else if (this.type === 3) {
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else {
            const wobble = Math.sin(Game.frameCount * 0.1 + this.y) * 2;
            ctx.beginPath();
            ctx.ellipse(0, 0, r + wobble, r - wobble, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-r * 0.3, -r * 0.2, r * 0.15, 0, Math.PI * 2);
        ctx.arc(r * 0.3, -r * 0.2, r * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
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

class Gem extends Entity {
    constructor(x, y, val) {
        super(x, y, 10, COLORS.gem);
        this.val = val;
        this.floatOffset = Math.random() * Math.PI * 2;
    }
    
    update(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < player.pickupRange) {
            const speed = 8;
            this.x += (dx / dist) * speed;
            this.y += (dy / dist) * speed;
            
            if (dist < player.radius + this.radius) {
                Game.addXp(this.val);
                Audio.play('pickup');
                this.markedForDeletion = true;
            }
        }
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        const float = Math.sin(Game.frameCount * 0.1 + this.floatOffset) * 3;
        
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y - 10 + float);
        ctx.lineTo(x + 8, y + float);
        ctx.lineTo(x, y + 10 + float);
        ctx.lineTo(x - 8, y + float);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.arc(x - 2, y - 3 + float, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}
