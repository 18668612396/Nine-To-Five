// --- 玩家信息界面（浮动） ---

class PlayerProfileScreen extends FloatScreen {
    constructor(config = {}) {
        super({
            id: 'playerProfile',
            domId: 'player-profile-modal',
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
        el.id = 'player-profile-modal';
        el.className = 'screen hidden';
        el.innerHTML = `
            <div class="profile-container">
                <div class="profile-header">
                    <h2>👤 玩家信息</h2>
                    <button class="modal-close" onclick="Screen.Manager.closeFloat('playerProfile')">✕</button>
                </div>
                <div class="profile-content">
                    <div class="profile-stats">
                        <div class="stat-item">
                            <span class="stat-label">总击杀</span>
                            <span class="stat-value" id="profile-kills">0</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Boss击杀</span>
                            <span class="stat-value" id="profile-boss-kills">0</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">游戏次数</span>
                            <span class="stat-value" id="profile-games">0</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">累计金币</span>
                            <span class="stat-value" id="profile-total-gold">0</span>
                        </div>
                    </div>
                    <div class="profile-actions">
                        <button class="profile-btn danger" onclick="Lobby.confirmResetData()">🗑️ 清理数据</button>
                    </div>
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
        this.updateStats();
    }
    
    onExit() {}
    
    updateStats() {
        const stats = PlayerData.stats || {};
        document.getElementById('profile-kills').textContent = stats.totalKills || 0;
        document.getElementById('profile-boss-kills').textContent = stats.bossKills || 0;
        document.getElementById('profile-games').textContent = stats.gamesPlayed || 0;
        document.getElementById('profile-total-gold').textContent = stats.totalGold || 0;
    }
}

Screen.register('playerProfile', PlayerProfileScreen);
