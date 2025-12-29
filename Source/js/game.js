// --- 游戏引擎 (葵瓜战记 - 垂直滚动射击) ---

const CANVAS = document.getElementById('gameCanvas');
const CTX = CANVAS.getContext('2d');

// 游戏缩放相关
let gameScale = 1;
let offsetX = 0;
let offsetY = 0;

function resize() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    const targetRatio = CONFIG.GAME_WIDTH / CONFIG.GAME_HEIGHT;
    const windowRatio = windowWidth / windowHeight;
    
    if (windowRatio > targetRatio) {
        gameScale = windowHeight / CONFIG.GAME_HEIGHT;
        CANVAS.height = windowHeight;
        CANVAS.width = CONFIG.GAME_WIDTH * gameScale;
        offsetX = (windowWidth - CANVAS.width) / 2;
        offsetY = 0;
    } else {
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
    lightningEffects: [],
    
    scrollY: 0,
    scrollSpeed: CONFIG.SCROLL_SPEED,
    
    frameCount: 0,
    time: 0,
    kills: 0,
    level: 1,
    xp: 0,
    xpToNext: 10,
    wave: 1,
    
    init() {
        Input.init();
        SceneManager.currentScene = 'grass';
        SceneManager.init();
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    },

    start(charType) {
        this.player = new Player(charType);
        this.player.x = CONFIG.GAME_WIDTH / 2;
        this.player.y = CONFIG.GAME_HEIGHT * 0.8;
        
        this.enemies = [];
        this.gems = [];
        this.projectiles = [];
        this.floatingTexts = [];
        this.particles = [];
        this.lightningEffects = [];
        this.frameCount = 0;
        this.time = 0;
        this.kills = 0;
        this.level = 1;
        this.xp = 0;
        this.xpToNext = 10;
        this.scrollY = 0;
        this.wave = 1;
        
        SceneManager.randomScene();
        
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
        
        this.scrollY += this.scrollSpeed;
        SceneManager.update(this.scrollSpeed, this.frameCount);
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
        this.lightningEffects = this.lightningEffects.filter(l => l.life-- > 0);

        this.player.update();
        if (this.player.hp <= 0) {
            this.gameOver();
        }

        this.enemies.forEach(e => e.update(this.player));
        this.gems.forEach(g => {
            g.y += this.scrollSpeed * 0.5;
            g.update(this.player);
        });
        this.projectiles.forEach(p => p.update());

        // 碰撞检测
        this.projectiles.forEach(p => {
            this.enemies.forEach(e => {
                if (!e.markedForDeletion && !p.markedForDeletion && checkCircleCollide(p, e)) {
                    if (!p.hitList.includes(e)) {
                        e.takeDamage(p.damage, p.dx * p.knockback, p.dy * p.knockback);
                        p.hitList.push(e);
                        this.spawnParticles(e.x, e.y, e.color, 3);
                        if (p.hitList.length >= p.penetrate) {
                            p.markedForDeletion = true;
                        }
                    }
                }
            });
        });

        this.enemies.forEach(e => {
            if (checkCircleCollide(e, this.player) && this.frameCount % 30 === 0) {
                this.player.hp -= e.damage;
                this.addFloatingText("-" + e.damage, this.player.x, this.player.y - 20, '#ff4444');
                this.spawnParticles(this.player.x, this.player.y, '#ff0000', 5);
                this.updateUI();
            }
        });

        // 清理
        this.enemies = this.enemies.filter(e => !e.markedForDeletion && e.y < CONFIG.GAME_HEIGHT * CONFIG.ENEMY_DESPAWN_Y);
        this.gems = this.gems.filter(g => !g.markedForDeletion && g.y < CONFIG.GAME_HEIGHT + 50);
        this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);
        this.floatingTexts = this.floatingTexts.filter(t => t.life > 0);
        this.floatingTexts.forEach(t => { t.y -= 0.5; t.life--; });
    },

    draw() {
        CTX.fillStyle = SceneManager.getBackgroundColor();
        CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);
        
        CTX.save();
        CTX.scale(gameScale, gameScale);
        SceneManager.draw(CTX, this.scrollY, this.frameCount);
        
        if (!this.player) {
            CTX.restore();
            return;
        }
        
        this.gems.forEach(g => g.draw(CTX, 0, 0));
        
        this.particles.forEach(p => {
            CTX.fillStyle = p.color;
            CTX.globalAlpha = p.life / 30;
            CTX.beginPath();
            CTX.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            CTX.fill();
            CTX.globalAlpha = 1.0;
        });

        this.enemies.forEach(e => e.draw(CTX, 0, 0));
        this.player.draw(CTX, 0, 0);
        this.projectiles.forEach(p => p.draw(CTX, 0, 0));
        
        this.drawLightningEffects();
        this.drawLaserBeams();
        this.drawWeaponEffects();

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
    
    drawWeaponEffects() {
        const weapon = this.player.weapon;
        
        // 护盾效果
        if (weapon.effects.shield.unlocked) {
            const r = weapon.shieldRadius || 60;
            CTX.save();
            CTX.translate(this.player.x, this.player.y);
            CTX.rotate(weapon.shieldAngle);
            const gradient = CTX.createRadialGradient(0, 0, r - 10, 0, 0, r + 10);
            gradient.addColorStop(0, 'rgba(0, 200, 255, 0)');
            gradient.addColorStop(0.5, 'rgba(0, 200, 255, 0.3)');
            gradient.addColorStop(1, 'rgba(0, 200, 255, 0)');
            CTX.fillStyle = gradient;
            CTX.beginPath();
            CTX.arc(0, 0, r, 0, Math.PI * 2);
            CTX.fill();
            CTX.strokeStyle = 'rgba(0, 200, 255, 0.6)';
            CTX.lineWidth = 2;
            CTX.setLineDash([10, 5]);
            CTX.stroke();
            CTX.setLineDash([]);
            CTX.restore();
        }
        
        // 僚机效果
        if (weapon.effects.wingman.unlocked) {
            const level = weapon.effects.wingman.level;
            const wingCount = Math.ceil(level / 2);
            for (let i = 0; i < wingCount; i++) {
                const offset = weapon.wingOffset + i * 25;
                this.drawWingman(this.player.x - offset, this.player.y - 5);
                this.drawWingman(this.player.x + offset, this.player.y - 5);
            }
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
            CTX.moveTo(l.x1, l.y1);
            for (let i = 1; i < segments; i++) {
                CTX.lineTo(l.x1 + dx * i + (Math.random() - 0.5) * 20, l.y1 + dy * i + (Math.random() - 0.5) * 20);
            }
            CTX.lineTo(l.x2, l.y2);
            CTX.stroke();
        });
    },
    
    drawLaserBeams() {
        const weapon = this.player.weapon;
        if (weapon.effects.laser.unlocked && weapon.laserActive) {
            const gradient = CTX.createLinearGradient(weapon.laserX - weapon.laserWidth/2, 0, weapon.laserX + weapon.laserWidth/2, 0);
            gradient.addColorStop(0, 'rgba(255, 0, 0, 0)');
            gradient.addColorStop(0.3, 'rgba(255, 100, 100, 0.6)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
            gradient.addColorStop(0.7, 'rgba(255, 100, 100, 0.6)');
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
            CTX.fillStyle = gradient;
            CTX.fillRect(weapon.laserX - weapon.laserWidth/2, 0, weapon.laserWidth, this.player.y - 20);
        }
    },
    
    drawWingman(x, y) {
        CTX.save();
        CTX.translate(x, y);
        CTX.fillStyle = '#666666';
        CTX.beginPath();
        CTX.moveTo(0, -10);
        CTX.lineTo(-8, 8);
        CTX.lineTo(0, 4);
        CTX.lineTo(8, 8);
        CTX.closePath();
        CTX.fill();
        CTX.fillStyle = '#ff6600';
        CTX.beginPath();
        CTX.arc(0, 0, 4, 0, Math.PI * 2);
        CTX.fill();
        const flameLength = 5 + Math.random() * 5;
        CTX.fillStyle = '#ff4400';
        CTX.beginPath();
        CTX.moveTo(-3, 8);
        CTX.lineTo(0, 8 + flameLength);
        CTX.lineTo(3, 8);
        CTX.closePath();
        CTX.fill();
        CTX.restore();
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
        const baseRate = Math.max(15, 45 - Math.floor(this.time / 5));
        if (this.frameCount % baseRate === 0) {
            const roadWidth = CONFIG.GAME_WIDTH * 0.6;
            const roadX = (CONFIG.GAME_WIDTH - roadWidth) / 2;
            const x = roadX + Math.random() * roadWidth;
            let type = 1;
            if (this.time > 20 && Math.random() < 0.25) type = 2;
            if (this.time > 45 && Math.random() < 0.15) type = 3;
            this.enemies.push(new Enemy(x, CONFIG.ENEMY_SPAWN_Y, type));
        }
        if (this.frameCount % 600 === 0) this.spawnWave();
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
                    this.enemies.push(new Enemy(x, CONFIG.ENEMY_SPAWN_Y - Math.random() * 100, Math.random() < 0.3 ? 2 : 1));
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
        for (let i = 0; i < 3 && pool.length > 0; i++) {
            const idx = Math.floor(Math.random() * pool.length);
            options.push(pool.splice(idx, 1)[0]);
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
            if (opt.stat === 'maxHp') { this.player.maxHp += opt.val; this.player.hp += opt.val; }
            else if (opt.stat === 'regen') this.player.regen += opt.val;
            else if (opt.stat === 'amount') this.player.amount += opt.val;
            else if (opt.stat === 'cooldownMult') this.player.cooldownMult *= opt.val;
            else if (opt.stat === 'speed') this.player.speed *= opt.val;
            else if (opt.stat === 'pickupRange') this.player.pickupRange *= opt.val;
            else if (opt.stat === 'projSpeed') this.player.projSpeed *= opt.val;
            else if (opt.val < 1) this.player[opt.stat] += opt.val;
            else this.player[opt.stat] *= opt.val;
        } else if (opt.type === 'effect') {
            this.player.unlockEffect(opt.effectId);
        }
        document.getElementById('levelup-screen').classList.add('hidden');
        this.state = 'PLAYING';
        this.updateUI();
    },

    spawnGem(x, y, val) { this.gems.push(new Gem(x, y, val)); },
    addFloatingText(text, x, y, color) { this.floatingTexts.push({ text, x, y, color, life: 30 }); },

    updateUI() {
        const hpPct = Math.max(0, (this.player.hp / this.player.maxHp) * 100);
        document.getElementById('hp-bar-fill').style.width = hpPct + '%';
        document.getElementById('hp-text').innerText = `${Math.floor(this.player.hp)}/${this.player.maxHp}`;
        document.getElementById('xp-bar-fill').style.width = (this.xp / this.xpToNext) * 100 + '%';
        document.getElementById('level-text').innerText = 'Lv. ' + this.level;
        document.getElementById('kill-count').innerText = '击杀: ' + this.kills;
    },

    formatTime(sec) {
        return Math.floor(sec / 60).toString().padStart(2, '0') + ':' + (sec % 60).toString().padStart(2, '0');
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

window.startGame = function(charType) { Game.start(charType); };
