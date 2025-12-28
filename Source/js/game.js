// --- 游戏引擎 (球比伦战记风格 - 垂直滚动射击) ---

const CANVAS = document.getElementById('gameCanvas');
const CTX = CANVAS.getContext('2d');

// 游戏缩放相关
let gameScale = 1;
let offsetX = 0;
let offsetY = 0;

function resize() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // 计算缩放比例，保持 1080:2340 的比例
    const targetRatio = CONFIG.GAME_WIDTH / CONFIG.GAME_HEIGHT;
    const windowRatio = windowWidth / windowHeight;
    
    if (windowRatio > targetRatio) {
        // 窗口更宽，以高度为基准
        gameScale = windowHeight / CONFIG.GAME_HEIGHT;
        CANVAS.height = windowHeight;
        CANVAS.width = CONFIG.GAME_WIDTH * gameScale;
        offsetX = (windowWidth - CANVAS.width) / 2;
        offsetY = 0;
    } else {
        // 窗口更高，以宽度为基准
        gameScale = windowWidth / CONFIG.GAME_WIDTH;
        CANVAS.width = windowWidth;
        CANVAS.height = CONFIG.GAME_HEIGHT * gameScale;
        offsetX = 0;
        offsetY = (windowHeight - CANVAS.height) / 2;
    }
    
    CANVAS.style.position = 'absolute';
    CANVAS.style.left = offsetX + 'px';
    CANVAS.style.top = offsetY + 'px';
}
window.addEventListener('resize', resize);
resize();

const Game = {
    state: 'MENU',
    player: null,
    enemies: [],
    gems: [],
    projectiles: [],
    floatingTexts: [],
    particles: [],
    
    // 地图滚动
    scrollY: 0,
    scrollSpeed: CONFIG.SCROLL_SPEED,
    
    // 背景元素
    bgElements: [],
    
    frameCount: 0,
    time: 0,
    kills: 0,
    level: 1,
    xp: 0,
    xpToNext: 10,
    
    // 波次系统
    wave: 1,
    waveTimer: 0,
    waveEnemyCount: 0,
    
    init() {
        Input.init();
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
        this.generateBgElements();
    },
    
    generateBgElements() {
        // 生成初始背景元素（树和石头）
        this.bgElements = [];
        for (let i = 0; i < 25; i++) {
            this.bgElements.push({
                x: Math.random() * CONFIG.GAME_WIDTH,
                y: Math.random() * CONFIG.GAME_HEIGHT * 2 - CONFIG.GAME_HEIGHT,
                type: Math.random() > 0.3 ? 'tree' : 'rock',
                size: 25 + Math.random() * 20
            });
        }
    },

    start(charType) {
        this.player = new Player(charType);
        // 玩家初始位置在屏幕下方中央
        this.player.x = CONFIG.GAME_WIDTH / 2;
        this.player.y = CONFIG.GAME_HEIGHT * 0.8;
        
        this.enemies = [];
        this.gems = [];
        this.projectiles = [];
        this.floatingTexts = [];
        this.particles = [];
        this.frameCount = 0;
        this.time = 0;
        this.kills = 0;
        this.level = 1;
        this.xp = 0;
        this.xpToNext = 10;
        this.scrollY = 0;
        this.wave = 1;
        this.waveTimer = 0;
        this.waveEnemyCount = 0;
        
        this.generateBgElements();
        
        document.getElementById('hud').classList.remove('hidden');
        document.getElementById('gameover-screen').classList.add('hidden');
        
        this.state = 'PLAYING';
        this.updateUI();
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
        
        // 地图滚动
        this.scrollY += this.scrollSpeed;
        
        // 更新背景元素
        this.bgElements.forEach(el => {
            el.y += this.scrollSpeed;
            // 循环背景
            if (el.y > CONFIG.GAME_HEIGHT + 100) {
                el.y = -100;
                el.x = Math.random() * CONFIG.GAME_WIDTH;
            }
        });

        // 生成敌人
        this.spawnEnemies();

        // 更新粒子
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy + this.scrollSpeed * 0.5;
            p.life--;
            p.vx *= 0.95;
            p.vy *= 0.95;
        });
        this.particles = this.particles.filter(p => p.life > 0);

        // 更新玩家
        this.player.update();
        if (this.player.hp <= 0) {
            this.gameOver();
        }

        // 更新敌人（向下移动 + 追踪玩家）
        this.enemies.forEach(e => e.update(this.player));
        
        // 更新宝石
        this.gems.forEach(g => {
            g.y += this.scrollSpeed * 0.5;
            g.update(this.player);
        });
        
        // 更新投射物
        this.projectiles.forEach(p => p.update());

        // 碰撞检测：投射物 vs 敌人
        this.projectiles.forEach(p => {
            this.enemies.forEach(e => {
                if (!e.markedForDeletion && !p.markedForDeletion) {
                    if (checkCircleCollide(p, e)) {
                        if (!p.hitList.includes(e)) {
                            e.takeDamage(p.damage, p.dx * p.knockback, p.dy * p.knockback);
                            p.hitList.push(e);
                            this.spawnParticles(e.x, e.y, e.color, 3);
                            if (p.hitList.length >= p.penetrate) {
                                p.markedForDeletion = true;
                            }
                        }
                    }
                }
            });
        });

        // 碰撞检测：敌人 vs 玩家
        this.enemies.forEach(e => {
            if (checkCircleCollide(e, this.player)) {
                if (this.frameCount % 30 === 0) {
                    this.player.hp -= e.damage;
                    this.addFloatingText("-" + e.damage, this.player.x, this.player.y - 20, '#ff4444');
                    this.spawnParticles(this.player.x, this.player.y, '#ff0000', 5);
                    this.updateUI();
                }
            }
        });

        // 清理
        this.enemies = this.enemies.filter(e => !e.markedForDeletion && e.y < CONFIG.GAME_HEIGHT * CONFIG.ENEMY_DESPAWN_Y);
        this.gems = this.gems.filter(g => !g.markedForDeletion && g.y < CONFIG.GAME_HEIGHT + 50);
        this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);
        this.floatingTexts = this.floatingTexts.filter(t => t.life > 0);
        this.floatingTexts.forEach(t => {
            t.y -= 0.5;
            t.life--;
        });
    },

    draw() {
        // 清空画布 - 草地底色
        CTX.fillStyle = '#8ccf7e';
        CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);
        
        CTX.save();
        CTX.scale(gameScale, gameScale);
        
        // 绘制道路背景
        this.drawBackground();
        
        if (!this.player) {
            // 菜单状态的背景动画
            this.drawMenuBackground();
            CTX.restore();
            return;
        }
        
        // 绘制宝石
        this.gems.forEach(g => g.draw(CTX, 0, 0));
        
        // 绘制粒子
        this.particles.forEach(p => {
            CTX.fillStyle = p.color;
            CTX.globalAlpha = p.life / 30;
            CTX.beginPath();
            CTX.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            CTX.fill();
            CTX.globalAlpha = 1.0;
        });

        // 绘制敌人
        this.enemies.forEach(e => e.draw(CTX, 0, 0));
        
        // 绘制玩家
        this.player.draw(CTX, 0, 0);
        
        // 绘制投射物
        this.projectiles.forEach(p => p.draw(CTX, 0, 0));

        // 光环视觉
        this.player.weapons.forEach(w => {
            if (w.id === 'aura' || w.id === 'garlic') {
                const stats = w.getStats();
                const r = (w.id === 'aura' ? 60 : 80) * stats.area;
                CTX.beginPath();
                CTX.arc(this.player.x, this.player.y, r, 0, Math.PI * 2);
                CTX.strokeStyle = w.id === 'aura' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(100, 255, 100, 0.4)';
                CTX.lineWidth = 3;
                CTX.setLineDash([10, 10]);
                CTX.stroke();
                CTX.setLineDash([]);
                CTX.fillStyle = w.id === 'aura' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(100, 255, 100, 0.1)';
                CTX.fill();
            }
        });

        // 浮动文字
        this.floatingTexts.forEach(t => {
            CTX.fillStyle = t.color;
            CTX.font = 'bold 24px Fredoka';
            CTX.strokeStyle = 'black';
            CTX.lineWidth = 3;
            CTX.strokeText(t.text, t.x, t.y);
            CTX.fillText(t.text, t.x, t.y);
        });
        
        CTX.restore();
    },
    
    drawBackground() {
        // 草地背景
        CTX.fillStyle = '#8ccf7e';
        CTX.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
        
        // 草地纹理（棋盘格效果）
        CTX.fillStyle = '#83c276';
        const tileSize = 100;
        const offsetY = this.scrollY % tileSize;
        
        for (let i = 0; i < CONFIG.GAME_WIDTH; i += tileSize) {
            for (let j = -tileSize + offsetY; j < CONFIG.GAME_HEIGHT + tileSize; j += tileSize) {
                if ((Math.floor(i / tileSize) + Math.floor((j - offsetY + this.scrollY) / tileSize)) % 2 === 0) {
                    CTX.fillRect(i, j, tileSize / 2, tileSize / 2);
                }
            }
        }
        
        // 背景装饰（树和石头）
        this.bgElements.forEach(el => {
            if (el.type === 'tree') {
                // 阴影
                CTX.fillStyle = 'rgba(0,0,0,0.2)';
                CTX.beginPath();
                CTX.arc(el.x, el.y + 10, el.size, 0, Math.PI * 2);
                CTX.fill();
                // 树干
                CTX.fillStyle = '#8d6e63';
                CTX.fillRect(el.x - 5, el.y - 10, 10, 20);
                // 树冠
                CTX.fillStyle = '#4caf50';
                CTX.beginPath();
                CTX.arc(el.x, el.y - 20, el.size, 0, Math.PI * 2);
                CTX.fill();
                CTX.fillStyle = '#66bb6a';
                CTX.beginPath();
                CTX.arc(el.x - 5, el.y - 25, el.size * 0.7, 0, Math.PI * 2);
                CTX.fill();
            } else {
                // 石头
                CTX.fillStyle = 'rgba(0,0,0,0.2)';
                CTX.beginPath();
                CTX.arc(el.x, el.y + 5, el.size * 0.8, 0, Math.PI * 2);
                CTX.fill();
                CTX.fillStyle = '#9e9e9e';
                CTX.beginPath();
                CTX.moveTo(el.x - el.size, el.y);
                CTX.lineTo(el.x, el.y - el.size);
                CTX.lineTo(el.x + el.size, el.y);
                CTX.lineTo(el.x, el.y + el.size * 0.6);
                CTX.fill();
            }
        });
    },
    
    drawMenuBackground() {
        // 菜单背景动画
        const t = Date.now() / 1000;
        this.scrollY = t * 50;
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

    spawnEnemies() {
        // 基础生成率随时间增加
        const baseRate = Math.max(15, 45 - Math.floor(this.time / 5));
        
        if (this.frameCount % baseRate === 0) {
            // 在屏幕上方随机位置生成
            const roadWidth = CONFIG.GAME_WIDTH * 0.6;
            const roadX = (CONFIG.GAME_WIDTH - roadWidth) / 2;
            const x = roadX + Math.random() * roadWidth;
            const y = CONFIG.ENEMY_SPAWN_Y;
            
            let type = 1;
            if (this.time > 20 && Math.random() < 0.25) type = 2;
            if (this.time > 45 && Math.random() < 0.15) type = 3;

            this.enemies.push(new Enemy(x, y, type));
        }
        
        // 波次敌人（成群出现）
        if (this.frameCount % 600 === 0) {
            this.spawnWave();
        }
    },
    
    spawnWave() {
        this.wave++;
        const enemyCount = 5 + this.wave * 2;
        const roadWidth = CONFIG.GAME_WIDTH * 0.6;
        const roadX = (CONFIG.GAME_WIDTH - roadWidth) / 2;
        
        for (let i = 0; i < enemyCount; i++) {
            setTimeout(() => {
                if (this.state === 'PLAYING') {
                    const x = roadX + (i / enemyCount) * roadWidth;
                    const y = CONFIG.ENEMY_SPAWN_Y - Math.random() * 100;
                    const type = Math.random() < 0.3 ? 2 : 1;
                    this.enemies.push(new Enemy(x, y, type));
                }
            }, i * 100);
        }
    },

    addXp(amount) {
        this.xp += amount;
        if (this.xp >= this.xpToNext) {
            this.xp -= this.xpToNext;
            this.levelUp();
        }
        this.updateUI();
    },

    levelUp() {
        this.level++;
        this.xpToNext = Math.floor(this.xpToNext * 1.2);
        this.state = 'LEVEL_UP';
        this.showUpgradeMenu();
        this.updateUI();
    },

    showUpgradeMenu() {
        const container = document.getElementById('cards-container');
        container.innerHTML = '';
        
        const options = [];
        const pool = [...UPGRADES];
        for (let i = 0; i < 3; i++) {
            if (pool.length === 0) break;
            const idx = Math.floor(Math.random() * pool.length);
            options.push(pool[idx]);
            pool.splice(idx, 1);
        }

        options.forEach(opt => {
            const div = document.createElement('div');
            div.className = 'upgrade-card';
            div.innerHTML = `<h3>${opt.name}</h3><p>${opt.desc}</p>`;
            div.onclick = () => this.selectUpgrade(opt);
            container.appendChild(div);
        });

        document.getElementById('levelup-screen').classList.remove('hidden');
        document.getElementById('levelup-level').innerText = this.level;
    },

    selectUpgrade(opt) {
        if (opt.type === 'stat') {
            if (opt.stat === 'maxHp') {
                this.player.maxHp += opt.val;
                this.player.hp += opt.val;
            } else if (opt.stat === 'regen') {
                this.player.regen += opt.val;
            } else if (opt.stat === 'amount') {
                this.player.amount += opt.val;
            } else if (['damageMult', 'areaMult', 'cooldownMult', 'durationMult', 'knockback'].includes(opt.stat)) {
                if (opt.stat === 'cooldownMult') this.player.cooldownMult *= opt.val;
                else if (opt.val < 1) this.player[opt.stat] += opt.val;
                else this.player[opt.stat] *= opt.val;
            } else if (opt.stat === 'speed') {
                this.player.speed *= opt.val;
            } else if (opt.stat === 'pickupRange') {
                this.player.pickupRange *= opt.val;
            } else if (opt.stat === 'projSpeed') {
                this.player.projSpeed *= opt.val;
            } else if (opt.stat === 'critChance') {
                this.player.critChance += opt.val;
            }
        } else if (opt.type === 'weapon') {
            this.player.addWeapon(opt.weaponId);
        }

        document.getElementById('levelup-screen').classList.add('hidden');
        this.state = 'PLAYING';
        this.updateUI();
    },

    spawnGem(x, y, val) {
        this.gems.push(new Gem(x, y, val));
    },

    addFloatingText(text, x, y, color) {
        this.floatingTexts.push({ text, x, y, color, life: 30 });
    },

    updateUI() {
        const hpPct = Math.max(0, (this.player.hp / this.player.maxHp) * 100);
        document.getElementById('hp-bar-fill').style.width = hpPct + '%';
        document.getElementById('hp-text').innerText = `${Math.floor(this.player.hp)}/${this.player.maxHp}`;
        
        const xpPct = (this.xp / this.xpToNext) * 100;
        document.getElementById('xp-bar-fill').style.width = xpPct + '%';
        document.getElementById('level-text').innerText = 'Lv. ' + this.level;
        
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
        this.floatingTexts = [];
        this.particles = [];
        
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('levelup-screen').classList.add('hidden');
        document.getElementById('gameover-screen').classList.add('hidden');
        document.getElementById('main-menu').classList.remove('hidden');
    }
};

window.startGame = function(charType) {
    Game.start(charType);
};
