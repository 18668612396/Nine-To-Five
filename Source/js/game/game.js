// --- 游戏主控制器 ---

const Game = {
    state: 'MENU',  // MENU, PLAYING, PAUSED, LEVEL_UP, INVENTORY, GAME_OVER, WEAPON_DROP
    
    // 游戏对象
    player: null,
    enemies: [],
    gems: [],
    projectiles: [],
    skillDrops: [],
    sceneElements: [],
    
    // 游戏状态
    frameCount: 0,
    time: 0,
    kills: 0,
    level: 1,
    xp: 0,
    xpToNext: 10,
    gold: 0,
    goldMult: 1,
    
    // 统计数据
    damageTaken: 0,
    damageDealt: 0,
    bossKills: 0,
    maxCombo: 0,
    currentCombo: 0,
    lastKillTime: 0,
    
    // 难度系数
    difficultyMult: { enemy: 1, spawn: 1, reward: 1 },
    
    // 当前配置
    currentConfig: null,
    
    // 初始化
    init() {
        initCanvas();
        Input.init();
        Scene.Manager.init();
        
        // 监听事件
        this.setupEventListeners();
        
        // 开始游戏循环
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    },
    
    // 设置事件监听
    setupEventListeners() {
        // 敌人死亡
        Events.on(EVENT.ENEMY_DEATH, (data) => {
            this.kills++;
            this.currentCombo++;
            this.lastKillTime = this.frameCount;
            
            if (this.currentCombo > this.maxCombo) {
                this.maxCombo = this.currentCombo;
            }
            
            // 掉落经验宝石
            if (data.xpValue) {
                this.spawnGem(data.x, data.y, data.xpValue);
            }
            
            // 掉落金币
            const goldAmount = Math.floor((1 + Math.random() * 2) * this.goldMult * (this.difficultyMult.reward || 1));
            this.gold += goldAmount;
            
            // 吸血效果
            if (this.player && this.player.vampirism > 0) {
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + this.player.vampirism);
            }
            
            // 奥术屏障 - 击杀获得护盾
            if (this.player && this.player.shieldOnKill > 0) {
                this.player.shield = (this.player.shield || 0) + this.player.shieldOnKill;
                Renderer.addFloatingText('+🛡️' + this.player.shieldOnKill, this.player.x, this.player.y - 40, '#66ccff');
            }
            
            // 通知武器击杀（回能等）
            if (this.player && this.player.weapon) {
                this.player.weapon.onKill();
            }
            
            // 掉落技能
            if (typeof trySpawnSkillDrop !== 'undefined') {
                trySpawnSkillDrop(data.x, data.y, this.player);
            }
            
            this.updateUI();
        });
        
        // Boss死亡
        Events.on(EVENT.BOSS_DEATH, (data) => {
            this.bossKills++;
            this.kills++;
            
            // Boss掉落金币
            const goldDrop = Math.floor((50 + Math.random() * 50) * this.goldMult * (this.difficultyMult.reward || 1));
            this.gold += goldDrop;
            Renderer.addFloatingText(`+${goldDrop} 💰`, data.x, data.y - 60, '#ffd700');
            
            // Boss掉落武器
            if (typeof WeaponGenerator !== 'undefined') {
                const weapons = [];
                const count = 2 + Math.floor(Math.random() * 2);
                for (let i = 0; i < count; i++) {
                    weapons.push(WeaponGenerator.generate(data.level || 1));
                }
                if (weapons.length > 0) {
                    this.showWeaponDrop(weapons);
                }
            }
            
            this.updateUI();
        });
        
        // 玩家升级
        Events.on(EVENT.PLAYER_LEVELUP, (data) => {
            this.level = data.level;
            this.showUpgradeMenu();
        });
        
        // 玩家受伤
        Events.on(EVENT.PLAYER_DAMAGE, (data) => {
            this.damageTaken += data.amount || 0;
            Renderer.spawnParticles(this.player.x, this.player.y, '#ff0000', 5);
            Camera.shake(5, 10);
            this.updateUI();
        });
        
        // 敌人受伤（统计伤害）
        Events.on(EVENT.ENEMY_DAMAGE, (data) => {
            this.damageDealt += data.amount || 0;
        });
        
        // 拾取经验
        Events.on(EVENT.XP_GAIN, (data) => {
            this.addXp(data.amount);
        });
        
        // 浮动文字
        Events.on(EVENT.FLOATING_TEXT, (data) => {
            Renderer.addFloatingText(data.text, data.x, data.y, data.color || '#fff');
        });
        
        // 粒子效果
        Events.on(EVENT.PARTICLES, (data) => {
            Renderer.spawnParticles(data.x, data.y, data.color || '#fff', data.count || 5);
        });
        
        // 屏幕震动
        Events.on(EVENT.SCREEN_SHAKE, (data) => {
            Camera.shake(data.intensity || 5, data.duration || 10);
        });
        
        // 投射物发射
        Events.on(EVENT.PROJECTILE_FIRE, (data) => {
            if (data.projectile) {
                this.projectiles.push(data.projectile);
            }
        });
    },
    
    // 开始游戏
    start(charType) {
        this.startWithConfig({
            character: charType,
            weapon: 'spark_bolt',
            difficulty: 'normal',
            map: 'forest',
            talentBonus: { hp: 1, damage: 1, speed: 1, crit: 0, xp: 1, gold: 1 }
        });
    },
    
    // 使用配置开始游戏
    startWithConfig(config) {
        this.currentConfig = config;
        
        // 创建玩家
        this.player = Player.create(config.character);
        if (!this.player) {
            console.error('无法创建角色:', config.character);
            return;
        }
        this.player.x = 0;
        this.player.y = 0;
        
        // 应用天赋加成
        if (config.talentBonus) {
            this.player.maxHp *= config.talentBonus.hp;
            this.player.hp = this.player.maxHp;
            this.player.damageMult *= config.talentBonus.damage;
            this.player.speed *= config.talentBonus.speed;
            this.player.critChance = (this.player.critChance || 0) + config.talentBonus.crit;
            this.player.xpMult = config.talentBonus.xp;
            this.goldMult = config.talentBonus.gold;
        } else {
            this.goldMult = 1;
        }
        
        // 应用难度
        this.applyDifficulty(config.difficulty);
        
        // 设置初始技能
        if (config.weapon && typeof MAGIC_SKILLS !== 'undefined' && MAGIC_SKILLS[config.weapon]) {
            this.player.weapon.slots[0] = { ...MAGIC_SKILLS[config.weapon], star: 1 };
        }
        
        // 添加预装技能
        if (config.preloadedSkills && config.preloadedSkills.length > 0) {
            config.preloadedSkills.forEach(skillId => {
                const skill = typeof ALL_SKILLS !== 'undefined' ? ALL_SKILLS[skillId] : null;
                if (skill) {
                    this.player.weapon.inventory.push({ ...skill, star: 1 });
                }
            });
        }
        
        // 重置游戏状态
        this.resetGameState();
        
        // 初始化Boss管理器
        Boss.Manager.init();
        Boss.Manager.setPlayer(this.player);
        
        // 设置场景
        Scene.Manager.setScene(config.map);
        this.generateSceneElements();
        
        // 显示HUD
        document.getElementById('hud')?.classList.remove('hidden');
        document.getElementById('gameover-screen')?.classList.add('hidden');
        
        this.state = 'PLAYING';
        this.updateUI();
    },
    
    // 重置游戏状态
    resetGameState() {
        this.enemies = [];
        this.gems = [];
        this.projectiles = [];
        this.skillDrops = [];
        this.sceneElements = [];
        this.gold = 0;
        this.frameCount = 0;
        this.time = 0;
        this.kills = 0;
        this.level = 1;
        this.xp = 0;
        this.xpToNext = 10;
        this.damageTaken = 0;
        this.damageDealt = 0;
        this.bossKills = 0;
        this.maxCombo = 0;
        this.currentCombo = 0;
        this.lastKillTime = 0;
        
        Renderer.clearEffects();
        Camera.x = 0;
        Camera.y = 0;
        Camera.shakeDuration = 0;
    },
    
    // 应用难度
    applyDifficulty(difficulty) {
        switch(difficulty) {
            case 'easy':
                this.difficultyMult = { enemy: 0.7, spawn: 0.8, reward: 0.8 };
                break;
            case 'hard':
                this.difficultyMult = { enemy: 1.5, spawn: 1.3, reward: 1.5 };
                break;
            default:
                this.difficultyMult = { enemy: 1, spawn: 1, reward: 1 };
        }
    },
    
    // 游戏主循环
    loop() {
        if (this.state === 'PLAYING') {
            this.update();
        }
        this.draw();
        requestAnimationFrame(this.loop);
    },
    
    // 更新
    update() {
        this.frameCount++;
        
        // 更新时间
        if (this.frameCount % 60 === 0) {
            this.time++;
            const timer = document.getElementById('timer');
            if (timer) timer.innerText = this.formatTime(this.time);
        }
        
        // 连击重置
        if (this.frameCount - this.lastKillTime > 180) {
            this.currentCombo = 0;
        }
        
        // 生成敌人
        if (Spawner.shouldSpawn(this.frameCount, this.time)) {
            const enemy = Spawner.spawnEnemy(this.player.x, this.player.y, this.time, this.difficultyMult);
            this.enemies.push(enemy);
        }
        
        // 更新场景元素
        this.updateSceneElements();
        
        // 更新特效
        Renderer.updateEffects();
        
        // 更新光柱伤害
        this.updateLightPillarDamage();
        
        // 更新玩家
        const input = Input.getAxis();
        Entity.frameCount = this.frameCount;
        Player.frameCount = this.frameCount;
        Enemy.frameCount = this.frameCount;
        this.player.update(input, this.enemies);
        if (this.player.hp <= 0) {
            this.gameOver();
            return;
        }
        
        // 更新武器能量条
        this.updateWeaponEnergyBar();
        
        // 更新相机
        Camera.update(this.player.x, this.player.y);
        cameraX = Camera.x;
        cameraY = Camera.y;
        
        // 更新敌人
        this.enemies.forEach(e => e.update(this.player));
        
        // 更新Boss
        Boss.Manager.update();
        
        // 更新宝石
        this.gems.forEach(g => g.update(this.player));
        
        // 更新技能掉落
        this.skillDrops.forEach(s => s.update(this.player));
        
        // 更新投射物
        this.projectiles.forEach(p => p.update());
        
        // 碰撞检测
        this.handleCollisions();
        
        // 清理对象
        this.cleanup();
    },

    // 光柱伤害
    updateLightPillarDamage() {
        if (this.frameCount % 10 !== 0) return;
        
        Renderer.lightPillars.forEach(pillar => {
            this.enemies.forEach(e => {
                if (!e.markedForDeletion) {
                    const dist = Collision.distance(e.x, e.y, pillar.x, pillar.y);
                    if (dist < pillar.radius) {
                        e.takeDamage(pillar.damage, 0, 0);
                    }
                }
            });
        });
    },
    
    // 碰撞检测
    handleCollisions() {
        // 投射物 vs 敌人/Boss
        this.projectiles.forEach(p => {
            if (p.isBossProjectile) return;
            
            // vs 敌人
            this.enemies.forEach(e => {
                if (!e.markedForDeletion && !p.markedForDeletion) {
                    if (Collision.checkCircle(p, e)) {
                        if (!p.hitList.includes(e)) {
                            const dmg = p.getFinalDamage ? p.getFinalDamage() : p.damage;
                            e.takeDamage(dmg, p.dx * p.knockback, p.dy * p.knockback, p);
                            p.hitList.push(e);
                            Renderer.spawnParticles(e.x, e.y, e.color, 3);
                            
                            if (p.onHit) p.onHit(e);
                            
                            if (p.hitList.length >= p.penetrate && !p.isHovering) {
                                p.markedForDeletion = true;
                            }
                        }
                    }
                }
            });
            
            // vs Boss
            Boss.Manager.bosses.forEach(boss => {
                if (!boss.markedForDeletion && !p.markedForDeletion) {
                    if (Collision.checkCircle(p, boss)) {
                        if (!p.hitList.includes(boss)) {
                            const dmg = p.getFinalDamage ? p.getFinalDamage() : p.damage;
                            boss.takeDamage(dmg, p.dx * p.knockback, p.dy * p.knockback);
                            p.hitList.push(boss);
                            Renderer.spawnParticles(boss.x, boss.y, boss.color, 5);
                            
                            if (p.onHit) p.onHit(boss);
                            
                            if (p.hitList.length >= p.penetrate && !p.isHovering) {
                                p.markedForDeletion = true;
                            }
                        }
                    }
                }
            });
        });
        
        // 敌人 vs 玩家
        this.enemies.forEach(e => {
            if (Collision.checkCircle(e, this.player)) {
                if (this.frameCount % 30 === 0) {
                    this.damagePlayer(e.damage);
                }
            }
        });
        
        // Boss vs 玩家
        Boss.Manager.bosses.forEach(boss => {
            if (Collision.checkCircle(boss, this.player)) {
                if (this.frameCount % 30 === 0) {
                    this.damagePlayer(boss.damage, true);
                }
            }
        });
    },
    
    // 清理对象
    cleanup() {
        const despawnDist = CONFIG.ENEMY_SPAWN_DISTANCE * 2;
        const playerX = this.player.x;
        const playerY = this.player.y;
        
        this.enemies = this.enemies.filter(e => {
            if (e.markedForDeletion) return false;
            return Collision.distance(e.x, e.y, playerX, playerY) < despawnDist;
        });
        
        this.gems = this.gems.filter(g => {
            if (g.markedForDeletion) return false;
            return Collision.distance(g.x, g.y, playerX, playerY) < despawnDist;
        });
        
        this.skillDrops = this.skillDrops.filter(s => {
            if (s.markedForDeletion) return false;
            return Collision.distance(s.x, s.y, playerX, playerY) < despawnDist;
        });
        
        this.projectiles = this.projectiles.filter(p => {
            if (p.markedForDeletion) return false;
            return Collision.distance(p.x, p.y, playerX, playerY) < despawnDist;
        });
    },
    
    // 绘制
    draw() {
        if (!CTX) return;
        
        // 清空画布
        CTX.fillStyle = Scene.Manager.getBackgroundColor();
        CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);
        
        // 绘制背景
        this.drawBackground();
        
        // 绘制场景元素
        this.drawSceneElements();
        
        if (!this.player) return;
        
        // 绘制宝石
        this.gems.forEach(g => g.draw(CTX, cameraX, cameraY, this.frameCount));
        
        // 绘制技能掉落
        this.skillDrops.forEach(s => s.draw(CTX, cameraX, cameraY));
        
        // 绘制粒子
        Renderer.drawParticles();
        
        // 绘制敌人
        this.enemies.forEach(e => e.draw(CTX, cameraX, cameraY));
        
        // 绘制Boss
        Boss.Manager.draw(CTX, cameraX, cameraY);
        
        // 绘制玩家
        this.player.draw(CTX, cameraX, cameraY);
        
        // 绘制投射物
        this.projectiles.forEach(p => p.draw(CTX, cameraX, cameraY));
        
        // 绘制特效
        Renderer.drawLightningEffects();
        Renderer.drawDistortEffects();
        Renderer.drawLightPillars();
        Renderer.drawExplosionEffects();
        
        // 绘制技能槽UI
        this.drawWandSlots();
        
        // 绘制浮动文字
        Renderer.drawFloatingTexts();
    },
    
    // 绘制背景
    drawBackground() {
        const scene = Scene.Manager.currentScene;
        const gridSize = 100;
        const startX = Math.floor(cameraX / gridSize) * gridSize;
        const startY = Math.floor(cameraY / gridSize) * gridSize;
        
        if (scene === 'grass' || scene === 'forest') {
            CTX.fillStyle = '#83c276';
            for (let x = startX; x < cameraX + CONFIG.GAME_WIDTH + gridSize; x += gridSize) {
                for (let y = startY; y < cameraY + CONFIG.GAME_HEIGHT + gridSize; y += gridSize) {
                    if ((Math.floor(x / gridSize) + Math.floor(y / gridSize)) % 2 === 0) {
                        CTX.fillRect(x - cameraX, y - cameraY, gridSize / 2, gridSize / 2);
                    }
                }
            }
        } else if (scene === 'ocean') {
            CTX.strokeStyle = 'rgba(255,255,255,0.1)';
            CTX.lineWidth = 2;
            for (let y = startY; y < cameraY + CONFIG.GAME_HEIGHT + gridSize; y += gridSize) {
                CTX.beginPath();
                for (let x = startX; x < cameraX + CONFIG.GAME_WIDTH + gridSize; x += 20) {
                    const waveY = y + Math.sin((x + this.frameCount * 2) * 0.02) * 10;
                    if (x === startX) {
                        CTX.moveTo(x - cameraX, waveY - cameraY);
                    } else {
                        CTX.lineTo(x - cameraX, waveY - cameraY);
                    }
                }
                CTX.stroke();
            }
        } else if (scene === 'desert') {
            CTX.strokeStyle = 'rgba(0,0,0,0.1)';
            CTX.lineWidth = 1;
            for (let x = startX; x < cameraX + CONFIG.GAME_WIDTH + gridSize; x += gridSize) {
                CTX.beginPath();
                CTX.moveTo(x - cameraX, 0);
                CTX.lineTo(x - cameraX, CONFIG.GAME_HEIGHT);
                CTX.stroke();
            }
            for (let y = startY; y < cameraY + CONFIG.GAME_HEIGHT + gridSize; y += gridSize) {
                CTX.beginPath();
                CTX.moveTo(0, y - cameraY);
                CTX.lineTo(CONFIG.GAME_WIDTH, y - cameraY);
                CTX.stroke();
            }
        }
    },
    
    // 生成场景元素
    generateSceneElements() {
        this.sceneElements = [];
        const range = 1500;
        const count = 40;
        
        for (let i = 0; i < count; i++) {
            this.sceneElements.push(this.createSceneElement(
                this.player.x + (Math.random() - 0.5) * range * 2,
                this.player.y + (Math.random() - 0.5) * range * 2
            ));
        }
    },
    
    // 创建场景元素
    createSceneElement(x, y) {
        const scene = Scene.Manager.currentScene;
        
        if (scene === 'grass' || scene === 'forest') {
            return {
                x, y,
                type: Math.random() > 0.3 ? 'tree' : 'rock',
                size: 25 + Math.random() * 20
            };
        } else if (scene === 'ocean') {
            return {
                x, y,
                type: 'seaweed',
                height: 60 + Math.random() * 40,
                phase: Math.random() * Math.PI * 2
            };
        } else if (scene === 'desert') {
            return {
                x, y,
                type: Math.random() > 0.5 ? 'cactus' : 'dune',
                size: 20 + Math.random() * 15,
                width: 150 + Math.random() * 100,
                height: 30 + Math.random() * 20
            };
        } else if (scene === 'snow') {
            const rand = Math.random();
            if (rand > 0.6) {
                return { x, y, type: 'pine', size: 30 + Math.random() * 25 };
            } else if (rand > 0.3) {
                return { x, y, type: 'snowpile', size: 20 + Math.random() * 15 };
            } else {
                return { x, y, type: 'icerock', size: 15 + Math.random() * 20 };
            }
        }
        return { x, y, type: 'tree', size: 30 };
    },
    
    // 更新场景元素
    updateSceneElements() {
        const range = 1000;
        this.sceneElements = this.sceneElements.filter(el => {
            return Collision.distance(el.x, el.y, this.player.x, this.player.y) < range * 1.5;
        });
        
        while (this.sceneElements.length < 40) {
            const angle = Math.random() * Math.PI * 2;
            const dist = range * 0.8 + Math.random() * range * 0.4;
            this.sceneElements.push(this.createSceneElement(
                this.player.x + Math.cos(angle) * dist,
                this.player.y + Math.sin(angle) * dist
            ));
        }
    },

    // 绘制场景元素
    drawSceneElements() {
        const scene = Scene.Manager.currentScene;
        
        this.sceneElements.forEach(el => {
            const x = el.x - cameraX;
            const y = el.y - cameraY;
            
            if (x < -100 || x > CONFIG.GAME_WIDTH + 100 || y < -100 || y > CONFIG.GAME_HEIGHT + 100) return;
            
            if (scene === 'grass' || scene === 'forest') {
                if (el.type === 'tree') {
                    CTX.fillStyle = 'rgba(0,0,0,0.2)';
                    CTX.beginPath();
                    CTX.arc(x, y + 10, el.size, 0, Math.PI * 2);
                    CTX.fill();
                    CTX.fillStyle = '#8d6e63';
                    CTX.fillRect(x - 5, y - 10, 10, 20);
                    CTX.fillStyle = '#4caf50';
                    CTX.beginPath();
                    CTX.arc(x, y - 20, el.size, 0, Math.PI * 2);
                    CTX.fill();
                    CTX.fillStyle = '#66bb6a';
                    CTX.beginPath();
                    CTX.arc(x - 5, y - 25, el.size * 0.7, 0, Math.PI * 2);
                    CTX.fill();
                } else {
                    CTX.fillStyle = 'rgba(0,0,0,0.2)';
                    CTX.beginPath();
                    CTX.arc(x, y + 5, el.size * 0.8, 0, Math.PI * 2);
                    CTX.fill();
                    CTX.fillStyle = '#9e9e9e';
                    CTX.beginPath();
                    CTX.moveTo(x - el.size, y);
                    CTX.lineTo(x, y - el.size);
                    CTX.lineTo(x + el.size, y);
                    CTX.lineTo(x, y + el.size * 0.6);
                    CTX.fill();
                }
            } else if (scene === 'ocean') {
                CTX.strokeStyle = '#2e7d32';
                CTX.lineWidth = 4;
                CTX.beginPath();
                CTX.moveTo(x, y + el.height);
                const segments = 5;
                for (let i = 0; i <= segments; i++) {
                    const t = i / segments;
                    const waveOffset = Math.sin(this.frameCount * 0.03 + el.phase + t * 3) * 15 * t;
                    CTX.lineTo(x + waveOffset, y + el.height * (1 - t));
                }
                CTX.stroke();
            } else if (scene === 'desert') {
                if (el.type === 'cactus') {
                    CTX.fillStyle = '#2d5a27';
                    CTX.fillRect(x - 5, y - el.size, 10, el.size);
                    CTX.fillRect(x - 15, y - el.size * 0.7, 10, el.size * 0.4);
                    CTX.fillRect(x + 5, y - el.size * 0.5, 10, el.size * 0.3);
                } else {
                    CTX.fillStyle = '#c9a227';
                    CTX.beginPath();
                    CTX.ellipse(x, y, el.width, el.height, 0, 0, Math.PI * 2);
                    CTX.fill();
                }
            } else if (scene === 'snow') {
                if (el.type === 'pine') {
                    CTX.fillStyle = 'rgba(0,0,0,0.15)';
                    CTX.beginPath();
                    CTX.ellipse(x, y + 5, el.size * 0.5, el.size * 0.2, 0, 0, Math.PI * 2);
                    CTX.fill();
                    CTX.fillStyle = '#5d4037';
                    CTX.fillRect(x - 4, y - 8, 8, 18);
                    for (let i = 0; i < 3; i++) {
                        const layerY = y - 12 - i * (el.size * 0.35);
                        const layerSize = el.size * (1 - i * 0.2);
                        CTX.fillStyle = '#1b5e20';
                        CTX.beginPath();
                        CTX.moveTo(x, layerY - layerSize * 0.7);
                        CTX.lineTo(x - layerSize * 0.5, layerY);
                        CTX.lineTo(x + layerSize * 0.5, layerY);
                        CTX.closePath();
                        CTX.fill();
                        CTX.fillStyle = '#e8f4ff';
                        CTX.beginPath();
                        CTX.moveTo(x, layerY - layerSize * 0.7);
                        CTX.lineTo(x - layerSize * 0.25, layerY - layerSize * 0.4);
                        CTX.lineTo(x + layerSize * 0.25, layerY - layerSize * 0.4);
                        CTX.closePath();
                        CTX.fill();
                    }
                } else if (el.type === 'snowpile') {
                    CTX.fillStyle = '#d8e8f0';
                    CTX.beginPath();
                    CTX.ellipse(x, y, el.size * 1.2, el.size * 0.5, 0, 0, Math.PI * 2);
                    CTX.fill();
                    CTX.fillStyle = '#e8f4ff';
                    CTX.beginPath();
                    CTX.ellipse(x - 3, y - 2, el.size * 0.8, el.size * 0.35, 0, 0, Math.PI * 2);
                    CTX.fill();
                } else if (el.type === 'icerock') {
                    CTX.fillStyle = 'rgba(0,0,0,0.1)';
                    CTX.beginPath();
                    CTX.ellipse(x, y + 3, el.size * 0.7, el.size * 0.3, 0, 0, Math.PI * 2);
                    CTX.fill();
                    CTX.fillStyle = '#8ab4c4';
                    CTX.beginPath();
                    CTX.moveTo(x - el.size * 0.8, y);
                    CTX.lineTo(x - el.size * 0.3, y - el.size * 0.7);
                    CTX.lineTo(x + el.size * 0.4, y - el.size * 0.5);
                    CTX.lineTo(x + el.size * 0.7, y);
                    CTX.lineTo(x, y + el.size * 0.3);
                    CTX.closePath();
                    CTX.fill();
                    CTX.fillStyle = 'rgba(255,255,255,0.5)';
                    CTX.beginPath();
                    CTX.moveTo(x - el.size * 0.2, y - el.size * 0.4);
                    CTX.lineTo(x + el.size * 0.1, y - el.size * 0.3);
                    CTX.lineTo(x, y - el.size * 0.1);
                    CTX.closePath();
                    CTX.fill();
                }
            }
        });
    },
    
    // 绘制技能槽
    drawWandSlots() {
        if (!this.player || !this.player.wand) return;
        
        const wand = this.player.wand;
        const slotSize = 36;
        const padding = 4;
        const startX = (CONFIG.GAME_WIDTH - (wand.slotCount * (slotSize + padding))) / 2;
        const startY = CONFIG.GAME_HEIGHT - 60;
        
        for (let i = 0; i < wand.slotCount; i++) {
            const x = startX + i * (slotSize + padding);
            const y = startY;
            const slot = wand.slots[i];
            
            CTX.fillStyle = 'rgba(0, 0, 0, 0.5)';
            CTX.strokeStyle = '#666666';
            CTX.lineWidth = 1;
            CTX.fillRect(x, y, slotSize, slotSize);
            CTX.strokeRect(x, y, slotSize, slotSize);
            
            if (slot) {
                const isActive = slot.type === 'active';
                CTX.fillStyle = isActive ? 'rgba(255, 150, 0, 0.3)' : 'rgba(100, 150, 255, 0.3)';
                CTX.fillRect(x + 2, y + 2, slotSize - 4, slotSize - 4);
                
                CTX.font = '20px Arial';
                CTX.textAlign = 'center';
                CTX.textBaseline = 'middle';
                CTX.fillStyle = '#fff';
                CTX.fillText(slot.icon, x + slotSize / 2, y + slotSize / 2);
            }
        }
        
        if (wand.cooldownTimer > 0) {
            CTX.fillStyle = 'rgba(255, 255, 255, 0.7)';
            CTX.font = '14px Arial';
            CTX.textAlign = 'center';
            CTX.fillText('CD', CONFIG.GAME_WIDTH / 2, startY - 10);
        }
    },
    
    // ========== 游戏逻辑 ==========
    
    // 添加经验
    addXp(amount) {
        const timeBonus = 1 + (this.time / 60) * 0.2;
        const finalAmount = Math.floor(amount * timeBonus * (this.player.xpMult || 1));
        this.xp += finalAmount;
        
        while (this.xp >= this.xpToNext) {
            this.xp -= this.xpToNext;
            this.levelUp();
        }
        this.updateUI();
    },
    
    // 升级
    levelUp() {
        this.level++;
        this.xpToNext = Math.floor(this.xpToNext * 1.25);
        this.state = 'LEVEL_UP';
        Audio.play('levelup');
        this.showUpgradeMenu();
        this.updateUI();
    },
    
    // 显示升级菜单
    showUpgradeMenu() {
        const container = document.getElementById('cards-container');
        if (!container) return;
        container.innerHTML = '';
        
        const options = [];
        const pool = typeof UPGRADES !== 'undefined' ? [...UPGRADES] : [];
        
        for (let i = 0; i < 3; i++) {
            if (pool.length === 0) break;
            const idx = Math.floor(Math.random() * pool.length);
            const opt = pool[idx];
            const currentLevel = this.player.perkManager ? this.player.perkManager.getPerkLevel(opt.perkId) : 0;
            options.push({ ...opt, currentLevel });
            pool.splice(idx, 1);
        }
        
        options.forEach(opt => {
            const div = document.createElement('div');
            div.className = 'upgrade-card';
            const levelText = opt.currentLevel > 0 ? ` (Lv.${opt.currentLevel + 1})` : '';
            div.innerHTML = `<h3>${opt.name}${levelText}</h3><p>${opt.desc}</p>`;
            div.onclick = () => this.selectUpgrade(opt);
            container.appendChild(div);
        });
        
        document.getElementById('levelup-screen')?.classList.remove('hidden');
        const levelEl = document.getElementById('levelup-level');
        if (levelEl) levelEl.innerText = this.level;
    },
    
    // 选择升级
    selectUpgrade(opt) {
        if (opt.type === 'perk' && this.player.perkManager) {
            const result = this.player.perkManager.addPerk(opt.perkId);
            if (result) {
                this.addFloatingText('+' + result.perk.name + ' Lv.' + result.level, this.player.x, this.player.y - 40, '#ffcc00');
            }
        }
        
        document.getElementById('levelup-screen')?.classList.add('hidden');
        this.state = 'PLAYING';
        this.updateUI();
    },
    
    // 生成宝石
    spawnGem(x, y, val) {
        this.gems.push(new Gem(x, y, val));
    },
    
    // 添加浮动文字
    addFloatingText(text, x, y, color) {
        Renderer.addFloatingText(text, x, y, color);
    },
    
    // 玩家受伤
    damagePlayer(damage, isBoss = false) {
        let actualDamage = damage;
        
        // 护盾吸收
        if (this.player.shield && this.player.shield > 0) {
            const absorbed = Math.min(this.player.shield, actualDamage);
            this.player.shield -= absorbed;
            actualDamage -= absorbed;
            if (absorbed > 0) {
                this.addFloatingText('🛡️-' + absorbed, this.player.x, this.player.y - 50, '#66ccff');
            }
        }
        
        if (actualDamage > 0) {
            this.player.hp -= actualDamage;
            this.damageTaken += actualDamage;
            this.addFloatingText("-" + actualDamage, this.player.x, this.player.y - 30, isBoss ? '#ff0000' : '#ff4444');
        }
        
        Renderer.spawnParticles(this.player.x, this.player.y, '#ff0000', isBoss ? 8 : 5);
        Camera.shake(isBoss ? 10 : 5, isBoss ? 15 : 10);
        Audio.play('hurt');
        this.updateUI();
    },
    
    // 屏幕震动（兼容）
    screenShake(intensity, duration) {
        Camera.shake(intensity, duration);
    },
    
    // 生成粒子（兼容）
    spawnParticles(x, y, color, count) {
        Renderer.spawnParticles(x, y, color, count);
    },

    // ========== UI更新 ==========
    
    updateWeaponEnergyBar() {
        if (this.player && this.player.weapon) {
            const weapon = this.player.weapon;
            const energyPct = (weapon.energy / weapon.maxEnergy) * 100;
            const energyFill = document.getElementById('weapon-energy-bar-fill');
            const energyText = document.getElementById('weapon-energy-text');
            if (energyFill) energyFill.style.width = energyPct + '%';
            if (energyText) energyText.innerText = `${Math.floor(weapon.energy)}/${weapon.maxEnergy}`;
        }
    },
    
    updateUI() {
        if (!this.player) return;
        
        const hpPct = Math.max(0, (this.player.hp / this.player.maxHp) * 100);
        const hpFill = document.getElementById('hp-bar-fill');
        if (hpFill) hpFill.style.width = hpPct + '%';
        
        const shieldText = this.player.shield > 0 ? ` +🛡️${Math.ceil(this.player.shield)}` : '';
        const hpText = document.getElementById('hp-text');
        if (hpText) hpText.innerText = `${Math.ceil(this.player.hp)}/${Math.ceil(this.player.maxHp)}${shieldText}`;
        
        const xpPct = (this.xp / this.xpToNext) * 100;
        const xpFill = document.getElementById('xp-bar-fill');
        if (xpFill) xpFill.style.width = xpPct + '%';
        
        const levelText = document.getElementById('level-text');
        if (levelText) levelText.innerText = 'Lv.' + this.level;
        
        const killCount = document.getElementById('kill-count');
        if (killCount) killCount.innerText = '击杀: ' + this.kills;
        
        const goldCount = document.getElementById('gold-count');
        if (goldCount) goldCount.innerText = '💰 ' + this.gold;
        
        if (this.player.weapon) {
            const weapon = this.player.weapon;
            const energyPct = (weapon.energy / weapon.maxEnergy) * 100;
            const energyFill = document.getElementById('weapon-energy-bar-fill');
            const energyText = document.getElementById('weapon-energy-text');
            const weaponIcon = document.getElementById('weapon-icon');
            const weaponName = document.getElementById('weapon-name');
            
            if (energyFill) energyFill.style.width = energyPct + '%';
            if (energyText) energyText.innerText = `${Math.floor(weapon.energy)}/${weapon.maxEnergy}`;
            if (weaponIcon) weaponIcon.innerText = weapon.icon;
            if (weaponName) weaponName.innerText = weapon.name;
        }
    },
    
    formatTime(sec) {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    },
    
    // ========== 界面控制 ==========
    
    openPauseMenu() {
        if (this.state !== 'PLAYING') return;
        Inventory.open();
    },
    
    closePauseMenu() {
        Inventory.close();
    },
    
    resumeGame() {
        this.closePauseMenu();
    },
    
    openInventory() {
        Inventory.open();
    },
    
    closeInventory() {
        Inventory.close();
    },
    
    renderInventory() {
        Inventory.render();
    },
    
    openSettings() {
        this.state = 'SETTINGS';
        document.getElementById('settings-modal')?.classList.remove('hidden');
    },
    
    closeSettings() {
        document.getElementById('settings-modal')?.classList.add('hidden');
        this.state = 'INVENTORY';
    },
    
    closeSettingsOnly() {
        document.getElementById('settings-modal')?.classList.add('hidden');
    },
    
    openSettingsFromPause() {
        document.getElementById('pause-modal')?.classList.add('hidden');
        this.openSettings();
    },
    
    openSettingsFromInventory() {
        this.openSettings();
    },
    
    openInventoryFromPause() {
        // 已经在背包界面
    },
    
    openGMFromPause() {
        document.getElementById('pause-modal')?.classList.add('hidden');
        if (typeof GM !== 'undefined') {
            GM.openFromPause();
        }
    },
    
    // 工作台
    toggleWorkbench() {
        Inventory.toggleWorkbench();
    },
    
    removeFromWorkbench(idx) {
        Inventory.removeFromWorkbench(idx);
    },
    
    doCraft() {
        Inventory.doCraft();
    },
    
    autoMergeAll() {
        Inventory.autoMergeAll();
    },
    
    // ========== 游戏结束 ==========
    
    surrenderGame() {
        document.getElementById('inventory-screen')?.classList.add('hidden');
        document.getElementById('settings-modal')?.classList.add('hidden');
        this.endGame();
    },
    
    gameOver() {
        this.endGame();
    },
    
    endGame() {
        this.state = 'GAME_OVER';
        Audio.play('death');
        
        // 结算金币
        const earnedGold = this.gold;
        PlayerData.addGold(earnedGold);
        
        // 更新统计
        PlayerData.updateStats({
            kills: this.kills,
            time: this.time,
            bossKills: this.bossKills
        });
        
        document.getElementById('hud')?.classList.add('hidden');
        document.getElementById('gameover-screen')?.classList.remove('hidden');
        
        const finalTime = document.getElementById('final-time');
        const finalKills = document.getElementById('final-kills');
        const finalGold = document.getElementById('final-gold');
        const finalLevel = document.getElementById('final-level');
        const finalDamage = document.getElementById('final-damage');
        const finalTaken = document.getElementById('final-taken');
        const finalBoss = document.getElementById('final-boss');
        
        if (finalTime) finalTime.innerText = this.formatTime(this.time);
        if (finalKills) finalKills.innerText = this.kills;
        if (finalGold) finalGold.innerText = earnedGold;
        if (finalLevel) finalLevel.innerText = this.level;
        if (finalDamage) finalDamage.innerText = Math.floor(this.damageDealt);
        if (finalTaken) finalTaken.innerText = Math.floor(this.damageTaken);
        if (finalBoss) finalBoss.innerText = this.bossKills;
    },
    
    backToMenu() {
        this.state = 'MENU';
        this.player = null;
        this.enemies = [];
        this.gems = [];
        this.projectiles = [];
        this.skillDrops = [];
        Renderer.clearEffects();
        
        document.getElementById('hud')?.classList.add('hidden');
        document.getElementById('levelup-screen')?.classList.add('hidden');
        document.getElementById('gameover-screen')?.classList.add('hidden');
        document.getElementById('inventory-screen')?.classList.add('hidden');
        document.getElementById('pause-modal')?.classList.add('hidden');
        
        Lobby.enter();
    },
    
    // ========== 武器掉落 ==========
    
    pendingWeaponDrops: null,
    
    showWeaponDrop(weapons) {
        this.pendingWeaponDrops = weapons;
        this.state = 'WEAPON_DROP';
        
        const container = document.getElementById('weapon-drop-options');
        if (!container) return;
        container.innerHTML = '';
        
        weapons.forEach((weapon, index) => {
            const card = document.createElement('div');
            card.className = `weapon-drop-card rarity-${weapon.rarity}`;
            card.onclick = () => this.selectWeaponDrop(index);
            
            let affixesHtml = '';
            if (weapon.affixes && typeof WEAPON_AFFIXES !== 'undefined') {
                weapon.affixes.forEach(affix => {
                    const def = WEAPON_AFFIXES[affix.id];
                    if (def) {
                        const desc = def.desc.replace('{value}', affix.value);
                        affixesHtml += `<div class="weapon-affix">✦ ${desc}</div>`;
                    }
                });
            }
            
            let specialHtml = '';
            if (weapon.specialSlot && typeof SPECIAL_TRIGGERS !== 'undefined') {
                const trigger = SPECIAL_TRIGGERS[weapon.specialSlot.trigger];
                if (trigger) {
                    const desc = trigger.desc.replace('{value}', weapon.specialSlot.value);
                    specialHtml = `<div class="weapon-card-special">⚡ 特殊槽(${weapon.specialSlot.slots}): ${desc}</div>`;
                }
            }
            
            const rarityNames = { common: '普通', uncommon: '优秀', rare: '稀有', epic: '史诗' };
            
            card.innerHTML = `
                <div class="weapon-card-header">
                    <span class="weapon-card-icon">${weapon.icon}</span>
                    <div>
                        <div class="weapon-card-name">${weapon.name}</div>
                        <span class="weapon-card-rarity">${rarityNames[weapon.rarity]}</span>
                    </div>
                </div>
                <div class="weapon-card-stats">
                    <div>⚡ 能量: ${weapon.maxEnergy} | 回复: ${weapon.baseEnergyRegen}/s</div>
                    <div>⏱️ 间隔: ${(weapon.baseCastInterval / 60).toFixed(2)}s | 槽位: ${weapon.slotCount}</div>
                </div>
                <div class="weapon-card-affixes">${affixesHtml || '<div class="weapon-affix" style="color:#888">无词条</div>'}</div>
                ${specialHtml}
            `;
            container.appendChild(card);
        });
        
        document.getElementById('weapon-drop-modal')?.classList.remove('hidden');
    },
    
    selectWeaponDrop(index) {
        const weapon = this.pendingWeaponDrops[index];
        this.equipNewWeapon(weapon);
        this.closeWeaponDrop();
    },
    
    skipWeaponDrop() {
        const index = Math.floor(Math.random() * this.pendingWeaponDrops.length);
        const weapon = this.pendingWeaponDrops[index];
        this.equipNewWeapon(weapon);
        this.addFloatingText(`随机获得: ${weapon.icon} ${weapon.name}`, this.player.x, this.player.y - 40, '#ffd700');
        this.closeWeaponDrop();
    },
    
    equipNewWeapon(weapon) {
        this.player.weaponInventory.push(weapon);
        this.addFloatingText(`获得: ${weapon.icon} ${weapon.name}`, this.player.x, this.player.y - 60, '#ffd700');
        Audio.play('levelup');
        this.updateUI();
    },
    
    closeWeaponDrop() {
        document.getElementById('weapon-drop-modal')?.classList.add('hidden');
        this.pendingWeaponDrops = null;
        this.state = 'PLAYING';
    }
};

// 兼容旧代码
window.startGame = function(charType) {
    Game.start(charType);
};
