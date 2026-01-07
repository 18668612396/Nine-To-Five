// --- 大厅系统 ---

const Lobby = {
    selectedChar: 'guagua',
    selectedWeapon: 'spark_bolt',
    selectedDifficulty: 'easy',
    selectedMap: 'random',
    
    // 玩家数据（持久化）
    playerData: {
        gold: 0,
        talents: {},
        level: 1
    },
    
    // 天赋定义
    talents: {
        hp_boost: { name: '生命强化', icon: '❤️', desc: '最大生命+5%', cost: 100, maxLevel: 10 },
        damage_boost: { name: '攻击强化', icon: '⚔️', desc: '伤害+5%', cost: 150, maxLevel: 10 },
        speed_boost: { name: '速度强化', icon: '🏃', desc: '移速+3%', cost: 120, maxLevel: 10 },
        crit_boost: { name: '暴击强化', icon: '💢', desc: '暴击+2%', cost: 200, maxLevel: 5 },
        xp_boost: { name: '经验强化', icon: '📚', desc: '经验+10%', cost: 180, maxLevel: 5 },
        gold_boost: { name: '财富强化', icon: '💰', desc: '金币+15%', cost: 250, maxLevel: 5 }
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
        }
    },
    
    // 保存玩家数据
    savePlayerData() {
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
    
    showCollection() {
        document.getElementById('collection-modal').classList.remove('hidden');
    },
    
    closeModal() {
        document.getElementById('char-select-modal').classList.add('hidden');
        document.getElementById('weapon-select-modal').classList.add('hidden');
        document.getElementById('talent-modal').classList.add('hidden');
        document.getElementById('collection-modal').classList.add('hidden');
    },
    
    showAdventure() {
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
            talentBonus: this.getTalentBonus()
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
            talentBonus: this.getTalentBonus()
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
