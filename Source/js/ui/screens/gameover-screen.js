// --- 游戏结束界面 ---

class GameOverScreen extends FullScreen {
    constructor(config = {}) {
        super({
            id: 'gameover',
            domId: 'gameover-screen',
            ...config
        });
        
        this.stats = {
            time: 0,
            kills: 0,
            gold: 0,
            level: 1,
            damage: 0,
            taken: 0,
            bossKills: 0
        };
        this.domCreated = false;
    }
    
    createDOM() {
        if (this.domCreated) return;
        
        const container = document.getElementById('ui-layer');
        if (!container) return;
        
        const el = document.createElement('div');
        el.id = 'gameover-screen';
        el.className = 'screen hidden';
        el.innerHTML = `
            <h1>游戏结束</h1>
            <div class="gameover-stats">
                <div class="stats-main">
                    <p>⏱️ 存活时间: <span id="final-time"></span></p>
                    <p>💀 击杀数量: <span id="final-kills"></span></p>
                    <p class="gold-earned">💰 获得金币: <span id="final-gold">0</span></p>
                </div>
                <div class="stats-detail">
                    <div class="stat-item">
                        <span class="stat-label">⬆️ 最终等级</span>
                        <span class="stat-value" id="final-level">1</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">⚔️ 造成伤害</span>
                        <span class="stat-value" id="final-damage">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">💔 承受伤害</span>
                        <span class="stat-value" id="final-taken">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">👹 Boss击杀</span>
                        <span class="stat-value" id="final-boss">0</span>
                    </div>
                </div>
            </div>
            <div class="gameover-btns">
                <button onclick="Lobby.enter()">返回大厅</button>
                <button onclick="Lobby.restartGame()">再来一局</button>
            </div>
        `;
        
        container.appendChild(el);
        this.domCreated = true;
    }
    
    show() {
        this.createDOM();
        super.show();
    }
    
    setStats(stats) {
        this.stats = { ...this.stats, ...stats };
    }
    
    onEnter() {
        this.updateDisplay();
    }
    
    updateDisplay() {
        const timeEl = document.getElementById('final-time');
        const killsEl = document.getElementById('final-kills');
        const goldEl = document.getElementById('final-gold');
        const levelEl = document.getElementById('final-level');
        const damageEl = document.getElementById('final-damage');
        const takenEl = document.getElementById('final-taken');
        const bossEl = document.getElementById('final-boss');
        
        if (timeEl) timeEl.textContent = this.formatTime(this.stats.time);
        if (killsEl) killsEl.textContent = this.stats.kills;
        if (goldEl) goldEl.textContent = this.stats.gold;
        if (levelEl) levelEl.textContent = this.stats.level;
        if (damageEl) damageEl.textContent = Math.floor(this.stats.damage);
        if (takenEl) takenEl.textContent = Math.floor(this.stats.taken);
        if (bossEl) bossEl.textContent = this.stats.bossKills;
    }
    
    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    
    backToLobby() {
        Screen.Manager.switchTo('lobby');
    }
    
    restart() {
        if (typeof Lobby !== 'undefined') {
            Lobby.restartGame();
        }
    }
}

Screen.register('gameover', GameOverScreen);
