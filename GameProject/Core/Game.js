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

        this.uiManager = new UIManager(this);
        this.uiManager.showTown(); // Ensure UI is in correct state

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Input listeners
        window.addEventListener('keydown', e => this.input.keys[e.key] = true);
        window.addEventListener('keyup', e => this.input.keys[e.key] = false);
        // Auto-shoot implemented in update loop, mouse click removed
        /*
        window.addEventListener('mousedown', e => {
            if (this.state === 'PLAYING') {
                this.shoot(e.clientX, e.clientY);
            }
        });
        */

        // Initialize player
        this.player = new Player(this.worldWidth, this.worldHeight);

        // Card Manager
        this.cardManager = new CardManager();

        // Particle System Manager
        this.particleSystemManager = new ParticleSystemManager();

        // TEST: Follow Player Particle System
        this.testPs = this.particleSystemManager.addSystem({
            x: 0, y: 0,
            duration: 1.0,
            looping: true,
            startLifetime: { min: 0.5, max: 1.0 },
            startSpeed: { min: 3, max: 6 },
            startSize: { min: 3, max: 6 },
            startColor: [0, 1, 0.5, 0.8], // Teal/Green
            emission: {
                rateOverTime: 0,
                bursts: [
                    { time: 0, count: 10 }
                ]
            },
            shape: {
                angle: 0,
                arc: Math.PI * 2
            }
        });

        // GM Manager
        this.gmManager = new GMManager(this);

        // Pause Listener
        window.addEventListener('keydown', e => {
            // console.log('Key pressed:', e.key, e.code, this.state);
            if (e.key === 'Escape' || e.code === 'Escape') {
                if (this.state === 'PLAYING') {
                    this.togglePause(true);
                } else if (this.state === 'PAUSED') {
                    this.togglePause(false);
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
        this.uiManager.showTown();
    }

    startLevel(lvl) {
        this.level = lvl;
        this.state = 'PLAYING';
        this.resetGame();
        this.uiManager.showHUD();
    }

    resetGame() {
        this.player.x = this.worldWidth/2;
        this.player.y = this.worldHeight/2;
        this.player.hp = this.player.maxHp;
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
            
            this.obstacles.push({x, y, r});
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
            // If count > 1, spread evenly. If count == 1, random spread?
            // Let's do random spread for all for simplicity, or even spread for shotgun
            let angle = baseAngle;
            if (count > 1) {
                // Even spread
                const startAngle = baseAngle - spread / 2;
                const step = spread / (count - 1);
                angle = startAngle + step * i;
            } else {
                // Random spread
                angle += (Math.random() - 0.5) * spread;
            }

            this.bullets.push(new Bullet(this.player.x, this.player.y, angle, weapon, this.worldWidth, this.worldHeight));
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
            this.enemies.push(new Enemy(ex, ey));
        }
    }

    spawnBoss() {
        this.bossSpawned = true;
        this.enemies = []; 
        this.enemies.push(new Enemy(this.player.x + 400, this.player.y, true)); // Spawn near player
        this.uiManager.showBossLabel();
    }

    update() {
        if (this.state !== 'PLAYING') return;

        this.player.update(this.input);

        // TEST: Update particle system position
        if (this.testPs) {
            this.testPs.x = this.player.x;
            this.testPs.y = this.player.y;
        }

        // Player vs Obstacles
        this.obstacles.forEach(obs => {
            if (checkCol(this.player, obs)) {
                // Simple push back
                const dx = this.player.x - obs.x;
                const dy = this.player.y - obs.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                const overlap = (this.player.r + obs.r) - dist;
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
                if (checkCol(b, obs)) return false;
            }
            return true;
        });

        this.spawnEnemy();

        this.enemies.forEach(e => {
            e.update(this.player);
            
            // Enemy vs Obstacles (Simple avoidance/slide)
            this.obstacles.forEach(obs => {
                if (checkCol(e, obs)) {
                    const dx = e.x - obs.x;
                    const dy = e.y - obs.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    const overlap = (e.r + obs.r) - dist;
                    if (dist > 0) {
                        e.x += (dx/dist) * overlap;
                        e.y += (dy/dist) * overlap;
                    }
                }
            });

            if (checkCol(this.player, e)) {
                this.player.hp -= 0.5;
                if (this.player.hp <= 0) {
                    this.gameOver();
                }
            }

            this.bullets.forEach(b => {
                if (b.active && checkCol(b, e)) {
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
            if (checkCol(this.player, l)) {
                l.active = false;
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
        // Convert hex color to 0-1 rgba if needed, but for now let's just use yellow/red
        // Or parse enemy.color. For simplicity, hardcode explosion color based on enemy type or just generic
        this.particleSystemManager.createExplosion(enemy.x, enemy.y, [1, 0, 0, 1]);

        if (enemy.isBoss) {
            this.victory();
            return;
        }

        if (Math.random() < 0.3) {
            // 30% chance for item loot (currently just damage boost)
            // this.loots.push(new Loot(enemy.x, enemy.y, 'item'));
        }
        
        // Always drop EXP
        this.loots.push(new Loot(enemy.x, enemy.y, 'exp', 20)); // 20 EXP per kill
    }

    loadData() {
        const saved = localStorage.getItem('officeMageSave');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.maxLevel = data.maxLevel || 1;
                this.metaData = data.metaData || {
                    talents: { hp: 0, atk: 0, spd: 0 },
                    inventory: [],
                    gold: 0
                };
            } catch (e) {
                console.error("Save file corrupted", e);
            }
        }
    }

    saveData() {
        const data = {
            maxLevel: this.maxLevel,
            metaData: this.metaData
        };
        localStorage.setItem('officeMageSave', JSON.stringify(data));
    }

    clearData(type) {
        if (type === 'talents') {
            this.metaData.talents = { hp: 0, atk: 0, spd: 0 };
            alert("天赋已重置");
        } else if (type === 'inventory') {
            this.metaData.inventory = [];
            alert("背包已清空");
        } else if (type === 'levels') {
            this.maxLevel = 1;
            alert("关卡进度已重置");
        } else {
            // Clear all
            localStorage.removeItem('officeMageSave');
            this.maxLevel = 1;
            this.metaData = {
                talents: { hp: 0, atk: 0, spd: 0 },
                inventory: [],
                gold: 0
            };
            alert("所有存档已清除");
            this.backToTown();
        }
        this.saveData();
    }

    completeLevel() {
        if (this.level === this.maxLevel) {
            this.maxLevel++;
        }
        this.metaData.gold += 100 * this.level;
        this.saveData();
    }

    gameOver() {
        this.state = 'GAMEOVER';
        this.uiManager.showGameOver();
    }

    victory() {
        this.state = 'VICTORY';
        this.completeLevel();
        this.uiManager.showVictory();
    }

    triggerLevelUp() {
        this.state = 'LEVEL_UP';
        const choices = this.cardManager.getChoices(3);
        this.uiManager.showLevelUp(this.player.level, choices, (card) => {
            card.apply(this);
            this.state = 'PLAYING';
        });
    }

    draw() {
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);

        this.ctx.strokeStyle = '#444';
        this.ctx.lineWidth = 1;
        const gridSize = 50;
        // Draw grid covering the whole world
        for(let x=0; x<=this.worldWidth; x+=gridSize) { 
            this.ctx.beginPath(); this.ctx.moveTo(x,0); this.ctx.lineTo(x,this.worldHeight); this.ctx.stroke(); 
        }
        for(let y=0; y<=this.worldHeight; y+=gridSize) { 
            this.ctx.beginPath(); this.ctx.moveTo(0,y); this.ctx.lineTo(this.worldWidth,y); this.ctx.stroke(); 
        }

        // Draw World Borders
        this.ctx.strokeStyle = '#f00';
        this.ctx.lineWidth = 5;
        this.ctx.strokeRect(0, 0, this.worldWidth, this.worldHeight);

        if (this.state === 'PLAYING') {
            // Draw Obstacles
            this.ctx.fillStyle = '#555';
            this.obstacles.forEach(obs => {
                this.ctx.beginPath();
                this.ctx.arc(obs.x, obs.y, obs.r, 0, Math.PI*2);
                this.ctx.fill();
                this.ctx.stroke();
            });

            this.loots.forEach(l => l.draw(this.ctx));
            this.enemies.forEach(e => e.draw(this.ctx));
            this.bullets.forEach(b => b.draw(this.ctx));
            this.player.draw(this.ctx);
            
            this.particleSystemManager.draw(this.ctx);
        }

        this.ctx.restore();
    }

    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(this.loop);
    }
}
