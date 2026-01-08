// --- 天赋树系统 ---

// 天赋节点定义 - 从上到下的树状结构
const TALENT_TREE = {
    // ========== 顶部核心节点 ==========
    core: {
        id: 'core',
        name: '核心',
        icon: '⭐',
        desc: '天赋树起点',
        cost: 0,
        maxLevel: 1,
        bonus: null,
        requires: null,
        position: { x: 0, y: 0 },
        branch: 'center'
    },
    
    // ========== 第一层（4个分支起点） ==========
    atk_1: {
        id: 'atk_1',
        name: '攻击强化I',
        icon: '⚔️',
        desc: '伤害+5%',
        cost: 20,
        maxLevel: 5,
        bonus: { stat: 'damage', value: 0.05 },
        requires: 'core',
        position: { x: -3, y: 1 },
        branch: 'attack'
    },
    hp_1: {
        id: 'hp_1',
        name: '生命强化I',
        icon: '❤️',
        desc: '最大生命+5%',
        cost: 20,
        maxLevel: 5,
        bonus: { stat: 'hp', value: 0.05 },
        requires: 'core',
        position: { x: -1, y: 1 },
        branch: 'defense'
    },
    speed_1: {
        id: 'speed_1',
        name: '速度强化I',
        icon: '🏃',
        desc: '移速+3%',
        cost: 20,
        maxLevel: 5,
        bonus: { stat: 'speed', value: 0.03 },
        requires: 'core',
        position: { x: 1, y: 1 },
        branch: 'utility'
    },
    xp_1: {
        id: 'xp_1',
        name: '经验强化I',
        icon: '📚',
        desc: '经验+10%',
        cost: 20,
        maxLevel: 5,
        bonus: { stat: 'xp', value: 0.1 },
        requires: 'core',
        position: { x: 3, y: 1 },
        branch: 'fortune'
    },
    
    // ========== 第二层 ==========
    atk_2: {
        id: 'atk_2',
        name: '攻击强化II',
        icon: '⚔️',
        desc: '伤害+5%',
        cost: 20,
        maxLevel: 5,
        bonus: { stat: 'damage', value: 0.05 },
        requires: 'atk_1',
        position: { x: -3, y: 2 },
        branch: 'attack'
    },
    hp_2: {
        id: 'hp_2',
        name: '生命强化II',
        icon: '❤️',
        desc: '最大生命+5%',
        cost: 20,
        maxLevel: 5,
        bonus: { stat: 'hp', value: 0.05 },
        requires: 'hp_1',
        position: { x: -1, y: 2 },
        branch: 'defense'
    },
    speed_2: {
        id: 'speed_2',
        name: '速度强化II',
        icon: '🏃',
        desc: '移速+3%',
        cost: 20,
        maxLevel: 5,
        bonus: { stat: 'speed', value: 0.03 },
        requires: 'speed_1',
        position: { x: 1, y: 2 },
        branch: 'utility'
    },
    gold_1: {
        id: 'gold_1',
        name: '财富强化I',
        icon: '💰',
        desc: '金币+15%',
        cost: 20,
        maxLevel: 5,
        bonus: { stat: 'gold', value: 0.15 },
        requires: 'xp_1',
        position: { x: 3, y: 2 },
        branch: 'fortune'
    },
    
    // ========== 第三层 ==========
    crit_1: {
        id: 'crit_1',
        name: '暴击强化I',
        icon: '💢',
        desc: '暴击+2%',
        cost: 20,
        maxLevel: 5,
        bonus: { stat: 'crit', value: 0.02 },
        requires: 'atk_2',
        position: { x: -3, y: 3 },
        branch: 'attack'
    },
    regen_1: {
        id: 'regen_1',
        name: '生命恢复I',
        icon: '💚',
        desc: '每秒恢复0.5生命',
        cost: 20,
        maxLevel: 5,
        bonus: { stat: 'regen', value: 0.5 },
        requires: 'hp_2',
        position: { x: -1, y: 3 },
        branch: 'defense'
    },
    cooldown_1: {
        id: 'cooldown_1',
        name: '冷却缩减I',
        icon: '⏱️',
        desc: '技能冷却-3%',
        cost: 20,
        maxLevel: 5,
        bonus: { stat: 'cooldown', value: 0.03 },
        requires: 'speed_2',
        position: { x: 1, y: 3 },
        branch: 'utility'
    },
    luck_1: {
        id: 'luck_1',
        name: '幸运强化I',
        icon: '🍀',
        desc: '掉落率+5%',
        cost: 20,
        maxLevel: 5,
        bonus: { stat: 'luck', value: 0.05 },
        requires: 'gold_1',
        position: { x: 3, y: 3 },
        branch: 'fortune'
    },
    
    // ========== 第四层（技能槽位） ==========
    skill_slot_1: {
        id: 'skill_slot_1',
        name: '技能槽位I',
        icon: '📦',
        desc: '预装技能槽+1',
        cost: 100,
        maxLevel: 1,
        bonus: { stat: 'skillSlot', value: 1 },
        requires: 'crit_1',
        position: { x: -3, y: 4 },
        branch: 'attack',
        rarity: 'rare'
    },
    skill_slot_2: {
        id: 'skill_slot_2',
        name: '技能槽位II',
        icon: '📦',
        desc: '预装技能槽+1',
        cost: 100,
        maxLevel: 1,
        bonus: { stat: 'skillSlot', value: 1 },
        requires: 'regen_1',
        position: { x: -1, y: 4 },
        branch: 'defense',
        rarity: 'rare'
    },
    skill_slot_3: {
        id: 'skill_slot_3',
        name: '技能槽位III',
        icon: '📦',
        desc: '预装技能槽+1',
        cost: 100,
        maxLevel: 1,
        bonus: { stat: 'skillSlot', value: 1 },
        requires: 'cooldown_1',
        position: { x: 1, y: 4 },
        branch: 'utility',
        rarity: 'rare'
    },
    skill_slot_4: {
        id: 'skill_slot_4',
        name: '技能槽位IV',
        icon: '📦',
        desc: '预装技能槽+1',
        cost: 100,
        maxLevel: 1,
        bonus: { stat: 'skillSlot', value: 1 },
        requires: 'luck_1',
        position: { x: 3, y: 4 },
        branch: 'fortune',
        rarity: 'rare'
    },
    
    // ========== 第五层 ==========
    atk_3: {
        id: 'atk_3',
        name: '攻击强化III',
        icon: '⚔️',
        desc: '伤害+8%',
        cost: 20,
        maxLevel: 5,
        bonus: { stat: 'damage', value: 0.08 },
        requires: 'skill_slot_1',
        position: { x: -3, y: 5 },
        branch: 'attack'
    },
    hp_3: {
        id: 'hp_3',
        name: '生命强化III',
        icon: '❤️',
        desc: '最大生命+8%',
        cost: 20,
        maxLevel: 5,
        bonus: { stat: 'hp', value: 0.08 },
        requires: 'skill_slot_2',
        position: { x: -1, y: 5 },
        branch: 'defense'
    },
    speed_3: {
        id: 'speed_3',
        name: '速度强化III',
        icon: '🏃',
        desc: '移速+5%',
        cost: 20,
        maxLevel: 5,
        bonus: { stat: 'speed', value: 0.05 },
        requires: 'skill_slot_3',
        position: { x: 1, y: 5 },
        branch: 'utility'
    },
    gold_2: {
        id: 'gold_2',
        name: '财富强化II',
        icon: '💰',
        desc: '金币+20%',
        cost: 20,
        maxLevel: 5,
        bonus: { stat: 'gold', value: 0.2 },
        requires: 'skill_slot_4',
        position: { x: 3, y: 5 },
        branch: 'fortune'
    }
};

// 分支颜色配置
const BRANCH_COLORS = {
    center: '#ffd700',
    attack: '#ff6b6b',
    defense: '#66ff66',
    utility: '#66b3ff',
    fortune: '#ffcc00'
};

const TalentTree = {
    // 获取所有天赋
    getAll() {
        return TALENT_TREE;
    },
    
    // 获取天赋定义
    get(talentId) {
        return TALENT_TREE[talentId];
    },
    
    // 获取天赋等级
    getLevel(talentId) {
        return PlayerData.getTalentLevel(talentId);
    },
    
    // 获取升级费用
    getCost(talentId) {
        const talent = TALENT_TREE[talentId];
        if (!talent) return 0;
        // 技能槽位固定100金币，其他固定20金币
        if (talent.bonus && talent.bonus.stat === 'skillSlot') {
            return 100;
        }
        return 20;
    },
    
    // 是否已满级
    isMaxed(talentId) {
        const talent = TALENT_TREE[talentId];
        if (!talent) return true;
        return this.getLevel(talentId) >= talent.maxLevel;
    },
    
    // 检查前置条件是否满足
    canUnlock(talentId) {
        const talent = TALENT_TREE[talentId];
        if (!talent) return false;
        
        // 核心节点始终可解锁
        if (!talent.requires) return true;
        
        // 检查前置天赋是否满级
        const reqTalent = TALENT_TREE[talent.requires];
        if (!reqTalent) return false;
        
        return this.isMaxed(talent.requires);
    },
    
    // 是否可以升级
    canUpgrade(talentId) {
        // 已满级
        if (this.isMaxed(talentId)) return false;
        
        // 前置条件不满足
        if (!this.canUnlock(talentId)) return false;
        
        // 金币不足
        return PlayerData.getGold() >= this.getCost(talentId);
    },
    
    // 获取节点状态
    getNodeState(talentId) {
        const level = this.getLevel(talentId);
        const maxed = this.isMaxed(talentId);
        const unlocked = this.canUnlock(talentId);
        const canUpgrade = this.canUpgrade(talentId);
        
        if (maxed) return 'maxed';
        if (level > 0) return 'active';
        if (unlocked && canUpgrade) return 'available';
        if (unlocked) return 'unlocked';
        return 'locked';
    },
    
    // 升级天赋
    upgrade(talentId) {
        const talent = TALENT_TREE[talentId];
        if (!talent) return false;
        
        if (!this.canUpgrade(talentId)) return false;
        
        const cost = this.getCost(talentId);
        if (!PlayerData.spendGold(cost)) return false;
        
        const level = this.getLevel(talentId);
        PlayerData.setTalentLevel(talentId, level + 1);
        Events.emit(EVENT.TALENT_UPGRADED, { talentId, level: level + 1 });
        return true;
    },
    
    // 获取天赋加成
    getBonus() {
        const bonus = {
            hp: 1,
            damage: 1,
            speed: 1,
            crit: 0,
            xp: 1,
            gold: 1,
            skillSlot: 0,
            regen: 0,
            cooldown: 1,
            luck: 1
        };
        
        Object.entries(TALENT_TREE).forEach(([id, talent]) => {
            const level = this.getLevel(id);
            if (level > 0 && talent.bonus) {
                const stat = talent.bonus.stat;
                if (stat === 'crit' || stat === 'skillSlot' || stat === 'regen') {
                    // 累加型
                    bonus[stat] += talent.bonus.value * level;
                } else if (stat === 'cooldown') {
                    // 冷却缩减（乘算递减）
                    bonus[stat] -= talent.bonus.value * level;
                } else {
                    // 乘算型
                    bonus[stat] += talent.bonus.value * level;
                }
            }
        });
        
        // 确保冷却不会低于0.5
        bonus.cooldown = Math.max(0.5, bonus.cooldown);
        
        return bonus;
    },
    
    // 获取预装技能槽位数量（基础1个 + 天赋加成，最大6个）
    getPreloadSlotCount() {
        let slots = 1;
        ['skill_slot_1', 'skill_slot_2', 'skill_slot_3', 'skill_slot_4'].forEach(id => {
            slots += this.getLevel(id);
        });
        return Math.min(6, slots);
    },
    
    // 获取分支颜色
    getBranchColor(branch) {
        return BRANCH_COLORS[branch] || '#ffffff';
    },
    
    // 获取连接线数据
    getConnections() {
        const connections = [];
        Object.values(TALENT_TREE).forEach(talent => {
            if (talent.requires) {
                const parent = TALENT_TREE[talent.requires];
                if (parent) {
                    connections.push({
                        from: parent.position,
                        to: talent.position,
                        branch: talent.branch,
                        active: this.getLevel(talent.requires) > 0
                    });
                }
            }
        });
        return connections;
    }
};

// 兼容旧的 TalentSystem 引用
if (typeof TalentSystem === 'undefined') {
    var TalentSystem = TalentTree;
}
