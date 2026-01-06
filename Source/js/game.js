// --- 游戏引擎 (类幸存者风格 + 场景系统) ---

const CANVAS = document.getElementById('gameCanvas');
const CTX = CANVAS.getContext('2d');

// 相机位置（跟随玩家）
let cameraX = 0;
let cameraY = 0;

function resize() {
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;
    CONFIG.GAME_WIDTH = CANVAS.width;
    CONFIG.GAME_HEIGHT = CANVAS.height;
}
window.addEventListener('resize', resize);
resize();

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
    
    init() {
        Input.init();
        SceneManager.currentScene = 'grass';
        SceneManager.init();
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    },

    start(charType) {
        this.player = new Player(charType);
        this.player.x = 0;
        this.player.y = 0;
        
        this.enemies = [];
        this.gems = [];
        this.projectiles = [];
        this.skillDrops = [];
        this.floatingTexts = [];
        this.particles = [];
        this.lightningEffects = [];
        this.sceneElements = [];
        this.frameCount = 0;
        this.time = 0;
        this.kills = 0;
        this.level = 1;
        this.xp = 0;
        this.xpToNext = 10;
        
        // 随机选择场景
        SceneManager.randomScene();
        this.generateSceneElements();
        
        document.getElementById('hud').classList.remove('hidden');
        document.getElementById('gameover-screen').classList.add('hidden');
        
        this.state = 'PLAYING';
        this.updateUI();
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

        // 更新相机（跟随玩家）
        cameraX = this.player.x - CONFIG.GAME_WIDTH / 2;
        cameraY = this.player.y - CONFIG.GAME_HEIGHT / 2;

        // 更新敌人
        this.enemies.forEach(e => e.update(this.player));
        
        // 更新宝石
        this.gems.forEach(g => g.update(this.player));
        
        // 更新技能掉落
        this.skillDrops.forEach(s => s.update(this.player));
        
        // 更新投射物
        this.projectiles.forEach(p => p.update());

        // 碰撞检测：投射物 vs 敌人
        this.projectiles.forEach(p => {
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
        });

        // 碰撞检测：敌人 vs 玩家
        this.enemies.forEach(e => {
            if (this.checkCollision(e, this.player)) {
                if (this.frameCount % 30 === 0) {
                    this.player.hp -= e.damage;
                    this.addFloatingText("-" + e.damage, this.player.x, this.player.y - 30, '#ff4444');
                    this.spawnParticles(this.player.x, this.player.y, '#ff0000', 5);
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
        document.getElementById('hp-text').innerText = `${Math.ceil(this.player.hp)}/${this.player.maxHp}`;
        
        const xpPct = (this.xp / this.xpToNext) * 100;
        document.getElementById('xp-bar-fill').style.width = xpPct + '%';
        document.getElementById('level-text').innerText = 'Lv.' + this.level;
        
        document.getElementById('kill-count').innerText = '击杀: ' + this.kills;
    },

    formatTime(sec) {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    },

    gameOver() {
        this.state = 'GAME_OVER';
        document.getElementById('gameover-screen').classList.remove('hidden');
        document.getElementById('final-time').innerText = this.formatTime(this.time);
        document.getElementById('final-kills').innerText = this.kills;
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
        document.getElementById('main-menu').classList.remove('hidden');
    },
    
    // 背包系统
    openInventory() {
        this.previousState = this.state;
        this.state = 'INVENTORY';
        document.getElementById('inventory-screen').classList.remove('hidden');
        this.renderInventory();
    },
    
    closeInventory() {
        this.state = this.previousState || 'PLAYING';
        document.getElementById('inventory-screen').classList.add('hidden');
    },
    
    renderInventory() {
        const wand = this.player.wand;
        
        // 渲染技能槽
        const slotsContainer = document.getElementById('wand-slots');
        slotsContainer.innerHTML = '';
        
        for (let i = 0; i < wand.slotCount; i++) {
            const slot = wand.slots[i];
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
                if (wand.slots[i]) {
                    wand.unequipSkill(i);
                    this.renderInventory();
                }
            };
            
            // 拖拽事件 - 槽位拖出
            div.ondragstart = (e) => {
                if (wand.slots[i]) {
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
                    if (!isNaN(fromIndex) && fromIndex !== i) {
                        wand.swapSlots(fromIndex, i);
                        this.renderInventory();
                    }
                } else if (type === 'inventory') {
                    // 从背包拖入
                    const invIndex = parseInt(e.dataTransfer.getData('inventoryIndex'));
                    if (!isNaN(invIndex)) {
                        wand.equipSkill(invIndex, i);
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
            
            // 点击背包物品：装备到第一个空槽
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
    
    // 合成面板
    showMergePanel() {
        document.getElementById('merge-modal').classList.remove('hidden');
        this.renderMergePanel();
    },
    
    closeMergePanel() {
        document.getElementById('merge-modal').classList.add('hidden');
    },
    
    renderMergePanel() {
        const mergeList = document.getElementById('merge-list');
        mergeList.innerHTML = '';
        
        const mergeable = this.player.wand.canMergeSkills();
        
        if (mergeable.length === 0) {
            mergeList.innerHTML = '<div class="merge-empty">没有可合成的技能<br>需要3个相同星级的技能</div>';
            return;
        }
        
        mergeable.forEach(item => {
            const skill = item.skill;
            const star = item.star;
            const count = item.indices.length;
            const starText = '⭐'.repeat(star);
            const nextStarText = '⭐'.repeat(star + 1);
            
            const div = document.createElement('div');
            div.className = 'merge-item';
            div.innerHTML = `
                <div class="merge-item-info">
                    <span class="merge-item-icon">${skill.icon}</span>
                    <div>
                        <div class="merge-item-name">${skill.name}</div>
                        <div class="merge-item-stars">${starText} → ${nextStarText}</div>
                        <div class="merge-item-count">数量: ${count}</div>
                    </div>
                </div>
                <button class="merge-do-btn" onclick="Game.doMerge('${skill.id}', ${star})">合成</button>
            `;
            mergeList.appendChild(div);
        });
    },
    
    doMerge(skillId, star) {
        if (this.player.wand.mergeSkill(skillId, star)) {
            this.addFloatingText('合成成功!', this.player.x, this.player.y - 40, '#00ff00');
            this.renderMergePanel();
            this.renderInventory();
        }
    }
};

window.startGame = function(charType) {
    Game.start(charType);
};
