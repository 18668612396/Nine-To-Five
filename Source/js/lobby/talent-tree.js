// --- 天赋树系统 ---

// 天赋节点定义 - 4条独立分支
const TALENT_TREE = {
    // ========== 攻击分支 ==========
    atk_1: {
        id: 'atk_1',
        name: '攻击强化I',
        icon: '⚔️',
        desc: '伤害+5%',
        cost: 20,
        maxLevel: 5,
        bonus: { stat: 'damage', value: 0.05 },
        requires: null,
        branch: 'attack'
    },
    atk_2: {
        id: 'atk_2',
        name: '攻击强化II',
        icon: '⚔️',
        desc: '伤害+5%',
        cost: 20,
        maxLevel: 5,
        bonus: { stat: 'damage', value: 0.05 },
        requires: 'atk_1',
        branch: 'attack'
    },
    crit_1: {
        id: 'crit_1',
        name: '暴击强化',
        icon: '💢',
        desc: '暴击+2%',
        cost: 20,
        maxLevel: 5,
        bonus: { stat: 'crit', value: 0.02 },
        requires: 'atk_2',
        branch: 'attack'
    },
    atk_pierce: {
        id: 'atk_pierce',
        name: '穿透强化',
        icon: '🗡️',
        desc: '穿透+1',
        cost: 30,
        maxLevel: 5,
        bonus: { stat: 'pierce', value: 1 },
        requires: 'crit_1',
        branch: 'attack'
    },
    crit_dmg: {
        id: 'crit_dmg',
        name: '暴击伤害',
        icon: '💥',
        desc: '暴击伤害+10%',
        cost: 30,
        maxLevel: 5,
        bonus: { stat: 'critDmg', value: 0.1 },
        requires: 'atk_pierce',
        branch: 'attack'
    },
    atk_range: {
        id: 'atk_range',
        name: '攻击范围',
        icon: '🎯',
        desc: '攻击范围+5%',
        cost: 30,
        maxLevel: 5,
        bonus: { stat: 'range', value: 0.05 },
        requires: 'crit_dmg',
        branch: 'attack'
    },
    skill_slot_1: {
        id: 'skill_slot_1',
        name: '技能槽位I',
        icon: '📦',
        desc: '预装技能槽+1',
        cost: 100,
        maxLevel: 1,
        bonus: { stat: 'skillSlot', value: 1 },
        requires: 'atk_range',
        branch: 'attack',
        rarity: 'rare'
    },
    atk_3: {
        id: 'atk_3',
        name: '攻击精通',
        icon: '⚔️',
        desc: '伤害+2%',
        cost: 100,
        maxLevel: Infinity,
        bonus: { stat: 'damage', value: 0.02 },
        requires: 'skill_slot_1',
        branch: 'attack',
        infinite: true
    },
    
    // ========== 防御分支 ==========
    hp_1: {
        id: 'hp_1',
        name: '生命强化I',
        icon: '❤️',
        desc: '最大生命+5%',
        cost: 20,
        maxLevel: 5,
        bonus: { stat: 'hp', value: 0.05 },
        requires: null,
        branch: 'defense'
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
        branch: 'defense'
    },
    regen_1: {
        id: 'regen_1',
        name: '生命恢复',
        icon: '💚',
        desc: '每秒恢复0.5生命',
        cost: 20,
        maxLevel: 5,
        bonus: { stat: 'regen', value: 0.5 },
        requires: 'hp_2',
        branch: 'defense'
    },
    def_armor: {
        id: 'def_armor',
        name: '护甲强化',
        icon: '🛡️',
        desc: '减伤+3%',
        cost: 30,
        maxLevel: 5,
        bonus: { stat: 'armor', value: 0.03 },
        requires: 'regen_1',
        branch: 'defense'
    },
    def_dodge: {
        id: 'def_dodge',
        name: '闪避强化',
        icon: '💨',
        desc: '闪避+2%',
        cost: 30,
        maxLevel: 5,
        bonus: { stat: 'dodge', value: 0.02 },
        requires: 'def_armor',
        branch: 'defense'
    },
    def_thorns: {
        id: 'def_thorns',
        name: '荆棘反伤',
        icon: '🌵',
        desc: '反伤+5%',
        cost: 30,
        maxLevel: 5,
        bonus: { stat: 'thorns', value: 0.05 },
        requires: 'def_dodge',
        branch: 'defense'
    },
    skill_slot_2: {
        id: 'skill_slot_2',
        name: '技能槽位II',
        icon: '📦',
        desc: '预装技能槽+1',
        cost: 100,
        maxLevel: 1,
        bonus: { stat: 'skillSlot', value: 1 },
        requires: 'def_thorns',
        branch: 'defense',
        rarity: 'rare'
    },
    hp_3: {
        id: 'hp_3',
        name: '生命精通',
        icon: '❤️',
        desc: '最大生命+2%',
        cost: 100,
        maxLevel: Infinity,
        bonus: { stat: 'hp', value: 0.02 },
        requires: 'skill_slot_2',
        branch: 'defense',
        infinite: true
    },
    
    // ========== 辅助分支 ==========
    speed_1: {
        id: 'speed_1',
        name: '速度强化I',
        icon: '🏃',
        desc: '移速+3%',
        cost: 20,
        maxLevel: 5,
        bonus: { stat: 'speed', value: 0.03 },
        requires: null,
        branch: 'utility'
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
        branch: 'utility'
    },
    cooldown_1: {
        id: 'cooldown_1',
        name: '冷却缩减',
        icon: '⏱️',
        desc: '技能冷却-3%',
        cost: 20,
        maxLevel: 5,
        bonus: { stat: 'cooldown', value: 0.03 },
        requires: 'speed_2',
        branch: 'utility'
    },
    util_pickup: {
        id: 'util_pickup',
        name: '拾取范围',
        icon: '🧲',
        desc: '拾取范围+10%',
        cost: 30,
        maxLevel: 5,
        bonus: { stat: 'pickup', value: 0.1 },
        requires: 'cooldown_1',
        branch: 'utility'
    },
    util_duration: {
        id: 'util_duration',
        name: '效果延长',
        icon: '⌛',
        desc: '技能持续+5%',
        cost: 30,
        maxLevel: 5,
        bonus: { stat: 'duration', value: 0.05 },
        requires: 'util_pickup',
        branch: 'utility'
    },
    util_area: {
        id: 'util_area',
        name: '范围扩大',
        icon: '🔮',
        desc: '技能范围+5%',
        cost: 30,
        maxLevel: 5,
        bonus: { stat: 'area', value: 0.05 },
        requires: 'util_duration',
        branch: 'utility'
    },
    skill_slot_3: {
        id: 'skill_slot_3',
        name: '技能槽位III',
        icon: '📦',
        desc: '预装技能槽+1',
        cost: 100,
        maxLevel: 1,
        bonus: { stat: 'skillSlot', value: 1 },
        requires: 'util_area',
        branch: 'utility',
        rarity: 'rare'
    },
    speed_3: {
        id: 'speed_3',
        name: '速度精通',
        icon: '🏃',
        desc: '移速+1%',
        cost: 100,
        maxLevel: Infinity,
        bonus: { stat: 'speed', value: 0.01 },
        requires: 'skill_slot_3',
        branch: 'utility',
        infinite: true
    },
    
    // ========== 财富分支 ==========
    xp_1: {
        id: 'xp_1',
        name: '经验强化',
        icon: '📚',
        desc: '经验+10%',
        cost: 20,
        maxLevel: 5,
        bonus: { stat: 'xp', value: 0.1 },
        requires: null,
        branch: 'fortune'
    },
    gold_1: {
        id: 'gold_1',
        name: '财富强化',
        icon: '💰',
        desc: '金币+15%',
        cost: 20,
        maxLevel: 5,
        bonus: { stat: 'gold', value: 0.15 },
        requires: 'xp_1',
        branch: 'fortune'
    },
    luck_1: {
        id: 'luck_1',
        name: '幸运强化',
        icon: '🍀',
        desc: '掉落率+5%',
        cost: 20,
        maxLevel: 5,
        bonus: { stat: 'luck', value: 0.05 },
        requires: 'gold_1',
        branch: 'fortune'
    },
    fort_magnet: {
        id: 'fort_magnet',
        name: '金币磁铁',
        icon: '🪙',
        desc: '金币拾取+15%',
        cost: 30,
        maxLevel: 5,
        bonus: { stat: 'goldPickup', value: 0.15 },
        requires: 'luck_1',
        branch: 'fortune'
    },
    fort_treasure: {
        id: 'fort_treasure',
        name: '宝箱猎人',
        icon: '🎁',
        desc: '宝箱掉落+10%',
        cost: 30,
        maxLevel: 5,
        bonus: { stat: 'treasure', value: 0.1 },
        requires: 'fort_magnet',
        branch: 'fortune'
    },
    fort_revival: {
        id: 'fort_revival',
        name: '复活机会',
        icon: '✨',
        desc: '复活次数+1',
        cost: 50,
        maxLevel: 3,
        bonus: { stat: 'revival', value: 1 },
        requires: 'fort_treasure',
        branch: 'fortune'
    },
    skill_slot_4: {
        id: 'skill_slot_4',
        name: '技能槽位IV',
        icon: '📦',
        desc: '预装技能槽+1',
        cost: 100,
        maxLevel: 1,
        bonus: { stat: 'skillSlot', value: 1 },
        requires: 'fort_revival',
        branch: 'fortune',
        rarity: 'rare'
    },
    gold_2: {
        id: 'gold_2',
        name: '财富精通',
        icon: '💰',
        desc: '金币+5%',
        cost: 100,
        maxLevel: Infinity,
        bonus: { stat: 'gold', value: 0.05 },
        requires: 'skill_slot_4',
        branch: 'fortune',
        infinite: true
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
        // 无限升级天赋固定100金币
        if (talent.infinite) {
            return 100;
        }
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
        // 无限升级天赋永远不会满级
        if (talent.infinite) return false;
        return this.getLevel(talentId) >= talent.maxLevel;
    },
    
    // 检查前置条件是否满足
    canUnlock(talentId) {
        const talent = TALENT_TREE[talentId];
        if (!talent) return false;
        
        // 没有前置要求的天赋始终可解锁
        if (!talent.requires) return true;
        
        // 检查前置天赋是否满级
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
        const talent = TALENT_TREE[talentId];
        const level = this.getLevel(talentId);
        const maxed = this.isMaxed(talentId);
        const unlocked = this.canUnlock(talentId);
        const canUpgrade = this.canUpgrade(talentId);
        
        // 无限升级天赋特殊状态
        if (talent && talent.infinite && level > 0) {
            return canUpgrade ? 'infinite-available' : 'infinite-active';
        }
        
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
            luck: 1,
            pierce: 0,
            critDmg: 1.5,
            range: 1,
            armor: 0,
            dodge: 0,
            thorns: 0,
            pickup: 1,
            duration: 1,
            area: 1,
            goldPickup: 1,
            treasure: 1,
            revival: 0
        };
        
        Object.entries(TALENT_TREE).forEach(([id, talent]) => {
            const level = this.getLevel(id);
            if (level > 0 && talent.bonus) {
                const stat = talent.bonus.stat;
                if (stat === 'crit' || stat === 'skillSlot' || stat === 'regen' || 
                    stat === 'pierce' || stat === 'armor' || stat === 'dodge' || 
                    stat === 'thorns' || stat === 'revival') {
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
    }
};

// 兼容旧的 TalentSystem 引用
if (typeof TalentSystem === 'undefined') {
    var TalentSystem = TalentTree;
}
