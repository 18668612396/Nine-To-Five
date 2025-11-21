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

        // Setup Renderers
        this.setupRenderers();
        
        // Setup Collider
        this.collider = new CircleCollider(this.r);
        this.addComponent(this.collider);
    }

    setupRenderers() {
        // Shadow
        const shadow = new CanvasRenderer((ctx) => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.beginPath();
            ctx.ellipse(0, 0, this.r, this.r * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
        });
        shadow.offsetY = this.r * 2 - 5;
        shadow.sortingOrder = -1;
        this.addComponent(shadow);

        // Sprite Animation
        const sprites = [];
        const basePath = 'assets/actors/players/xiaokui/xiaokui01/run/xiaokui01_0';
        for(let i=1; i<=4; i++) {
            const img = new Image();
            img.src = `${basePath}${i}.png`;
            sprites.push(img);
        }
        
        this.animator = new DynamicRenderer(sprites, 8);
        this.animator.width = this.r * 4;
        this.animator.height = this.r * 4;
        this.addComponent(this.animator);
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
        if (input.keys['a']) this.animator.flipX = true;
        if (input.keys['d']) this.animator.flipX = false;

        const isMoving = input.keys['w'] || input.keys['s'] || input.keys['a'] || input.keys['d'];
        if (isMoving) {
            this.animator.play();
        } else {
            this.animator.stop();
            this.animator.currentFrame = 0; // Reset to idle
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
        // Fallback drawing removed as we use Renderers now
        // Debug collider
        // ctx.save(); ctx.translate(this.x, this.y); ctx.beginPath(); ctx.arc(0, 0, this.r, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(255,0,0,0.5)'; ctx.stroke(); ctx.restore();
    }
}
