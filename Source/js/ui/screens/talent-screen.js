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
        this.nodeSize = 50;
        this.gridSize = 58;
        
        // 拖拽相关
        this.offsetX = 0;
        this.offsetY = 0;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
    }
    
    createDOM() {
        if (this.domCreated) return;
        
        const container = document.getElementById('ui-layer');
        if (!container) return;
        
        const el = document.createElement('div');
        el.id = 'talent-modal';
        el.className = 'screen hidden';
        el.innerHTML = `
            <div class="modal-container wide">
                <div class="modal-header">
                    <h2>🌟 天赋树</h2>
                    <div class="talent-gold">💰 <span id="talent-gold">0</span></div>
                    <button class="modal-close" onclick="Lobby.closeModal()">✕</button>
                </div>
                <div class="talent-tree-container" id="talent-tree-container">
                    <canvas class="talent-tree-canvas" id="talent-tree-canvas"></canvas>
                    <div class="talent-tree-nodes" id="talent-tree-nodes"></div>
                </div>
                <div class="talent-detail-panel hidden" id="talent-detail-panel">
                    <div class="talent-detail-name"></div>
                    <div class="talent-detail-desc"></div>
                    <div class="talent-detail-level"></div>
                    <div class="talent-detail-cost"></div>
                    <div class="talent-detail-req"></div>
                </div>
                <p class="talent-hint">点击节点升级天赋，需要先点满前置节点</p>
            </div>
        `;
        
        container.appendChild(el);
        this.domCreated = true;
        
        // 绑定拖拽事件
        this.bindDragEvents();
    }
    
    bindDragEvents() {
        const container = document.getElementById('talent-tree-container');
        if (!container) return;
        
        container.addEventListener('mousedown', (e) => {
            if (e.target.closest('.talent-tree-node')) return;
            this.isDragging = true;
            this.dragStartX = e.clientX - this.offsetX;
            this.dragStartY = e.clientY - this.offsetY;
            container.style.cursor = 'grabbing';
        });
        
        container.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            this.offsetX = e.clientX - this.dragStartX;
            this.offsetY = e.clientY - this.dragStartY;
            this.renderTalentTree();
        });
        
        container.addEventListener('mouseup', () => {
            this.isDragging = false;
            const container = document.getElementById('talent-tree-container');
            if (container) container.style.cursor = 'grab';
        });
        
        container.addEventListener('mouseleave', () => {
            this.isDragging = false;
            const container = document.getElementById('talent-tree-container');
            if (container) container.style.cursor = 'grab';
        });
    }
    
    show() {
        this.createDOM();
        super.show();
    }
    
    onEnter() {
        this.updateGoldDisplay();
        this.renderTalentTree();
    }
    
    updateGoldDisplay() {
        const talentGold = document.getElementById('talent-gold');
        if (talentGold) {
            talentGold.textContent = PlayerData.getGold();
        }
    }
    
    renderTalentTree() {
        this.renderConnections();
        this.renderNodes();
    }
    
    renderConnections() {
        const canvas = document.getElementById('talent-tree-canvas');
        if (!canvas) return;
        
        const container = canvas.parentElement;
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2 + this.offsetX;
        const centerY = canvas.height / 2 + this.offsetY;
        
        const connections = TalentTree.getConnections();
        
        connections.forEach(conn => {
            const fromX = centerX + conn.from.x * this.gridSize;
            const fromY = centerY + conn.from.y * this.gridSize;
            const toX = centerX + conn.to.x * this.gridSize;
            const toY = centerY + conn.to.y * this.gridSize;
            
            ctx.beginPath();
            ctx.moveTo(fromX, fromY);
            ctx.lineTo(toX, toY);
            ctx.strokeStyle = conn.active ? TalentTree.getBranchColor(conn.branch) : '#333';
            ctx.lineWidth = conn.active ? 3 : 2;
            ctx.stroke();
        });
    }
    
    renderNodes() {
        const nodesContainer = document.getElementById('talent-tree-nodes');
        if (!nodesContainer) return;
        
        nodesContainer.innerHTML = '';
        
        const talents = TalentTree.getAll();
        const containerRect = nodesContainer.parentElement.getBoundingClientRect();
        const centerX = containerRect.width / 2 + this.offsetX;
        const centerY = containerRect.height / 2 + this.offsetY;
        
        Object.values(talents).forEach(talent => {
            const state = TalentTree.getNodeState(talent.id);
            const level = TalentTree.getLevel(talent.id);
            
            const node = document.createElement('div');
            node.className = `talent-tree-node ${state} branch-${talent.branch}`;
            if (talent.rarity === 'rare') node.classList.add('rare');
            
            const x = centerX + talent.position.x * this.gridSize;
            const y = centerY + talent.position.y * this.gridSize;
            
            node.style.left = `${x}px`;
            node.style.top = `${y}px`;
            
            node.innerHTML = `
                <span class="node-icon">${talent.icon}</span>
                <span class="node-level">${level}/${talent.maxLevel}</span>
            `;
            
            node.addEventListener('click', (e) => {
                e.stopPropagation();
                this.onNodeClick(talent.id);
            });
            node.addEventListener('mouseenter', () => this.showDetail(talent.id));
            node.addEventListener('mouseleave', () => this.hideDetail());
            
            nodesContainer.appendChild(node);
        });
    }
    
    onNodeClick(talentId) {
        if (TalentTree.upgrade(talentId)) {
            this.updateGoldDisplay();
            this.renderTalentTree();
            this.showDetail(talentId);
        }
    }
    
    showDetail(talentId) {
        const panel = document.getElementById('talent-detail-panel');
        if (!panel) return;
        
        const talent = TalentTree.get(talentId);
        if (!talent) return;
        
        const level = TalentTree.getLevel(talentId);
        const cost = TalentTree.getCost(talentId);
        const maxed = TalentTree.isMaxed(talentId);
        const canUnlock = TalentTree.canUnlock(talentId);
        const canAfford = PlayerData.getGold() >= cost;
        
        panel.querySelector('.talent-detail-name').textContent = talent.name;
        panel.querySelector('.talent-detail-desc').textContent = talent.desc;
        panel.querySelector('.talent-detail-level').textContent = `等级: ${level}/${talent.maxLevel}`;
        
        const costEl = panel.querySelector('.talent-detail-cost');
        if (maxed) {
            costEl.textContent = '已满级';
            costEl.className = 'talent-detail-cost';
        } else {
            costEl.textContent = `升级费用: 💰 ${cost}`;
            costEl.className = 'talent-detail-cost' + (canAfford ? '' : ' cant-afford');
        }
        
        const reqEl = panel.querySelector('.talent-detail-req');
        if (!canUnlock && talent.requires) {
            const reqTalent = TalentTree.get(talent.requires);
            reqEl.textContent = `需要先点满: ${reqTalent.name}`;
            reqEl.style.display = 'block';
        } else {
            reqEl.style.display = 'none';
        }
        
        panel.classList.remove('hidden');
        this.selectedTalent = talentId;
    }
    
    hideDetail() {
        const panel = document.getElementById('talent-detail-panel');
        if (panel) {
            panel.classList.add('hidden');
        }
        this.selectedTalent = null;
    }
}

Screen.register('talent', TalentScreen);
