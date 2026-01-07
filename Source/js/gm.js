// --- GM指令面板 ---

const GM = {
    init() {
        // 初始化完成
    },
    
    openPanel() {
        Game.state = 'GM';
        document.getElementById('gm-modal').classList.remove('hidden');
        this.render();
    },
    
    // 从暂停菜单打开
    openFromPause() {
        Game.state = 'GM';
        document.getElementById('gm-modal').classList.remove('hidden');
        this.render();
    },
    
    closePanel() {
        document.getElementById('gm-modal').classList.add('hidden');
        // 返回背包界面
        Game.state = 'INVENTORY';
    },
    
    render() {
        if (!Game.player) return;
        
        // 渲染魔法技能
        const magicList = document.getElementById('gm-magic-list');
        magicList.innerHTML = '';
        Object.values(MAGIC_SKILLS).forEach(skill => {
            const btn = document.createElement('button');
            btn.className = 'gm-btn magic-type';
            btn.innerHTML = `${skill.icon} ${skill.name}`;
            btn.title = skill.desc;
            btn.onclick = () => this.addSkill(skill.id);
            magicList.appendChild(btn);
        });
        
        // 渲染被动技能
        const modifierList = document.getElementById('gm-modifier-list');
        modifierList.innerHTML = '';
        Object.values(MODIFIER_SKILLS).forEach(skill => {
            const btn = document.createElement('button');
            btn.className = 'gm-btn modifier-type';
            btn.innerHTML = `${skill.icon} ${skill.name}`;
            btn.title = skill.desc;
            btn.onclick = () => this.addSkill(skill.id);
            modifierList.appendChild(btn);
        });
        
        // 渲染祝福
        const perkList = document.getElementById('gm-perk-list');
        perkList.innerHTML = '';
        Object.values(PERKS).forEach(perk => {
            const level = Game.player.perkManager.getPerkLevel(perk.id);
            const btn = document.createElement('button');
            btn.className = 'gm-btn perk-type';
            btn.innerHTML = `${perk.icon} ${perk.name}${level > 0 ? ` (${level})` : ''}`;
            btn.title = perk.desc;
            btn.onclick = () => this.addPerk(perk.id);
            perkList.appendChild(btn);
        });
    },
    
    addSkill(skillId) {
        const skill = ALL_SKILLS[skillId];
        if (skill) {
            Game.player.skillInventory.push({ ...skill, star: 1 });
            Game.addFloatingText('+' + skill.name, Game.player.x, Game.player.y - 30, '#00ff00');
            // 如果背包界面打开，刷新显示
            if (Game.state === 'INVENTORY') {
                Game.renderInventory();
            }
        }
    },
    
    addPerk(perkId) {
        const result = Game.player.perkManager.addPerk(perkId);
        if (result) {
            Game.addFloatingText('+' + result.perk.name + ' Lv.' + result.level, Game.player.x, Game.player.y - 30, '#ffcc00');
            Game.updateUI();
            this.render();
        }
    },
    
    addGold(amount) {
        Game.gold += amount;
        Game.addFloatingText('+' + amount + ' 💰', Game.player.x, Game.player.y - 30, '#ffd700');
        Game.updateUI();
    },
    
    spawnBoss(type) {
        if (BossManager && BossManager.spawnBoss) {
            BossManager.spawnBoss(type);
        }
    }
};
