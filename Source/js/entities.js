// --- 游戏实体类 ---

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
        super(0, 0, 15, '#fff');
        this.charType = charType;
        
        // 基础属性
        this.speed = 3;
        this.maxHp = 100;
        this.hp = 100;
        this.regen = 0;
        this.pickupRange = 60;
        
        // 战斗属性
        this.damageMult = 1.0;
        this.areaMult = 1.0;
        this.cooldownMult = 1.0;
        this.projSpeed = 1.0;
        this.durationMult = 1.0;
        this.critChance = 0.05;
        this.amount = 0;
        this.knockback = 1.0;

        // 武器
        this.weapons = [];

        // 角色特性
        if (charType === 'guagua') {
            this.color = COLORS.guagua;
            this.speed = 3.5;
            this.addWeapon('fishbone');
        } else {
            this.color = COLORS.kuikui;
            this.maxHp = 150;
            this.hp = 150;
            this.addWeapon('aura');
        }

        // 视觉
        this.facingRight = true;
    }

    addWeapon(id) {
        const w = this.weapons.find(w => w.id === id);
        if (w) {
            w.levelUp();
        } else {
            switch(id) {
                case 'fishbone': this.weapons.push(new WeaponFishbone(this)); break;
                case 'aura': this.weapons.push(new WeaponAura(this)); break;
                case 'garlic': this.weapons.push(new WeaponGarlic(this)); break;
                case 'axe': this.weapons.push(new WeaponAxe(this)); break;
                case 'wand': this.weapons.push(new WeaponWand(this)); break;
                case 'orbit': this.weapons.push(new WeaponOrbit(this)); break;
            }
        }
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

        // 武器更新
        this.weapons.forEach(w => w.update());
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
        let r = 12, c = COLORS.enemy_1, hp = 10, speed = 1.5, xp = 1;

        if (type === 2) {
            c = COLORS.enemy_2;
            speed = 2.2;
            hp = 5;
            xp = 2;
        } else if (type === 3) {
            c = COLORS.enemy_3;
            r = 18;
            speed = 1.0;
            hp = 25;
            xp = 5;
        }

        const diffMult = 1 + (Game.time / 60) * 0.1;
        hp *= diffMult;

        super(x, y, r, c);
        this.hp = hp;
        this.maxHp = hp;
        this.speed = speed;
        this.xpValue = xp;
        this.damage = 5;
        this.knockbackX = 0;
        this.knockbackY = 0;
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
        ctx.lineWidth = 1;

        if (this.speed > 2.0) {
            // 蝙蝠
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            const wingFlap = Math.sin(Game.frameCount * 0.5) * 5;
            ctx.beginPath();
            ctx.moveTo(-r, -5);
            ctx.lineTo(-r - 10, -15 + wingFlap);
            ctx.lineTo(-r - 5, 0);
            ctx.moveTo(r, -5);
            ctx.lineTo(r + 10, -15 + wingFlap);
            ctx.lineTo(r + 5, 0);
            ctx.fill();
            ctx.stroke();
        } else if (this.maxHp > 20) {
            // 岩石怪
            ctx.beginPath();
            ctx.rect(-r, -r, r * 2, r * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-r, -r); ctx.lineTo(-r - 5, -r - 5); ctx.lineTo(0, -r);
            ctx.moveTo(r, -r); ctx.lineTo(r + 5, -r - 5); ctx.lineTo(0, -r);
            ctx.stroke();
        } else {
            // 史莱姆
            const wobble = Math.sin(Game.frameCount * 0.1 + this.y) * 2;
            ctx.beginPath();
            ctx.ellipse(0, 0, r + wobble, r - wobble, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        // 表情
        if (this.knockbackX !== 0 || this.knockbackY !== 0) {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-5, -5); ctx.lineTo(-2, -2); ctx.lineTo(-5, 1);
            ctx.moveTo(5, -5); ctx.lineTo(2, -2); ctx.lineTo(5, 1);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 5, 3, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(-4, -2, 2, 0, Math.PI * 2);
            ctx.arc(4, -2, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
            ctx.beginPath();
            ctx.arc(-6, 2, 2, 0, Math.PI * 2);
            ctx.arc(6, 2, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(0, 2, 2, 0, Math.PI, false);
            ctx.stroke();
        }
        ctx.restore();
    }
}

class Gem extends Entity {
    constructor(x, y, val) {
        super(x, y, 5, COLORS.gem);
        this.val = val;
    }
    
    update(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < player.pickupRange) {
            this.x += (dx / dist) * 8;
            this.y += (dy / dist) * 8;
            
            if (dist < player.radius) {
                Game.addXp(this.val);
                this.markedForDeletion = true;
            }
        }
    }
    
    draw(ctx, camX, camY) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x - camX, this.y - camY - 5);
        ctx.lineTo(this.x - camX + 5, this.y - camY);
        ctx.lineTo(this.x - camX, this.y - camY + 5);
        ctx.lineTo(this.x - camX - 5, this.y - camY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
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
        this.angle = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.5;
    }

    update() {
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;
        this.angle += this.rotationSpeed;
        this.duration--;
        if (this.duration <= 0) this.markedForDeletion = true;
    }

    draw(ctx, camX, camY) {
        ctx.save();
        ctx.translate(this.x - camX, this.y - camY);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;

        if (this.ownerId === 'orbit') {
            ctx.beginPath();
            ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-8, 0); ctx.lineTo(-12, -4); ctx.lineTo(-12, 4); ctx.fill();
        } else if (this.color === '#fff') {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-6, 0); ctx.lineTo(6, 0);
            ctx.moveTo(-6, -2); ctx.lineTo(-6, 2);
            ctx.moveTo(6, -2); ctx.lineTo(6, 2);
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();
    }
}
