// Imports removed for non-module support

class Game extends EngineObject {
    constructor() {
        super('GameManager');
        this.container = document.getElementById('gameContainer');
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = true; // 设置纹理采样为 Linear (平滑)
        this.ctx.imageSmoothingQuality = 'high';
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
        
        // Input Manager
        this.inputManager = new InputManager(this.canvas);
        this.input = this.inputManager; // Backward compatibility
        
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
        
        // Card Manager
        this.cardManager = new CardManager();

        // GM Manager
        this.gmManager = new GMManager(this);

        // Render Pipeline
        this.renderPipeline = new RenderPipeline(this);

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Start in Town
        this.backToTown();

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
        // Load Main Scene using GUID
        resourceManager.load('898eed6b26204a9cb03790ec74b3c7cd').then(scene => {
            console.log("Loaded Main Scene:", scene);
            this.sceneManager.loadScene(scene, LoadSceneMode.Single);
            this.uiManager.showTown();
        }).catch(e => console.error("Failed to load main scene:", e));
    }

    startLevel(lvl) {
        this.level = lvl;
        this.state = 'PLAYING';
        
        console.log("Starting level " + lvl);
        console.log("LoadSceneMode:", window.LoadSceneMode);

        // Load Fighting Scene using GUID
        resourceManager.load('7cfb61dee1d145b48eb928514b64b18c').then(scene => {
            console.log("Loaded fighting scene", scene);
            // Force mode 0 (Single) to ensure unload
            this.sceneManager.loadScene(scene, 0);
            this.resetGame(); // This will populate the scene
            this.uiManager.showHUD();
        }).catch(err => {
            console.error("Failed to load fighting scene:", err);
        });
    }

    resetGame() {
        const scene = this.sceneManager.activeScene;
        if (!scene) return;

        // Create Main Camera if not exists
        if (!scene.gameObjects.find(go => go.getComponent('Camera'))) {
            const cameraGO = new GameObject('MainCamera');
            const camera = new Camera();
            cameraGO.addComponent(camera);
            scene.add(cameraGO);
            this.cameraGO = cameraGO; // Keep reference
            
            // Snap camera to player immediately to avoid black screen during pan
            if (this.player) {
                this.cameraGO.transform.x = this.player.x;
                this.cameraGO.transform.y = this.player.y;
            }
        } else {
            this.cameraGO = scene.gameObjects.find(go => go.getComponent('Camera'));
        }

        // Find Player in Scene
        const playerGO = scene.gameObjects.find(go => go.name === 'Player');
        if (playerGO) {
            this.playerGameObject = playerGO;
            this.player = playerGO.getComponent('Player');
        } else {
            console.error("Player not found in scene!");
            return;
        }

        this.player.x = this.worldWidth/2;
        this.player.y = this.worldHeight/2;
        this.player.hp = this.player.maxHp;
        
        this.bullets = [];
        this.enemies = [];
        this.loots = [];
        this.obstacles = [];
        this.survivalTime = 0;
        this.bossSpawned = false;
        
        // Generate Obstacles - Removed as per request
        // for(let i=0; i<20; i++) { ... }

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
            this.sceneManager.activeScene.add(bullet); // Add to Scene
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
            
            const enemyGO = new GameObject('Enemy');
            const enemyComp = new Enemy();
            enemyComp.onLoad({ x: ex, y: ey, isBoss: false });
            enemyGO.addComponent(enemyComp);
            
            this.enemies.push(enemyComp);
            this.sceneManager.activeScene.add(enemyGO); // Add to Scene
        }
    }

    spawnBoss() {
        this.bossSpawned = true;
        // Clear existing enemies? Maybe not
        // this.enemies = []; 
        const bossGO = new GameObject('Boss');
        const bossComp = new Enemy();
        bossComp.onLoad({ x: this.player.x + 400, y: this.player.y, isBoss: true });
        bossGO.addComponent(bossComp);
        
        this.enemies.push(bossComp); 
        this.sceneManager.activeScene.add(bossGO); // Add to Scene
        this.uiManager.showBossLabel();
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

    checkCollisions() {
        // Bullets vs Enemies
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            if (!bullet.active) {
                this.bullets.splice(i, 1);
                if (this.sceneManager.activeScene) this.sceneManager.activeScene.remove(bullet);
                continue;
            }

            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (!enemy.gameObject || !enemy.collider) continue;

                if (bullet.collider && bullet.collider.checkCollision(enemy.collider)) {
                    enemy.hp -= bullet.damage;
                    
                    if (bullet.pierce > 0) {
                        if (!bullet.hitList.includes(enemy)) {
                            bullet.hitList.push(enemy);
                            bullet.pierce--;
                        } else {
                            continue;
                        }
                    } else {
                        bullet.active = false;
                    }

                    if (enemy.hp <= 0) {
                        this.handleKill(enemy);
                        this.enemies.splice(j, 1);
                        if (this.sceneManager.activeScene) this.sceneManager.activeScene.remove(enemy.gameObject);
                    }

                    if (!bullet.active) break;
                }
            }
        }

        // Player vs Loot
        for (let i = this.loots.length - 1; i >= 0; i--) {
            const loot = this.loots[i];
            if (this.player && this.player.collider && loot.collider) {
                if (this.player.collider.checkCollision(loot.collider)) {
                    if (loot.type === 'exp') {
                        this.player.gainExp(loot.value);
                    }
                    this.loots.splice(i, 1);
                    if (this.sceneManager.activeScene) this.sceneManager.activeScene.remove(loot);
                }
            }
        }
    }

    onLevelUp(level) {
        console.log(`Level Up! New Level: ${level}`);
        this.togglePause(true);
        
        // Show Level Up UI
        if (this.uiManager) {
            this.uiManager.showLevelUp(level);
        }
    }

    update() {
        // Global Input
        if (this.inputManager.getKeyDown('Escape')) {
            if (this.state === 'PLAYING') {
                this.togglePause(true);
            } else if (this.state === 'PAUSED') {
                this.togglePause(false);
            }
        }

        // Debug: Print Hierarchy
        if (this.inputManager.getKeyDown('h')) {
            console.log("%c=== Scene Hierarchy ===", "color: cyan; font-weight: bold; font-size: 14px;");
            
            const printNode = (go) => {
                const style = go.active ? "color: #e0e0e0; font-weight: bold;" : "color: #888;";
                // Use groupCollapsed to keep it tidy, or group to see everything
                console.groupCollapsed(`%c📦 ${go.name} [${go.constructor.name}]`, style);
                
                // Components
                if (go.components && go.components.length > 0) {
                    console.log("%c🧩 Components:", "color: #aaa; font-size: 10px; font-weight: bold;");
                    go.components.forEach(c => {
                        // c.name is usually the class name or set name
                        console.groupCollapsed(`%c   • ${c.name || c.constructor.name}`, "color: #81c784;");
                        
                        // Filter properties for display
                        const displayProps = {};
                        // Get all keys including inherited ones if needed, but usually instance props are enough
                        for (const key in c) {
                            // Skip functions, gameObject reference, and private members
                            if (typeof c[key] === 'function') continue;
                            if (key === 'gameObject') continue;
                            if (key.startsWith('_')) continue;
                            
                            // Handle objects nicely
                            if (typeof c[key] === 'object' && c[key] !== null) {
                                // If it's a simple object, show it. If it's complex, maybe just type
                                if (c[key].constructor && c[key].constructor.name !== 'Object') {
                                    displayProps[key] = `[${c[key].constructor.name}]`;
                                } else {
                                    displayProps[key] = c[key];
                                }
                            } else {
                                displayProps[key] = c[key];
                            }
                        }
                        console.log(displayProps);
                        console.groupEnd();
                    });
                }
                
                // Children
                if (go.transform.children && go.transform.children.length > 0) {
                    console.log("%c👶 Children:", "color: #aaa; font-size: 10px; font-weight: bold;");
                    go.transform.children.forEach(childTrans => {
                        if (childTrans.gameObject) {
                            printNode(childTrans.gameObject);
                        }
                    });
                }
                console.groupEnd();
            };

            if (this.sceneManager.activeScene) {
                // Find root objects (objects without parent)
                this.sceneManager.activeScene.gameObjects.forEach(go => {
                    if (!go.transform.parent) {
                        printNode(go);
                    }
                });
            }
            console.log("=======================");
        }

        if (this.state === 'TOWN') {
            this.sceneManager.update(1/60);
            // Reset Camera if exists
            if (window.Camera && window.Camera.main) {
                window.Camera.main.gameObject.transform.x = this.canvas.width / 2;
                window.Camera.main.gameObject.transform.y = this.canvas.height / 2;
            }
            return;
        }

        if (this.state !== 'PLAYING') return;

        // Update Scene (Updates all GameObjects)
        this.sceneManager.update(1/60);

        if (!this.player) return;

        // Camera Follow
        if (this.cameraGO) {
            // Update Camera GameObject Transform (Center on player)
            let targetX = this.player.x;
            let targetY = this.player.y;
            
            // Clamp Camera
            const halfW = this.canvas.width / 2;
            const halfH = this.canvas.height / 2;
            targetX = Math.max(halfW, Math.min(targetX, this.worldWidth - halfW));
            targetY = Math.max(halfH, Math.min(targetY, this.worldHeight - halfH));

            // Smooth follow
            this.cameraGO.transform.x += (targetX - this.cameraGO.transform.x) * 0.1;
            this.cameraGO.transform.y += (targetY - this.cameraGO.transform.y) * 0.1;
        }

        this.checkCollisions();

        this.uiManager.update(this.player, this.survivalTime, this.maxSurvivalTime);
    }

    handleKill(enemy) {
        // Death Effect is now handled by Enemy.js die() method

        // Remove from Scene
        if (this.sceneManager.activeScene) {
            this.sceneManager.activeScene.remove(enemy.gameObject || enemy);
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
        if (this.sceneManager.activeScene) {
            this.sceneManager.activeScene.add(loot);
        }
    }

    draw() {
        // Use Render Pipeline
        this.renderPipeline.beginFrame();

        // 1. Collect Render Commands from Scene
        if (this.sceneManager.activeScene) {
            // We need to expose a way to get renderers or iterate objects
            // For now, let's iterate gameObjects and find renderers
            // Ideally SceneManager or Scene should handle this collection
            const scene = this.sceneManager.activeScene;
            
            // Camera Setup
            const camera = window.Camera && window.Camera.main;
            if (camera) {
                // Camera.apply() internally calls ctx.save() and sets transform.
                // We need to make sure we restore it later.
                // But wait, Camera.apply() clears the screen too.
                // And RenderPipeline.beginFrame() also clears the screen.
                // This is redundant but fine.
                
                camera.apply(this.ctx);
            }

            // Collect
            for (const go of scene.gameObjects) {
                if (!go.active) continue;
                const renderers = go.components.filter(c => c instanceof Renderer);
                for (const r of renderers) {
                    if (r.visible) r.render(this.renderPipeline);
                }
            }
        }

        // Execute Pipeline
        this.renderPipeline.endFrame();

        // Restore Camera
        if (window.Camera && window.Camera.main) {
            // Camera.apply() did a ctx.save(), so we must restore it.
            // But Camera.js has a reset() method for this?
            // Let's use reset() if available, or manual restore.
            window.Camera.main.reset(this.ctx);
        }

        // Draw World Borders (Debug/Visual)
        this.ctx.save();
        if (window.Camera && window.Camera.main) window.Camera.main.apply(this.ctx);
        this.ctx.strokeStyle = '#f00';
        this.ctx.lineWidth = 5;
        this.ctx.strokeRect(0, 0, this.worldWidth, this.worldHeight);
        this.ctx.restore();
    }

    loop() {
        this.update();
        this.draw();
        this.inputManager.update();
        requestAnimationFrame(this.loop);
    }
}
