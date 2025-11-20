class Player {
    constructor(worldWidth, worldHeight) {
        this.x = worldWidth / 2;
        this.y = worldHeight / 2;
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

        this.recalcStats();
        this.ammo = this.maxAmmo; // Start full
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
        // Reload Logic
        if (this.isReloading) {
            this.reloadTimer--;
            if (this.reloadTimer <= 0) {
                this.isReloading = false;
                this.ammo = this.maxAmmo;
                // console.log("Reload Complete!");
            }
            return; // Can't move or shoot while reloading? Let's allow move.
        }

        if (this.fireTimer > 0) this.fireTimer--;
        
        if (input.keys['w']) this.y -= this.speed;
        if (input.keys['s']) this.y += this.speed;
        if (input.keys['a']) this.x -= this.speed;
        if (input.keys['d']) this.x += this.speed;

        // 边界限制
        this.x = Math.max(this.r, Math.min(this.worldWidth - this.r, this.x));
        this.y = Math.max(this.r, Math.min(this.worldHeight - this.r, this.y));
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

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
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

        ctx.restore();
    }
}
