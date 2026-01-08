// --- 玩家数据管理 ---

const PlayerData = {
    // 存储键名
    STORAGE_KEY: 'kuigua_player',
    
    // 数据
    gold: 0,
    talents: {},
    level: 1,
    preloadedSkills: [],
    
    // 统计数据
    stats: {
        totalKills: 0,
        totalGold: 0,
        totalTime: 0,
        gamesPlayed: 0,
        bossKills: 0
    },
    
    // 初始化
    init() {
        this.load();
    },
    
    // 加载数据
    load() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                this.gold = data.gold || 0;
                this.talents = data.talents || {};
                this.level = data.level || 1;
                this.preloadedSkills = data.preloadedSkills || [];
                this.stats = data.stats || this.stats;
            }
            // 新玩家默认预装火花弹
            if (this.preloadedSkills.length === 0) {
                this.preloadedSkills = ['spark_bolt'];
                this.save();
            }
        } catch (e) {
            console.warn('加载玩家数据失败:', e);
        }
    },
    
    // 保存数据
    save() {
        try {
            const data = {
                gold: this.gold,
                talents: this.talents,
                level: this.level,
                preloadedSkills: this.preloadedSkills,
                stats: this.stats
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('保存玩家数据失败:', e);
        }
    },
    
    // 添加金币
    addGold(amount) {
        this.gold += amount;
        this.stats.totalGold += amount;
        this.save();
        Events.emit(EVENT.GOLD_CHANGED, { gold: this.gold, change: amount });
    },
    
    // 消耗金币
    spendGold(amount) {
        if (this.gold < amount) return false;
        this.gold -= amount;
        this.save();
        Events.emit(EVENT.GOLD_CHANGED, { gold: this.gold, change: -amount });
        return true;
    },
    
    // 获取金币
    getGold() {
        return this.gold;
    },
    
    // 获取天赋等级
    getTalentLevel(talentId) {
        return this.talents[talentId] || 0;
    },
    
    // 设置天赋等级
    setTalentLevel(talentId, level) {
        this.talents[talentId] = level;
        this.save();
    },
    
    // 获取预装技能
    getPreloadedSkills() {
        return [...this.preloadedSkills];
    },
    
    // 设置预装技能
    setPreloadedSkills(skills) {
        this.preloadedSkills = [...skills];
        this.save();
    },
    
    // 添加预装技能
    addPreloadedSkill(skillId) {
        if (!this.preloadedSkills.includes(skillId)) {
            this.preloadedSkills.push(skillId);
            this.save();
            return true;
        }
        return false;
    },
    
    // 移除预装技能
    removePreloadedSkill(index) {
        if (index >= 0 && index < this.preloadedSkills.length) {
            this.preloadedSkills.splice(index, 1);
            this.save();
            return true;
        }
        return false;
    },
    
    // 更新统计
    updateStats(gameStats) {
        this.stats.totalKills += gameStats.kills || 0;
        this.stats.totalTime += gameStats.time || 0;
        this.stats.gamesPlayed += 1;
        this.stats.bossKills += gameStats.bossKills || 0;
        this.save();
    },
    
    // 重置数据（调试用）
    reset() {
        this.gold = 0;
        this.talents = {};
        this.level = 1;
        this.preloadedSkills = [];
        this.stats = {
            totalKills: 0,
            totalGold: 0,
            totalTime: 0,
            gamesPlayed: 0,
            bossKills: 0
        };
        this.save();
    }
};
