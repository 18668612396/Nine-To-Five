// --- UI管理器 ---

const UI = {
    currentScreen: 'loading',
    selectedCharacter: 'guagua',
    loadingFrame: 0,
    previewFrame: 0,
    mainCharFrame: 0,
    
    panels: {
        characters: {
            title: '选择角色',
            content: '' // 动态生成
        },
        talents: {
            title: '天赋树',
            content: `
                <p>消耗鱼干解锁永久强化！</p>
                <div class="talent-grid">
                    <div class="talent-node"><span class="talent-icon">❤️</span><span class="talent-name">生命+5%</span></div>
                    <div class="talent-node"><span class="talent-icon">⚡</span><span class="talent-name">速度+5%</span></div>
                    <div class="talent-node"><span class="talent-icon">⚔️</span><span class="talent-name">攻击+5%</span></div>
                    <div class="talent-node"><span class="talent-icon">🛡️</span><span class="talent-name">防御+5%</span></div>
                    <div class="talent-node locked"><span class="talent-icon">🔒</span><span class="talent-name">未解锁</span></div>
                    <div class="talent-node locked"><span class="talent-icon">🔒</span><span class="talent-name">未解锁</span></div>
                    <div class="talent-node locked"><span class="talent-icon">🔒</span><span class="talent-name">未解锁</span></div>
                    <div class="talent-node locked"><span class="talent-icon">🔒</span><span class="talent-name">未解锁</span></div>
                </div>
                <p style="margin-top:20px;color:#888;">功能开发中...</p>
            `
        },
        collection: {
            title: '图鉴',
            content: `
                <p>收集游戏中遇到的敌人和道具！</p>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:20px;">
                    <div style="background:rgba(255,255,255,0.1);padding:20px;border-radius:10px;"><span style="font-size:32px;">👾</span><p style="margin:5px 0 0;font-size:12px;">史莱姆</p></div>
                    <div style="background:rgba(255,255,255,0.1);padding:20px;border-radius:10px;"><span style="font-size:32px;">🦇</span><p style="margin:5px 0 0;font-size:12px;">蝙蝠</p></div>
                    <div style="background:rgba(255,255,255,0.05);padding:20px;border-radius:10px;"><span style="font-size:32px;">❓</span><p style="margin:5px 0 0;font-size:12px;">???</p></div>
                    <div style="background:rgba(255,255,255,0.05);padding:20px;border-radius:10px;"><span style="font-size:32px;">❓</span><p style="margin:5px 0 0;font-size:12px;">???</p></div>
                </div>
                <p style="margin-top:20px;color:#888;">功能开发中...</p>
            `
        },
        settings: {
            title: '设置',
            content: `
                <div style="text-align:left;max-width:300px;margin:0 auto;">
                    <div style="margin-bottom:20px;"><label style="color:#fff;">音乐音量</label><input type="range" style="width:100%;margin-top:10px;" disabled></div>
                    <div style="margin-bottom:20px;"><label style="color:#fff;">音效音量</label><input type="range" style="width:100%;margin-top:10px;" disabled></div>
                    <div style="margin-bottom:20px;"><label style="color:#fff;"><input type="checkbox" disabled> 显示伤害数字</label></div>
                </div>
                <p style="margin-top:20px;color:#888;">功能开发中...</p>
            `
        },
        achievements: {
            title: '成就',
            content: `
                <div style="text-align:left;">
                    <div style="background:rgba(255,255,255,0.1);padding:15px;border-radius:10px;margin-bottom:10px;"><span style="font-size:24px;">🏆</span><strong style="color:#ffd700;margin-left:10px;">初出茅庐</strong><p style="margin:5px 0 0;font-size:14px;">完成第一局游戏</p></div>
                    <div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:10px;margin-bottom:10px;opacity:0.5;"><span style="font-size:24px;">🔒</span><strong style="color:#888;margin-left:10px;">百战百胜</strong><p style="margin:5px 0 0;font-size:14px;">击杀100只敌人</p></div>
                    <div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:10px;opacity:0.5;"><span style="font-size:24px;">🔒</span><strong style="color:#888;margin-left:10px;">生存大师</strong><p style="margin:5px 0 0;font-size:14px;">存活超过5分钟</p></div>
                </div>
            `
        },
        daily: {
            title: '每日任务',
            content: `
                <div style="text-align:left;">
                    <div style="background:rgba(255,255,255,0.1);padding:15px;border-radius:10px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;"><div><strong style="color:#fff;">完成1局游戏</strong><p style="margin:5px 0 0;font-size:14px;color:#888;">0/1</p></div><span style="color:#ffd700;">🐟 x10</span></div>
                    <div style="background:rgba(255,255,255,0.1);padding:15px;border-radius:10px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;"><div><strong style="color:#fff;">击杀50只敌人</strong><p style="margin:5px 0 0;font-size:14px;color:#888;">0/50</p></div><span style="color:#ffd700;">🐟 x20</span></div>
                </div>
                <p style="margin-top:20px;color:#888;">功能开发中...</p>
            `
        },
        shop: {
            title: '商店',
            content: `
                <p>使用鱼干购买道具！</p>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:15px;margin-top:20px;">
                    <div style="background:rgba(255,255,255,0.1);padding:20px;border-radius:10px;"><span style="font-size:40px;">💎</span><p style="color:#fff;margin:10px 0 5px;">钻石 x10</p><p style="color:#ffd700;">🐟 100</p></div>
                    <div style="background:rgba(255,255,255,0.1);padding:20px;border-radius:10px;"><span style="font-size:40px;">❤️</span><p style="color:#fff;margin:10px 0 5px;">生命药水</p><p style="color:#ffd700;">🐟 50</p></div>
                </div>
                <p style="margin-top:20px;color:#888;">功能开发中...</p>
            `
        },
        mail: {
            title: '邮件',
            content: `
                <div style="background:rgba(255,255,255,0.1);padding:20px;border-radius:10px;"><strong style="color:#ffd700;">📧 欢迎来到喵喵幸存者！</strong><p style="margin:10px 0;font-size:14px;">感谢你的游玩，祝你玩得开心！</p><p style="color:#888;font-size:12px;">- 开发团队</p></div>
                <p style="margin-top:20px;color:#888;">暂无更多邮件</p>
            `
        }
    },
    
    init() {
        this.animateLoadingScreen();
        this.animateMainCharacter();
        this.bindEvents();
    },
    
    bindEvents() {
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.showMainMenu());
        }
    },
    
    showMainMenu() {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('main-menu').classList.remove('hidden');
    },
    
    showCharacterSelect() {
        // 使用面板形式显示角色选择
        this.panels.characters.content = this.generateCharacterPanelContent();
        this.showPanel('characters');
        
        // 延迟启动预览动画（等待DOM渲染）
        setTimeout(() => this.startCharacterPanelAnimation(), 50);
    },
    
    generateCharacterPanelContent() {
        const guaguaSelected = this.selectedCharacter === 'guagua' ? 'selected' : '';
        const kuikuiSelected = this.selectedCharacter === 'kuikui' ? 'selected' : '';
        
        return `
            <div class="char-panel-container">
                <div class="char-panel-card ${guaguaSelected}" onclick="selectCharacter('guagua')">
                    <canvas id="panel-guagua-preview" class="char-panel-preview" width="80" height="80"></canvas>
                    <div class="char-panel-info">
                        <h3>瓜瓜 (Guagua)</h3>
                        <p class="char-panel-desc">布偶猫</p>
                        <p class="char-panel-stats">速度 +15% | 初始武器: 鱼骨飞镖</p>
                    </div>
                    ${guaguaSelected ? '<span class="char-panel-check">✓</span>' : ''}
                </div>
                <div class="char-panel-card ${kuikuiSelected}" onclick="selectCharacter('kuikui')">
                    <canvas id="panel-kuikui-preview" class="char-panel-preview" width="80" height="80"></canvas>
                    <div class="char-panel-info">
                        <h3>葵葵 (Kuikui)</h3>
                        <p class="char-panel-desc">蓝白英短</p>
                        <p class="char-panel-stats">生命 +50% | 初始武器: 呼噜护盾</p>
                    </div>
                    ${kuikuiSelected ? '<span class="char-panel-check">✓</span>' : ''}
                </div>
            </div>
        `;
    },
    
    charPanelAnimationId: null,
    charPanelFrame: 0,
    
    startCharacterPanelAnimation() {
        // 停止之前的动画
        if (this.charPanelAnimationId) {
            cancelAnimationFrame(this.charPanelAnimationId);
        }
        
        const animate = () => {
            this.charPanelFrame++;
            
            const guaguaCanvas = document.getElementById('panel-guagua-preview');
            const kuikuiCanvas = document.getElementById('panel-kuikui-preview');
            
            if (guaguaCanvas && kuikuiCanvas) {
                const guaguaCtx = guaguaCanvas.getContext('2d');
                const kuikuiCtx = kuikuiCanvas.getContext('2d');
                
                guaguaCtx.clearRect(0, 0, 80, 80);
                kuikuiCtx.clearRect(0, 0, 80, 80);
                
                CharacterRenderer.drawGuagua(guaguaCtx, 40, 45, 15, this.charPanelFrame);
                CharacterRenderer.drawKuikui(kuikuiCtx, 40, 45, 15, this.charPanelFrame);
                
                this.charPanelAnimationId = requestAnimationFrame(animate);
            } else {
                // Canvas不存在了，停止动画
                this.charPanelAnimationId = null;
            }
        };
        
        animate();
    },
    
    selectCharacter(charType) {
        this.selectedCharacter = charType;
        this.updateMainCharName();
        this.closePanel();
        
        // 停止面板动画
        if (this.charPanelAnimationId) {
            cancelAnimationFrame(this.charPanelAnimationId);
            this.charPanelAnimationId = null;
        }
    },
    
    updateMainCharName() {
        const nameEl = document.querySelector('.current-char-name');
        if (nameEl) nameEl.innerText = this.selectedCharacter === 'guagua' ? '瓜瓜' : '葵葵';
    },
    
    startGameWithSelectedChar() {
        document.getElementById('main-menu').classList.add('hidden');
        Game.start(this.selectedCharacter);
    },
    
    showPanel(panelId) {
        const panel = this.panels[panelId];
        if (panel) {
            document.getElementById('panel-title').innerText = panel.title;
            document.getElementById('panel-content').innerHTML = panel.content;
            document.getElementById('panel-overlay').classList.remove('hidden');
        }
    },
    
    closePanel() {
        document.getElementById('panel-overlay').classList.add('hidden');
        
        // 停止角色面板动画
        if (this.charPanelAnimationId) {
            cancelAnimationFrame(this.charPanelAnimationId);
            this.charPanelAnimationId = null;
        }
    },
    
    animateLoadingScreen() {
        this.loadingFrame++;
        
        const loadingCat = document.getElementById('loading-cat');
        if (loadingCat) {
            const ctx = loadingCat.getContext('2d');
            ctx.clearRect(0, 0, 120, 120);
            
            if (Math.floor(this.loadingFrame / 60) % 2 === 0) {
                CharacterRenderer.drawGuagua(ctx, 60, 65, 18, this.loadingFrame);
            } else {
                CharacterRenderer.drawKuikui(ctx, 60, 65, 18, this.loadingFrame);
            }
        }
        
        requestAnimationFrame(() => this.animateLoadingScreen());
    },
    
    animateMainCharacter() {
        this.mainCharFrame++;
        
        const mainChar = document.getElementById('main-character');
        const avatarPreview = document.getElementById('avatar-preview');
        
        if (mainChar) {
            const ctx = mainChar.getContext('2d');
            ctx.clearRect(0, 0, 200, 200);
            
            if (this.selectedCharacter === 'guagua') {
                CharacterRenderer.drawGuagua(ctx, 100, 110, 35, this.mainCharFrame);
            } else {
                CharacterRenderer.drawKuikui(ctx, 100, 110, 35, this.mainCharFrame);
            }
        }
        
        if (avatarPreview) {
            const ctx = avatarPreview.getContext('2d');
            ctx.clearRect(0, 0, 50, 50);
            
            if (this.selectedCharacter === 'guagua') {
                CharacterRenderer.drawGuagua(ctx, 25, 28, 12, this.mainCharFrame);
            } else {
                CharacterRenderer.drawKuikui(ctx, 25, 28, 12, this.mainCharFrame);
            }
        }
        
        requestAnimationFrame(() => this.animateMainCharacter());
    },
    

};

// 全局函数
window.showCharacterSelect = function() { UI.showCharacterSelect(); };
window.backToMainMenu = function() { UI.backToMainMenu(); };
window.showPanel = function(panelId) { UI.showPanel(panelId); };
window.closePanel = function() { UI.closePanel(); };
window.selectCharacter = function(charType) { UI.selectCharacter(charType); };
window.startGameWithSelectedChar = function() { UI.startGameWithSelectedChar(); };
window.toggleAutoBattle = function() {
    CONFIG.AUTO_BATTLE = !CONFIG.AUTO_BATTLE;
    const btn = document.getElementById('auto-battle-btn');
    btn.innerText = CONFIG.AUTO_BATTLE ? '自动: 开' : '自动: 关';
    btn.classList.toggle('off', !CONFIG.AUTO_BATTLE);
};
