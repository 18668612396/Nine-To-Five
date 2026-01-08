// --- 背包界面（浮动） ---

class InventoryScreen extends FloatScreen {
    constructor(config = {}) {
        super({
            id: 'inventory',
            domId: 'inventory-screen',
            closeOnBackdrop: false,
            ...config
        });
        
        this.pauseParent = true;
        this.domCreated = false;
    }
    
    // 创建 DOM 结构
    createDOM() {
        if (this.domCreated) return;
        
        const container = document.getElementById('ui-layer');
        if (!container) return;
        
        const el = document.createElement('div');
        el.id = 'inventory-screen';
        el.className = 'screen hidden';
        el.innerHTML = `
            <button class="inv-back-btn" onclick="Game.closeInventory()">← 返回</button>
            <button class="inv-settings-btn" onclick="Game.openSettingsFromInventory()">⚙️ 设置</button>
            <button class="inv-surrender-btn" onclick="Game.surrenderGame()">🏳️ 放弃战斗</button>
            
            <div class="inventory-layout">
                <div class="inventory-container">
                    <div class="inventory-header">
                        <h2>⚔️ 技能编辑</h2>
                        <div class="inventory-header-btns">
                            <button class="merge-btn" id="workbench-toggle-btn" onclick="Game.toggleWorkbench()">🔧 工作台</button>
                        </div>
                    </div>
                    
                    <div class="inventory-section weapon-wand-section">
                        <h3>🗡️ 武器与技能槽 <span class="weapon-switch-hint">(按Q切换武器)</span></h3>
                        <div id="weapon-wand-rows" class="weapon-wand-container"></div>
                    </div>
                    
                    <div class="inventory-section">
                        <h3>📦 技能背包</h3>
                        <div id="inventory-items" class="inventory-grid"></div>
                    </div>
                    
                    <div class="inventory-section">
                        <h3>🎁 祝福</h3>
                        <div id="perks-display" class="perks-grid"></div>
                    </div>
                    
                    <div class="inventory-section weapon-inventory-section">
                        <h3>🎒 武器背包</h3>
                        <div id="weapon-inventory" class="weapon-inventory-grid"></div>
                    </div>
                </div>
                
                <div class="workbench-panel hidden" id="workbench-panel">
                    <div class="workbench-header"><h3>🔧 工作台</h3></div>
                    <div class="workbench-slots">
                        <div class="workbench-slot" id="workbench-slot-0" onclick="Game.removeFromWorkbench(0)"></div>
                        <div class="workbench-slot" id="workbench-slot-1" onclick="Game.removeFromWorkbench(1)"></div>
                        <div class="workbench-slot" id="workbench-slot-2" onclick="Game.removeFromWorkbench(2)"></div>
                    </div>
                    <div class="workbench-arrow-down">⬇</div>
                    <div class="workbench-result" id="workbench-result"></div>
                    <div class="workbench-tip" id="workbench-tip">• 3个相同 → 升星<br>• 2个不同 → 随机</div>
                    <button class="workbench-craft-btn" id="workbench-craft-btn" onclick="Game.doCraft()" disabled>合成</button>
                    <button class="workbench-auto-btn" onclick="Game.autoMergeAll()">⚡ 一键合成</button>
                </div>
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
        if (typeof Game !== 'undefined') {
            Game.state = 'INVENTORY';
        }
        if (typeof Inventory !== 'undefined') {
            Inventory.open();
        }
    }
    
    onExit() {
        if (typeof Inventory !== 'undefined') {
            Inventory.close();
        }
        if (typeof Game !== 'undefined' && Game.state === 'INVENTORY') {
            Game.state = 'PLAYING';
        }
    }
    
    refresh() {
        if (typeof Game !== 'undefined' && Game.renderInventory) {
            Game.renderInventory();
        }
    }
    
    openSettings() {
        Screen.Manager.openFloat('settings');
    }
}

Screen.register('inventory', InventoryScreen);
