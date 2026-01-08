// --- 大厅系统 ---

const Lobby = {
    // 选择状态
    selectedChar: 'guagua',
    selectedWeapon: 'spark_bolt',
    selectedDifficulty: 'easy',
    selectedMap: 'random',
    
    // 预装技能（运行时）
    preloadedSkills: [],
    
    // 动画
    animationFrame: 0,
    animationId: null,
    
    // 天赋定义（兼容旧代码）
    get talents() {
        return TalentTree.getAll();
    },
    
    // 玩家数据（兼容旧代码）
    get playerData() {
        return {
            gold: PlayerData.gold,
            talents: PlayerData.talents,
            level: PlayerData.level,
            preloadedSkills: PlayerData.preloadedSkills
        };
    },
    
    // 初始化
    init() {
        PlayerData.init();
        this.preloadedSkills = PlayerData.getPreloadedSkills();
        this.initWeaponSelect();
        this.startTitleAnimation();
        
        // 监听事件
        Events.on(EVENT.GOLD_CHANGED, () => this.updateGoldDisplay());
    },
    
    // ========== 数据操作 ==========
    
    // 加载玩家数据（兼容）
    loadPlayerData() {
        PlayerData.load();
        this.preloadedSkills = PlayerData.getPreloadedSkills();
    },
    
    // 保存玩家数据（兼容）
    savePlayerData() {
        PlayerData.setPreloadedSkills(this.preloadedSkills);
    },
    
    // 添加金币
    addGold(amount) {
        PlayerData.addGold(amount);
    },
    
    // 更新金币显示
    updateGoldDisplay() {
        const lobbyGold = document.getElementById('lobby-gold');
        const talentGold = document.getElementById('talent-gold');
        const gold = PlayerData.getGold();
        if (lobbyGold) lobbyGold.textContent = gold;
        if (talentGold) talentGold.textContent = gold;
    },
    
    // ========== 动画 ==========
    
    // 标题页动画
    startTitleAnimation() {
        const canvas1 = document.getElementById('title-char-1');
        const canvas2 = document.getElementById('title-char-2');
        if (!canvas1 || !canvas2) return;
        
        const ctx1 = canvas1.getContext('2d');
        const ctx2 = canvas2.getContext('2d');
        
        const animate = () => {
            this.animationFrame++;
            ctx1.clearRect(0, 0, 120, 120);
            ctx2.clearRect(0, 0, 120, 120);
            GuaguaPlayer.drawCharacter(ctx1, 60, 70, 30, this.animationFrame);
            KuikuiPlayer.drawCharacter(ctx2, 60, 70, 30, this.animationFrame);
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    },
    
    // 大厅角色动画
    startLobbyAnimation() {
        const canvas = document.getElementById('lobby-char-canvas');
        const avatarCanvas = document.getElementById('lobby-avatar');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const avatarCtx = avatarCanvas ? avatarCanvas.getContext('2d') : null;
        
        const animate = () => {
            this.animationFrame++;
            
            ctx.clearRect(0, 0, 300, 350);
            if (this.selectedChar === 'guagua') {
                GuaguaPlayer.drawCharacter(ctx, 150, 200, 80, this.animationFrame);
            } else {
                KuikuiPlayer.drawCharacter(ctx, 150, 200, 80, this.animationFrame);
            }
            
            if (avatarCtx) {
                avatarCtx.clearRect(0, 0, 50, 50);
                if (this.selectedChar === 'guagua') {
                    GuaguaPlayer.drawCharacter(avatarCtx, 25, 30, 15, this.animationFrame);
                } else {
                    KuikuiPlayer.drawCharacter(avatarCtx, 25, 30, 15, this.animationFrame);
                }
            }
            
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    },
    
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    },
    
    // ========== 界面导航 ==========
    
    // 进入大厅
    enter() {
        Screen.Manager.switchTo('lobby');
        this.updateCharDisplay();
        this.updateGoldDisplay();
        this.startLobbyAnimation();
    },
    
    // 返回标题页
    backToTitle() {
        Screen.Manager.switchTo('title');
    },
    
    // ========== 角色选择 ==========
    
    // 更新角色展示
    updateCharDisplay() {
        const name = document.getElementById('lobby-char-name');
        const stats = document.getElementById('lobby-char-stats');
        
        // 从角色注册表获取信息
        const charClass = Player.types[this.selectedChar];
        if (charClass && charClass.CONFIG) {
            if (name) name.textContent = charClass.CONFIG.name || this.selectedChar;
            // 根据 startPerks 显示描述
            const perkDesc = this.selectedChar === 'guagua' ? '速度+10%' : '血量+20%';
            if (stats) stats.textContent = perkDesc;
        } else {
            if (this.selectedChar === 'guagua') {
                if (name) name.textContent = '瓜瓜';
                if (stats) stats.textContent = '速度+10%';
            } else {
                if (name) name.textContent = '葵葵';
                if (stats) stats.textContent = '血量+20%';
            }
        }
    },
    
    // 显示角色选择
    showCharSelect() {
        Screen.Manager.openFloat('charSelect');
        document.querySelectorAll('.char-card').forEach(card => {
            card.classList.toggle('selected', card.dataset.char === this.selectedChar);
        });
        this.animateCharCards();
    },
    
    // 角色卡片动画
    animateCharCards() {
        const canvases = document.querySelectorAll('.char-card-canvas');
        canvases.forEach(canvas => {
            const ctx = canvas.getContext('2d');
            const charType = canvas.dataset.char;
            ctx.clearRect(0, 0, 80, 80);
            if (charType === 'guagua') {
                GuaguaPlayer.drawCharacter(ctx, 40, 45, 22, this.animationFrame);
            } else {
                KuikuiPlayer.drawCharacter(ctx, 40, 45, 22, this.animationFrame);
            }
        });
    },
    
    // 选择角色
    selectChar(charType, element) {
        document.querySelectorAll('.char-card').forEach(card => card.classList.remove('selected'));
        if (element) element.classList.add('selected');
        this.selectedChar = charType;
    },
    
    // 确认角色选择
    confirmChar() {
        this.closeModal();
        this.updateCharDisplay();
    },
    
    // ========== 武器选择 ==========
    
    // 初始化武器选择
    initWeaponSelect() {
        const grid = document.getElementById('weapon-select-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        if (typeof MAGIC_SKILLS === 'undefined') return;
        
        Object.values(MAGIC_SKILLS).forEach(skill => {
            const div = document.createElement('div');
            div.className = 'weapon-card' + (skill.id === this.selectedWeapon ? ' selected' : '');
            div.dataset.weapon = skill.id;
            div.innerHTML = `
                <span class="weapon-icon">${skill.icon}</span>
                <span class="weapon-name">${skill.name}</span>
                <div class="weapon-card-check">✓</div>
            `;
            div.onclick = () => this.selectWeapon(skill.id, div);
            grid.appendChild(div);
        });
    },
    
    showWeaponSelect() {
        this.initWeaponSelect();
        Screen.Manager.openFloat('weaponSelect');
    },
    
    selectWeapon(weaponId, element) {
        document.querySelectorAll('.weapon-card').forEach(card => card.classList.remove('selected'));
        if (element) element.classList.add('selected');
        this.selectedWeapon = weaponId;
    },
    
    confirmWeapon() {
        this.closeModal();
    },
    
    // ========== 天赋系统 ==========
    
    // 显示天赋树
    showTalentTree() {
        this.updateGoldDisplay();
        Screen.Manager.openFloat('talent');
    },
    
    // 升级天赋
    upgradeTalent(talentId) {
        if (TalentTree.upgrade(talentId)) {
            this.updateGoldDisplay();
        }
    },
    
    // 获取天赋加成
    getTalentBonus() {
        return TalentTree.getBonus();
    },
    
    // 获取预装技能槽位数量
    getPreloadSlotCount() {
        return TalentTree.getPreloadSlotCount();
    },

    // ========== 技能预装 ==========
    
    // 显示技能预装界面
    showSkillPreload() {
        Screen.Manager.openFloat('skillPreload');
        this.renderSkillPreload();
    },
    
    // 渲染技能预装界面
    renderSkillPreload() {
        const slotsContainer = document.getElementById('preload-slots');
        const skillsGrid = document.getElementById('preload-skills-grid');
        const slotCount = this.getPreloadSlotCount();
        
        // 渲染槽位
        slotsContainer.innerHTML = '';
        for (let i = 0; i < 6; i++) {
            const slot = document.createElement('div');
            slot.className = 'preload-slot' + (i >= slotCount ? ' locked' : '');
            
            if (i < slotCount) {
                const skillId = this.preloadedSkills[i];
                if (skillId) {
                    const skillDef = typeof ALL_SKILLS !== 'undefined' ? ALL_SKILLS[skillId] : null;
                    const isMagic = typeof MAGIC_SKILLS !== 'undefined' && MAGIC_SKILLS[skillId] !== undefined;
                    slot.classList.add(isMagic ? 'magic-type' : 'modifier-type');
                    slot.innerHTML = `<span class="preload-skill-icon">${skillDef?.icon || '?'}</span>`;
                    slot.title = skillDef?.name || skillId;
                    slot.onclick = () => this.removePreloadSkill(i);
                } else {
                    slot.innerHTML = '<span class="preload-slot-empty">+</span>';
                }
            } else {
                slot.innerHTML = '<span class="preload-slot-locked">🔒</span>';
                slot.title = '升级天赋"技能槽位"解锁';
            }
            slotsContainer.appendChild(slot);
        }
        
        // 渲染可选技能列表
        skillsGrid.innerHTML = '';
        
        // 主动技能区域
        if (typeof MAGIC_SKILLS !== 'undefined') {
            const magicSection = document.createElement('div');
            magicSection.className = 'skill-section';
            magicSection.innerHTML = '<h5 class="skill-section-title">🔥 主动技能</h5>';
            const magicGrid = document.createElement('div');
            magicGrid.className = 'skill-section-grid';
            
            Object.values(MAGIC_SKILLS).forEach(skill => {
                const div = this.createSkillItem(skill, slotCount, 'magic');
                magicGrid.appendChild(div);
            });
            magicSection.appendChild(magicGrid);
            skillsGrid.appendChild(magicSection);
        }
        
        // 被动技能区域
        if (typeof MODIFIER_SKILLS !== 'undefined') {
            const modifierSection = document.createElement('div');
            modifierSection.className = 'skill-section';
            modifierSection.innerHTML = '<h5 class="skill-section-title">💠 被动技能</h5>';
            const modifierGrid = document.createElement('div');
            modifierGrid.className = 'skill-section-grid';
            
            Object.values(MODIFIER_SKILLS).forEach(skill => {
                const div = this.createSkillItem(skill, slotCount, 'modifier');
                modifierGrid.appendChild(div);
            });
            modifierSection.appendChild(modifierGrid);
            skillsGrid.appendChild(modifierSection);
        }
    },
    
    // 创建技能项
    createSkillItem(skill, slotCount, type) {
        const div = document.createElement('div');
        const isEquipped = this.preloadedSkills.includes(skill.id);
        const typeClass = type === 'magic' ? 'magic-type' : 'modifier-type';
        div.className = 'preload-skill-item ' + typeClass + (isEquipped ? ' equipped' : '');
        div.innerHTML = `<span class="skill-icon">${skill.icon}</span>`;
        div.title = skill.name + (skill.desc ? ': ' + skill.desc : '');
        if (!isEquipped && this.preloadedSkills.length < slotCount) {
            div.onclick = () => this.addPreloadSkill(skill.id);
        }
        return div;
    },
    
    // 添加预装技能
    addPreloadSkill(skillId) {
        const slotCount = this.getPreloadSlotCount();
        if (this.preloadedSkills.length >= slotCount) return;
        if (this.preloadedSkills.includes(skillId)) return;
        
        this.preloadedSkills.push(skillId);
        this.savePlayerData();
        this.renderSkillPreload();
    },
    
    // 移除预装技能
    removePreloadSkill(index) {
        this.preloadedSkills.splice(index, 1);
        this.savePlayerData();
        this.renderSkillPreload();
    },
    
    // 确认预装技能
    confirmSkillPreload() {
        this.savePlayerData();
        this.closeModal();
    },
    
    // ========== 图鉴 ==========
    
    showCollection() {
        Screen.Manager.openFloat('collection');
        this.showCollectionTab('characters');
    },
    
    showCollectionTab(tab, element) {
        document.querySelectorAll('.collection-tab').forEach(t => t.classList.remove('active'));
        if (element) {
            element.classList.add('active');
        } else {
            document.querySelector(`.collection-tab[onclick*="${tab}"]`)?.classList.add('active');
        }
        
        const grid = document.getElementById('collection-grid');
        grid.innerHTML = '';
        
        if (tab === 'characters') {
            this.renderCharacterCollection(grid);
        } else if (tab === 'enemies') {
            this.renderEnemyCollection(grid);
        } else if (tab === 'skills') {
            this.renderSkillCollection(grid);
        } else if (tab === 'weapons') {
            this.renderWeaponCollection(grid);
        }
    },
    
    renderCharacterCollection(grid) {
        // 从角色注册表获取
        const characters = [
            { id: 'guagua', name: '瓜瓜', desc: '速度+10%', icon: '🍈', unlocked: true },
            { id: 'kuikui', name: '葵葵', desc: '血量+20%', icon: '🌻', unlocked: true },
            { id: 'unknown1', name: '???', desc: '敬请期待', icon: '❓', unlocked: false },
            { id: 'unknown2', name: '???', desc: '敬请期待', icon: '❓', unlocked: false }
        ];
        
        characters.forEach(char => {
            const div = document.createElement('div');
            div.className = 'collection-item' + (char.unlocked ? '' : ' locked');
            
            if (char.unlocked && (char.id === 'guagua' || char.id === 'kuikui')) {
                const canvas = document.createElement('canvas');
                canvas.width = 60;
                canvas.height = 60;
                const ctx = canvas.getContext('2d');
                if (char.id === 'guagua') {
                    GuaguaPlayer.drawCharacter(ctx, 30, 35, 18, 0);
                } else {
                    KuikuiPlayer.drawCharacter(ctx, 30, 35, 18, 0);
                }
                div.innerHTML = `
                    <div class="collection-icon"></div>
                    <span class="collection-name">${char.name}</span>
                    <span class="collection-desc">${char.desc}</span>
                `;
                div.querySelector('.collection-icon').appendChild(canvas);
            } else {
                div.innerHTML = `
                    <span class="collection-icon">${char.icon}</span>
                    <span class="collection-name">${char.name}</span>
                    <span class="collection-desc">${char.desc}</span>
                `;
            }
            grid.appendChild(div);
        });
    },
    
    renderEnemyCollection(grid) {
        const enemies = [];
        
        // 从Monster注册表获取怪物
        if (typeof MONSTER_TYPES !== 'undefined') {
            Object.entries(MONSTER_TYPES).forEach(([id, entry]) => {
                const config = entry.config;
                enemies.push({
                    id: id,
                    name: config.name,
                    desc: config.desc || '普通怪物',
                    icon: config.icon || '👾',
                    unlocked: true,
                    rarity: 'common'
                });
            });
        }
        
        // 从Boss注册表获取Boss
        if (typeof BOSS_TYPES !== 'undefined') {
            Object.entries(BOSS_TYPES).forEach(([id, entry]) => {
                const config = entry.config;
                enemies.push({
                    id: id,
                    name: config.name,
                    desc: config.desc || 'Boss',
                    icon: config.icon || '👹',
                    unlocked: true,
                    rarity: 'legendary'
                });
            });
        }
        
        enemies.forEach(enemy => {
            const div = document.createElement('div');
            div.className = 'collection-item' + (enemy.unlocked ? '' : ' locked');
            if (enemy.rarity) div.classList.add('rarity-' + enemy.rarity);
            div.innerHTML = `
                <span class="collection-icon">${enemy.icon}</span>
                <span class="collection-name">${enemy.name}</span>
                <span class="collection-desc">${enemy.desc}</span>
            `;
            grid.appendChild(div);
        });
    },
    
    renderSkillCollection(grid) {
        if (typeof MAGIC_SKILLS !== 'undefined') {
            Object.values(MAGIC_SKILLS).forEach(skill => {
                const div = document.createElement('div');
                div.className = 'collection-item rarity-rare';
                div.innerHTML = `
                    <span class="collection-icon">${skill.icon}</span>
                    <span class="collection-name">${skill.name}</span>
                    <span class="collection-desc">${skill.desc || '主动技能'}</span>
                `;
                grid.appendChild(div);
            });
        }
        
        if (typeof MODIFIER_SKILLS !== 'undefined') {
            Object.values(MODIFIER_SKILLS).forEach(skill => {
                const div = document.createElement('div');
                div.className = 'collection-item rarity-common';
                div.innerHTML = `
                    <span class="collection-icon">${skill.icon}</span>
                    <span class="collection-name">${skill.name}</span>
                    <span class="collection-desc">${skill.desc || '被动效果'}</span>
                `;
                grid.appendChild(div);
            });
        }
    },
    
    renderWeaponCollection(grid) {
        if (typeof WEAPON_TEMPLATES !== 'undefined') {
            Object.values(WEAPON_TEMPLATES).forEach(template => {
                const div = document.createElement('div');
                div.className = 'collection-item rarity-' + (template.rarity || 'common');
                const iconStyle = template.iconColor ? `style="color: ${template.iconColor}; text-shadow: 0 0 8px ${template.iconColor};"` : '';
                div.innerHTML = `
                    <span class="collection-icon" ${iconStyle}>${template.icon || '🪄'}</span>
                    <span class="collection-name">${template.name}</span>
                    <span class="collection-desc">${template.desc || '法杖'}</span>
                `;
                grid.appendChild(div);
            });
        }
    },
    
    // ========== 冒险 ==========
    
    showAdventure() {
        const hasMagicSkill = this.preloadedSkills.some(skillId => 
            typeof MAGIC_SKILLS !== 'undefined' && MAGIC_SKILLS[skillId] !== undefined
        );
        if (!hasMagicSkill) {
            alert('请至少预装一个主动技能！');
            return;
        }
        
        Screen.Manager.openFloat('adventure');
    },
    
    closeAdventure() {
        Screen.Manager.closeFloat('adventure');
    },
    
    selectDifficulty(diff, element) {
        document.querySelectorAll('.difficulty-option').forEach(opt => opt.classList.remove('selected'));
        if (element) element.classList.add('selected');
        this.selectedDifficulty = diff;
    },
    
    selectMap(map, element) {
        document.querySelectorAll('.map-option').forEach(opt => opt.classList.remove('selected'));
        if (element) element.classList.add('selected');
        this.selectedMap = map;
    },
    
    startAdventure() {
        this.stopAnimation();
        this.hideAllScreens();
        
        let actualMap = this.selectedMap;
        if (actualMap === 'random') {
            const maps = ['forest', 'desert', 'snow'];
            actualMap = maps[Math.floor(Math.random() * maps.length)];
        }
        
        Game.startWithConfig({
            character: this.selectedChar,
            weapon: this.selectedWeapon,
            difficulty: this.selectedDifficulty,
            map: actualMap,
            talentBonus: this.getTalentBonus(),
            preloadedSkills: [...this.preloadedSkills]
        });
    },
    
    restartGame() {
        this.hideAllScreens();
        
        let actualMap = this.selectedMap;
        if (actualMap === 'random') {
            const maps = ['forest', 'desert', 'snow'];
            actualMap = maps[Math.floor(Math.random() * maps.length)];
        }
        
        Game.startWithConfig({
            character: this.selectedChar,
            weapon: this.selectedWeapon,
            difficulty: this.selectedDifficulty,
            map: actualMap,
            talentBonus: this.getTalentBonus(),
            preloadedSkills: [...this.preloadedSkills]
        });
    },
    
    // ========== 工具方法 ==========
    
    closeModal() {
        Screen.Manager.closeAllFloats();
    },
    
    hideAllScreens() {
        Screen.Manager.hideAll();
        this.closeModal();
    }
};
