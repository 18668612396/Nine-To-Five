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
        this.tooltip = null;
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
                <p class="talent-hint">点击节点升级天赋，需要先点满前置节点</p>
                <div id="talent-tooltip" class="talent-tooltip hidden"></div>
            </div>
        `;
        
        container.appendChild(el);
        this.tooltip = document.getElementById('talent-tooltip');
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
                node.addEventListener('click', (e) => {
                    if (!this.longPressTimer) {
                        this.onNodeClick(talentId);
                    }
                });
                
                // 移动端长按显示信息
                node.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.longPressTimer = setTimeout(() => {
                        this.showTooltip(talentId, e.touches[0]);
                        this.longPressTimer = null;
                    }, 300);
                });
                
                node.addEventListener('touchend', (e) => {
                    if (this.longPressTimer) {
                        clearTimeout(this.longPressTimer);
                        this.longPressTimer = null;
                        this.onNodeClick(talentId);
                    }
                    this.hideTooltip();
                });
                
                node.addEventListener('touchmove', () => {
                    if (this.longPressTimer) {
                        clearTimeout(this.longPressTimer);
                        this.longPressTimer = null;
                    }
                });
                
                node.title = `${talent.name}\n${talent.desc}\n费用: ${TalentTree.getCost(talentId)} 金币`;
                
                nodesDiv.appendChild(node);
            });
            
            branchDiv.appendChild(nodesDiv);
            container.appendChild(branchDiv);
        });
    }
    
    showTooltip(talentId, touch) {
        const talent = TalentTree.get(talentId);
        if (!talent || !this.tooltip) return;
        
        const level = TalentTree.getLevel(talentId);
        const cost = TalentTree.getCost(talentId);
        const levelText = talent.infinite ? `Lv.${level}` : `${level}/${talent.maxLevel}`;
        
        this.tooltip.innerHTML = `
            <div class="tooltip-title">${talent.icon} ${talent.name}</div>
            <div class="tooltip-level">${levelText}</div>
            <div class="tooltip-desc">${talent.desc}</div>
            <div class="tooltip-cost">💰 ${cost}</div>
        `;
        this.tooltip.classList.remove('hidden');
    }
    
    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.classList.add('hidden');
        }
    }
    
    onNodeClick(talentId) {
        if (TalentTree.upgrade(talentId)) {
            this.updateGoldDisplay();
            this.renderTalentTree();
        }
    }
}

Screen.register('talent', TalentScreen);
