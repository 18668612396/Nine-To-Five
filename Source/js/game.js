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
    skillDrops: [],
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
        this.skillDrops = [];
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
        this.skillDrops.forEach(s => s.update(this.player));
        this.projectiles.forEach(p => p.update());

        // 碰撞检测
        this.projectiles.forEach(p => {
            this.enemies.forEach(e => {
                if (!e.markedForDeletion && !p.markedForDeletion && checkCircleCollide(p, e)) {
                    if (!p.hitList.includes(e)) {
                        e.takeDamage(p.damage, p.dx * p.knockback, p.dy * p.knockback);
                        p.hitList.push(e);
                        this.spawnParticles(e.x, e.y, e.color, 3);
                        
                        // 触发命中效果（爆炸、连锁等）
                        if (p.onHit) p.onHit(e);
                        
                        if (p.hitList.length >= p.penetrate) {
                            p.markedForDeletion = true;
                        }
                    }
                }
            });
        });

        this.enemies.forEach(e => {
            if (checkCircleCollide(e, this.player) && this.frameCount % 30 === 0) {
                this.player.hp -= e.contactDamage;
                const dmgText = e.contactDamage >= 1 ? '-1💔' : '-½💔';
                this.addFloatingText(dmgText, this.player.x, this.player.y - 20, '#ff4444');
                this.spawnParticles(this.player.x, this.player.y, '#ff0000', 5);
                this.updateUI();
            }
        });

        // 清理
        this.enemies = this.enemies.filter(e => !e.markedForDeletion && e.y < CONFIG.GAME_HEIGHT * CONFIG.ENEMY_DESPAWN_Y);
        this.gems = this.gems.filter(g => !g.markedForDeletion && g.y < CONFIG.GAME_HEIGHT + 50);
        this.skillDrops = this.skillDrops.filter(s => !s.markedForDeletion);
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
        this.skillDrops.forEach(s => s.draw(CTX, 0, 0));
        
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
        this.drawWandSlots();

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
    
    // 绘制技能槽UI
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
            
            // 槽位背景
            CTX.fillStyle = isCurrent ? 'rgba(255, 255, 0, 0.3)' : 'rgba(0, 0, 0, 0.5)';
            CTX.strokeStyle = isCurrent ? '#ffff00' : '#666666';
            CTX.lineWidth = isCurrent ? 3 : 1;
            CTX.fillRect(x, y, slotSize, slotSize);
            CTX.strokeRect(x, y, slotSize, slotSize);
            
            if (slot) {
                // 技能类型颜色
                const isActive = slot.type === 'active';
                CTX.fillStyle = isActive ? 'rgba(255, 150, 0, 0.3)' : 'rgba(100, 150, 255, 0.3)';
                CTX.fillRect(x + 2, y + 2, slotSize - 4, slotSize - 4);
                
                // 图标
                CTX.font = '20px Arial';
                CTX.textAlign = 'center';
                CTX.textBaseline = 'middle';
                CTX.fillStyle = '#fff';
                CTX.fillText(slot.icon, x + slotSize / 2, y + slotSize / 2);
            }
        }
        
        // 冷却指示
        if (wand.cooldownTimer > 0) {
            const cdPct = wand.cooldownTimer / 30;
            CTX.fillStyle = 'rgba(255, 255, 255, 0.7)';
            CTX.font = '14px Arial';
            CTX.textAlign = 'center';
            CTX.fillText('CD', CONFIG.GAME_WIDTH / 2, startY - 10);
        }
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
            if (this.time > 45 && Math.random() < 0.15) type = 3; // 精英
            this.enemies.push(new Enemy(x, CONFIG.ENEMY_SPAWN_Y, type));
        }
        
        // 每60秒生成一个Boss
        if (this.time > 0 && this.time % 60 === 0 && this.frameCount % 60 === 0) {
            const x = CONFIG.GAME_WIDTH / 2;
            this.enemies.push(new Enemy(x, CONFIG.ENEMY_SPAWN_Y, 4));
            this.addFloatingText('⚠️ BOSS来袭!', CONFIG.GAME_WIDTH / 2, 200, '#ff0000');
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
            let opt = pool.splice(idx, 1)[0];
            
            // 15%概率技能卡变成Lv2
            if (opt.type === 'skill' && Math.random() < 0.15) {
                opt = { ...opt, skillLevel: 2, name: opt.name + ' ★★', desc: opt.desc + ' (Lv.2)' };
            }
            
            options.push(opt);
        }
        
        options.forEach(opt => {
            const div = document.createElement('div');
            div.className = 'upgrade-card';
            if (opt.skillLevel === 2) div.classList.add('rare-card');
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
                this.player.hp += opt.val; // 同时恢复
            }
            else if (opt.stat === 'regen') this.player.regen += opt.val;
            else if (opt.stat === 'cooldownMult') this.player.cooldownMult *= opt.val;
            else if (opt.stat === 'speed') this.player.speed *= opt.val;
            else if (opt.stat === 'pickupRange') this.player.pickupRange *= opt.val;
            else if (opt.stat === 'projSpeed') this.player.projSpeed *= opt.val;
            else if (opt.val < 1) this.player[opt.stat] += opt.val;
            else this.player[opt.stat] *= opt.val;
        } else if (opt.type === 'skill') {
            // 添加技能到背包
            const baseSkill = ALL_SKILLS[opt.skillId];
            const level = opt.skillLevel || 1;
            const skillToAdd = { 
                ...baseSkill, 
                level,
                name: level > 1 ? baseSkill.name + '+'.repeat(level - 1) : baseSkill.name
            };
            this.player.wand.inventory.push(skillToAdd);
            
            const color = level >= 2 ? '#9b59b6' : '#00ff00';
            this.addFloatingText('+' + skillToAdd.name, this.player.x, this.player.y - 30, color);
        }
        document.getElementById('levelup-screen').classList.add('hidden');
        this.state = 'PLAYING';
        this.updateUI();
    },

    spawnGem(x, y, val) { this.gems.push(new Gem(x, y, val)); },
    addFloatingText(text, x, y, color) { this.floatingTexts.push({ text, x, y, color, life: 30 }); },

    updateUI() {
        // 血量心形显示
        const fullHearts = Math.floor(this.player.hp);
        const halfHeart = (this.player.hp % 1) >= 0.5;
        let hpHtml = '';
        
        for (let i = 0; i < Math.floor(this.player.maxHp); i++) {
            if (i < fullHearts) {
                hpHtml += '<span class="heart full">❤️</span>';
            } else if (i === fullHearts && halfHeart) {
                hpHtml += '<span class="heart half">💔</span>';
            } else {
                hpHtml += '<span class="heart empty">🖤</span>';
            }
        }
        
        document.getElementById('hp-hearts').innerHTML = hpHtml;
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
    },
    
    // ========== 背包系统 ==========
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
        const mergeableSkills = wand.getMergeableSkills();
        const mergeableIds = mergeableSkills.map(m => m.id + '_' + m.level);
        
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
                div.classList.add('has-skill');
                div.classList.add(slot.type === 'active' ? 'active-type' : 'passive-type');
                const levelStr = slot.level > 1 ? `<span class="skill-level skill-level-${slot.level}">${'★'.repeat(slot.level)}</span>` : '';
                div.innerHTML = `<span class="slot-index">${i + 1}</span><span class="slot-icon">${slot.icon}</span>${levelStr}`;
                div.title = `${slot.name} (Lv.${slot.level || 1})\n${slot.desc || ''}`;
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
                    e.dataTransfer.setData('slotIndex', i);
                    div.classList.add('dragging');
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
        
        // 渲染背包
        const inventoryContainer = document.getElementById('inventory-items');
        inventoryContainer.innerHTML = '';
        
        if (wand.inventory.length === 0) {
            inventoryContainer.innerHTML = '<div class="inventory-empty">背包空空如也~<br>击败敌人或升级获取技能</div>';
        } else {
            wand.inventory.forEach((skill, idx) => {
                const div = document.createElement('div');
                const isMergeable = mergeableIds.includes(skill.id + '_' + skill.level);
                div.className = 'inventory-item ' + (skill.type === 'active' ? 'active-type' : 'passive-type');
                if (isMergeable) div.classList.add('mergeable');
                div.draggable = true;
                
                const levelStr = skill.level > 1 ? `<span class="skill-level skill-level-${skill.level}">${'★'.repeat(skill.level)}</span>` : '';
                div.innerHTML = `<span class="item-icon">${skill.icon}</span><span class="item-name">${skill.name}</span>${levelStr}`;
                div.title = `${skill.name} (Lv.${skill.level || 1})\n${skill.desc || ''}\n${isMergeable ? '💡 可合成!' : ''}`;
                
                // 拖拽事件 - 背包物品拖出
                div.ondragstart = (e) => {
                    e.dataTransfer.setData('type', 'inventory');
                    e.dataTransfer.setData('inventoryIndex', idx);
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
        }
    },
    
    // 一键合成所有可合成的技能
    autoMerge() {
        const wand = this.player.wand;
        let merged = 0;
        
        while (true) {
            const mergeableSkills = wand.getMergeableSkills();
            if (mergeableSkills.length === 0) break;
            
            const result = wand.mergeSkills(mergeableSkills[0].id);
            if (result.success) {
                merged++;
                this.addFloatingText(`合成 Lv.${result.newLevel}!`, this.player.x, this.player.y - 30 - merged * 20, '#9b59b6');
            } else {
                break;
            }
        }
        
        if (merged > 0) {
            this.renderInventory();
        } else {
            this.addFloatingText('没有可合成的技能', this.player.x, this.player.y - 30, '#999');
        }
    }
};

window.startGame = function(charType) { Game.start(charType); };
