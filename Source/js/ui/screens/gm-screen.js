// --- GM面板（浮动） ---

class GMScreen extends FloatScreen {
    constructor(config = {}) {
        super({
            id: 'gm',
            domId: 'gm-modal',
            closeOnBackdrop: true,
            ...config
        });
        
        this.domCreated = false;
    }
    
    createDOM() {
        if (this.domCreated) return;
        
        const container = document.getElementById('ui-layer');
        if (!container) return;
        
        const el = document.createElement('div');
        el.id = 'gm-modal';
        el.className = 'screen hidden';
        el.innerHTML = `
            <div class="gm-modal-container">
                <div class="gm-header">
                    <h2>🛠️ GM</h2>
                    <button class="gm-close-btn" onclick="GM.closePanel()">✕</button>
                </div>
                <div class="gm-section">
                    <h4>💰 金币</h4>
                    <div class="gm-gold-btns">
                        <button class="gm-btn gold-type" onclick="GM.addGold(100)">+100</button>
                        <button class="gm-btn gold-type" onclick="GM.addGold(1000)">+1000</button>
                        <button class="gm-btn gold-type" onclick="GM.addGold(10000)">+10000</button>
                    </div>
                </div>
                <div class="gm-section">
                    <h4>👹 召唤Boss</h4>
                    <div class="gm-boss-btns">
                        <button class="gm-btn boss-type" onclick="GM.spawnBoss('sakura_treant')">🌸 樱花树妖</button>
                        <button class="gm-btn boss-type" onclick="GM.spawnBoss('lava_golem')">🔥 熔岩巨人</button>
                        <button class="gm-btn boss-type" onclick="GM.spawnBoss('abyssal_eye')">👁️ 深渊之眼</button>
                        <button class="gm-btn boss-type" onclick="GM.spawnBoss('frost_queen')">❄️ 冰霜女王</button>
                    </div>
                </div>
                <div class="gm-section">
                    <h4>🔥 魔法</h4>
                    <div id="gm-magic-list" class="gm-list"></div>
                </div>
                <div class="gm-section">
                    <h4>💠 被动</h4>
                    <div id="gm-modifier-list" class="gm-list"></div>
                </div>
                <div class="gm-section">
                    <h4>🎁 祝福</h4>
                    <div id="gm-perk-list" class="gm-list"></div>
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
        if (typeof GM !== 'undefined' && GM.render) {
            GM.render();
        }
    }
    
    addGold(amount) {
        if (typeof GM !== 'undefined') {
            GM.addGold(amount);
        }
    }
    
    spawnBoss(bossId) {
        if (typeof GM !== 'undefined') {
            GM.spawnBoss(bossId);
        }
    }
    
    addSkill(skillId) {
        if (typeof GM !== 'undefined') {
            GM.addSkill(skillId);
        }
    }
    
    addPerk(perkId) {
        if (typeof GM !== 'undefined') {
            GM.addPerk(perkId);
        }
    }
}

Screen.register('gm', GMScreen);
