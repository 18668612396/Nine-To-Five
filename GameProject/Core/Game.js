// Imports removed for non-module support

class Game extends EngineObject {
    constructor() {
        super('GameManager');
        this.container = document.getElementById('gameContainer');
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false; // 设置纹理采样为 Point (最近邻)
        
        // Fixed resolution
        this.designWidth = 1280;
        this.designHeight = 720;
        
        // World Size
        this.worldWidth = 2500;
        this.worldHeight = 2500;
        this.camera = { x: 0, y: 0 };
        this.obstacles = [];

        this.state = 'TOWN'; // TOWN, PLAYING, GAMEOVER
        this.player = null;
        this.bullets = [];
        this.enemies = [];
        this.loots = [];
        this.input = { keys: {} };
        
        this.level = 1;
        this.survivalTime = 0;
        this.maxSurvivalTime = 600; // 10 minutes in seconds
        this.bossSpawned = false;

        // Persistent Data
        this.maxLevel = 1;
        this.metaData = {
            talents: { hp: 0, atk: 0, spd: 0 },
            inventory: [],
            gold: 0
        };
        
        this.loadData();

        this.sceneManager = new SceneManager(this);
        this.uiManager = new UIManager(this);
        
        // Initialize player (Persistent)
        this.player = new Player(this.worldWidth, this.worldHeight);

        // Card Manager
        this.cardManager = new CardManager();

        // Particle System Manager
        this.particleSystemManager = new ParticleSystemManager();

        // GM Manager
        this.gmManager = new GMManager(this);

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Input listeners
        window.addEventListener('keydown', e => this.input.keys[e.key] = true);
        window.addEventListener('keyup', e => this.input.keys[e.key] = false);

        // Pause Listener
        window.addEventListener('keydown', e => {
            if (e.key === 'Escape' || e.code === 'Escape') {
                if (this.state === 'PLAYING') {
                    this.togglePause(true);
                } else if (this.state === 'PAUSED') {
                    this.togglePause(false);
                }
            }
        });

        // Start in Town
        this.backToTown();

        // Start loop
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }                    this.togglePause(false);
                }
            }
        });

        // Start loop
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    resize() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const scaleX = windowWidth / this.designWidth;
        const scaleY = windowHeight / this.designHeight;
        
        // Fit to window while maintaining aspect ratio
        const scale = Math.min(scaleX, scaleY);
        
        this.container.style.width = `${this.designWidth * scale}px`;
        this.container.style.height = `${this.designHeight * scale}px`;
        
        // Canvas internal resolution stays constant
        this.canvas.width = this.designWidth;
        this.canvas.height = this.designHeight;

        // Player boundaries are now world based, not canvas based
        // if (this.player) {
        //     this.player.canvasWidth = this.canvas.width;
        //     this.player.canvasHeight = this.canvas.height;
        // }
    }

    togglePause(isPaused) {
        if (isPaused) {
            this.state = 'PAUSED';
            this.uiManager.showPauseMenu();
        } else {
            this.state = 'PLAYING';
            this.uiManager.hidePauseMenu();
            this.gmManager.hide();
        }
    }

    openLevelSelect() {
        this.uiManager.showLevelSelect();
    }

    backToTown() {
        this.state = 'TOWN';
        resourceManager.load('assets/scenes/main.scene').then(scene => {
            this.sceneManager.loadScene(scene);
            this.uiManager.showTown();
        });
    }

    startLevel(lvl) {
        this.level = lvl;
        this.state = 'PLAYING';
        
        resourceManager.load('assets/scenes/fighting.scene').then(scene => {
            this.sceneManager.loadScene(scene);
            this.resetGame(); // This will populate the scene
            this.uiManager.showHUD();
        });
    }

    resetGame() {
        const scene = this.sceneManager.currentScene;
        if (!scene) return;

        this.player.x = this.worldWidth/2;
        this.player.y = this.worldHeight/2;
        this.player.hp = this.player.maxHp;
        
        // Add Player to Scene
        scene.add(this.player);

        this.bullets = [];
        this.enemies = [];
        this.loots = [];
        this.obstacles = [];
        this.survivalTime = 0;
        this.bossSpawned = false;
        
        // Generate Obstacles
        for(let i=0; i<20; i++) {
            const r = 30 + Math.random() * 50;
            const x = Math.random() * (this.worldWidth - 2*r) + r;
            const y = Math.random() * (this.worldHeight - 2*r) + r;
            // Avoid spawning on player
            const dx = x - this.player.x;
            const dy = y - this.player.y;
            if (Math.sqrt(dx*dx + dy*dy) < 300) continue;
            
            // Convert Obstacle to GameObject
            const obs = new GameObject('Obstacle', x, y);
            obs.r = r; // Keep for legacy or just use collider
            obs.addComponent(new StaticRenderer('#555', r*2, r*2, 'circle'));
            obs.addComponent(new CircleCollider(r));
            
            this.obstacles.push(obs);
            scene.add(obs); // Add to Scene
        }

        this.uiManager.update(this.player, this.survivalTime, this.maxSurvivalTime);
    }

    shoot(tx, ty) {
        const weapon = this.player.getWeaponConfig();
        if (!weapon) return;

        // Consume ammo
        if (!this.player.consumeAmmo()) return;

        const baseAngle = Math.atan2(ty - this.player.y, tx - this.player.x);
        const count = weapon.count || 1;
        const spread = weapon.spread || 0;

        for (let i = 0; i < count; i++) {
            // Calculate spread
            let angle = baseAngle;
            if (count > 1) {
                const startAngle = baseAngle - spread / 2;
                const step = spread / (count - 1);
                angle = startAngle + step * i;
            } else {
                angle += (Math.random() - 0.5) * spread;
            }

            const bullet = new Bullet(this.player.x, this.player.y, angle, weapon, this.worldWidth, this.worldHeight);
            this.bullets.push(bullet);
            this.sceneManager.currentScene.add(bullet); // Add to Scene
        }
    }

    spawnEnemy() {
        if (this.bossSpawned) return;
        const chance = 0.02 + (this.level * 0.005);
        if (Math.random() < chance) {
            // Spawn outside camera view but within world
            let ex, ey;
            // Simple random spawn for now
            ex = Math.random() * this.worldWidth;
            ey = Math.random() * this.worldHeight;
            
            const enemy = new Enemy(ex, ey);
            this.enemies.push(enemy);
            this.sceneManager.currentScene.add(enemy); // Add to Scene
        }
    }

    spawnBoss() {
        this.bossSpawned = true;
        // Clear existing enemies? Maybe not
        // this.enemies = []; 
        const boss = new Enemy(this.player.x + 400, this.player.y, true);
        this.enemies.push(boss); 
        this.sceneManager.currentScene.add(boss); // Add to Scene
        this.uiManager.showBossLabel();
    }

    update() {
        if (this.state !== 'PLAYING') return;

        // Update Scene (Updates all GameObjects)
        this.sceneManager.update(1/60);

        // TEST: Update particle system position
        if (this.testPs) {
            this.testPs.x = this.player.x;
            this.testPs.y = this.player.y;
        }

        // Player vs Obstacles
        this.obstacles.forEach(obs => {
            if (checkCol(this.player.collider, obs.getComponent('CircleCollider'))) {
                // Simple push back
                const dx = this.player.x - obs.x;
                const dy = this.player.y - obs.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                const overlap = (this.player.collider.radius + obs.getComponent('CircleCollider').radius) - dist;
                if (dist > 0) {
                    this.player.x += (dx/dist) * overlap;
                    this.player.y += (dy/dist) * overlap;
                }
            }
        });

        // Camera Follow
        const targetX = this.player.x - this.canvas.width / 2;
        const targetY = this.player.y - this.canvas.height / 2;
        // Smooth follow with buffer
        this.camera.x += (targetX - this.camera.x) * 0.1;
        this.camera.y += (targetY - this.camera.y) * 0.1;
        
        // Clamp Camera
        this.camera.x = Math.max(0, Math.min(this.camera.x, this.worldWidth - this.canvas.width));
        this.camera.y = Math.max(0, Math.min(this.camera.y, this.worldHeight - this.canvas.height));

        // Auto Shoot Logic
        if (this.player.fireTimer <= 0) {
            let nearest = null;
            let minDist = Infinity;
            for (const enemy of this.enemies) {
                const dx = enemy.x - this.player.x;
                const dy = enemy.y - this.player.y;
                const dist = dx*dx + dy*dy;
                // Only shoot if within range (e.g. screen size)
                if (dist < 1000*1000 && dist < minDist) {
                    minDist = dist;
                    nearest = enemy;
                }
            }

            if (nearest) {
                this.shoot(nearest.x, nearest.y);
                this.player.fireTimer = this.player.fireRate;
            }
        }

        this.bullets.forEach(b => b.update());
        // Bullet vs Obstacles
        this.bullets = this.bullets.filter(b => {
            if (!b.active) return false;
            for (const obs of this.obstacles) {
                if (checkCol(b.collider, obs.getComponent('CircleCollider'))) return false;
            }
            return true;
        });

        this.spawnEnemy();

        this.enemies.forEach(e => {
            e.update(this.player);
            
            // Enemy vs Obstacles (Simple avoidance/slide)
            this.obstacles.forEach(obs => {
                if (checkCol(e.collider, obs.getComponent('CircleCollider'))) {
                    const dx = e.x - obs.x;
                    const dy = e.y - obs.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    const overlap = (e.collider.radius + obs.getComponent('CircleCollider').radius) - dist;
                    if (dist > 0) {
                        e.x += (dx/dist) * overlap;
                        e.y += (dy/dist) * overlap;
                    }
                }
            });

            if (checkCol(this.player.collider, e.collider)) {
                this.player.hp -= 0.5;
                if (this.player.hp <= 0) {
                    this.gameOver();
                }
            }

            this.bullets.forEach(b => {
                if (b.active && checkCol(b.collider, e.collider)) {
                    // Check if already hit this enemy
                    if (b.hitList.includes(e.id)) return;
                    
                    b.hitList.push(e.id);
                    e.hp -= b.damage; // Use bullet damage
                    
                    // Hit Effect
                    this.particleSystemManager.createHitEffect(b.x, b.y);

                    // Handle Pierce
                    if (b.pierce > 0) {
                        b.pierce--;
                    } else {
                        b.active = false;
                    }

                    if (e.hp <= 0) {
                        e.active = false;
                        this.handleKill(e);
                    }
                }
            });
        });
        this.enemies = this.enemies.filter(e => e.active);

        this.loots.forEach(l => {
            if (checkCol(this.player.collider, l.collider)) {
                l.active = false;
                if (this.sceneManager.currentScene) this.sceneManager.currentScene.remove(l); // Remove from Scene
                
                if (l.type === 'exp') {
                    const leveledUp = this.player.gainExp(l.value);
                    if (leveledUp) {
                        this.triggerLevelUp();
                    }
                } else {
                    this.player.damage += 2;
                    this.uiManager.showLootMsg("获得装备：攻击力 +2 !");
                }
            }
        });
        this.loots = this.loots.filter(l => l.active);

        // Update Particles
        this.particleSystemManager.update(1/60);

        // Update Timer
        this.survivalTime += 1/60; // Assuming 60 FPS
        if (!this.bossSpawned && this.survivalTime >= this.maxSurvivalTime) {
            this.spawnBoss();
        }

        this.uiManager.update(this.player, this.survivalTime, this.maxSurvivalTime);
    }

    handleKill(enemy) {
        // Death Effect
        this.particleSystemManager.createExplosion(enemy.x, enemy.y, [1, 0, 0, 1]);

        // Remove from Scene
        if (this.sceneManager.currentScene) {
            this.sceneManager.currentScene.remove(enemy);
        }

        if (enemy.isBoss) {
            this.victory();
            return;
        }

        if (Math.random() < 0.3) {
            // 30% chance for item loot (currently just damage boost)
            // this.loots.push(new Loot(enemy.x, enemy.y, 'item'));
        }
        
        // Always drop EXP
        const loot = new Loot(enemy.x, enemy.y, 'exp', 20);
        this.loots.push(loot);
        if (this.sceneManager.currentScene) {
            this.sceneManager.currentScene.add(loot);
        }
    }

    // ...existing code...

    draw() {
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);

        // Draw Scene (Backgrounds, Objects, Entities)
        this.sceneManager.draw(this.ctx);

        // Draw Particles on top
        this.particleSystemManager.draw(this.ctx);

        // Draw World Borders (Debug/Visual)
        this.ctx.strokeStyle = '#f00';
        this.ctx.lineWidth = 5;
        this.ctx.strokeRect(0, 0, this.worldWidth, this.worldHeight);

        this.ctx.restore();
    }

    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(this.loop);
    }
}
