// --- 天赋系统 ---

// 天赋定义
const TALENTS = {
    hp_boost: { 
        id: 'hp_boost',
        name: '生命强化', 
        icon: '❤️', 
        desc: '最大生命+5%', 
        cost: 100, 
        maxLevel: 10,
        bonus: { stat: 'hp', value: 0.05 }
    },
    damage_boost: { 
        id: 'damage_boost',
        name: '攻击强化', 
        icon: '⚔️', 
        desc: '伤害+5%', 
        cost: 150, 
        maxLevel: 10,
        bonus: { stat: 'damage', value: 0.05 }
    },
    speed_boost: { 
        id: 'speed_boost',
        name: '速度强化', 
        icon: '🏃', 
        desc: '移速+3%', 
        cost: 120, 
        maxLevel: 10,
        bonus: { stat: 'speed', value: 0.03 }
    },
    crit_boost: { 
        id: 'crit_boost',
        name: '暴击强化', 
        icon: '💢', 
        desc: '暴击+2%', 
        cost: 200, 
        maxLevel: 5,
        bonus: { stat: 'crit', value: 0.02 }
    },
    xp_boost: { 
        id: 'xp_boost',
        name: '经验强化', 
        icon: '📚', 
        desc: '经验+10%', 
        cost: 180, 
        maxLevel: 5,
        bonus: { stat: 'xp', value: 0.1 }
    },
    gold_boost: { 
        id: 'gold_boost',
        name: '财富强化', 
        icon: '💰', 
        desc: '金币+15%', 
        cost: 250, 
        maxLevel: 5,
        bonus: { stat: 'gold', value: 0.15 }
    },
    skill_slot: { 
        id: 'skill_slot',
        name: '技能槽位', 
        icon: '📦', 
        desc: '预装技能槽+1', 
        cost: 500, 
        maxLevel: 5,
        bonus: { stat: 'skillSlot', value: 1 }
    }
};

const TalentSystem = {
    // 获取所有天赋
    getAll() {
        return TALENTS;
    },
    
    // 获取天赋定义
    get(talentId) {
        return TALENTS[talentId];
    },
    
    // 获取天赋等级
    getLevel(talentId) {
        return PlayerData.getTalentLevel(talentId);
    },
    
    // 获取升级费用
    getCost(talentId) {
        const talent = TALENTS[talentId];
        if (!talent) return 0;
        const level = this.getLevel(talentId);
        return talent.cost * (level + 1);
    },
    
    // 是否已满级
    isMaxed(talentId) {
        const talent = TALENTS[talentId];
        if (!talent) return true;
        return this.getLevel(talentId) >= talent.maxLevel;
    },
    
    // 是否可以升级
    canUpgrade(talentId) {
        if (this.isMaxed(talentId)) return false;
        return PlayerData.getGold() >= this.getCost(talentId);
    },
    
    // 升级天赋
    upgrade(talentId) {
        const talent = TALENTS[talentId];
        if (!talent) return false;
        
        const level = this.getLevel(talentId);
        if (level >= talent.maxLevel) return false;
        
        const cost = this.getCost(talentId);
        if (!PlayerData.spendGold(cost)) return false;
        
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
            skillSlot: 0
        };
        
        Object.entries(TALENTS).forEach(([id, talent]) => {
            const level = this.getLevel(id);
            if (level > 0 && talent.bonus) {
                const stat = talent.bonus.stat;
                if (stat === 'crit' || stat === 'skillSlot') {
                    // 累加型
                    bonus[stat] += talent.bonus.value * level;
                } else {
                    // 乘算型
                    bonus[stat] += talent.bonus.value * level;
                }
            }
        });
        
        return bonus;
    },
    
    // 获取预装技能槽位数量（基础1个 + 天赋加成，最大6个）
    getPreloadSlotCount() {
        const talentLevel = this.getLevel('skill_slot');
        return Math.min(6, 1 + talentLevel);
    }
};
