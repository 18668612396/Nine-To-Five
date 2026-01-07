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
    }
    
    onEnter() {
        this.showTab('characters');
    }
    
    // 显示标签页
    showTab(tab, element) {
        this.currentTab = tab;
        
        // 更新标签状态
        document.querySelectorAll('.collection-tab').forEach(t => t.classList.remove('active'));
        if (element) {
            element.classList.add('active');
        } else {
            document.querySelector(`.collection-tab[onclick*="${tab}"]`)?.classList.add('active');
        }
        
        // 渲染内容
        if (typeof Lobby !== 'undefined') {
            Lobby.showCollectionTab(tab, element);
        }
    }
}

Screen.register('collection', CollectionScreen);
