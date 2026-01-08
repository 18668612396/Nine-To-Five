// --- 图鉴界面（浮动） ---

class CollectionScreen extends FloatScreen {
    constructor(config = {}) {
        super({
            id: 'collection',
            domId: 'collection-modal',
            closeOnBackdrop: true,
            ...config
        });
        
        this.currentTab = 'characters';
        this.domCreated = false;
    }
    
    createDOM() {
        if (this.domCreated) return;
        
        const container = document.getElementById('ui-layer');
        if (!container) return;
        
        const el = document.createElement('div');
        el.id = 'collection-modal';
        el.className = 'screen hidden';
        el.innerHTML = `
            <div class="modal-container wide">
                <div class="modal-header">
                    <h2>📖 图鉴</h2>
                    <button class="modal-close" onclick="Lobby.closeModal()">✕</button>
                </div>
                <div class="collection-content">
                    <div class="collection-tabs">
                        <button class="collection-tab active" onclick="Lobby.showCollectionTab('characters', this)">👤 角色</button>
                        <button class="collection-tab" onclick="Lobby.showCollectionTab('enemies', this)">👹 敌人</button>
                        <button class="collection-tab" onclick="Lobby.showCollectionTab('skills', this)">🔮 技能</button>
                    </div>
                    <div id="collection-grid" class="collection-grid"></div>
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
        this.showTab('characters');
    }
    
    showTab(tab, element) {
        this.currentTab = tab;
        
        document.querySelectorAll('.collection-tab').forEach(t => t.classList.remove('active'));
        if (element) {
            element.classList.add('active');
        } else {
            document.querySelector(`.collection-tab[onclick*="${tab}"]`)?.classList.add('active');
        }
        
        if (typeof Lobby !== 'undefined') {
            Lobby.showCollectionTab(tab, element);
        }
    }
}

Screen.register('collection', CollectionScreen);
