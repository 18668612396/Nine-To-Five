// --- 大厅系统 ---

const Lobby = {
    selectedChar: 'guagua',
    selectedWeapon: 'spark_bolt',
    selectedDifficulty: 'easy',
    selectedMap: 'random',
    
    // 预装技能槽（最多6个，只能装1星技能）
    preloadedSkills: [],
    
    // 玩家数据（持久化）
    playerData: {
        gold: 0,
        talents: {},
        level: 1,
        preloadedSkills: [] // 保存预装技能
    },
    
    // 天赋定义
    talents: {
        hp_boost: { name: '生命强化', icon: '❤️', desc: '最大生命+5%', cost: 100, maxLevel: 10 },
        damage_boost: { name: '攻击强化', icon: '⚔️', desc: '伤害+5%', cost: 150, maxLevel: 10 },
        speed_boost: { name: '速度强化', icon: '🏃', desc: '移速+3%', cost: 120, maxLevel: 10 },
        crit_boost: { name: '暴击强化', icon: '💢', desc: '暴击+2%', cost: 200, maxLevel: 5 },
        xp_boost: { name: '经验强化', icon: '📚', desc: '经验+10%', cost: 180, maxLevel: 5 },
        gold_boost: { name: '财富强化', icon: '💰', desc: '金币+15%', cost: 250, maxLevel: 5 },
        skill_slot: { name: '技能槽位', icon: '📦', desc: '预装技能槽+1', cost: 500, maxLevel: 5 }
    },
    
    animationFrame: 0,
    animationId: null,
    
    init() {
        this.loadPlayerData();
        this.initWeaponSelect();
        this.startTitleAnimation();
    },
    
    // 加载玩家数据
    loadPlayerData() {
        const saved = localStorage.getItem('kuigua_player');
        if (saved) {
            this.playerData = JSON.parse(saved);
            // 兼容旧数据
            if (!this.playerData.preloadedSkills) {
                this.playerData.preloadedSkills = [];
            }
        }
        this.preloadedSkills = [...this.playerData.preloadedSkills];
    },
    
    // 保存玩家数据
    savePlayerData() {
        this.playerData.preloadedSkills = [...this.preloadedSkills];
        localStorage.setItem('kuigua_player', JSON.stringify(this.playerData));
    },
    
    // 添加金币
    addGold(amount) {
        this.playerData.gold += amount;
        this.savePlayerData();
        this.updateGoldDisplay();
    },
    
    // 更新金币显示
    updateGoldDisplay() {
        const lobbyGold = document.getElementById('lobby-gold');
        const talentGold = document.getElementById('talent-gold');
        if (lobbyGold) lobbyGold.textContent = this.playerData.gold;
        if (talentGold) talentGold.textContent = this.playerData.gold;
    },
    
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
            CharacterRenderer.drawGuagua(ctx1, 60, 70, 30, this.animationFrame);
            CharacterRenderer.drawKuikui(ctx2, 60, 70, 30, this.animationFrame);
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    },
    
    // 进入大厅
    enter() {
        this.hideAllScreens();
        document.getElementById('lobby-screen').classList.remove('hidden');
        this.updateCharDisplay();
        this.updateGoldDisplay();
        this.startLobbyAnimation();
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
            
            // 主角色
            ctx.clearRect(0, 0, 300, 350);
            if (this.selectedChar === 'guagua') {
                CharacterRenderer.drawGuagua(ctx, 150, 200, 80, this.animationFrame);
            } else {
                CharacterRenderer.drawKuikui(ctx, 150, 200, 80, this.animationFrame);
            }
            
            // 头像
            if (avatarCtx) {
                avatarCtx.clearRect(0, 0, 50, 50);
                if (this.selectedChar === 'guagua') {
                    CharacterRenderer.drawGuagua(avatarCtx, 25, 30, 15, this.animationFrame);
                } else {
                    CharacterRenderer.drawKuikui(avatarCtx, 25, 30, 15, this.animationFrame);
                }
            }
            
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    },
    
    // 返回标题页
    backToTitle() {
        this.hideAllScreens();
        document.getElementById('title-screen').classList.remove('hidden');
    },
    
    // 更新角色展示
    updateCharDisplay() {
        const name = document.getElementById('lobby-char-name');
        const stats = document.getElementById('lobby-char-stats');
        
        if (this.selectedChar === 'guagua') {
            if (name) name.textContent = '瓜瓜';
            if (stats) stats.textContent = '速度+10%';
        } else {
            if (name) name.textContent = '葵葵';
            if (stats) stats.textContent = '血量+20%';
        }
    },
    
    // 显示角色选择
    showCharSelect() {
        document.getElementById('char-select-modal').classList.remove('hidden');
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
                CharacterRenderer.drawGuagua(ctx, 40, 45, 22, this.animationFrame);
            } else {
                CharacterRenderer.drawKuikui(ctx, 40, 45, 22, this.animationFrame);
            }
        });
    },
    
    // 选择角色
    selectChar(charType, element) {
        document.querySelectorAll('.char-card').forEach(card => card.classList.remove('selected'));
        element.classList.add('selected');
        this.selectedChar = charType;
    },
    
    // 确认角色选择
    confirmChar() {
        this.closeModal();
        this.updateCharDisplay();
    },
    
    // 初始化武器选择
    initWeaponSelect() {
        const grid = document.getElementById('weapon-select-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
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
        document.getElementById('weapon-select-modal').classList.remove('hidden');
    },
    
    selectWeapon(weaponId, element) {
        document.querySelectorAll('.weapon-card').forEach(card => card.classList.remove('selected'));
        element.classList.add('selected');
        this.selectedWeapon = weaponId;
    },
    
    confirmWeapon() {
        this.closeModal();
    },
    
    // 显示天赋树
    showTalentTree() {
        this.updateGoldDisplay();
        this.renderTalentGrid();
        document.getElementById('talent-modal').classList.remove('hidden');
    },
    
    // 渲染天赋格子
    renderTalentGrid() {
        const grid = document.getElementById('talent-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        Object.entries(this.talents).forEach(([id, talent]) => {
            const level = this.playerData.talents[id] || 0;
            const cost = talent.cost * (level + 1);
            const maxed = level >= talent.maxLevel;
            const canAfford = this.playerData.gold >= cost;
            
            const div = document.createElement('div');
            div.className = 'talent-node' + (maxed ? ' maxed' : '') + (!canAfford && !maxed ? ' locked' : '');
            div.innerHTML = `
                <span class="talent-icon">${talent.icon}</span>
                <span class="talent-name">${talent.name}</span>
                <span class="talent-level">Lv.${level}/${talent.maxLevel}</span>
                <span class="talent-desc">${talent.desc}</span>
                ${maxed ? '<span class="talent-cost">已满级</span>' : `<span class="talent-cost">💰 ${cost}</span>`}
            `;
            if (!maxed) {
                div.onclick = () => this.upgradeTalent(id);
            }
            grid.appendChild(div);
        });
    },
    
    // 升级天赋
    upgradeTalent(talentId) {
        const talent = this.talents[talentId];
        const level = this.playerData.talents[talentId] || 0;
        const cost = talent.cost * (level + 1);
        
        if (level >= talent.maxLevel) return;
        if (this.playerData.gold < cost) return;
        
        this.playerData.gold -= cost;
        this.playerData.talents[talentId] = level + 1;
        this.savePlayerData();
        this.updateGoldDisplay();
        this.renderTalentGrid();
    },
    
    // 获取天赋加成
    getTalentBonus() {
        const bonus = {
            hp: 1,
            damage: 1,
            speed: 1,
            crit: 0,
            xp: 1,
            gold: 1
        };
        
        const talents = this.playerData.talents;
        if (talents.hp_boost) bonus.hp += talents.hp_boost * 0.05;
        if (talents.damage_boost) bonus.damage += talents.damage_boost * 0.05;
        if (talents.speed_boost) bonus.speed += talents.speed_boost * 0.03;
        if (talents.crit_boost) bonus.crit += talents.crit_boost * 0.02;
        if (talents.xp_boost) bonus.xp += talents.xp_boost * 0.1;
        if (talents.gold_boost) bonus.gold += talents.gold_boost * 0.15;
        
        return bonus;
    },
    
    // 获取预装技能槽位数量（基础1个 + 天赋加成，最大6个）
    getPreloadSlotCount() {
        const talentLevel = this.playerData.talents.skill_slot || 0;
        return Math.min(6, 1 + talentLevel);
    },
    
    // 显示技能预装界面
    showSkillPreload() {
        document.getElementById('skill-preload-modal').classList.remove('hidden');
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
                    const skillDef = ALL_SKILLS[skillId];
                    // 判断技能类型并添加对应样式
                    const isMagic = MAGIC_SKILLS[skillId] !== undefined;
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
        
        // 渲染可选技能列表（分类显示）
        skillsGrid.innerHTML = '';
        
        // 主动技能区域
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
        
        // 被动技能区域
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
    
    showCollection() {
        document.getElementById('collection-modal').classList.remove('hidden');
        this.showCollectionTab('characters');
    },
    
    showCollectionTab(tab, element) {
        // 更新标签状态
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
        }
    },
    
    renderCharacterCollection(grid) {
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
                    CharacterRenderer.drawGuagua(ctx, 30, 35, 18, 0);
                } else {
                    CharacterRenderer.drawKuikui(ctx, 30, 35, 18, 0);
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
        const enemies = [
            { id: 'slime', name: '史莱姆', desc: '普通敌人，缓慢但坚韧', icon: '🟣', color: '#ac92ec', unlocked: true },
            { id: 'bat', name: '蝙蝠', desc: '快速但脆弱的飞行敌人', icon: '🦇', color: '#ec87c0', unlocked: true },
            { id: 'golem', name: '石巨人', desc: '高血量的精英敌人', icon: '🗿', color: '#ffce54', unlocked: true },
            { id: 'boss_sakura', name: '樱花树妖', desc: 'Boss - 召唤花瓣攻击', icon: '🌸', unlocked: true, rarity: 'epic' },
            { id: 'boss_lava', name: '熔岩巨人', desc: 'Boss - 喷射火焰', icon: '🔥', unlocked: true, rarity: 'epic' },
            { id: 'boss_eye', name: '深渊之眼', desc: 'Boss - 激光扫射', icon: '👁️', unlocked: true, rarity: 'legendary' },
            { id: 'boss_frost', name: '冰霜女王', desc: 'Boss - 冰冻领域', icon: '❄️', unlocked: true, rarity: 'legendary' }
        ];
        
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
        if (typeof MAGIC_SKILLS === 'undefined') return;
        
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
    
    closeModal() {
        document.getElementById('char-select-modal').classList.add('hidden');
        document.getElementById('weapon-select-modal').classList.add('hidden');
        document.getElementById('talent-modal').classList.add('hidden');
        document.getElementById('collection-modal').classList.add('hidden');
        document.getElementById('skill-preload-modal')?.classList.add('hidden');
    },
    
    showAdventure() {
        // 检查预装技能中是否至少有一个主动技能
        const hasMagicSkill = this.preloadedSkills.some(skillId => MAGIC_SKILLS[skillId] !== undefined);
        if (!hasMagicSkill) {
            alert('请至少预装一个主动技能！');
            return;
        }
        
        this.hideAllScreens();
        document.getElementById('adventure-screen').classList.remove('hidden');
    },
    
    closeAdventure() {
        this.hideAllScreens();
        document.getElementById('lobby-screen').classList.remove('hidden');
        this.startLobbyAnimation();
    },
    
    selectDifficulty(diff, element) {
        document.querySelectorAll('.difficulty-option').forEach(opt => opt.classList.remove('selected'));
        element.classList.add('selected');
        this.selectedDifficulty = diff;
    },
    
    selectMap(map, element) {
        document.querySelectorAll('.map-option').forEach(opt => opt.classList.remove('selected'));
        element.classList.add('selected');
        this.selectedMap = map;
    },
    
    startAdventure() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
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
    
    hideAllScreens() {
        document.getElementById('title-screen').classList.add('hidden');
        document.getElementById('lobby-screen').classList.add('hidden');
        document.getElementById('adventure-screen').classList.add('hidden');
        document.getElementById('gameover-screen').classList.add('hidden');
        document.getElementById('levelup-screen').classList.add('hidden');
        document.getElementById('inventory-screen').classList.add('hidden');
        this.closeModal();
    }
};
