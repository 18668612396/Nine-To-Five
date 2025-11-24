class Player extends Actor {
    constructor() {
        super('Player');
        this.r = 20; // 半径
        this.worldWidth = 3000; // Default, should be set via onLoad or property
        this.worldHeight = 3000;
        this.worldHalfWidth = this.worldWidth / 2;
        this.worldHalfHeight = this.worldHeight / 2;

        // Base Stats
        this.baseStats = {
            hp: 100,
            speed: 5,
            damage: 0,
            fireRate: 0,
            reloadSpeed: 1.0,
            attackRange: 600 // Attack range in pixels
        };

        // Equipment
        this.equipment = {
            weapon: ItemFactory.createWeapon('rifle'),
            armor: null,
            gloves: null,
            shoes: null
        };

        // Runtime Stats (Initialized in Actor, but we can override defaults here if needed)
        this.maxHp = 100;
        this.hp = 100;
        this.speed = 5;
        this.damage = 10;

        this.fireRate = 15;
        this.attackRange = 300; // Current attack range

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

        this.muzzleDistance = 40; //最小攻击范围，小于这个范围内的怪物不会受到伤害
        
        // Debug
        this.showAttackRange = false; // Toggle with 'R' key
    }

    onLoad(props) {
        if (props.worldWidth) {
            this.worldWidth = props.worldWidth;
            this.worldHalfWidth = this.worldWidth / 2;
        }
        if (props.worldHeight) {
            this.worldHeight = props.worldHeight;
            this.worldHalfHeight = this.worldHeight / 2;
        }
        if (props.speed) this.baseStats.speed = props.speed;
        if (props.attackRange !== undefined) this.baseStats.attackRange = props.attackRange;
        if (props.weaponPrefab) this.weaponPrefabPath = props.weaponPrefab;
        if (props.shadowPrefab) this.shadowPrefabPath = props.shadowPrefab;
        if (props.muzzleDistance !== undefined) this.muzzleDistance = props.muzzleDistance;
    }

    start() {
        // Get Components (Assumed to be added via Prefab)
        this.rb = this.gameObject.getComponent('RigidBody');
        this.collider = this.gameObject.getComponent('CircleCollider');

        this.initVisuals();

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

        // Load Shoot Effect Prefab
        window.resourceManager.load('b6b093b829dd43b8beabf30869778a32').then(prefab => {
            this.shootEffectPrefab = prefab;
        }).catch(err => console.error("Failed to load shoot effect prefab:", err));
    }

    gainExp(amount) {
        this.exp += amount;
        if (this.exp >= this.maxExp) {
            this.levelUp();
        }

        // Update UI (Assuming UIManager handles this via event or direct call)
        if (window.game && window.game.uiManager) {
            window.game.uiManager.updateExpBar(this.exp, this.maxExp, this.level);
        }
    }

    levelUp() {
        this.level++;
        this.exp -= this.maxExp;
        this.maxExp = Math.floor(this.maxExp * 1.2); // Increase requirement by 20%

        // Trigger Level Up Event
        if (window.game) {
            window.game.onLevelUp(this.level);
        }

        // Check if we have enough exp for another level
        if (this.exp >= this.maxExp) {
            this.levelUp();
        }
    }

    recalcStats() {
        // Reset to base
        this.maxHp = this.baseStats.hp;
        this.speed = this.baseStats.speed;
        this.attackRange = this.baseStats.attackRange;
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
            // Weapon can also modify attack range
            if (weapon.attackRange !== undefined) {
                this.attackRange = weapon.attackRange;
            }
        } else {
            this.damage = 1;
            this.fireRate = 30;
            this.maxAmmo = 0;
        }

        // Clamp HP
        this.hp = Math.min(this.hp, this.maxHp);
    }

    initVisuals() {
        // Find Visuals child for rendering components
        let visualsGO = this.gameObject;
        if (this.gameObject.transform.children && this.gameObject.transform.children.length > 0) {
            const visualTransform = this.gameObject.transform.children.find(t => t.gameObject.name === 'Visuals');
            if (visualTransform) {
                visualsGO = visualTransform.gameObject;
                // console.log("Player: Visuals child found.");
            }
        }

        // Only update if we found something or if we haven't set them yet
        const sr = visualsGO.getComponent('SpriteRenderer');
        if (sr) this.spriteRenderer = sr;

        const anim = visualsGO.getComponent('Animator');
        if (anim) this.animator = anim;
    }

    update(dt) {
        const input = window.game.inputManager;

        // Ensure visuals are linked (in case start() ran before children were created)
        if (!this.animator || !this.spriteRenderer) {
            this.initVisuals();
        }

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
            const len = Math.sqrt(moveX * moveX + moveY * moveY);
            moveX /= len;
            moveY /= len;

            const forceMagnitude = this.speed * this.rb.drag * this.rb.mass * 10;
            this.rb.addForce(moveX * forceMagnitude, moveY * forceMagnitude);
        }

        // 边界限制 (world is centered at 0,0)
        // Note: accessing this.x/y via getters which proxy to transform
        this.x = Math.max(-this.worldHalfWidth + this.r, Math.min(this.worldHalfWidth - this.r, this.x));
        this.y = Math.max(-this.worldHalfHeight + this.r, Math.min(this.worldHalfHeight - this.r, this.y));

        const isMoving = moveX !== 0 || moveY !== 0;
        if (this.animator) {
            if (isMoving) {
                if (this.animator.play) this.animator.play('Run');
            } else {
                if (this.animator.play) this.animator.play('Idle');
            }
        }

        // --- Combat Logic ---
        this.handleCombat(input);
    }

    findNearestEnemy() {
        if (!window.enemyManager) return null;
        let nearest = null;
        let minDistSq = Infinity;
        const rangeSq = this.attackRange * this.attackRange; // Use attack range

        // Use activeEnemies list
        const enemies = window.enemyManager.activeEnemies || [];

        for (const enemy of enemies) {
            if (!enemy.active || enemy.destroyed) continue;

            const dx = enemy.transform.x - this.x;
            const dy = enemy.transform.y - this.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < rangeSq && distSq < minDistSq) {
                minDistSq = distSq;
                nearest = enemy;
            }
        }
        return nearest;
    }

    handleCombat(input) {
        const enemy = this.findNearestEnemy();
        let angle = 0;
        let hasTarget = false;

        if (enemy) {
            hasTarget = true;
            // Aim at enemy
            const dx = enemy.transform.x - this.x;
            const dy = enemy.transform.y - this.y;
            angle = Math.atan2(dy, dx);

            // Face Enemy
            const isLeft = dx < 0;
            this.gameObject.transform.localScale.x = isLeft ? -1 : 1;

            // Auto Fire - Only if enemy is within attack range
            const distSq = dx * dx + dy * dy;
            if (distSq <= this.attackRange * this.attackRange) {
                if (this.fireTimer <= 0 && !this.isReloading) {
                    if (this.ammo > 0) {
                        this.fire(angle);
                    } else {
                        this.startReload();
                    }
                }
            }
        } else {
            // No enemy in range, face movement direction
            if (input.getKey('a')) {
                this.gameObject.transform.localScale.x = -1;
                angle = Math.PI;
            } else if (input.getKey('d')) {
                this.gameObject.transform.localScale.x = 1;
                angle = 0;
            } else {
                // Keep facing direction
                angle = this.gameObject.transform.localScale.x > 0 ? 0 : Math.PI;
            }
        }

        // Rotate Weapon
        if (this.weaponGO) {
            // Flip weapon if aiming left
            const isLeft = Math.abs(angle) > Math.PI / 2;
            this.weaponGO.transform.scale.y = isLeft ? -1 : 1;
            this.weaponGO.transform.rotation = angle;

            // Adjust weapon position relative to player (orbit)
            const orbitRadius = 20;
            this.weaponGO.transform.x = this.x + Math.cos(angle) * orbitRadius;
            this.weaponGO.transform.y = this.y + Math.sin(angle) * orbitRadius;
        }
    }

    fire(angle) {
        this.fireTimer = 60 / this.fireRate; // Frames between shots
        this.consumeAmmo();

        // Spawn Shoot Effect
        if (this.shootEffectPrefab) {
            // Spawn as child of player so it follows
            this.shootEffectPrefab.instantiate(null, this.gameObject);
        }

        // Spawn Bullet
        // Muzzle offset (approximate)
        const muzzleDist = this.muzzleDistance;
        const spawnX = this.x + Math.cos(angle) * muzzleDist;
        const spawnY = this.y + Math.sin(angle) * muzzleDist;

        const bullet = new Bullet(spawnX, spawnY, angle, this.equipment.weapon || {}, this.worldWidth, this.worldHeight);

        // Add to scene
        if (window.game && window.game.sceneManager && window.game.sceneManager.activeScene) {
            window.game.sceneManager.activeScene.add(bullet);
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
