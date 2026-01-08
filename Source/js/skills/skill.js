// --- 技能基类 ---

// 技能类型枚举
const SkillType = {
    MAGIC: 'magic',      // 主动技能
    MODIFIER: 'modifier', // 被动技能
    PERK: 'perk'         // 祝福
};

// 技能基类
class Skill {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.type = config.type;
        this.icon = config.icon;
        this.desc = config.desc || '';
        this.star = config.star || 1;
    }
    
    // 获取技能信息
    getInfo() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            icon: this.icon,
            desc: this.desc,
            star: this.star
        };
    }
}

// 主动技能基类
class MagicSkill extends Skill {
    constructor(config) {
        super({ ...config, type: SkillType.MAGIC });
        this.cooldown = config.cooldown || 10;
        this.energyCost = config.energyCost || 1;
    }
    
    // 创建投射物 - 子类重写
    createProjectile(caster, mods) {
        throw new Error('MagicSkill.createProjectile must be overridden');
    }
}

// 被动技能基类
class ModifierSkill extends Skill {
    constructor(config) {
        super({ ...config, type: SkillType.MODIFIER });
    }
    
    // 修改属性 - 子类重写
    modify(mods, star) {
        throw new Error('ModifierSkill.modify must be overridden');
    }
}

// 祝福基类
class Perk extends Skill {
    constructor(config) {
        super({ ...config, type: SkillType.PERK });
        this.stackable = config.stackable !== false;
        this.maxLevel = config.maxLevel || 999;
    }
    
    // 应用效果 - 子类重写
    apply(player, level) {
        throw new Error('Perk.apply must be overridden');
    }
    
    // 获取描述 - 子类可重写以显示等级相关数值
    getDesc(level) {
        return this.desc;
    }
}

// 祝福管理器 (静态)
Perk.Manager = {
    player: null,
    perks: {}, // { perkId: level }
    
    // 初始化
    init() {
        this.player = null;
        this.perks = {};
    },
    
    // 设置玩家
    setPlayer(player) {
        this.player = player;
    },
    
    // 添加祝福
    addPerk(perkId) {
        if (!this.player) return null;
        
        const perk = SkillRegistry.perks[perkId] || PERKS[perkId];
        if (!perk) {
            console.warn('未知祝福:', perkId);
            return null;
        }
        
        const currentLevel = this.perks[perkId] || 0;
        
        // 检查是否可叠加
        if (!perk.stackable && currentLevel > 0) {
            return null;
        }
        
        // 检查最大等级
        if (currentLevel >= perk.maxLevel) {
            return null;
        }
        
        // 增加等级
        this.perks[perkId] = currentLevel + 1;
        
        // 应用效果
        if (perk.apply) {
            perk.apply(this.player, 1);
        }
        
        return { perk, level: this.perks[perkId] };
    },
    
    // 获取祝福等级
    getPerkLevel(perkId) {
        return this.perks[perkId] || 0;
    },
    
    // 获取所有已获得的祝福
    getAllPerks() {
        const result = [];
        for (const [perkId, level] of Object.entries(this.perks)) {
            const perk = SkillRegistry.perks[perkId] || PERKS[perkId];
            if (perk) {
                result.push({ perk, level });
            }
        }
        return result;
    },
    
    // 检查是否拥有祝福
    hasPerk(perkId) {
        return this.perks[perkId] > 0;
    }
};

// 兼容旧代码
class PerkManager {
    constructor(player) {
        Perk.Manager.setPlayer(player);
    }
    
    addPerk(perkId) {
        return Perk.Manager.addPerk(perkId);
    }
    
    getPerkLevel(perkId) {
        return Perk.Manager.getPerkLevel(perkId);
    }
    
    getAllPerks() {
        return Perk.Manager.getAllPerks();
    }
    
    hasPerk(perkId) {
        return Perk.Manager.hasPerk(perkId);
    }
}

// --- 技能注册表 ---
const SkillRegistry = {
    magic: {},
    modifiers: {},
    perks: {},
    
    // 注册主动技能
    registerMagic(skill) {
        this.magic[skill.id] = skill;
    },
    
    // 注册被动技能
    registerModifier(skill) {
        this.modifiers[skill.id] = skill;
    },
    
    // 注册祝福
    registerPerk(perk) {
        this.perks[perk.id] = perk;
    },
    
    // 获取技能
    getMagic(id) {
        return this.magic[id];
    },
    
    getModifier(id) {
        return this.modifiers[id];
    },
    
    getPerk(id) {
        return this.perks[id];
    },
    
    // 获取所有技能
    getAllMagic() {
        return Object.values(this.magic);
    },
    
    getAllModifiers() {
        return Object.values(this.modifiers);
    },
    
    getAllPerks() {
        return Object.values(this.perks);
    },
    
    // 清空注册表
    clear() {
        this.magic = {};
        this.modifiers = {};
        this.perks = {};
    }
};
