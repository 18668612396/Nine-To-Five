class Player extends GameBehaviour {
    constructor() {
        super('Player');
        this.r = 20; // 半径
        this.worldWidth = 2500; // Default, should be set via onLoad or property
        this.worldHeight = 2500;

        // Base Stats
        this.baseStats = {
            hp: 100,
            speed: 5,
            damage: 0,
            fireRate: 0,
            reloadSpeed: 1.0
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
    }

    onLoad(props) {
        if (props.worldWidth) this.worldWidth = props.worldWidth;
        if (props.worldHeight) this.worldHeight = props.worldHeight;
        if (props.speed) this.baseStats.speed = props.speed;
        if (props.weaponPrefab) this.weaponPrefabPath = props.weaponPrefab;
        if (props.shadowPrefab) this.shadowPrefabPath = props.shadowPrefab;
    }

    start() {
        // Get Components (Assumed to be added via Prefab)
        this.rb = this.gameObject.getComponent('RigidBody');
        this.collider = this.gameObject.getComponent('CircleCollider');
        this.spriteRenderer = this.gameObject.getComponent('SpriteRenderer');
        this.animator = this.gameObject.getComponent('Animator');

        // Load Shadow Prefab if defined
        if (this.shadowPrefabPath) {
            window.resourceManager.load(this.shadowPrefabPath).then(prefab => {
                if (prefab && prefab instanceof window.Prefab) {
                    const shadowGO = prefab.instantiate(null, this.gameObject);
                    // Optional: Override properties if needed, or trust the prefab
                    // shadowGO.transform.localPosition.y = this.r * 2 - 5; 
                }
            }).catch(err => console.error("Failed to load shadow prefab:", err));
        }

        this.recalcStats();
        this.ammo = this.maxAmmo;

        // Load Weapon Prefab if defined
        if (this.weaponPrefabPath) {
            window.resourceManager.load(this.weaponPrefabPath).then(prefab => {
                if (prefab && prefab instanceof window.Prefab) {
                    const weaponGO = prefab.instantiate(null, this.gameObject);
                    this.weaponGO = weaponGO;
                    console.log("Weapon instantiated:", weaponGO);
                }
            }).catch(err => console.error("Failed to load weapon prefab:", err));
        }
    }

    // Proxy Transform properties for compatibility
    get x() { return this.gameObject ? this.gameObject.transform.x : 0; }
    set x(v) { if (this.gameObject) this.gameObject.transform.x = v; }
    get y() { return this.gameObject ? this.gameObject.transform.y : 0; }
    set y(v) { if (this.gameObject) this.gameObject.transform.y = v; }

    recalcStats() {
        // Reset to base
        this.maxHp = this.baseStats.hp;
        this.speed = this.baseStats.speed;
        let reloadMult = this.baseStats.reloadSpeed;
        let fireRateMult = 1.0;

        // Apply Equipment
        if (this.equipment.armor) {
            this.maxHp += (this.equipment.armor.stats.hp || 0);
        }
        if (this.equipment.shoes) {
            this.speed += (this.equipment.shoes.stats.moveSpeed || 0);
        }
        if (this.equipment.gloves) {
            reloadMult += (this.equipment.gloves.stats.reloadSpeed || 0);
            fireRateMult -= (this.equipment.gloves.stats.fireRate || 0);
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

    update(dt) {
        const input = window.game.inputManager;
        
        // Reload Logic
        if (this.isReloading) {
            this.reloadTimer--;
            if (this.reloadTimer <= 0) {
                this.isReloading = false;
                this.ammo = this.maxAmmo;
            }
        }

        if (this.fireTimer > 0) this.fireTimer--;
        
        // Movement using RigidBody
        let moveX = 0;
        let moveY = 0;
        
        if (input.getKey('w')) moveY -= 1;
        if (input.getKey('s')) moveY += 1;
        if (input.getKey('a')) moveX -= 1;
        if (input.getKey('d')) moveX += 1;

        // Normalize vector
        if (moveX !== 0 || moveY !== 0) {
            const len = Math.sqrt(moveX*moveX + moveY*moveY);
            moveX /= len;
            moveY /= len;
            
            const forceMagnitude = this.speed * this.rb.drag * this.rb.mass * 10;
            this.rb.addForce(moveX * forceMagnitude, moveY * forceMagnitude);
        }

        // 边界限制
        // Note: accessing this.x/y via getters which proxy to transform
        this.x = Math.max(this.r, Math.min(this.worldWidth - this.r, this.x));
        this.y = Math.max(this.r, Math.min(this.worldHeight - this.r, this.y));

        // Update Animation Logic
        if (input.getKey('a')) {
            this.gameObject.transform.localScale.x = -1;
        }
        if (input.getKey('d')) {
            this.gameObject.transform.localScale.x = 1;
        }

        const isMoving = moveX !== 0 || moveY !== 0;
        if (isMoving) {
            if (this.animator.play) this.animator.play('Run');
        } else {
            if (this.animator.stop) this.animator.stop();
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
    }

    gainExp(amount) {
        this.exp += amount;
        if (this.exp >= this.maxExp) {
            this.exp -= this.maxExp;
            this.level++;
            this.maxExp = Math.floor(this.maxExp * 1.2);
            return true;
        }
        return false;
    }
}

window.Player = Player;
