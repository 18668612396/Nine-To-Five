// --- 游戏主控制器 ---

const Game = {
    state: 'MENU',  // MENU, PLAYING, PAUSED, LEVEL_UP, INVENTORY, GAME_OVER, WEAPON_DROP
    
    // 游戏对象
    player: null,
    enemies: [],
    gems: [],
    projectiles: [],
    skillDrops: [],
    
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
    
    // 帧率控制
    targetFPS: 60,
    frameInterval: 1000 / 60,
    lastFrameTime: 0,
    
    // 初始化
    init() {
        initCanvas();
        Input.init();
        Scene.Manager.init();
        
        // 监听事件
        this.setupEventListeners();
        
        // 开始游戏循环
        this.lastFrameTime = performance.now();
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
            
            // Boss掉落武器（延迟显示）
            if (typeof WeaponGenerator !== 'undefined') {
                const weapons = [];
                const count = 2 + Math.floor(Math.random() * 2);
                for (let i = 0; i < count; i++) {
                    weapons.push(WeaponGenerator.generate(data.level || 1));
                }
                if (weapons.length > 0) {
                    // 延迟1秒后显示武器选择
                    setTimeout(() => {
                        this.showWeaponDrop(weapons);
                    }, 1000);
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
        
        // 技能施放效果
        Events.on(EVENT.SKILL_CAST, (data) => {
            if (data.type === 'lightning') {
                // 闪电链效果
                Renderer.addLightning(data.x1, data.y1, data.x2, data.y2, data.color || '#ffdd00');
            } else if (data.type === 'lightPillar') {
                // 光之柱效果
                Renderer.addLightPillar(data.x, data.y, data.radius, data.damage);
            } else if (data.type === 'distort') {
                // 扭曲效果
                Renderer.addDistort(data.x, data.y, data.targetX || data.x, data.targetY || data.y);
            } else if (data.type === 'explosion') {
                // 爆炸效果
                Renderer.addExplosion(data.x, data.y, data.radius);
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
        
        // 初始化祝福管理器
        if (typeof Perk !== 'undefined' && Perk.Manager) {
            Perk.Manager.init();
            Perk.Manager.setPlayer(this.player);
        }
        
        // 应用角色初始祝福
        if (this.player.init) {
            this.player.init();
        }
        
        // 初始化Boss管理器
        Boss.Manager.init();
        Boss.Manager.setPlayer(this.player);
        
        // 设置场景
        Scene.Manager.setScene(config.map);
        
        // 显示游戏界面（HUD）
        Screen.Manager.switchTo('game');
        
        this.state = 'PLAYING';
        this.updateUI();
    },
    
    // 重置游戏状态
    resetGameState() {
        this.enemies = [];
        this.gems = [];
        this.projectiles = [];
        this.skillDrops = [];
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
    loop(currentTime) {
        requestAnimationFrame(this.loop);
        
        // 帧率限制
        const elapsed = currentTime - this.lastFrameTime;
        if (elapsed < this.frameInterval) {
            return;
        }
        this.lastFrameTime = currentTime - (elapsed % this.frameInterval);
        
        if (this.state === 'PLAYING') {
            this.update();
        }
        this.draw();
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
        if (Spawner.shouldSpawn(this.frameCount, this.time, this.difficultyMult.spawn)) {
            const enemy = Spawner.spawnEnemy(this.player.x, this.player.y, this.time, this.difficultyMult);
            this.enemies.push(enemy);
        }
        
        // 更新场景
        Scene.Manager.update(this.frameCount, this.player);
        
        // 更新特效
        Renderer.updateEffects();
        
        // 更新光柱伤害
        this.updateLightPillarDamage();
        
        // 设置SkillProjectile的敌人引用（用于闪电链等效果）
        if (typeof SkillProjectile !== 'undefined') {
            SkillProjectile.enemies = this.enemies;
            SkillProjectile.bosses = Boss.Manager.bosses;
        }
        
        // 更新玩家
        const input = Input.getAxis();
        Entity.frameCount = this.frameCount;
        Player.frameCount = this.frameCount;
        Enemy.frameCount = this.frameCount;
        // 合并敌人和Boss作为攻击目标
        const allTargets = [...this.enemies, ...Boss.Manager.bosses];
        this.player.update(input, allTargets);
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
        
        // 敌人与场景元素碰撞
        Scene.Manager.handleEntitiesCollisions(this.enemies);
        
        // 更新Boss
        Boss.Manager.update();
        
        // Boss与场景元素碰撞
        Scene.Manager.handleEntitiesCollisions(Boss.Manager.bosses);
        
        // 更新宝石
        this.gems.forEach(g => g.update(this.player));
        
        // 更新技能掉落
        this.skillDrops.forEach(s => s.update(this.player));
        
        // 更新投射物
        this.projectiles.forEach(p => {
            if (p.isBossProjectile) {
                p.update(this.player);
            } else {
                p.update();
            }
        });
        
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
        
        // 绘制场景（背景 + 元素 + 粒子）
        Scene.Manager.draw(CTX, cameraX, cameraY, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT, this.frameCount);
        
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
        
        // 绘制浮动文字
        Renderer.drawFloatingTexts();
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
        const levelUpScreen = Screen.Manager.get('levelUp');
        if (levelUpScreen && levelUpScreen.generateOptions) {
            levelUpScreen.generateOptions(this.player, this.level);
        }
        Screen.Manager.openFloat('levelUp');
    },
    
    // 选择升级
    selectUpgrade(opt) {
        if (opt.type === 'perk' && this.player.perkManager) {
            const result = this.player.perkManager.addPerk(opt.perkId);
            if (result) {
                this.addFloatingText('+' + result.perk.name + ' Lv.' + result.level, this.player.x, this.player.y - 40, '#ffcc00');
            }
        }
        
        Screen.Manager.closeFloat('levelUp');
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
        let actualDamage = Math.round(damage);
        
        // 护盾吸收
        if (this.player.shield && this.player.shield > 0) {
            const absorbed = Math.min(this.player.shield, actualDamage);
            this.player.shield -= absorbed;
            actualDamage -= absorbed;
            if (absorbed > 0) {
                this.addFloatingText('🛡️-' + Math.round(absorbed), this.player.x, this.player.y - 50, '#66ccff');
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
        
        // 更新法杖列表
        this.updateWandListUI();
        
        // 更新Boss血条
        this.updateBossUI();
    },
    
    // 更新法杖列表UI
    updateWandListUI() {
        const container = document.getElementById('hud-wand-list');
        if (!container || !this.player) return;
        
        container.innerHTML = '';
        
        this.player.weaponSlots.forEach((weapon, idx) => {
            if (!weapon) return;
            
            const isActive = idx === this.player.currentWeaponIndex;
            
            const wandRow = document.createElement('div');
            wandRow.className = 'hud-wand-row' + (isActive ? ' active' : '');
            
            // 法杖图标
            const wandIcon = document.createElement('div');
            wandIcon.className = 'hud-wand-icon';
            wandIcon.innerHTML = `<span class="wand-index">${idx + 1}</span>${weapon.icon}`;
            wandRow.appendChild(wandIcon);
            
            // 技能槽
            const slotsDiv = document.createElement('div');
            slotsDiv.className = 'hud-wand-slots';
            
            // 普通槽
            for (let i = 0; i < weapon.slotCount; i++) {
                const slot = weapon.slots[i];
                const slotDiv = document.createElement('div');
                slotDiv.className = 'hud-slot';
                if (slot) {
                    slotDiv.classList.add(slot.type === 'magic' ? 'magic' : 'modifier');
                    slotDiv.innerHTML = slot.icon;
                }
                slotsDiv.appendChild(slotDiv);
            }
            
            // 特殊槽
            if (weapon.specialSlots) {
                for (let i = 0; i < weapon.specialSlots.length; i++) {
                    const slot = weapon.specialSlots[i];
                    const slotDiv = document.createElement('div');
                    slotDiv.className = 'hud-slot special';
                    if (slot) {
                        slotDiv.classList.add(slot.type === 'magic' ? 'magic' : 'modifier');
                        slotDiv.innerHTML = slot.icon;
                    }
                    slotsDiv.appendChild(slotDiv);
                }
            }
            
            wandRow.appendChild(slotsDiv);
            container.appendChild(wandRow);
        });
    },
    
    updateBossUI() {
        const bossContainer = document.getElementById('boss-hp-container');
        if (!bossContainer) return;
        
        const bosses = Boss.Manager.bosses;
        if (bosses.length === 0) {
            bossContainer.classList.add('hidden');
            return;
        }
        
        // 显示第一个Boss的血条
        const boss = bosses[0];
        bossContainer.classList.remove('hidden');
        
        const bossName = document.getElementById('boss-name');
        const bossHpFill = document.getElementById('boss-hp-bar-fill');
        
        if (bossName) bossName.innerText = '👹 ' + boss.name;
        if (bossHpFill) {
            const hpPct = Math.max(0, (boss.hp / boss.maxHp) * 100);
            bossHpFill.style.width = hpPct + '%';
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
        Screen.Manager.openFloat('inventory');
    },
    
    closePauseMenu() {
        Screen.Manager.closeFloat('inventory');
    },
    
    resumeGame() {
        this.closePauseMenu();
    },
    
    openInventory() {
        Screen.Manager.openFloat('inventory');
    },
    
    closeInventory() {
        Screen.Manager.closeFloat('inventory');
    },
    
    renderInventory() {
        Inventory.render();
    },
    
    openSettings() {
        Screen.Manager.openFloat('settings');
    },
    
    closeSettings() {
        Screen.Manager.closeFloat('settings');
    },
    
    closeSettingsOnly() {
        Screen.Manager.closeFloat('settings');
    },
    
    openSettingsFromPause() {
        this.openSettings();
    },
    
    openSettingsFromInventory() {
        this.openSettings();
    },
    
    openInventoryFromPause() {
        // 已经在背包界面
    },
    
    openGMFromPause() {
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
        Screen.Manager.closeAllFloats();
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
        
        // 设置结算数据并显示结算界面
        const gameoverScreen = Screen.Manager.get('gameover');
        if (gameoverScreen) {
            gameoverScreen.setStats({
                time: this.time,
                kills: this.kills,
                gold: earnedGold,
                level: this.level,
                damage: this.damageDealt,
                taken: this.damageTaken,
                bossKills: this.bossKills
            });
        }
        Screen.Manager.switchTo('gameover');
    },
    
    backToMenu() {
        this.state = 'MENU';
        this.player = null;
        this.enemies = [];
        this.gems = [];
        this.projectiles = [];
        this.skillDrops = [];
        Renderer.clearEffects();
        
        Lobby.enter();
    },
    
    // ========== 武器掉落 ==========
    
    pendingWeaponDrops: null,
    
    showWeaponDrop(weapons) {
        this.pendingWeaponDrops = weapons;
        this.state = 'WEAPON_DROP';
        
        const weaponDropScreen = Screen.Manager.get('weaponDrop');
        if (weaponDropScreen && weaponDropScreen.setWeapons) {
            weaponDropScreen.setWeapons(weapons);
        }
        Screen.Manager.openFloat('weaponDrop');
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
        Screen.Manager.closeFloat('weaponDrop');
        this.pendingWeaponDrops = null;
        this.state = 'PLAYING';
    }
};

// 兼容旧代码
window.startGame = function(charType) {
    Game.start(charType);
};
