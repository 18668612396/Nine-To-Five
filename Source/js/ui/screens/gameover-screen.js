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
    }
    
    // 设置统计数据
    setStats(stats) {
        this.stats = { ...this.stats, ...stats };
    }
    
    onEnter() {
        this.updateDisplay();
    }
    
    // 更新显示
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
    
    // 格式化时间
    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    
    // 返回大厅
    backToLobby() {
        Screen.Manager.switchTo('lobby');
    }
    
    // 再来一局
    restart() {
        // 通过Lobby重新开始
        if (typeof Lobby !== 'undefined') {
            Lobby.restartGame();
        }
    }
}

Screen.register('gameover', GameOverScreen);
