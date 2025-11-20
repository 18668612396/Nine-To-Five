class Player extends GameObject {
    constructor(worldWidth, worldHeight) {
        super('Player', worldWidth / 2, worldHeight / 2);
        this.r = 20; // 半径
        this.color = '#fff'; // 白猫
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;

        // Base Stats
        this.baseStats = {
            hp: 100,
            speed: 5,
            damage: 0, // Weapon provides base damage
            fireRate: 0, // Weapon provides base fire rate
            reloadSpeed: 1.0 // Multiplier
        };

        // Equipment
        this.equipment = {
            weapon: ItemFactory.createWeapon('rifle'),
            armor: null,
            gloves: null,
            shoes: null
        };

        // Runtime Stats
        this.maxHp = 100;
        this.hp = 100;
        this.speed = 5;
        this.damage = 10;
        this.fireRate = 15;
        
        // Combat State
        this.fireTimer = 0;
        this.reloadTimer = 0;
        this.isReloading = false;
        this.ammo = 0;
        this.maxAmmo = 0;

        // Leveling
        this.level = 1;
        this.exp = 0;
        this.maxExp = 100;

        this.recalcStats();
        this.ammo = this.maxAmmo; // Start full

        // Animation State
        this.sprites = [];
        this.loadedSprites = 0;
        this.frameCount = 4;
        this.currentFrame = 0;
        this.animTimer = 0;
        this.animSpeed = 8; 
        this.facingRight = true;
        this.loadAssets();
    }

    loadAssets() {
        // 加载小葵第一套时装的跑步动作
        const basePath = 'assets/actors/players/xiaokui/xiaokui01/run/xiaokui01_0';
        for(let i=1; i<=4; i++) {
            const img = new Image();
            img.src = `${basePath}${i}.png`;
            img.onload = () => this.loadedSprites++;
            this.sprites.push(img);
        }
    }

    recalcStats() {
        // Reset to base
        this.maxHp = this.baseStats.hp;
        this.speed = this.baseStats.speed;
        let reloadMult = this.baseStats.reloadSpeed;
        let fireRateMult = 1.0;

        // Apply Equipment
        if (this.equipment.armor) {
            this.maxHp += (this.equipment.armor.stats.hp || 0);
            // def not implemented yet
        }
        if (this.equipment.shoes) {
            this.speed += (this.equipment.shoes.stats.moveSpeed || 0);
        }
        if (this.equipment.gloves) {
            reloadMult += (this.equipment.gloves.stats.reloadSpeed || 0);
            fireRateMult -= (this.equipment.gloves.stats.fireRate || 0); // Lower is faster? No, let's say higher is faster fire rate reduction
        }

        // Weapon Stats
        const weapon = this.equipment.weapon;
        if (weapon) {
            this.damage = weapon.damage;
            this.fireRate = Math.max(1, weapon.fireRate * (1 - (this.equipment.gloves?.stats.fireRate || 0))); 
            this.maxAmmo = weapon.clipSize;
            this.reloadTime = weapon.reloadTime / reloadMult;
        } else {
            this.damage = 1;
            this.fireRate = 30;
            this.maxAmmo = 0;
        }

        // Clamp HP
        this.hp = Math.min(this.hp, this.maxHp);
    }

    update(input) {
        super.update(1/60);
        // Reload Logic
        if (this.isReloading) {
            this.reloadTimer--;
            if (this.reloadTimer <= 0) {
                this.isReloading = false;
                this.ammo = this.maxAmmo;
                // console.log("Reload Complete!");
            }
            // return; // Allow movement while reloading
        }

        if (this.fireTimer > 0) this.fireTimer--;
        
        if (input.keys['w']) this.y -= this.speed;
        if (input.keys['s']) this.y += this.speed;
        if (input.keys['a']) this.x -= this.speed;
        if (input.keys['d']) this.x += this.speed;

        // 边界限制
        this.x = Math.max(this.r, Math.min(this.worldWidth - this.r, this.x));
        this.y = Math.max(this.r, Math.min(this.worldHeight - this.r, this.y));

        // Update Animation Logic
        if (input.keys['a']) this.facingRight = false;
        if (input.keys['d']) this.facingRight = true;

        const isMoving = input.keys['w'] || input.keys['s'] || input.keys['a'] || input.keys['d'];
        if (isMoving) {
            this.animTimer++;
            if (this.animTimer >= this.animSpeed) {
                this.currentFrame = (this.currentFrame + 1) % this.frameCount;
                this.animTimer = 0;
            }
        } else {
            this.currentFrame = 0; // Idle frame
            this.animTimer = 0;
        }
    }

    getWeaponConfig() {
        return this.equipment.weapon;
    }

    consumeAmmo() {
        if (this.ammo > 0) {
            this.ammo--;
            if (this.ammo <= 0) {
                this.startReload();
            }
            return true;
        } else {
            if (!this.isReloading) this.startReload();
            return false;
        }
    }

    startReload() {
        if (this.isReloading) return;
        this.isReloading = true;
        this.reloadTimer = this.reloadTime;
        // console.log("Reloading...");
    }

    gainExp(amount) {
        this.exp += amount;
        if (this.exp >= this.maxExp) {
            this.exp -= this.maxExp;
            this.level++;
            this.maxExp = Math.floor(this.maxExp * 1.2); // Increase requirement by 20%
            return true; // Leveled up
        }
        return false;
    }

    draw(ctx) {
        super.draw(ctx);
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // 绘制阴影
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        // 绘制椭圆阴影，位置下移至脚底 (图片大小为 r*4，半高为 r*2)
        ctx.ellipse(0, this.r * 2 - 5, this.r, this.r * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (this.loadedSprites === this.frameCount) {
            // 绘制图片
            ctx.save();
            if (!this.facingRight) ctx.scale(-1, 1);
            
            const img = this.sprites[this.currentFrame];
            // 调整图片大小，这里假设图片比较大，稍微缩小一点或者根据半径调整
            // 假设碰撞半径 r=20，直径40。我们将图片绘制为 80x80 以覆盖碰撞体
            const size = this.r * 4; 
            ctx.drawImage(img, -size/2, -size/2, size, size);
            ctx.restore();

            // 可选：绘制碰撞框用于调试
            // ctx.beginPath(); ctx.arc(0, 0, this.r, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(255,0,0,0.5)'; ctx.stroke();
        } else {
            // 图片未加载完成时的 Fallback 绘制
            // 身体
            ctx.beginPath();
            ctx.arc(0, 0, this.r, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.stroke();

            // 耳朵
            ctx.fillStyle = this.color;
            ctx.beginPath(); ctx.moveTo(-15, -10); ctx.lineTo(-20, -25); ctx.lineTo(-5, -15); ctx.fill();
            ctx.beginPath(); ctx.moveTo(15, -10); ctx.lineTo(20, -25); ctx.lineTo(5, -15); ctx.fill();

            // 法师帽 (简单的三角形)
            ctx.fillStyle = '#6200ea';
            ctx.beginPath(); ctx.moveTo(-15, -15); ctx.lineTo(0, -45); ctx.lineTo(15, -15); ctx.fill();
        }

        ctx.restore();
    }
}
