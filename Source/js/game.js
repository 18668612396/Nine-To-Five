// --- 游戏引擎 (类幸存者风格 + 场景系统) ---

let CANVAS = null;
let CTX = null;

// 相机位置（跟随玩家）
let cameraX = 0;
let cameraY = 0;

// 设备像素比（解决手机端模糊问题）
const dpr = window.devicePixelRatio || 1;

function resize() {
    if (!CANVAS || !CTX) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Canvas 实际像素大小（乘以设备像素比）
    CANVAS.width = width * dpr;
    CANVAS.height = height * dpr;
    
    // CSS 显示大小
    CANVAS.style.width = width + 'px';
    CANVAS.style.height = height + 'px';
    
    // 缩放绘图上下文
    CTX.setTransform(dpr, 0, 0, dpr, 0, 0);
    
    CONFIG.GAME_WIDTH = width;
    CONFIG.GAME_WIDTH = width;
    CONFIG.GAME_HEIGHT = height;
}

const Game = {
    state: 'MENU',
    player: null,
    enemies: [],
    gems: [],
    projectiles: [],
    skillDrops: [],
    floatingTexts: [],
    particles: [],
    lightningEffects: [],
    
    // 场景元素（基于玩家位置生成）
    sceneElements: [],
    
    frameCount: 0,
    time: 0,
    kills: 0,
    level: 1,
    xp: 0,
    xpToNext: 10,
    gold: 0, // 本局获得的金币
    
    // 统计数据
    damageTaken: 0,
    damageDealt: 0,
    bossKills: 0,
    maxCombo: 0,
    currentCombo: 0,
    lastKillTime: 0,
    
    // 屏幕震动
    shakeX: 0,
    shakeY: 0,
    shakeDuration: 0,
    
    init() {
        // 初始化 Canvas
        CANVAS = document.getElementById('gameCanvas');
        CTX = CANVAS.getContext('2d');
        
        resize();
        window.addEventListener('resize', resize);
        
        Input.init();
        SceneManager.currentScene = 'grass';
        SceneManager.init();
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    },

    start(charType) {
        this.startWithConfig({
            character: charType,
            weapon: 'spark_bolt',
            difficulty: 'normal',
            map: 'forest',
            talentBonus: { hp: 1, damage: 1, speed: 1, crit: 0, xp: 1, gold: 1 }
        });
    },
    
    startWithConfig(config) {
        this.currentConfig = config;
        
        this.player = new Player(config.character);
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
        
        // 应用难度修正
        this.applyDifficulty(config.difficulty);
        
        // 设置初始武器
        if (config.weapon && MAGIC_SKILLS[config.weapon]) {
            this.player.wand.addSkillToInventory(config.weapon, 1);
            this.player.wand.equipSkill(0, 0);
        }
        
        this.enemies = [];
        this.gems = [];
        this.projectiles = [];
        this.skillDrops = [];
        this.floatingTexts = [];
        this.particles = [];
        this.lightningEffects = [];
        this.sceneElements = [];
        this.gold = 0;
        this.frameCount = 0;
        this.time = 0;
        this.kills = 0;
        this.level = 1;
        this.xp = 0;
        this.xpToNext = 10;
        
        // 重置统计
        this.damageTaken = 0;
        this.damageDealt = 0;
        this.bossKills = 0;
        this.maxCombo = 0;
        this.currentCombo = 0;
        this.lastKillTime = 0;
        this.shakeX = 0;
        this.shakeY = 0;
        this.shakeDuration = 0;
        
        // 初始化Boss管理器
        BossManager.init();
        
        // 设置地图场景
        SceneManager.setScene(config.map);
        this.generateSceneElements();
        
        document.getElementById('hud').classList.remove('hidden');
        document.getElementById('gameover-screen').classList.add('hidden');
        
        this.state = 'PLAYING';
        this.updateUI();
    },
    
    applyDifficulty(difficulty) {
        // 难度系数存储，供敌人生成时使用
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
    
    // 生成场景装饰元素
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
    
    createSceneElement(x, y) {
        const scene = SceneManager.currentScene;
        if (scene === 'grass') {
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
        }
        return { x, y, type: 'tree', size: 30 };
    },

    loop() {
        if (this.state === 'PLAYING') {
            this.update();
        }
        this.draw();
        requestAnimationFrame(this.loop);
    },

    update() {
        this.frameCount++;
        if (this.frameCount % 60 === 0) {
            this.time++;
            document.getElementById('timer').innerText = this.formatTime(this.time);
        }
        
        // 生成敌人
        this.spawnEnemies();
        
        // 更新场景元素（保持在玩家周围）
        this.updateSceneElements();

        // 更新粒子
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            p.vx *= 0.95;
            p.vy *= 0.95;
        });
        this.particles = this.particles.filter(p => p.life > 0);
        
        // 更新闪电效果
        this.lightningEffects = this.lightningEffects.filter(l => l.life-- > 0);

        // 更新光之柱
        this.lightPillars = this.lightPillars || [];
        this.lightPillars.forEach(pillar => {
            pillar.life--;
            // 每10帧造成一次伤害
            if (Game.frameCount % 10 === 0) {
                this.enemies.forEach(e => {
                    if (!e.markedForDeletion) {
                        const dist = Math.sqrt((e.x - pillar.x) ** 2 + (e.y - pillar.y) ** 2);
                        if (dist < pillar.radius) {
                            e.takeDamage(pillar.damage, 0, 0);
                        }
                    }
                });
            }
        });
        this.lightPillars = this.lightPillars.filter(p => p.life > 0);

        // 更新玩家
        this.player.update();
        if (this.player.hp <= 0) {
            this.gameOver();
        }

        // 更新屏幕震动
        if (this.shakeDuration > 0) {
            this.shakeDuration--;
            this.shakeX = (Math.random() - 0.5) * this.shakeIntensity;
            this.shakeY = (Math.random() - 0.5) * this.shakeIntensity;
        } else {
            this.shakeX = 0;
            this.shakeY = 0;
        }

        // 更新相机（跟随玩家 + 震动）
        cameraX = this.player.x - CONFIG.GAME_WIDTH / 2 + this.shakeX;
        cameraY = this.player.y - CONFIG.GAME_HEIGHT / 2 + this.shakeY;

        // 更新敌人
        this.enemies.forEach(e => e.update(this.player));
        
        // 更新Boss
        BossManager.update();
        
        // 更新宝石
        this.gems.forEach(g => g.update(this.player));
        
        // 更新技能掉落
        this.skillDrops.forEach(s => s.update(this.player));
        
        // 更新投射物
        this.projectiles.forEach(p => p.update());

        // 碰撞检测：投射物 vs 敌人
        this.projectiles.forEach(p => {
            if (p.isBossProjectile) return; // Boss投射物不攻击敌人
            
            this.enemies.forEach(e => {
                if (!e.markedForDeletion && !p.markedForDeletion) {
                    if (this.checkCollision(p, e)) {
                        if (!p.hitList.includes(e)) {
                            const dmg = p.getFinalDamage ? p.getFinalDamage() : p.damage;
                            e.takeDamage(dmg, p.dx * p.knockback, p.dy * p.knockback, p);
                            p.hitList.push(e);
                            this.spawnParticles(e.x, e.y, e.color, 3);
                            
                            // 触发命中效果
                            if (p.onHit) p.onHit(e);
                            
                            if (p.hitList.length >= p.penetrate && !p.isHovering) {
                                p.markedForDeletion = true;
                            }
                        }
                    }
                }
            });
            
            // 投射物 vs Boss
            BossManager.bosses.forEach(boss => {
                if (!boss.markedForDeletion && !p.markedForDeletion) {
                    if (this.checkCollision(p, boss)) {
                        if (!p.hitList.includes(boss)) {
                            const dmg = p.getFinalDamage ? p.getFinalDamage() : p.damage;
                            boss.takeDamage(dmg, p.dx * p.knockback, p.dy * p.knockback);
                            p.hitList.push(boss);
                            this.spawnParticles(boss.x, boss.y, boss.color, 5);
                            
                            if (p.onHit) p.onHit(boss);
                            
                            if (p.hitList.length >= p.penetrate && !p.isHovering) {
                                p.markedForDeletion = true;
                            }
                        }
                    }
                }
            });
        });

        // 碰撞检测：敌人 vs 玩家
        this.enemies.forEach(e => {
            if (this.checkCollision(e, this.player)) {
                if (this.frameCount % 30 === 0) {
                    this.player.hp -= e.damage;
                    this.damageTaken += e.damage;
                    this.addFloatingText("-" + e.damage, this.player.x, this.player.y - 30, '#ff4444');
                    this.spawnParticles(this.player.x, this.player.y, '#ff0000', 5);
                    this.screenShake(5, 10);
                    Audio.play('hurt');
                    this.updateUI();
                }
            }
        });
        
        // 碰撞检测：Boss vs 玩家
        BossManager.bosses.forEach(boss => {
            if (this.checkCollision(boss, this.player)) {
                if (this.frameCount % 30 === 0) {
                    this.player.hp -= boss.damage;
                    this.damageTaken += boss.damage;
                    this.addFloatingText("-" + boss.damage, this.player.x, this.player.y - 30, '#ff0000');
                    this.spawnParticles(this.player.x, this.player.y, '#ff0000', 8);
                    this.screenShake(10, 15);
                    Audio.play('hurt');
                    this.updateUI();
                }
            }
        });

        // 清理（基于与玩家的距离）
        const despawnDist = CONFIG.ENEMY_SPAWN_DISTANCE * 2;
        this.enemies = this.enemies.filter(e => {
            if (e.markedForDeletion) return false;
            const dist = Math.sqrt((e.x - this.player.x) ** 2 + (e.y - this.player.y) ** 2);
            return dist < despawnDist;
        });
        this.gems = this.gems.filter(g => {
            if (g.markedForDeletion) return false;
            const dist = Math.sqrt((g.x - this.player.x) ** 2 + (g.y - this.player.y) ** 2);
            return dist < despawnDist;
        });
        this.skillDrops = this.skillDrops.filter(s => {
            if (s.markedForDeletion) return false;
            const dist = Math.sqrt((s.x - this.player.x) ** 2 + (s.y - this.player.y) ** 2);
            return dist < despawnDist;
        });
        this.projectiles = this.projectiles.filter(p => {
            if (p.markedForDeletion) return false;
            const dist = Math.sqrt((p.x - this.player.x) ** 2 + (p.y - this.player.y) ** 2);
            return dist < despawnDist;
        });
        this.floatingTexts = this.floatingTexts.filter(t => t.life > 0);
        this.floatingTexts.forEach(t => {
            t.y -= 0.5;
            t.life--;
        });
    },
    
    updateSceneElements() {
        const range = 1000;
        this.sceneElements = this.sceneElements.filter(el => {
            const dist = Math.sqrt((el.x - this.player.x) ** 2 + (el.y - this.player.y) ** 2);
            return dist < range * 1.5;
        });
        
        // 补充新元素
        while (this.sceneElements.length < 40) {
            const angle = Math.random() * Math.PI * 2;
            const dist = range * 0.8 + Math.random() * range * 0.4;
            this.sceneElements.push(this.createSceneElement(
                this.player.x + Math.cos(angle) * dist,
                this.player.y + Math.sin(angle) * dist
            ));
        }
    },

    checkCollision(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < a.radius + b.radius;
    },

    draw() {
        // 清空画布
        CTX.fillStyle = SceneManager.getBackgroundColor();
        CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);
        
        // 绘制背景网格
        this.drawBackground();
        
        // 绘制场景元素
        this.drawSceneElements();
        
        if (!this.player) return;
        
        // 绘制宝石
        this.gems.forEach(g => g.draw(CTX, cameraX, cameraY));
        
        // 绘制技能掉落
        this.skillDrops.forEach(s => s.draw(CTX, cameraX, cameraY));
        
        // 绘制粒子
        this.particles.forEach(p => {
            CTX.fillStyle = p.color;
            CTX.globalAlpha = p.life / 30;
            CTX.beginPath();
            CTX.arc(p.x - cameraX, p.y - cameraY, p.size, 0, Math.PI * 2);
            CTX.fill();
            CTX.globalAlpha = 1.0;
        });

        // 绘制敌人
        this.enemies.forEach(e => e.draw(CTX, cameraX, cameraY));
        
        // 绘制Boss
        BossManager.draw(CTX, cameraX, cameraY);
        
        // 绘制玩家
        this.player.draw(CTX, cameraX, cameraY);
        
        // 绘制投射物
        this.projectiles.forEach(p => p.draw(CTX, cameraX, cameraY));
        
        // 绘制闪电效果
        this.drawLightningEffects();
        
        // 绘制光之柱
        this.drawLightPillars();
        
        // 绘制技能槽UI
        this.drawWandSlots();

        // 浮动文字
        this.floatingTexts.forEach(t => {
            CTX.fillStyle = t.color;
            CTX.font = 'bold 20px Arial';
            CTX.textAlign = 'center';
            CTX.strokeStyle = 'black';
            CTX.lineWidth = 3;
            CTX.strokeText(t.text, t.x - cameraX, t.y - cameraY);
            CTX.fillText(t.text, t.x - cameraX, t.y - cameraY);
        });
    },
    
    drawBackground() {
        const scene = SceneManager.currentScene;
        const gridSize = 100;
        const startX = Math.floor(cameraX / gridSize) * gridSize;
        const startY = Math.floor(cameraY / gridSize) * gridSize;
        
        if (scene === 'grass') {
            // 草地棋盘格
            CTX.fillStyle = '#83c276';
            for (let x = startX; x < cameraX + CONFIG.GAME_WIDTH + gridSize; x += gridSize) {
                for (let y = startY; y < cameraY + CONFIG.GAME_HEIGHT + gridSize; y += gridSize) {
                    if ((Math.floor(x / gridSize) + Math.floor(y / gridSize)) % 2 === 0) {
                        CTX.fillRect(x - cameraX, y - cameraY, gridSize / 2, gridSize / 2);
                    }
                }
            }
        } else if (scene === 'ocean') {
            // 海洋波纹
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
            // 沙漠网格
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
    
    drawSceneElements() {
        const scene = SceneManager.currentScene;
        
        this.sceneElements.forEach(el => {
            const x = el.x - cameraX;
            const y = el.y - cameraY;
            
            // 跳过屏幕外的元素
            if (x < -100 || x > CONFIG.GAME_WIDTH + 100 || y < -100 || y > CONFIG.GAME_HEIGHT + 100) return;
            
            if (scene === 'grass') {
                if (el.type === 'tree') {
                    // 阴影
                    CTX.fillStyle = 'rgba(0,0,0,0.2)';
                    CTX.beginPath();
                    CTX.arc(x, y + 10, el.size, 0, Math.PI * 2);
                    CTX.fill();
                    // 树干
                    CTX.fillStyle = '#8d6e63';
                    CTX.fillRect(x - 5, y - 10, 10, 20);
                    // 树冠
                    CTX.fillStyle = '#4caf50';
                    CTX.beginPath();
                    CTX.arc(x, y - 20, el.size, 0, Math.PI * 2);
                    CTX.fill();
                    CTX.fillStyle = '#66bb6a';
                    CTX.beginPath();
                    CTX.arc(x - 5, y - 25, el.size * 0.7, 0, Math.PI * 2);
                    CTX.fill();
                } else {
                    // 石头
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
                // 海草
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
                    // 沙丘
                    CTX.fillStyle = '#c9a227';
                    CTX.beginPath();
                    CTX.ellipse(x, y, el.width, el.height, 0, 0, Math.PI * 2);
                    CTX.fill();
                }
            }
        });
    },

    spawnParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                life: 20 + Math.random() * 20,
                color,
                size: 2 + Math.random() * 3
            });
        }
    },
    
    screenShake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    },
    
    drawLightningEffects() {
        this.lightningEffects.forEach(l => {
            const alpha = l.life / 15;
            CTX.strokeStyle = `rgba(100, 200, 255, ${alpha})`;
            CTX.lineWidth = 3;
            CTX.beginPath();
            const segments = 5;
            const dx = (l.x2 - l.x1) / segments;
            const dy = (l.y2 - l.y1) / segments;
            CTX.moveTo(l.x1 - cameraX, l.y1 - cameraY);
            for (let i = 1; i < segments; i++) {
                CTX.lineTo(
                    l.x1 + dx * i + (Math.random() - 0.5) * 20 - cameraX,
                    l.y1 + dy * i + (Math.random() - 0.5) * 20 - cameraY
                );
            }
            CTX.lineTo(l.x2 - cameraX, l.y2 - cameraY);
            CTX.stroke();
        });
    },
    
    drawLightPillars() {
        this.lightPillars = this.lightPillars || [];
        this.lightPillars.forEach(pillar => {
            const x = pillar.x - cameraX;
            const y = pillar.y - cameraY;
            const alpha = pillar.life / 60;
            
            // 光柱效果
            const gradient = CTX.createRadialGradient(x, y, 0, x, y, pillar.radius);
            gradient.addColorStop(0, `rgba(255, 255, 200, ${alpha * 0.8})`);
            gradient.addColorStop(0.5, `rgba(255, 220, 100, ${alpha * 0.4})`);
            gradient.addColorStop(1, `rgba(255, 200, 50, 0)`);
            
            CTX.fillStyle = gradient;
            CTX.beginPath();
            CTX.arc(x, y, pillar.radius, 0, Math.PI * 2);
            CTX.fill();
            
            // 中心光点
            CTX.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            CTX.beginPath();
            CTX.arc(x, y, 5, 0, Math.PI * 2);
            CTX.fill();
        });
    },
    
    drawWandSlots() {
        const wand = this.player.wand;
        const slotSize = 36;
        const padding = 4;
        const startX = (CONFIG.GAME_WIDTH - (wand.slotCount * (slotSize + padding))) / 2;
        const startY = CONFIG.GAME_HEIGHT - 60;
        
        for (let i = 0; i < wand.slotCount; i++) {
            const x = startX + i * (slotSize + padding);
            const y = startY;
            const slot = wand.slots[i];
            const isCurrent = i === wand.currentIndex;
            
            CTX.fillStyle = isCurrent ? 'rgba(255, 255, 0, 0.3)' : 'rgba(0, 0, 0, 0.5)';
            CTX.strokeStyle = isCurrent ? '#ffff00' : '#666666';
            CTX.lineWidth = isCurrent ? 3 : 1;
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
        
        // 冷却指示
        if (wand.cooldownTimer > 0) {
            CTX.fillStyle = 'rgba(255, 255, 255, 0.7)';
            CTX.font = '14px Arial';
            CTX.textAlign = 'center';
            CTX.fillText('CD', CONFIG.GAME_WIDTH / 2, startY - 10);
        }
    },

    spawnEnemies() {
        const baseRate = Math.max(10, 40 - Math.floor(this.time / 3));
        
        if (this.frameCount % baseRate === 0) {
            const angle = Math.random() * Math.PI * 2;
            const dist = CONFIG.ENEMY_SPAWN_DISTANCE + Math.random() * 100;
            const x = this.player.x + Math.cos(angle) * dist;
            const y = this.player.y + Math.sin(angle) * dist;
            
            let type = 1;
            if (this.time > 30 && Math.random() < 0.2) type = 2;
            if (this.time > 60 && Math.random() < 0.1) type = 3;

            this.enemies.push(new Enemy(x, y, type));
        }
    },

    addXp(amount) {
        this.xp += amount;
        while (this.xp >= this.xpToNext) {
            this.xp -= this.xpToNext;
            this.levelUp();
        }
        this.updateUI();
    },

    levelUp() {
        this.level++;
        this.xpToNext = Math.floor(this.xpToNext * 1.15);
        this.state = 'LEVEL_UP';
        Audio.play('levelup');
        this.showUpgradeMenu();
        this.updateUI();
    },

    showUpgradeMenu() {
        const container = document.getElementById('cards-container');
        container.innerHTML = '';
        
        // 随机选3个祝福
        const options = [];
        const pool = [...UPGRADES];
        for (let i = 0; i < 3; i++) {
            if (pool.length === 0) break;
            const idx = Math.floor(Math.random() * pool.length);
            const opt = pool[idx];
            // 显示当前等级
            const currentLevel = this.player.perkManager.getPerkLevel(opt.perkId);
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

        document.getElementById('levelup-screen').classList.remove('hidden');
        document.getElementById('levelup-level').innerText = this.level;
    },

    selectUpgrade(opt) {
        if (opt.type === 'perk') {
            const result = this.player.perkManager.addPerk(opt.perkId);
            if (result) {
                this.addFloatingText('+' + result.perk.name + ' Lv.' + result.level, this.player.x, this.player.y - 40, '#ffcc00');
            }
        }

        document.getElementById('levelup-screen').classList.add('hidden');
        this.state = 'PLAYING';
        this.updateUI();
    },

    spawnGem(x, y, val) {
        this.gems.push(new Gem(x, y, val));
    },

    addFloatingText(text, x, y, color) {
        this.floatingTexts.push({ text, x, y, color, life: 40 });
    },

    updateUI() {
        const hpPct = Math.max(0, (this.player.hp / this.player.maxHp) * 100);
        document.getElementById('hp-bar-fill').style.width = hpPct + '%';
        document.getElementById('hp-text').innerText = `${Math.ceil(this.player.hp)}/${Math.ceil(this.player.maxHp)}`;
        
        const xpPct = (this.xp / this.xpToNext) * 100;
        document.getElementById('xp-bar-fill').style.width = xpPct + '%';
        document.getElementById('level-text').innerText = 'Lv.' + this.level;
        
        document.getElementById('kill-count').innerText = '击杀: ' + this.kills;
        document.getElementById('gold-count').innerText = '💰 ' + this.gold;
        
        // 武器能量条
        if (this.player.weapon) {
            const weapon = this.player.weapon;
            const energyPct = (weapon.energy / weapon.maxEnergy) * 100;
            document.getElementById('energy-bar-fill').style.width = energyPct + '%';
            document.getElementById('energy-text').innerText = `${Math.floor(weapon.energy)}/${weapon.maxEnergy}`;
            document.getElementById('weapon-icon').innerText = weapon.icon;
            document.getElementById('weapon-name').innerText = weapon.name;
        }
    },

    formatTime(sec) {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    },

    // 暂停菜单 - ESC直接打开背包
    openPauseMenu() {
        this.state = 'INVENTORY';
        // 每次打开背包时，确保工作台是关闭的
        this.workbenchOpen = false;
        this.workbenchSlots = [null, null, null];
        document.getElementById('workbench-panel').classList.add('hidden');
        document.getElementById('workbench-toggle-btn').classList.remove('active');
        document.querySelector('.inventory-layout').classList.remove('with-workbench');
        
        document.getElementById('inventory-screen').classList.remove('hidden');
        this.renderInventory();
    },
    
    closePauseMenu() {
        document.getElementById('inventory-screen').classList.add('hidden');
        this.state = 'PLAYING';
    },
    
    resumeGame() {
        this.closePauseMenu();
    },
    
    // 从暂停菜单打开背包
    openInventoryFromPause() {
        // 已经在背包界面了，不需要操作
    },
    
    // 从暂停菜单打开GM
    openGMFromPause() {
        document.getElementById('pause-modal').classList.add('hidden');
        GM.openFromPause();
    },
    
    // 从暂停菜单打开设置
    openSettingsFromPause() {
        document.getElementById('pause-modal').classList.add('hidden');
        this.state = 'SETTINGS';
        document.getElementById('settings-modal').classList.remove('hidden');
    },
    
    // 从背包打开设置
    openSettingsFromInventory() {
        this.state = 'SETTINGS';
        document.getElementById('settings-modal').classList.remove('hidden');
    },
    
    closeSettings() {
        document.getElementById('settings-modal').classList.add('hidden');
        // 返回背包界面
        this.state = 'INVENTORY';
    },
    
    // 只关闭设置弹窗（不改变状态）
    closeSettingsOnly() {
        document.getElementById('settings-modal').classList.add('hidden');
    },
    
    // 放弃战斗
    surrenderGame() {
        document.getElementById('inventory-screen').classList.add('hidden');
        document.getElementById('settings-modal').classList.add('hidden');
        this.endGame();
    },

    gameOver() {
        this.endGame();
    },
    
    // 结束游戏（通用）
    endGame() {
        this.state = 'GAME_OVER';
        
        // 播放死亡音效
        Audio.play('death');
        
        // 结算金币
        const earnedGold = this.gold;
        Lobby.addGold(earnedGold);
        
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('gameover-screen').classList.remove('hidden');
        document.getElementById('final-time').innerText = this.formatTime(this.time);
        document.getElementById('final-kills').innerText = this.kills;
        document.getElementById('final-gold').innerText = earnedGold;
        document.getElementById('final-level').innerText = this.level;
        document.getElementById('final-damage').innerText = Math.floor(this.damageDealt);
        document.getElementById('final-taken').innerText = Math.floor(this.damageTaken);
        document.getElementById('final-boss').innerText = this.bossKills;
    },

    backToMenu() {
        this.state = 'MENU';
        this.player = null;
        this.enemies = [];
        this.gems = [];
        this.projectiles = [];
        this.skillDrops = [];
        this.floatingTexts = [];
        this.particles = [];
        this.lightningEffects = [];
        
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('levelup-screen').classList.add('hidden');
        document.getElementById('gameover-screen').classList.add('hidden');
        document.getElementById('inventory-screen').classList.add('hidden');
        document.getElementById('pause-modal').classList.add('hidden');
        
        // 返回大厅
        Lobby.enter();
    },
    
    // 背包系统（直接打开，用于HUD按钮）
    openInventory() {
        if (this.state === 'PLAYING') {
            this.state = 'INVENTORY';
            // 每次打开背包时，确保工作台是关闭的
            this.workbenchOpen = false;
            this.workbenchSlots = [null, null, null];
            document.getElementById('workbench-panel').classList.add('hidden');
            document.getElementById('workbench-toggle-btn').classList.remove('active');
            document.querySelector('.inventory-layout').classList.remove('with-workbench');
            
            document.getElementById('inventory-screen').classList.remove('hidden');
            this.renderInventory();
        }
    },
    
    closeInventory() {
        // 关闭工作台
        if (this.workbenchOpen) {
            this.workbenchSlots.forEach((item) => {
                if (item) {
                    this.player.wand.inventory.push(item.skill);
                }
            });
            this.workbenchSlots = [null, null, null];
            this.workbenchOpen = false;
            document.getElementById('workbench-panel').classList.add('hidden');
            document.getElementById('workbench-toggle-btn').classList.remove('active');
            document.querySelector('.inventory-layout').classList.remove('with-workbench');
        }
        
        document.getElementById('inventory-screen').classList.add('hidden');
        this.state = 'PLAYING';
    },
    
    renderInventory() {
        const player = this.player;
        const weapon = player.weapon;
        
        // 渲染武器槽
        this.renderWeaponSlots();
        
        // 渲染武器背包
        this.renderWeaponInventory();
        
        // 更新当前武器标签
        const weaponLabel = document.getElementById('current-weapon-label');
        if (weaponLabel && weapon) {
            weaponLabel.textContent = `(${weapon.icon} ${weapon.name})`;
        }
        
        // 渲染技能槽
        const slotsContainer = document.getElementById('wand-slots');
        slotsContainer.innerHTML = '';
        
        // 使用当前武器的槽位数
        const slotCount = weapon ? weapon.slotCount : 6;
        const slots = weapon ? weapon.slots : [];
        
        for (let i = 0; i < slotCount; i++) {
            const slot = slots[i];
            const div = document.createElement('div');
            div.className = 'wand-slot';
            div.dataset.slotIndex = i;
            div.draggable = true;
            
            if (slot) {
                const star = slot.star || 1;
                div.classList.add('has-skill');
                div.classList.add(slot.type === 'magic' ? 'magic-type' : 'modifier-type');
                if (star >= 2) div.classList.add(`star-${star}`);
                const starText = '⭐'.repeat(star);
                div.innerHTML = `<span class="slot-index">${i + 1}</span><span class="slot-icon">${slot.icon}</span><span class="star-badge">${starText}</span>`;
                div.title = `${slot.name} (${star}星)\n${slot.desc || ''}`;
            } else {
                div.innerHTML = `<span class="slot-index">${i + 1}</span>`;
            }
            
            // 点击槽位：卸下技能
            div.onclick = () => {
                if (weapon && weapon.slots[i]) {
                    weapon.unequipSkill(i);
                    this.renderInventory();
                }
            };
            
            // 拖拽事件 - 槽位拖出
            div.ondragstart = (e) => {
                if (weapon && weapon.slots[i]) {
                    e.dataTransfer.setData('type', 'slot');
                    e.dataTransfer.setData('slotIndex', i.toString());
                    div.classList.add('dragging');
                } else {
                    e.preventDefault();
                }
            };
            div.ondragend = () => div.classList.remove('dragging');
            
            // 拖拽事件 - 接收拖入
            div.ondragover = (e) => { e.preventDefault(); div.classList.add('drag-over'); };
            div.ondragleave = () => div.classList.remove('drag-over');
            div.ondrop = (e) => {
                e.preventDefault();
                div.classList.remove('drag-over');
                const type = e.dataTransfer.getData('type');
                
                if (type === 'slot') {
                    // 槽位之间交换
                    const fromIndex = parseInt(e.dataTransfer.getData('slotIndex'));
                    if (!isNaN(fromIndex) && fromIndex !== i && weapon) {
                        [weapon.slots[fromIndex], weapon.slots[i]] = [weapon.slots[i], weapon.slots[fromIndex]];
                        this.renderInventory();
                    }
                } else if (type === 'inventory') {
                    // 从背包拖入
                    const invIndex = parseInt(e.dataTransfer.getData('inventoryIndex'));
                    if (!isNaN(invIndex) && weapon) {
                        weapon.equipSkill(invIndex, i);
                        this.renderInventory();
                    }
                }
            };
            
            slotsContainer.appendChild(div);
        }
        
        // 渲染背包（格子样式）
        const inventoryContainer = document.getElementById('inventory-items');
        inventoryContainer.innerHTML = '';
        
        const totalSlots = 100; // 背包总格子数 10x10
        const wand = weapon; // 兼容旧代码
        
        // 先渲染已有物品
        wand.inventory.forEach((skill, idx) => {
            const star = skill.star || 1;
            const div = document.createElement('div');
            div.className = 'inventory-item ' + (skill.type === 'magic' ? 'magic-type' : 'modifier-type');
            if (star >= 2) div.classList.add(`star-${star}`);
            div.draggable = true;
            div.dataset.inventoryIndex = idx;
            const starText = '⭐'.repeat(star);
            div.innerHTML = `<span class="item-icon">${skill.icon}</span><span class="star-badge">${starText}</span>`;
            div.title = `${skill.name} (${star}星)\n${skill.desc || ''}`;
            
            // 拖拽事件 - 背包物品拖出
            div.ondragstart = (e) => {
                e.dataTransfer.setData('type', 'inventory');
                e.dataTransfer.setData('inventoryIndex', idx.toString());
                div.classList.add('dragging');
            };
            div.ondragend = () => div.classList.remove('dragging');
            
            // 接收从工作台拖入的物品
            div.ondragover = (e) => { e.preventDefault(); div.classList.add('drag-over'); };
            div.ondragleave = () => div.classList.remove('drag-over');
            div.ondrop = (e) => {
                e.preventDefault();
                div.classList.remove('drag-over');
                const type = e.dataTransfer.getData('type');
                if (type === 'workbench') {
                    const wbIdx = parseInt(e.dataTransfer.getData('workbenchIndex'));
                    if (!isNaN(wbIdx)) {
                        this.dropFromWorkbenchToInventory(wbIdx);
                    }
                }
            };
            
            // 点击背包物品：装备到第一个空槽（工作台用拖拽）
            div.onclick = () => {
                let targetSlot = -1;
                for (let i = 0; i < wand.slotCount; i++) {
                    if (wand.slots[i] === null) {
                        targetSlot = i;
                        break;
                    }
                }
                
                if (targetSlot >= 0) {
                    wand.equipSkill(idx, targetSlot);
                } else {
                    wand.equipSkill(idx, wand.slotCount - 1);
                }
                this.renderInventory();
            };
            
            inventoryContainer.appendChild(div);
        });
        
        // 填充空槽位
        const emptySlots = totalSlots - wand.inventory.length;
        for (let i = 0; i < emptySlots; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'inventory-slot-empty';
            
            // 空槽位接收从技能槽拖入的技能
            emptyDiv.ondragover = (e) => { e.preventDefault(); emptyDiv.classList.add('drag-over'); };
            emptyDiv.ondragleave = () => emptyDiv.classList.remove('drag-over');
            emptyDiv.ondrop = (e) => {
                e.preventDefault();
                emptyDiv.classList.remove('drag-over');
                const type = e.dataTransfer.getData('type');
                
                if (type === 'slot') {
                    // 从技能槽拖回背包
                    const slotIndex = parseInt(e.dataTransfer.getData('slotIndex'));
                    if (!isNaN(slotIndex) && wand.slots[slotIndex]) {
                        wand.unequipSkill(slotIndex);
                        this.renderInventory();
                    }
                } else if (type === 'workbench') {
                    // 从工作台拖回背包
                    const wbIdx = parseInt(e.dataTransfer.getData('workbenchIndex'));
                    if (!isNaN(wbIdx)) {
                        this.dropFromWorkbenchToInventory(wbIdx);
                    }
                }
            };
            
            inventoryContainer.appendChild(emptyDiv);
        }
        
        // 渲染已获得的祝福
        const perksContainer = document.getElementById('perks-display');
        perksContainer.innerHTML = '';
        
        const perks = this.player.perkManager.getAllPerks();
        if (perks.length === 0) {
            perksContainer.innerHTML = '<div class="perks-empty">暂无祝福，升级后可获得</div>';
        } else {
            perks.forEach(perk => {
                const div = document.createElement('div');
                div.className = 'perk-item';
                div.innerHTML = `
                    <span class="perk-icon">${perk.icon}</span>
                    <div class="perk-info">
                        <span class="perk-name">${perk.name}</span>
                        <span class="perk-level">Lv.${perk.level}</span>
                    </div>
                `;
                div.title = perk.desc;
                perksContainer.appendChild(div);
            });
        }
    },
    
    // 工作台系统
    workbenchSlots: [null, null, null],
    workbenchOpen: false,
    
    toggleWorkbench() {
        this.workbenchOpen = !this.workbenchOpen;
        const panel = document.getElementById('workbench-panel');
        const btn = document.getElementById('workbench-toggle-btn');
        const layout = document.querySelector('.inventory-layout');
        
        if (this.workbenchOpen) {
            panel.classList.remove('hidden');
            btn.classList.add('active');
            layout.classList.add('with-workbench');
            this.renderWorkbench();
        } else {
            // 把工作台里的技能放回背包
            this.workbenchSlots.forEach((item, idx) => {
                if (item) {
                    this.player.wand.inventory.push(item.skill);
                }
            });
            this.workbenchSlots = [null, null, null];
            panel.classList.add('hidden');
            btn.classList.remove('active');
            layout.classList.remove('with-workbench');
            this.renderInventory();
        }
    },
    
    closeWorkbench() {
        if (this.workbenchOpen) {
            this.toggleWorkbench();
        }
    },
    
    // 渲染武器槽
    renderWeaponSlots() {
        const container = document.getElementById('weapon-slots');
        if (!container) return;
        container.innerHTML = '';
        
        const player = this.player;
        
        for (let i = 0; i < player.weaponSlots.length; i++) {
            const weapon = player.weaponSlots[i];
            const div = document.createElement('div');
            div.className = 'weapon-slot';
            div.dataset.slotIndex = i;
            
            if (weapon) {
                div.classList.add(`rarity-${weapon.rarity}`);
                if (i === player.currentWeaponIndex) {
                    div.classList.add('active');
                }
                div.innerHTML = `
                    <span class="weapon-slot-index">${i + 1}</span>
                    <span class="weapon-slot-icon">${weapon.icon}</span>
                    <span class="weapon-slot-name">${weapon.name}</span>
                `;
                div.title = `${weapon.name}\n能量: ${weapon.maxEnergy}\n槽位: ${weapon.slotCount}`;
            } else {
                div.classList.add('empty');
                div.innerHTML = `<span class="weapon-slot-index">${i + 1}</span><span class="weapon-slot-icon">+</span>`;
            }
            
            // 点击切换武器
            div.onclick = () => {
                if (weapon) {
                    player.switchWeapon(i);
                    this.renderInventory();
                }
            };
            
            // 拖拽接收
            div.ondragover = (e) => { e.preventDefault(); div.classList.add('drag-over'); };
            div.ondragleave = () => div.classList.remove('drag-over');
            div.ondrop = (e) => {
                e.preventDefault();
                div.classList.remove('drag-over');
                const type = e.dataTransfer.getData('type');
                
                if (type === 'weaponInventory') {
                    const weaponIdx = parseInt(e.dataTransfer.getData('weaponIndex'));
                    if (!isNaN(weaponIdx)) {
                        player.equipWeaponToSlot(weaponIdx, i);
                        this.renderInventory();
                    }
                }
            };
            
            container.appendChild(div);
        }
    },
    
    // 渲染武器背包
    renderWeaponInventory() {
        const container = document.getElementById('weapon-inventory');
        if (!container) return;
        container.innerHTML = '';
        
        const player = this.player;
        
        if (player.weaponInventory.length === 0) {
            container.innerHTML = '<div style="color:#666;font-size:12px;padding:10px;">暂无武器，击败Boss获取</div>';
            return;
        }
        
        player.weaponInventory.forEach((weapon, idx) => {
            const div = document.createElement('div');
            div.className = `weapon-inv-item rarity-${weapon.rarity}`;
            div.draggable = true;
            div.dataset.weaponIndex = idx;
            
            div.innerHTML = `
                <span class="weapon-inv-icon">${weapon.icon}</span>
                <span class="weapon-inv-name">${weapon.name}</span>
            `;
            div.title = `${weapon.name}\n能量: ${weapon.maxEnergy}\n回复: ${weapon.baseEnergyRegen}/s\n槽位: ${weapon.slotCount}`;
            
            // 拖拽开始
            div.ondragstart = (e) => {
                e.dataTransfer.setData('type', 'weaponInventory');
                e.dataTransfer.setData('weaponIndex', idx.toString());
                div.classList.add('dragging');
            };
            div.ondragend = () => div.classList.remove('dragging');
            
            container.appendChild(div);
        });
    },

    renderWorkbench() {
        // 渲染槽位
        for (let i = 0; i < 3; i++) {
            const slot = document.getElementById(`workbench-slot-${i}`);
            const item = this.workbenchSlots[i];
            if (item) {
                const starText = '⭐'.repeat(item.skill.star || 1);
                slot.innerHTML = `<span class="wb-icon">${item.skill.icon}</span><span class="wb-star">${starText}</span>`;
                slot.classList.add('filled');
                slot.draggable = true;
                
                // 从工作台拖出
                slot.ondragstart = (e) => {
                    e.dataTransfer.setData('type', 'workbench');
                    e.dataTransfer.setData('workbenchIndex', i.toString());
                    slot.classList.add('dragging');
                };
                slot.ondragend = () => slot.classList.remove('dragging');
            } else {
                slot.innerHTML = '<span class="wb-empty">+</span>';
                slot.classList.remove('filled');
                slot.draggable = false;
                slot.ondragstart = null;
                slot.ondragend = null;
            }
            
            // 接收拖入
            slot.ondragover = (e) => { e.preventDefault(); slot.classList.add('drag-over'); };
            slot.ondragleave = () => slot.classList.remove('drag-over');
            slot.ondrop = (e) => {
                e.preventDefault();
                slot.classList.remove('drag-over');
                const type = e.dataTransfer.getData('type');
                
                if (type === 'inventory') {
                    const invIdx = parseInt(e.dataTransfer.getData('inventoryIndex'));
                    if (!isNaN(invIdx)) {
                        this.dropToWorkbench(invIdx, i);
                    }
                } else if (type === 'workbench') {
                    const fromIdx = parseInt(e.dataTransfer.getData('workbenchIndex'));
                    if (!isNaN(fromIdx) && fromIdx !== i) {
                        this.swapWorkbenchSlots(fromIdx, i);
                    }
                }
            };
        }
        
        // 检查合成结果
        this.updateCraftResult();
    },
    
    // 从背包拖入工作台
    dropToWorkbench(inventoryIdx, slotIdx) {
        if (this.workbenchSlots[slotIdx] !== null) {
            // 槽位已有物品，放回背包
            this.player.wand.inventory.push(this.workbenchSlots[slotIdx].skill);
        }
        
        const skill = this.player.wand.inventory[inventoryIdx];
        this.workbenchSlots[slotIdx] = { skill };
        this.player.wand.inventory.splice(inventoryIdx, 1);
        this.renderWorkbench();
        this.renderInventory();
    },
    
    // 交换工作台槽位
    swapWorkbenchSlots(fromIdx, toIdx) {
        const temp = this.workbenchSlots[fromIdx];
        this.workbenchSlots[fromIdx] = this.workbenchSlots[toIdx];
        this.workbenchSlots[toIdx] = temp;
        this.renderWorkbench();
    },
    
    removeFromWorkbench(slotIdx) {
        const item = this.workbenchSlots[slotIdx];
        if (!item) return;
        
        this.player.wand.inventory.push(item.skill);
        this.workbenchSlots[slotIdx] = null;
        this.renderWorkbench();
        this.renderInventory();
    },
    
    // 从工作台拖回背包
    dropFromWorkbenchToInventory(workbenchIdx) {
        const item = this.workbenchSlots[workbenchIdx];
        if (!item) return;
        
        this.player.wand.inventory.push(item.skill);
        this.workbenchSlots[workbenchIdx] = null;
        this.renderWorkbench();
        this.renderInventory();
    },
    
    updateCraftResult() {
        const resultDiv = document.getElementById('workbench-result');
        const tipDiv = document.getElementById('workbench-tip');
        const craftBtn = document.getElementById('workbench-craft-btn');
        
        const filledSlots = this.workbenchSlots.filter(s => s !== null);
        const craftResult = this.getCraftResult();
        
        if (craftResult) {
            if (craftResult.type === 'upgrade') {
                const starText = '⭐'.repeat(craftResult.newStar);
                resultDiv.innerHTML = `<span class="wb-result-icon">${craftResult.skill.icon}</span><span class="wb-result-star">${starText}</span>`;
                tipDiv.innerHTML = `✨ 升星合成: ${craftResult.skill.name} → ${starText}`;
            } else if (craftResult.type === 'random') {
                // 计算并显示概率
                const probText = this.getRandomCraftProbText(craftResult.slots);
                resultDiv.innerHTML = `<span class="wb-result-icon">❓</span><span class="wb-result-text">随机</span>`;
                tipDiv.innerHTML = `🎲 随机合成<br>${probText}`;
            }
            resultDiv.classList.add('ready');
            craftBtn.disabled = false;
        } else {
            resultDiv.innerHTML = '<span class="wb-empty">?</span>';
            resultDiv.classList.remove('ready');
            craftBtn.disabled = true;
            
            if (filledSlots.length === 0) {
                tipDiv.innerHTML = '拖入技能进行合成：<br>• 3个相同技能 → 升星 (最高3星)<br>• 2个不同技能 → 随机新技能';
            } else if (filledSlots.length === 1) {
                tipDiv.innerHTML = '再添加1个技能进行随机合成，或添加2个相同技能进行升星';
            } else if (filledSlots.length === 2) {
                const s1 = filledSlots[0].skill;
                const s2 = filledSlots[1].skill;
                if (s1.id === s2.id && (s1.star || 1) === (s2.star || 1)) {
                    tipDiv.innerHTML = '再添加1个相同技能可升星';
                }
            } else {
                tipDiv.innerHTML = '无法合成，请检查技能组合';
            }
        }
    },
    
    getRandomCraftProbText(slots) {
        let totalValue = 0;
        slots.forEach(slot => {
            const star = slot.skill.star || 1;
            totalValue += Math.pow(2, star - 1);
        });
        
        if (totalValue >= 4) {
            const p1 = Math.round(1 / totalValue * 100);
            const p2 = Math.round(2 / totalValue * 100);
            const p3 = 100 - p1 - p2;
            return `⭐${p1}% ⭐⭐${p2}% ⭐⭐⭐${p3}%`;
        } else if (totalValue >= 2) {
            const p2 = Math.round((totalValue - 1) / totalValue * 100);
            const p1 = 100 - p2;
            if (totalValue === 2) {
                return `必定获得 ⭐⭐`;
            }
            return `⭐${p1}% ⭐⭐${p2}%`;
        }
        return `必定获得 ⭐`;
    },
    
    getCraftResult() {
        const filledSlots = this.workbenchSlots.filter(s => s !== null);
        
        if (filledSlots.length === 3) {
            // 检查是否3个相同技能且同星级
            const s1 = filledSlots[0].skill;
            const s2 = filledSlots[1].skill;
            const s3 = filledSlots[2].skill;
            const star1 = s1.star || 1;
            const star2 = s2.star || 1;
            const star3 = s3.star || 1;
            
            if (s1.id === s2.id && s2.id === s3.id && star1 === star2 && star2 === star3) {
                if (star1 < 3) {
                    return { type: 'upgrade', skill: s1, newStar: star1 + 1 };
                }
            }
            // 3个不同的也可以随机合成
            return { type: 'random', slots: filledSlots };
        }
        
        if (filledSlots.length === 2) {
            const s1 = filledSlots[0].skill;
            const s2 = filledSlots[1].skill;
            // 2个不同技能可以随机合成
            if (s1.id !== s2.id || (s1.star || 1) !== (s2.star || 1)) {
                return { type: 'random', slots: filledSlots };
            }
        }
        
        return null;
    },
    
    // 计算随机合成的结果星级
    calculateRandomCraftStar(slots) {
        // 计算总星值（每星等于2^(star-1)个1星）
        let totalValue = 0;
        slots.forEach(slot => {
            const star = slot.skill.star || 1;
            totalValue += Math.pow(2, star - 1);
        });
        
        // 计算各星级概率
        // 1星=1, 2星=2, 3星=4
        // 例如：1星+2星 = 1+2 = 3，有 2/3 概率1星，1/3 概率2星
        // 例如：2星+2星 = 2+2 = 4，必定2星
        // 例如：1星+3星 = 1+4 = 5，有 4/5 概率1星，1/5 概率3星（简化为2星）
        
        const rand = Math.random() * totalValue;
        
        if (totalValue >= 4) {
            // 有机会出3星
            if (rand < 1) return 1;
            if (rand < 3) return 2;
            return 3;
        } else if (totalValue >= 2) {
            // 有机会出2星
            if (rand < totalValue - 2 + 1) return 1;
            return 2;
        }
        return 1;
    },
    
    doCraft() {
        const craftResult = this.getCraftResult();
        if (!craftResult) return;
        
        if (craftResult.type === 'upgrade') {
            // 升星合成
            const newSkill = { ...craftResult.skill, star: craftResult.newStar };
            this.player.wand.inventory.push(newSkill);
            this.workbenchSlots = [null, null, null];
            this.addFloatingText(`升星成功! ${newSkill.name} ${'⭐'.repeat(craftResult.newStar)}`, this.player.x, this.player.y - 40, '#ffd700');
            Audio.play('levelup');
        } else if (craftResult.type === 'random') {
            // 随机合成 - 根据投入技能星级计算结果星级
            const resultStar = this.calculateRandomCraftStar(craftResult.slots);
            const allSkillIds = Object.keys(ALL_SKILLS);
            const randomId = allSkillIds[Math.floor(Math.random() * allSkillIds.length)];
            const randomSkill = { ...ALL_SKILLS[randomId], star: resultStar };
            this.player.wand.inventory.push(randomSkill);
            this.workbenchSlots = [null, null, null];
            const starText = resultStar > 1 ? ' ' + '⭐'.repeat(resultStar) : '';
            this.addFloatingText(`获得: ${randomSkill.icon} ${randomSkill.name}${starText}!`, this.player.x, this.player.y - 40, '#00ffff');
            Audio.play('pickup');
        }
        
        this.renderWorkbench();
        this.renderInventory();
    },
    
    // 一键合成 - 自动合成所有可升星的技能
    autoMergeAll() {
        let mergeCount = 0;
        let continueLoop = true;
        
        while (continueLoop) {
            continueLoop = false;
            const inventory = this.player.wand.inventory;
            
            // 统计每种技能每个星级的数量
            const skillCounts = {};
            inventory.forEach((skill, idx) => {
                const key = `${skill.id}_${skill.star || 1}`;
                if (!skillCounts[key]) {
                    skillCounts[key] = { skill, star: skill.star || 1, indices: [] };
                }
                skillCounts[key].indices.push(idx);
            });
            
            // 找到可以合成的（3个相同且星级<3）
            for (const key in skillCounts) {
                const data = skillCounts[key];
                if (data.indices.length >= 3 && data.star < 3) {
                    // 移除3个，添加1个升星的
                    const toRemove = data.indices.slice(0, 3).sort((a, b) => b - a);
                    toRemove.forEach(idx => inventory.splice(idx, 1));
                    
                    const newSkill = { ...data.skill, star: data.star + 1 };
                    inventory.push(newSkill);
                    
                    mergeCount++;
                    continueLoop = true;
                    break; // 重新开始循环
                }
            }
        }
        
        if (mergeCount > 0) {
            this.addFloatingText(`一键合成完成! 合成了 ${mergeCount} 次`, this.player.x, this.player.y - 40, '#ffd700');
            Audio.play('levelup');
            this.renderInventory();
        } else {
            this.addFloatingText('没有可合成的技能', this.player.x, this.player.y - 40, '#888888');
        }
    },
    
    // ========== 武器选择系统 ==========
    pendingWeaponDrops: null,
    
    showWeaponDrop(weapons) {
        this.pendingWeaponDrops = weapons;
        this.state = 'WEAPON_DROP';
        
        const container = document.getElementById('weapon-drop-options');
        container.innerHTML = '';
        
        weapons.forEach((weapon, index) => {
            const card = document.createElement('div');
            card.className = `weapon-drop-card rarity-${weapon.rarity}`;
            card.onclick = () => this.selectWeaponDrop(index);
            
            // 词条HTML
            let affixesHtml = '';
            weapon.affixes.forEach(affix => {
                const def = WEAPON_AFFIXES[affix.id];
                if (def) {
                    const desc = def.desc.replace('{value}', affix.value);
                    affixesHtml += `<div class="weapon-affix">✦ ${desc}</div>`;
                }
            });
            
            // 特殊槽HTML
            let specialHtml = '';
            if (weapon.specialSlot) {
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
        
        document.getElementById('weapon-drop-modal').classList.remove('hidden');
    },
    
    selectWeaponDrop(index) {
        const weapon = this.pendingWeaponDrops[index];
        this.equipNewWeapon(weapon);
        this.closeWeaponDrop();
    },
    
    skipWeaponDrop() {
        // 随机选一个
        const index = Math.floor(Math.random() * this.pendingWeaponDrops.length);
        const weapon = this.pendingWeaponDrops[index];
        this.equipNewWeapon(weapon);
        this.addFloatingText(`随机获得: ${weapon.icon} ${weapon.name}`, this.player.x, this.player.y - 40, '#ffd700');
        this.closeWeaponDrop();
    },
    
    equipNewWeapon(weapon) {
        // 新武器放入武器背包
        this.player.weaponInventory.push(weapon);
        this.addFloatingText(`获得: ${weapon.icon} ${weapon.name}`, this.player.x, this.player.y - 60, '#ffd700');
        Audio.play('levelup');
        this.updateUI();
    },
    
    closeWeaponDrop() {
        document.getElementById('weapon-drop-modal').classList.add('hidden');
        this.pendingWeaponDrops = null;
        this.state = 'PLAYING';
    }
};

window.startGame = function(charType) {
    Game.start(charType);
};
