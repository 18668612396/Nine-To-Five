// --- 游戏引擎 ---

const CANVAS = document.getElementById('gameCanvas');
const CTX = CANVAS.getContext('2d');

function resize() {
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;
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
    trees: [],
    
    frameCount: 0,
    time: 0,
    kills: 0,
    level: 1,
    xp: 0,
    xpToNext: 10,
    
    init() {
        Input.init();
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
        
        for (let i = 0; i < 50; i++) {
            this.trees.push({
                x: (Math.random() - 0.5) * 4000,
                y: (Math.random() - 0.5) * 4000,
                r: 30 + Math.random() * 20,
                type: Math.random() > 0.3 ? 'tree' : 'rock'
            });
        }
    },

    start(charType) {
        this.player = new Player(charType);
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

        this.spawnEnemies();

        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            p.vx *= 0.95;
            p.vy *= 0.95;
        });
        this.particles = this.particles.filter(p => p.life > 0);

        this.player.update();
        if (this.player.hp <= 0) {
            this.gameOver();
        }

        this.enemies.forEach(e => e.update(this.player));
        this.gems.forEach(g => g.update(this.player));
        this.projectiles.forEach(p => p.update());

        // 碰撞检测
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

        this.enemies = this.enemies.filter(e => !e.markedForDeletion);
        this.gems = this.gems.filter(g => !g.markedForDeletion);
        this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);
        this.floatingTexts = this.floatingTexts.filter(t => t.life > 0);
        this.floatingTexts.forEach(t => {
            t.y -= 0.5;
            t.life--;
        });
    },

    draw() {
        CTX.fillStyle = '#8ccf7e';
        CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);

        let camX = 0, camY = 0;

        if (this.player) {
            camX = this.player.x - CANVAS.width / 2;
            camY = this.player.y - CANVAS.height / 2;
        } else {
            const t = Date.now() / 20;
            camX = Math.sin(t / 100) * 200;
            camY = Math.cos(t / 100) * 200;
        }

        // 草地纹理
        CTX.fillStyle = '#83c276';
        for (let i = 0; i < CANVAS.width; i += 100) {
            for (let j = 0; j < CANVAS.height; j += 100) {
                if ((Math.floor((i + camX) / 100) + Math.floor((j + camY) / 100)) % 2 === 0) {
                    CTX.fillRect(i - (camX % 100), j - (camY % 100), 10, 10);
                }
            }
        }

        // 环境
        this.trees.forEach(t => {
            const tx = t.x - camX;
            const ty = t.y - camY;
            if (tx > -100 && tx < CANVAS.width + 100 && ty > -100 && ty < CANVAS.height + 100) {
                if (t.type === 'tree') {
                    CTX.fillStyle = 'rgba(0,0,0,0.2)';
                    CTX.beginPath(); CTX.arc(tx, ty + 10, t.r, 0, Math.PI * 2); CTX.fill();
                    CTX.fillStyle = '#8d6e63';
                    CTX.fillRect(tx - 5, ty - 10, 10, 20);
                    CTX.fillStyle = '#4caf50';
                    CTX.beginPath(); CTX.arc(tx, ty - 20, t.r, 0, Math.PI * 2); CTX.fill();
                    CTX.fillStyle = '#66bb6a';
                    CTX.beginPath(); CTX.arc(tx - 5, ty - 25, t.r * 0.7, 0, Math.PI * 2); CTX.fill();
                } else {
                    CTX.fillStyle = 'rgba(0,0,0,0.2)';
                    CTX.beginPath(); CTX.arc(tx, ty + 5, t.r * 0.8, 0, Math.PI * 2); CTX.fill();
                    CTX.fillStyle = '#9e9e9e';
                    CTX.beginPath();
                    CTX.moveTo(tx - t.r, ty);
                    CTX.lineTo(tx, ty - t.r);
                    CTX.lineTo(tx + t.r, ty);
                    CTX.lineTo(tx, ty + t.r * 0.6);
                    CTX.fill();
                }
            }
        });

        if (!this.player) return;

        this.gems.forEach(g => g.draw(CTX, camX, camY));
        
        this.particles.forEach(p => {
            CTX.fillStyle = p.color;
            CTX.globalAlpha = p.life / 30;
            CTX.beginPath();
            CTX.arc(p.x - camX, p.y - camY, p.size, 0, Math.PI * 2);
            CTX.fill();
            CTX.globalAlpha = 1.0;
        });

        this.enemies.forEach(e => e.draw(CTX, camX, camY));
        this.player.draw(CTX, camX, camY);
        this.projectiles.forEach(p => p.draw(CTX, camX, camY));

        // 光环视觉
        this.player.weapons.forEach(w => {
            if (w.id === 'aura' || w.id === 'garlic') {
                const stats = w.getStats();
                const r = (w.id === 'aura' ? 60 : 80) * stats.area;
                CTX.beginPath();
                CTX.arc(this.player.x - camX, this.player.y - camY, r, 0, Math.PI * 2);
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
            CTX.font = 'bold 20px Fredoka';
            CTX.strokeStyle = 'black';
            CTX.lineWidth = 3;
            CTX.strokeText(t.text, t.x - camX, t.y - camY);
            CTX.fillText(t.text, t.x - camX, t.y - camY);
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

    spawnEnemies() {
        const spawnRate = Math.max(10, 60 - Math.floor(this.time / 10));
        
        if (this.frameCount % spawnRate === 0) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.sqrt((CANVAS.width / 2) ** 2 + (CANVAS.height / 2) ** 2) + 50;
            const x = this.player.x + Math.cos(angle) * dist;
            const y = this.player.y + Math.sin(angle) * dist;
            
            let type = 1;
            if (this.time > 30 && Math.random() < 0.3) type = 2;
            if (this.time > 60 && Math.random() < 0.1) type = 3;

            this.enemies.push(new Enemy(x, y, type));
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
    }
};

window.startGame = function(charType) {
    Game.start(charType);
};
