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
}

// 技能注册表
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
    
    // 获取所有主动技能
    getAllMagic() {
        return Object.values(this.magic);
    },
    
    // 获取所有被动技能
    getAllModifiers() {
        return Object.values(this.modifiers);
    },
    
    // 获取所有祝福
    getAllPerks() {
        return Object.values(this.perks);
    },
    
    // 获取技能
    getSkill(id) {
        return this.magic[id] || this.modifiers[id] || this.perks[id];
    }
};
