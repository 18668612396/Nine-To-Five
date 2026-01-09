// --- 升级选择界面（浮动） ---

class LevelUpScreen extends FloatScreen {
    constructor(config = {}) {
        super({
            id: 'levelUp',
            domId: 'levelup-screen',
            closeOnBackdrop: false,
            canCloseByEsc: false,
            ...config
        });
        
        this.level = 1;
        this.pauseParent = true;
        this.domCreated = false;
        this.longPressTimer = null;
        this.longPressDelay = 500; // 长按触发时间(ms)
    }
    
    createDOM() {
        if (this.domCreated) return;
        
        const container = document.getElementById('ui-layer');
        if (!container) return;
        
        const el = document.createElement('div');
        el.id = 'levelup-screen';
        el.className = 'screen hidden';
        el.innerHTML = `
            <h2>升级! Lv.<span id="levelup-level"></span></h2>
            <p>选择一个强化</p>
            <div id="cards-container"></div>
            <div id="current-perks-container" class="current-perks-container"></div>
        `;
        
        container.appendChild(el);
        this.domCreated = true;
    }
    
    show() {
        this.createDOM();
        super.show();
    }
    
    setLevel(level) {
        this.level = level;
    }
    
    generateOptions(player, level) {
        this.level = level;
        this.createDOM();
        
        const container = document.getElementById('cards-container');
        if (!container) return;
        container.innerHTML = '';
        
        const options = [];
        const pool = typeof UPGRADES !== 'undefined' ? [...UPGRADES] : [];
        
        for (let i = 0; i < 3; i++) {
            if (pool.length === 0) break;
            const idx = Math.floor(Math.random() * pool.length);
            const opt = pool[idx];
            const currentLevel = player && player.perkManager ? player.perkManager.getPerkLevel(opt.perkId) : 0;
            options.push({ ...opt, currentLevel });
            pool.splice(idx, 1);
        }
        
        options.forEach(opt => {
            const div = document.createElement('div');
            div.className = 'upgrade-card';
            const levelText = opt.currentLevel > 0 ? ` (Lv.${opt.currentLevel + 1})` : '';
            div.innerHTML = `<h3>${opt.name}${levelText}</h3><p>${opt.desc}</p>`;
            div.onclick = () => Game.selectUpgrade(opt);
            container.appendChild(div);
        });
        
        // 显示当前已有的祝福
        this.renderCurrentPerks(player);
    }
    
    // 渲染当前已有的祝福
    renderCurrentPerks(player) {
        const container = document.getElementById('current-perks-container');
        if (!container) return;
        container.innerHTML = '';
        
        const perks = player && player.perkManager ? player.perkManager.getAllPerks() : [];
        if (perks.length === 0) return;
        
        const title = document.createElement('div');
        title.className = 'current-perks-title';
        title.textContent = '当前祝福';
        container.appendChild(title);
        
        const list = document.createElement('div');
        list.className = 'current-perks-list';
        
        perks.forEach(({ perk, level }) => {
            const item = document.createElement('div');
            item.className = 'current-perk-item';
            item.innerHTML = `
                <span class="current-perk-icon">${perk.icon || '✨'}</span>
                <span class="current-perk-level">Lv.${level}</span>
            `;
            item.title = `${perk.name}: ${perk.getDesc ? perk.getDesc(level) : perk.desc}`;
            
            // 移动端长按支持
            this.addLongPressHandler(item, perk, level);
            
            list.appendChild(item);
        });
        
        container.appendChild(list);
    }
    
    // 添加长按事件处理
    addLongPressHandler(element, perk, level) {
        let startX, startY;
        
        const showTooltip = () => {
            this.showPerkTooltip(perk, level);
        };
        
        const clearTimer = () => {
            if (this.longPressTimer) {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
            }
        };
        
        // 触摸事件（移动端）
        element.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            this.longPressTimer = setTimeout(showTooltip, this.longPressDelay);
        }, { passive: true });
        
        element.addEventListener('touchmove', (e) => {
            const dx = Math.abs(e.touches[0].clientX - startX);
            const dy = Math.abs(e.touches[0].clientY - startY);
            if (dx > 10 || dy > 10) clearTimer();
        }, { passive: true });
        
        element.addEventListener('touchend', clearTimer);
        element.addEventListener('touchcancel', clearTimer);
        
        // PC端悬停显示
        element.addEventListener('mouseenter', () => {
            this.longPressTimer = setTimeout(showTooltip, 300);
        });
        
        element.addEventListener('mouseleave', () => {
            clearTimer();
            this.hidePerkTooltip();
        });
    }
    
    // 显示祝福详情弹窗
    showPerkTooltip(perk, level) {
        this.hidePerkTooltip();
        
        const tooltip = document.createElement('div');
        tooltip.id = 'perk-detail-tooltip';
        tooltip.className = 'perk-detail-tooltip';
        tooltip.innerHTML = `
            <div class="perk-tooltip-header">
                <span class="perk-tooltip-icon">${perk.icon || '✨'}</span>
                <span class="perk-tooltip-name">${perk.name}</span>
                <span class="perk-tooltip-level">Lv.${level}</span>
            </div>
            <div class="perk-tooltip-desc">${perk.getDesc ? perk.getDesc(level) : perk.desc}</div>
            <div class="perk-tooltip-hint">点击任意处关闭</div>
        `;
        
        tooltip.onclick = () => this.hidePerkTooltip();
        document.body.appendChild(tooltip);
    }
    
    // 隐藏祝福详情弹窗
    hidePerkTooltip() {
        const tooltip = document.getElementById('perk-detail-tooltip');
        if (tooltip) tooltip.remove();
    }
    
    onEnter() {
        if (typeof Game !== 'undefined') {
            Game.pauseGame();
        }
        
        const levelEl = document.getElementById('levelup-level');
        if (levelEl) levelEl.textContent = this.level;
    }
    
    onExit() {
        if (typeof Game !== 'undefined') {
            Game.unpauseGame();
        }
        this.hidePerkTooltip();
    }
}

Screen.register('levelUp', LevelUpScreen);
