// --- 天赋树界面（浮动） ---

class TalentScreen extends FloatScreen {
    constructor(config = {}) {
        super({
            id: 'talent',
            domId: 'talent-modal',
            closeOnBackdrop: true,
            ...config
        });
        
        this.domCreated = false;
        this.selectedTalent = null;
        this.longPressTimer = null;
        this.longPressDelay = 400;
        this.isLongPress = false;
    }
    
    createDOM() {
        if (this.domCreated) return;
        
        const container = document.getElementById('ui-layer');
        if (!container) return;
        
        const el = document.createElement('div');
        el.id = 'talent-modal';
        el.className = 'screen hidden';
        el.innerHTML = `
            <div class="modal-container wide talent-modal-container">
                <div class="modal-header">
                    <h2>🌟 天赋树</h2>
                    <div class="talent-gold">💰 <span id="talent-gold">0</span></div>
                    <button class="modal-close" onclick="Lobby.closeModal()">✕</button>
                </div>
                <div class="talent-branches-container" id="talent-branches-container"></div>
                <p class="talent-hint">点击节点升级天赋，长按查看详情</p>
            </div>
        `;
        
        container.appendChild(el);
        this.domCreated = true;
    }
    
    show() {
        this.createDOM();
        super.show();
    }
    
    onEnter() {
        this.updateGoldDisplay();
        this.renderTalentTree();
    }
    
    onExit() {
        this.hideTooltip();
    }
    
    updateGoldDisplay() {
        const talentGold = document.getElementById('talent-gold');
        if (talentGold) {
            talentGold.textContent = PlayerData.getGold();
        }
    }
    
    renderTalentTree() {
        const container = document.getElementById('talent-branches-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        // 4个分支配置
        const branches = [
            { id: 'attack', name: '⚔️ 攻击', color: '#ff6b6b', talents: ['atk_1', 'atk_2', 'crit_1', 'atk_pierce', 'crit_dmg', 'atk_range', 'skill_slot_1', 'atk_3'] },
            { id: 'defense', name: '❤️ 防御', color: '#66ff66', talents: ['hp_1', 'hp_2', 'regen_1', 'def_armor', 'def_dodge', 'def_thorns', 'skill_slot_2', 'hp_3'] },
            { id: 'utility', name: '🏃 辅助', color: '#66b3ff', talents: ['speed_1', 'speed_2', 'cooldown_1', 'util_pickup', 'util_duration', 'util_area', 'skill_slot_3', 'speed_3'] },
            { id: 'fortune', name: '💰 财富', color: '#ffcc00', talents: ['xp_1', 'gold_1', 'luck_1', 'fort_magnet', 'fort_treasure', 'fort_revival', 'skill_slot_4', 'gold_2'] }
        ];
        
        branches.forEach(branch => {
            const branchDiv = document.createElement('div');
            branchDiv.className = 'talent-branch';
            branchDiv.style.borderColor = branch.color;
            
            // 分支标题
            const titleDiv = document.createElement('div');
            titleDiv.className = 'talent-branch-title';
            titleDiv.style.color = branch.color;
            titleDiv.textContent = branch.name;
            branchDiv.appendChild(titleDiv);
            
            // 天赋节点列表
            const nodesDiv = document.createElement('div');
            nodesDiv.className = 'talent-branch-nodes';
            
            branch.talents.forEach(talentId => {
                const talent = TalentTree.get(talentId);
                if (!talent) return;
                
                const state = TalentTree.getNodeState(talentId);
                const level = TalentTree.getLevel(talentId);
                
                const node = document.createElement('div');
                node.className = `talent-node-new ${state}`;
                node.style.borderColor = branch.color;
                if (talent.rarity === 'rare') node.classList.add('rare');
                if (talent.infinite) node.classList.add('infinite');
                
                const levelText = talent.infinite ? `Lv.${level}` : `${level}/${talent.maxLevel}`;
                
                node.innerHTML = `
                    <span class="node-icon">${talent.icon}</span>
                    <span class="node-level">${levelText}</span>
                `;
                
                // PC端点击
                node.addEventListener('click', () => {
                    if (!this.isLongPress) {
                        this.onNodeClick(talentId);
                    }
                    this.isLongPress = false;
                });
                
                // 移动端长按显示信息
                node.addEventListener('touchstart', (e) => {
                    this.isLongPress = false;
                    this.longPressTimer = setTimeout(() => {
                        this.isLongPress = true;
                        this.showTooltip(talentId);
                    }, this.longPressDelay);
                }, { passive: true });
                
                node.addEventListener('touchend', () => {
                    clearTimeout(this.longPressTimer);
                });
                
                node.addEventListener('touchmove', () => {
                    clearTimeout(this.longPressTimer);
                });
                
                node.title = `${talent.name}\n${talent.desc}\n费用: ${TalentTree.getCost(talentId)} 金币`;
                
                nodesDiv.appendChild(node);
            });
            
            branchDiv.appendChild(nodesDiv);
            container.appendChild(branchDiv);
        });
    }
    
    showTooltip(talentId) {
        const talent = TalentTree.get(talentId);
        if (!talent) return;
        
        // 移除旧的tooltip
        this.hideTooltip();
        
        const level = TalentTree.getLevel(talentId);
        const cost = TalentTree.getCost(talentId);
        const levelText = talent.infinite ? `Lv.${level}` : `${level}/${talent.maxLevel}`;
        
        const tooltip = document.createElement('div');
        tooltip.id = 'talent-tooltip';
        tooltip.className = 'talent-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-title">${talent.icon} ${talent.name}</div>
            <div class="tooltip-level">${levelText}</div>
            <div class="tooltip-desc">${talent.desc}</div>
            <div class="tooltip-cost">💰 ${cost}</div>
            <div class="tooltip-hint">点击任意处关闭</div>
        `;
        
        document.body.appendChild(tooltip);
        
        // 点击任意处关闭
        setTimeout(() => {
            document.addEventListener('touchstart', () => this.hideTooltip(), { once: true });
            document.addEventListener('click', () => this.hideTooltip(), { once: true });
        }, 100);
    }
    
    hideTooltip() {
        const tooltip = document.getElementById('talent-tooltip');
        if (tooltip) tooltip.remove();
    }
    
    onNodeClick(talentId) {
        if (TalentTree.upgrade(talentId)) {
            this.updateGoldDisplay();
            this.renderTalentTree();
        }
    }
}

Screen.register('talent', TalentScreen);
