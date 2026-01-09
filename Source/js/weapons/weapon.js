// --- 武器基类 ---

// 武器词条定义
const WEAPON_AFFIXES = {
    // ========== 元素类 ==========
    fire_affinity: {
        id: 'fire_affinity',
        name: '火焰亲和',
        desc: '火焰技能有{value}%概率免费施法',
        type: 'element',
        element: 'fire',
        valueRange: [10, 25],
        apply: (weapon, value) => { weapon.freecastChance.fire = value / 100; }
    },
    ice_affinity: {
        id: 'ice_affinity',
        name: '冰霜亲和',
        desc: '冰霜技能减速效果+{value}%',
        type: 'element',
        element: 'ice',
        valueRange: [15, 35],
        apply: (weapon, value) => { weapon.elementBonus.ice = { slow: value / 100 }; }
    },
    lightning_affinity: {
        id: 'lightning_affinity',
        name: '雷电亲和',
        desc: '雷电技能有{value}%概率连锁',
        type: 'element',
        element: 'lightning',
        valueRange: [10, 30],
        apply: (weapon, value) => { weapon.elementBonus.lightning = { chain: value / 100 }; }
    },
    frost_affinity: {
        id: 'frost_affinity',
        name: '冰霜亲和',
        desc: '命中敌人时减速{value}%',
        type: 'element',
        element: 'ice',
        valueRange: [20, 40],
        apply: (weapon, value) => { weapon.frostSlow = value / 100; }
    },
    
    // ========== 能量类 ==========
    energy_regen: {
        id: 'energy_regen',
        name: '能量涌动',
        desc: '能量回复速度+{value}%',
        type: 'energy',
        valueRange: [15, 40],
        apply: (weapon, value) => { weapon.energyRegenMult = 1 + value / 100; }
    },
    energy_on_kill: {
        id: 'energy_on_kill',
        name: '杀戮回能',
        desc: '击杀敌人回复{value}点能量',
        type: 'energy',
        valueRange: [3, 8],
        apply: (weapon, value) => { weapon.energyOnKill = value; }
    },
    energy_on_crit: {
        id: 'energy_on_crit',
        name: '暴击回能',
        desc: '暴击时回复{value}点能量',
        type: 'energy',
        valueRange: [2, 6],
        apply: (weapon, value) => { weapon.energyOnCrit = value; }
    },
    cost_reduce: {
        id: 'cost_reduce',
        name: '节能施法',
        desc: '技能消耗-{value}%',
        type: 'energy',
        valueRange: [10, 25],
        apply: (weapon, value) => { weapon.costMult = 1 - value / 100; }
    },
    energy_max: {
        id: 'energy_max',
        name: '能量上限',
        desc: '最大能量+{value}',
        type: 'energy',
        valueRange: [10, 25],
        apply: (weapon, value) => { weapon.maxEnergy += value; weapon.energy = Math.min(weapon.energy, weapon.maxEnergy); }
    },
    full_energy_damage: {
        id: 'full_energy_damage',
        name: '满能强化',
        desc: '能量>80%时伤害+{value}%',
        type: 'energy',
        valueRange: [20, 40],
        apply: (weapon, value) => { weapon.fullEnergyDamage = value / 100; }
    },
    combo_cast: {
        id: 'combo_cast',
        name: '连击',
        desc: '连续施法{value}次后下次免费',
        type: 'energy',
        valueRange: [3, 5],
        apply: (weapon, value) => { weapon.comboThreshold = value; weapon.comboCounter = 0; }
    },
    echo: {
        id: 'echo',
        name: '回响',
        desc: '{value}%概率重复施放上一个技能',
        type: 'energy',
        valueRange: [10, 20],
        apply: (weapon, value) => { weapon.echoChance = value / 100; }
    },
    
    // ========== 攻击类 ==========
    attack_speed: {
        id: 'attack_speed',
        name: '疾速',
        desc: '攻击间隔-{value}%',
        type: 'attack',
        valueRange: [10, 25],
        apply: (weapon, value) => { weapon.castIntervalMult = 1 - value / 100; }
    },
    damage_boost: {
        id: 'damage_boost',
        name: '强力',
        desc: '伤害+{value}%',
        type: 'attack',
        valueRange: [10, 30],
        apply: (weapon, value) => { weapon.damageMult = 1 + value / 100; }
    },
    low_energy_damage: {
        id: 'low_energy_damage',
        name: '背水一战',
        desc: '能量<30%时伤害+{value}%',
        type: 'attack',
        valueRange: [25, 50],
        apply: (weapon, value) => { weapon.lowEnergyDamage = value / 100; }
    },
    void_penetration: {
        id: 'void_penetration',
        name: '虚空穿透',
        desc: '弹道穿透+{value}',
        type: 'attack',
        valueRange: [2, 3],
        apply: (weapon, value) => { weapon.bonusPenetrate = value; }
    },
    multi_shot: {
        id: 'multi_shot',
        name: '多重射击',
        desc: '每次施法额外发射{value}发弹道',
        type: 'attack',
        valueRange: [1, 2],
        apply: (weapon, value) => { weapon.extraProjectiles = value; }
    },
    crit_damage: {
        id: 'crit_damage',
        name: '暴击强化',
        desc: '暴击伤害+{value}%',
        type: 'attack',
        valueRange: [20, 50],
        apply: (weapon, value) => { weapon.critDamageBonus = value / 100; }
    },
    crit_chance: {
        id: 'crit_chance',
        name: '暴击率提升',
        desc: '暴击率+{value}%',
        type: 'attack',
        valueRange: [5, 15],
        apply: (weapon, value) => { weapon.critChanceBonus = value / 100; }
    },
    execute: {
        id: 'execute',
        name: '处决',
        desc: '对生命<20%的敌人伤害+{value}%',
        type: 'attack',
        valueRange: [30, 60],
        apply: (weapon, value) => { weapon.executeDamage = value / 100; }
    },
    armor_pierce: {
        id: 'armor_pierce',
        name: '破甲',
        desc: '无视敌人{value}%防御',
        type: 'attack',
        valueRange: [15, 30],
        apply: (weapon, value) => { weapon.armorPierce = value / 100; }
    },
    area_expand: {
        id: 'area_expand',
        name: '范围扩大',
        desc: '技能范围+{value}%',
        type: 'attack',
        valueRange: [15, 30],
        apply: (weapon, value) => { weapon.areaBonus = value / 100; }
    },
    projectile_speed: {
        id: 'projectile_speed',
        name: '弹道加速',
        desc: '弹道速度+{value}%',
        type: 'attack',
        valueRange: [20, 40],
        apply: (weapon, value) => { weapon.projectileSpeedBonus = value / 100; }
    },
    
    // ========== 元素/状态类 ==========
    burning: {
        id: 'burning',
        name: '燃烧',
        desc: '命中敌人附加{value}秒燃烧',
        type: 'status',
        valueRange: [2, 4],
        apply: (weapon, value) => { weapon.burnDuration = value; }
    },
    freezing: {
        id: 'freezing',
        name: '冰冻',
        desc: '{value}%概率冻结敌人1秒',
        type: 'status',
        valueRange: [5, 12],
        apply: (weapon, value) => { weapon.freezeChance = value / 100; }
    },
    shock: {
        id: 'shock',
        name: '感电',
        desc: '命中敌人{value}%概率传导给周围敌人',
        type: 'status',
        valueRange: [15, 30],
        apply: (weapon, value) => { weapon.shockChance = value / 100; }
    },
    poison: {
        id: 'poison',
        name: '毒素',
        desc: '命中敌人叠加毒素，每层每秒{value}伤害',
        type: 'status',
        valueRange: [2, 5],
        apply: (weapon, value) => { weapon.poisonDamage = value; }
    },
    weaken: {
        id: 'weaken',
        name: '虚弱',
        desc: '命中敌人使其受到伤害+{value}%',
        type: 'status',
        valueRange: [10, 20],
        apply: (weapon, value) => { weapon.weakenAmount = value / 100; }
    },
    
    // ========== 防御/生存类 ==========
    shield_on_kill: {
        id: 'shield_on_kill',
        name: '护盾充能',
        desc: '击杀敌人获得{value}点临时护盾',
        type: 'defense',
        valueRange: [2, 5],
        apply: (weapon, value) => { weapon.shieldOnKill = value; }
    },
    thorns: {
        id: 'thorns',
        name: '荆棘反伤',
        desc: '受伤时反弹{value}%伤害给周围敌人',
        type: 'defense',
        valueRange: [15, 30],
        apply: (weapon, value) => { weapon.thornsPercent = value / 100; }
    },
    dodge: {
        id: 'dodge',
        name: '闪避本能',
        desc: '受到致命伤害时{value}%概率闪避',
        type: 'defense',
        valueRange: [8, 15],
        apply: (weapon, value) => { weapon.dodgeChance = value / 100; }
    },
    life_regen: {
        id: 'life_regen',
        name: '生命涌动',
        desc: '每秒回复{value}点生命',
        type: 'defense',
        valueRange: [0.5, 1.5],
        apply: (weapon, value) => { weapon.lifeRegen = value; }
    },
    life_steal: {
        id: 'life_steal',
        name: '生命汲取',
        desc: '击杀敌人回复{value}点生命',
        type: 'special',
        valueRange: [1, 3],
        apply: (weapon, value) => { weapon.lifeOnKill = value; }
    },
    
    // ========== 特殊机制类 ==========
    overload: {
        id: 'overload',
        name: '过载',
        desc: '能量耗尽后可消耗生命继续施法',
        type: 'special',
        valueRange: [1, 1],
        apply: (weapon, value) => { weapon.canOverload = true; }
    },
    chaos_power: {
        id: 'chaos_power',
        name: '混沌之力',
        desc: '每次施法随机增加{value}%伤害/速度/范围',
        type: 'special',
        valueRange: [15, 35],
        apply: (weapon, value) => { weapon.chaosBonus = value / 100; }
    },
    lucky: {
        id: 'lucky',
        name: '幸运',
        desc: '金币掉落+{value}%',
        type: 'special',
        valueRange: [20, 50],
        apply: (weapon, value) => { weapon.goldBonus = value / 100; }
    },
    xp_boost: {
        id: 'xp_boost',
        name: '经验加成',
        desc: '经验获取+{value}%',
        type: 'special',
        valueRange: [10, 25],
        apply: (weapon, value) => { weapon.xpBonus = value / 100; }
    },
    magnet: {
        id: 'magnet',
        name: '吸铁石',
        desc: '拾取范围+{value}%',
        type: 'special',
        valueRange: [25, 50],
        apply: (weapon, value) => { weapon.pickupBonus = value / 100; }
    },
    chain_lightning: {
        id: 'chain_lightning',
        name: '连锁闪电',
        desc: '击杀敌人时{value}%概率释放闪电链',
        type: 'special',
        valueRange: [15, 30],
        apply: (weapon, value) => { weapon.chainLightningChance = value / 100; }
    },
    explosion_on_kill: {
        id: 'explosion_on_kill',
        name: '爆炸',
        desc: '击杀敌人时{value}%概率爆炸',
        type: 'special',
        valueRange: [20, 35],
        apply: (weapon, value) => { weapon.explosionChance = value / 100; }
    },
    soul_harvest: {
        id: 'soul_harvest',
        name: '灵魂收割',
        desc: '击杀敌人{value}%概率掉落技能',
        type: 'special',
        valueRange: [3, 8],
        apply: (weapon, value) => { weapon.skillDropBonus = value / 100; }
    },
    
    // ========== 条件触发类 ==========
    bloodlust: {
        id: 'bloodlust',
        name: '嗜血',
        desc: '生命<50%时攻速+{value}%',
        type: 'conditional',
        valueRange: [20, 40],
        apply: (weapon, value) => { weapon.bloodlustSpeed = value / 100; }
    },
    calm: {
        id: 'calm',
        name: '冷静',
        desc: '生命>80%时伤害+{value}%',
        type: 'conditional',
        valueRange: [15, 30],
        apply: (weapon, value) => { weapon.calmDamage = value / 100; }
    },
    killing_spree: {
        id: 'killing_spree',
        name: '连杀',
        desc: '3秒内击杀3个敌人后伤害+{value}%',
        type: 'conditional',
        valueRange: [25, 50],
        apply: (weapon, value) => { weapon.killingSpreeBonus = value / 100; }
    },
    first_strike: {
        id: 'first_strike',
        name: '首击',
        desc: '对满血敌人伤害+{value}%',
        type: 'conditional',
        valueRange: [30, 50],
        apply: (weapon, value) => { weapon.firstStrikeDamage = value / 100; }
    }
};

// 特殊槽触发条件
const SPECIAL_TRIGGERS = {
    energy_spent: {
        id: 'energy_spent',
        name: '能量消耗',
        desc: '消耗{value}能量后触发',
        check: (weapon, value) => {
            if (weapon.energySpentCounter >= value) {
                weapon.energySpentCounter -= value;
                return true;
            }
            return false;
        }
    },
    kills: {
        id: 'kills',
        name: '击杀',
        desc: '击杀{value}个敌人后触发',
        check: (weapon, value) => {
            if (weapon.killCounter >= value) {
                weapon.killCounter -= value;
                return true;
            }
            return false;
        }
    },
    timer: {
        id: 'timer',
        name: '定时',
        desc: '每{value}秒触发',
        check: (weapon, value) => {
            if (weapon.timerCounter >= value * 60) {
                weapon.timerCounter = 0;
                return true;
            }
            return false;
        }
    },
    on_hurt: {
        id: 'on_hurt',
        name: '受伤',
        desc: '受到伤害时触发',
        check: (weapon, value) => {
            if (weapon.hurtTrigger) {
                weapon.hurtTrigger = false;
                return true;
            }
            return false;
        }
    },
    hits: {
        id: 'hits',
        name: '命中',
        desc: '命中{value}次敌人后触发',
        check: (weapon, value) => {
            if (weapon.hitCounter >= value) {
                weapon.hitCounter -= value;
                return true;
            }
            return false;
        }
    }
};

// 武器模板注册表
const WEAPON_TEMPLATES = {};

class Weapon {
    constructor(template, affixes = []) {
        this.id = template.id;
        this.name = template.name;
        this.icon = template.icon;
        this.rarity = template.rarity;
        this.desc = template.desc;
        
        // 基础属性
        this.maxEnergy = template.maxEnergy;
        this.energy = this.maxEnergy;
        this.baseEnergyRegen = template.energyRegen;
        this.baseCastInterval = template.castInterval;
        this.baseSlotCount = template.slotCount;
        this.slotCount = template.slotCount;
        
        // 技能槽
        this.slots = new Array(this.slotCount).fill(null);
        this.currentIndex = 0;
        this.castTimer = 0;
        
        // 特殊槽
        this.specialSlot = template.specialSlot ? { ...template.specialSlot } : null;
        if (this.specialSlot) {
            this.specialSlots = new Array(this.specialSlot.slots).fill(null);
        }
        
        // 词条
        this.affixes = affixes;
        
        // 词条效果
        this.energyRegenMult = 1;
        this.castIntervalMult = 1;
        this.costMult = 1;
        this.damageMult = 1;
        this.freecastChance = {};
        this.elementBonus = {};
        this.energyOnKill = 0;
        this.energyOnCrit = 0;
        this.lowEnergyDamage = 0;
        this.canOverload = false;
        
        // 新词缀效果
        this.frostSlow = 0;        // 冰霜减速
        this.bonusPenetrate = 0;   // 额外穿透
        this.lifeOnKill = 0;       // 击杀回血
        this.chaosBonus = 0;       // 混沌加成
        this.extraProjectiles = 0; // 额外弹道
        
        // 攻击增强
        this.critDamageBonus = 0;  // 暴击伤害加成
        this.critChanceBonus = 0;  // 暴击率加成
        this.executeDamage = 0;    // 处决伤害
        this.armorPierce = 0;      // 破甲
        this.areaBonus = 0;        // 范围扩大
        this.projectileSpeedBonus = 0; // 弹道加速
        
        // 能量类
        this.fullEnergyDamage = 0; // 满能强化
        this.comboThreshold = 0;   // 连击阈值
        this.comboCounter = 0;     // 连击计数
        this.echoChance = 0;       // 回响概率
        this.lastSkill = null;     // 上一个技能
        
        // 元素/状态类
        this.burnDuration = 0;     // 燃烧持续时间
        this.freezeChance = 0;     // 冰冻概率
        this.shockChance = 0;      // 感电概率
        this.poisonDamage = 0;     // 毒素伤害
        this.weakenAmount = 0;     // 虚弱效果
        
        // 防御/生存类
        this.shieldOnKill = 0;     // 击杀护盾
        this.thornsPercent = 0;    // 荆棘反伤
        this.dodgeChance = 0;      // 闪避概率
        this.dodgeCooldown = 0;    // 闪避冷却
        this.lifeRegen = 0;        // 生命回复
        
        // 特殊机制类
        this.goldBonus = 0;        // 金币加成
        this.xpBonus = 0;          // 经验加成
        this.pickupBonus = 0;      // 拾取范围加成
        this.chainLightningChance = 0; // 连锁闪电概率
        this.explosionChance = 0;  // 爆炸概率
        this.skillDropBonus = 0;   // 技能掉落加成
        
        // 条件触发类
        this.bloodlustSpeed = 0;   // 嗜血攻速
        this.calmDamage = 0;       // 冷静伤害
        this.killingSpreeBonus = 0;// 连杀加成
        this.killingSpreeActive = false;
        this.killingSpreeTimer = 0;
        this.recentKills = [];     // 最近击杀时间戳
        this.firstStrikeDamage = 0;// 首击伤害
        
        // 触发计数器
        this.energySpentCounter = 0;
        this.killCounter = 0;
        this.timerCounter = 0;
        this.hurtTrigger = false;
        this.hitCounter = 0;
        
        // 狂暴系统
        this.lastTargetId = null;
        this.frenzyStacks = 0;
        this.maxFrenzyStacks = 10;
        
        // 应用词条效果
        this.affixes.forEach(affix => {
            const def = WEAPON_AFFIXES[affix.id];
            if (def && def.apply) {
                def.apply(this, affix.value);
            }
        });
        
        // 背包
        this.inventory = [];
    }
    
    // 注册武器模板
    static register(id, template) {
        WEAPON_TEMPLATES[id] = { ...template, id };
    }
    
    // 获取所有模板
    static getAllTemplates() {
        return Object.values(WEAPON_TEMPLATES);
    }
    
    // 获取模板
    static getTemplate(id) {
        return WEAPON_TEMPLATES[id];
    }
    
    // 获取实际能量回复
    getEnergyRegen() {
        return this.baseEnergyRegen * this.energyRegenMult;
    }
    
    // 获取实际攻击间隔
    getCastInterval(player = null) {
        let mult = this.castIntervalMult;
        // 应用玩家的冷却减少
        if (player && player.cooldownMult) {
            mult *= player.cooldownMult;
        }
        // 嗜血：生命<50%时攻速加成
        if (this.bloodlustSpeed > 0 && player && player.hp / player.maxHp < 0.5) {
            mult *= (1 - this.bloodlustSpeed);
        }
        return Math.max(3, Math.floor(this.baseCastInterval * mult));
    }
    
    // 获取技能消耗
    getSkillCost(skill) {
        const baseCost = skill.energyCost || 1;
        return Math.max(1, Math.floor(baseCost * this.costMult));
    }
    
    // 更新槽位数量（根据拓展技能）
    updateSlotCount() {
        let expandSlots = 0;
        let expandSpecialSlots = 0;
        
        // 统计普通槽中的拓展技能
        this.slots.forEach(slot => {
            if (slot && slot.id === 'expand') {
                expandSlots += 4;
            }
        });
        
        // 统计特殊槽中的拓展技能
        if (this.specialSlots) {
            this.specialSlots.forEach(slot => {
                if (slot && slot.id === 'expand') {
                    expandSpecialSlots += 2; // 特殊槽拓展数量较少
                }
            });
        }
        
        // 更新普通槽数量
        const newSlotCount = this.baseSlotCount + expandSlots;
        
        if (newSlotCount > this.slotCount) {
            while (this.slots.length < newSlotCount) {
                this.slots.push(null);
            }
        } else if (newSlotCount < this.slotCount) {
            // 先把要移除的槽位中的技能放回背包
            for (let i = this.slots.length - 1; i >= newSlotCount; i--) {
                if (this.slots[i]) {
                    this.inventory.push(this.slots[i]);
                    this.slots[i] = null;
                }
            }
            // 然后缩减数组
            this.slots.length = newSlotCount;
        }
        
        this.slotCount = newSlotCount;
        
        // 更新特殊槽数量
        if (this.specialSlot) {
            const baseSpecialSlots = this.specialSlot.slots || 0;
            const newSpecialSlotCount = baseSpecialSlots + expandSpecialSlots;
            
            if (newSpecialSlotCount > this.specialSlots.length) {
                while (this.specialSlots.length < newSpecialSlotCount) {
                    this.specialSlots.push(null);
                }
            } else if (newSpecialSlotCount < this.specialSlots.length) {
                // 先把要移除的槽位中的技能放回背包
                for (let i = this.specialSlots.length - 1; i >= newSpecialSlotCount; i--) {
                    if (this.specialSlots[i]) {
                        this.inventory.push(this.specialSlots[i]);
                        this.specialSlots[i] = null;
                    }
                }
                // 然后缩减数组
                this.specialSlots.length = newSpecialSlotCount;
            }
            
            this.specialSlot.slots = newSpecialSlotCount;
        }
    }
    
    // 获取伤害倍率
    getDamageMult(player = null, enemy = null) {
        let mult = this.damageMult;
        
        // 背水一战：能量<30%时伤害加成
        if (this.lowEnergyDamage > 0 && this.energy / this.maxEnergy < 0.3) {
            mult *= (1 + this.lowEnergyDamage);
        }
        
        // 满能强化：能量>80%时伤害加成
        if (this.fullEnergyDamage > 0 && this.energy / this.maxEnergy > 0.8) {
            mult *= (1 + this.fullEnergyDamage);
        }
        
        // 冷静：生命>80%时伤害加成
        if (this.calmDamage > 0 && player && player.hp / player.maxHp > 0.8) {
            mult *= (1 + this.calmDamage);
        }
        
        // 连杀加成
        if (this.killingSpreeActive && this.killingSpreeBonus > 0) {
            mult *= (1 + this.killingSpreeBonus);
        }
        
        // 处决：对低血量敌人伤害加成
        if (this.executeDamage > 0 && enemy && enemy.hp / enemy.maxHp < 0.2) {
            mult *= (1 + this.executeDamage);
        }
        
        // 首击：对满血敌人伤害加成
        if (this.firstStrikeDamage > 0 && enemy && enemy.hp >= enemy.maxHp) {
            mult *= (1 + this.firstStrikeDamage);
        }
        
        return mult;
    }
    
    // 检查是否免费施法
    checkFreecast(skill) {
        if (skill.element && this.freecastChance[skill.element]) {
            if (Math.random() < this.freecastChance[skill.element]) {
                return true;
            }
        }
        return false;
    }

    // 更新（需要传入敌人列表）
    update(player, enemies = []) {
        this.currentEnemies = enemies; // 缓存敌人列表供 fireSkill 使用
        
        // 能量回复
        if (this.energy < this.maxEnergy) {
            this.energy = Math.min(this.maxEnergy, this.energy + this.getEnergyRegen() / 60);
        }
        
        // 生命回复
        if (this.lifeRegen > 0 && player && player.hp < player.maxHp) {
            player.hp = Math.min(player.maxHp, player.hp + this.lifeRegen / 60);
        }
        
        // 连杀计时器
        if (this.killingSpreeActive) {
            this.killingSpreeTimer--;
            if (this.killingSpreeTimer <= 0) {
                this.killingSpreeActive = false;
            }
        }
        
        // 闪避冷却
        if (this.dodgeCooldown > 0) {
            this.dodgeCooldown--;
        }
        
        // 定时器计数
        this.timerCounter++;
        
        // 施法冷却
        if (this.castTimer > 0) {
            this.castTimer--;
            return;
        }
        
        // 检查特殊槽触发
        if (this.specialSlot && this.specialSlots.some(s => s !== null)) {
            const trigger = SPECIAL_TRIGGERS[this.specialSlot.trigger];
            if (trigger && trigger.check(this, this.specialSlot.value)) {
                this.castSpecialSlots(player);
            }
        }
        
        // 主槽施法
        this.castMainSlots(player);
    }
    
    // 主槽施法
    castMainSlots(player) {
        const result = this.castAllSlots(player, this.slots);
        if (result.fired) {
            this.castTimer = this.getCastInterval(player);
        }
    }
    
    // 特殊槽施法
    castSpecialSlots(player) {
        this.castAllSlots(player, this.specialSlots, true);
    }
    
    // 一次轮播所有槽位
    castAllSlots(player, slots, isSpecialSlot = false) {
        let totalCost = 0;
        let costReductionPercent = 0; // 能量消耗减少百分比
        
        // 收集所有技能序列，被动只影响紧跟其后的主动
        const skillSequence = [];
        let pendingMods = this.getDefaultMods(player);  // 当前累积的被动效果
        
        for (let i = 0; i < slots.length; i++) {
            const slot = slots[i];
            if (slot === null) continue;
            
            // 节能技能本身不消耗能量
            if (slot.id !== 'energy_save') {
                totalCost += this.getSkillCost(slot);
            }
            
            if (slot.type === 'modifier') {
                // 被动技能：累积效果到 pendingMods
                const star = slot.star || 1;
                const starMult = this.getStarMultiplier(star);
                if (slot.modify) {
                    slot.modify(pendingMods, star);
                    Object.keys(pendingMods).forEach(key => {
                        if (typeof pendingMods[key] === 'number' && pendingMods[key] > 1 && key !== 'penetrate') {
                            pendingMods[key] = 1 + (pendingMods[key] - 1) * starMult;
                        }
                    });
                }
                // 累计能量消耗减少百分比
                if (pendingMods.costReductionPercent) {
                    costReductionPercent += pendingMods.costReductionPercent;
                    pendingMods.costReductionPercent = 0;
                }
            } else if (slot.type === 'magic') {
                // 主动技能：使用当前累积的被动效果，然后重置
                skillSequence.push({
                    skill: slot,
                    mods: { ...pendingMods }
                });
                // 重置被动效果，下一个主动技能需要新的被动
                pendingMods = this.getDefaultMods(player);
            }
        }
        
        if (skillSequence.length === 0) {
            return { fired: false };
        }
        
        // 应用能量消耗减少（百分比）
        totalCost = Math.max(0, Math.floor(totalCost * (1 - costReductionPercent)));
        
        // 检查能量
        const isFree = skillSequence.some(s => this.checkFreecast(s.skill));
        
        if (!isFree && this.energy < totalCost) {
            if (this.canOverload && player.hp > totalCost) {
                player.hp -= totalCost;
                Events.emit(EVENT.FLOATING_TEXT, {
                    text: '过载!',
                    x: player.x, y: player.y - 40,
                    color: '#ff0000'
                });
                Events.emit(EVENT.SCREEN_SHAKE, { intensity: 3, duration: 5 });
            } else {
                return { fired: false };
            }
        } else if (!isFree) {
            this.energy -= totalCost;
            this.energySpentCounter += totalCost;
        }
        
        if (isFree) {
            Events.emit(EVENT.FLOATING_TEXT, {
                text: '免费!',
                x: player.x, y: player.y - 30,
                color: '#00ffff'
            });
        }
        
        // 发射所有魔法技能
        skillSequence.forEach(({ skill, mods: skillMods }) => {
            skillMods.damage *= this.getDamageMult();
            const starMult = this.getStarMultiplier(skill.star || 1);
            skillMods.damage *= starMult;
            skillMods.star = skill.star || 1;
            
            // 特殊槽伤害降低30%
            if (isSpecialSlot) {
                skillMods.damage *= 0.7;
            }
            
            this.fireSkill(player, skill, skillMods);
        });
        
        return { fired: true };
    }
    
    getStarMultiplier(star) {
        const multipliers = { 1: 1, 2: 1.5, 3: 2.5 };
        return multipliers[star] || 1;
    }
    
    getDefaultMods(player) {
        // 混沌加成 - 随机增强一项属性
        let chaosDamage = 1, chaosSpeed = 1, chaosSize = 1;
        if (this.chaosBonus > 0) {
            const roll = Math.random();
            if (roll < 0.33) {
                chaosDamage = 1 + this.chaosBonus;
                Events.emit(EVENT.FLOATING_TEXT, {
                    text: '混沌:伤害↑',
                    x: player.x, y: player.y - 40,
                    color: '#ff00ff'
                });
            } else if (roll < 0.66) {
                chaosSpeed = 1 + this.chaosBonus;
                Events.emit(EVENT.FLOATING_TEXT, {
                    text: '混沌:速度↑',
                    x: player.x, y: player.y - 40,
                    color: '#ff00ff'
                });
            } else {
                chaosSize = 1 + this.chaosBonus;
                Events.emit(EVENT.FLOATING_TEXT, {
                    text: '混沌:范围↑',
                    x: player.x, y: player.y - 40,
                    color: '#ff00ff'
                });
            }
        }
        
        return {
            damage: 1.0 * player.damageMult * chaosDamage,
            speed: 1.0 * player.projSpeed * chaosSpeed * (1 + this.projectileSpeedBonus),
            penetrate: 1 + this.bonusPenetrate,
            splitCount: 1 + (player.extraProjectiles || 0) + this.extraProjectiles,
            homing: false,
            turnSpeed: 0,
            chainCount: 0,
            cooldownMult: player.cooldownMult,
            explosive: false,
            explosionRadius: 0,
            bounceCount: 0,
            bounceRange: 200,
            knockback: player.knockback || 1,
            sizeScale: (1 + this.areaBonus) * chaosSize,
            critChance: (player.critChance || 0) + this.critChanceBonus,
            critDamage: 1.5 + this.critDamageBonus,
            frostSlow: this.frostSlow,
            armorPierce: this.armorPierce,
            weapon: this
        };
    }
    
    fireSkill(player, skill, mods) {
        const count = mods.splitCount || 1;
        const enemies = this.currentEnemies || [];
        
        // 收集所有可攻击的目标
        const targets = [];
        
        enemies.forEach(e => {
            if (!e.markedForDeletion) {
                const dist = Math.sqrt((e.x - player.x) ** 2 + (e.y - player.y) ** 2);
                if (dist < 800) {
                    targets.push({ target: e, dist });
                }
            }
        });
        
        targets.sort((a, b) => a.dist - b.dist);
        
        // 如果没有目标，朝前方发射
        if (targets.length === 0) {
            for (let i = 0; i < count; i++) {
                const spreadAngle = count > 1 ? Math.PI / 6 : 0;
                let angle = player.facingRight ? 0 : Math.PI;
                if (count > 1) {
                    angle += (i - (count - 1) / 2) * (spreadAngle / (count - 1 || 1));
                }
                const proj = skill.create(player, { ...mods, angle, weapon: this });
                if (proj) {
                    Events.emit(EVENT.PROJECTILE_FIRE, { projectile: proj });
                }
            }
            Audio.play('shoot');
            return;
        }
        
        // 狂暴系统
        const nearest = targets[0].target;
        if (mods.frenzy) {
            const targetId = nearest.id || nearest;
            if (this.lastTargetId === targetId) {
                this.frenzyStacks = Math.min(this.frenzyStacks + 1, this.maxFrenzyStacks);
            } else {
                this.frenzyStacks = 0;
                this.lastTargetId = targetId;
            }
            
            const frenzyBonus = this.frenzyStacks * mods.frenzyReduction;
            mods.cooldownMult = (mods.cooldownMult || 1) * (1 - frenzyBonus);
            
            if (this.frenzyStacks > 0) {
                Events.emit(EVENT.FLOATING_TEXT, {
                    text: '狂暴x' + this.frenzyStacks,
                    x: player.x, y: player.y - 40,
                    color: '#ff4444'
                });
            }
        }
        
        // 散射：每个投射物朝向不同的敌人
        for (let i = 0; i < count; i++) {
            const targetIndex = i % targets.length;
            const target = targets[targetIndex].target;
            const angle = Math.atan2(target.y - player.y, target.x - player.x);
            
            const proj = skill.create(player, { ...mods, angle, weapon: this });
            if (proj) {
                Events.emit(EVENT.PROJECTILE_FIRE, { projectile: proj });
            }
        }
        
        Audio.play('shoot');
    }
    
    // 击杀回调
    onKill(player, enemy = null) {
        this.killCounter++;
        
        // 杀戮回能
        if (this.energyOnKill > 0) {
            this.energy = Math.min(this.maxEnergy, this.energy + this.energyOnKill);
        }
        
        // 生命汲取
        if (this.lifeOnKill > 0 && player) {
            player.hp = Math.min(player.maxHp, player.hp + this.lifeOnKill);
            Events.emit(EVENT.FLOATING_TEXT, {
                text: '+' + this.lifeOnKill + '❤️',
                x: player.x, y: player.y - 30,
                color: '#00ff66'
            });
        }
        
        // 护盾充能
        if (this.shieldOnKill > 0 && player) {
            const maxShield = player.maxHp * 0.5;
            player.shield = Math.min((player.shield || 0) + this.shieldOnKill, maxShield);
            Events.emit(EVENT.FLOATING_TEXT, {
                text: '+' + this.shieldOnKill + '🛡️',
                x: player.x, y: player.y - 40,
                color: '#66ccff'
            });
        }
        
        // 连杀检测
        if (this.killingSpreeBonus > 0) {
            const now = Date.now();
            this.recentKills.push(now);
            // 只保留3秒内的击杀
            this.recentKills = this.recentKills.filter(t => now - t < 3000);
            if (this.recentKills.length >= 3) {
                this.killingSpreeActive = true;
                this.killingSpreeTimer = 300; // 5秒
                Events.emit(EVENT.FLOATING_TEXT, {
                    text: '连杀!',
                    x: player.x, y: player.y - 50,
                    color: '#ff4444'
                });
            }
        }
        
        // 连锁闪电
        if (this.chainLightningChance > 0 && enemy && Math.random() < this.chainLightningChance) {
            this.triggerChainLightning(enemy, player);
        }
        
        // 爆炸
        if (this.explosionChance > 0 && enemy && Math.random() < this.explosionChance) {
            this.triggerExplosion(enemy, player);
        }
    }
    
    // 触发连锁闪电
    triggerChainLightning(enemy, player) {
        const enemies = this.currentEnemies || [];
        const targets = enemies.filter(e => 
            !e.markedForDeletion && e !== enemy &&
            Math.sqrt((e.x - enemy.x) ** 2 + (e.y - enemy.y) ** 2) < 150
        ).slice(0, 3);
        
        const damage = Math.floor(player.damageMult * 20 * 0.5);
        targets.forEach(t => {
            t.takeDamage(damage, 0, 0);
            Events.emit(EVENT.SKILL_CAST, {
                type: 'lightning',
                x1: enemy.x, y1: enemy.y,
                x2: t.x, y2: t.y,
                color: '#ffdd00'
            });
        });
    }
    
    // 触发爆炸
    triggerExplosion(enemy, player) {
        const enemies = this.currentEnemies || [];
        const radius = 80;
        const damage = Math.floor(player.damageMult * 20 * 0.3);
        
        enemies.forEach(e => {
            if (!e.markedForDeletion && e !== enemy) {
                const dist = Math.sqrt((e.x - enemy.x) ** 2 + (e.y - enemy.y) ** 2);
                if (dist < radius) {
                    e.takeDamage(damage, 0, 0);
                }
            }
        });
        
        Events.emit(EVENT.SKILL_CAST, {
            type: 'explosion',
            x: enemy.x, y: enemy.y,
            radius: radius
        });
    }
    
    // 命中回调
    onHit(enemy, damage = 0) {
        this.hitCounter++;
        
        // 燃烧
        if (this.burnDuration > 0 && enemy.addBurn) {
            enemy.addBurn(this.burnDuration, damage * 0.05);
        }
        
        // 冰冻
        if (this.freezeChance > 0 && Math.random() < this.freezeChance) {
            if (enemy.freeze) {
                enemy.freeze(60); // 1秒
                Events.emit(EVENT.FLOATING_TEXT, {
                    text: '❄️冰冻',
                    x: enemy.x, y: enemy.y - 30,
                    color: '#66ccff'
                });
            }
        }
        
        // 感电传导
        if (this.shockChance > 0 && Math.random() < this.shockChance) {
            this.triggerShock(enemy, damage);
        }
        
        // 毒素
        if (this.poisonDamage > 0 && enemy.addPoison) {
            enemy.addPoison(this.poisonDamage);
        }
        
        // 虚弱
        if (this.weakenAmount > 0 && enemy.addWeaken) {
            enemy.addWeaken(this.weakenAmount, 180); // 3秒
        }
    }
    
    // 触发感电传导
    triggerShock(enemy, damage) {
        const enemies = this.currentEnemies || [];
        const targets = enemies.filter(e => 
            !e.markedForDeletion && e !== enemy &&
            Math.sqrt((e.x - enemy.x) ** 2 + (e.y - enemy.y) ** 2) < 150
        ).slice(0, 2);
        
        const shockDamage = Math.floor(damage * 0.5);
        targets.forEach(t => {
            t.takeDamage(shockDamage, 0, 0);
            Events.emit(EVENT.SKILL_CAST, {
                type: 'lightning',
                x1: enemy.x, y1: enemy.y,
                x2: t.x, y2: t.y,
                color: '#88ddff'
            });
        });
    }
    
    // 暴击回调
    onCrit() {
        if (this.energyOnCrit > 0) {
            this.energy = Math.min(this.maxEnergy, this.energy + this.energyOnCrit);
        }
    }
    
    // 受伤回调
    onHurt(player, damage, attacker = null) {
        this.hurtTrigger = true;
        
        // 荆棘反伤
        if (this.thornsPercent > 0 && attacker) {
            const thornsDamage = Math.floor(damage * this.thornsPercent);
            if (thornsDamage > 0) {
                // 对周围敌人造成伤害
                const enemies = this.currentEnemies || [];
                enemies.forEach(e => {
                    if (!e.markedForDeletion) {
                        const dist = Math.sqrt((e.x - player.x) ** 2 + (e.y - player.y) ** 2);
                        if (dist < 100) {
                            e.takeDamage(thornsDamage, 0, 0);
                        }
                    }
                });
                Events.emit(EVENT.FLOATING_TEXT, {
                    text: '荆棘!' + thornsDamage,
                    x: player.x, y: player.y - 40,
                    color: '#88ff88'
                });
            }
        }
    }
    
    // 检查闪避（致命伤害时调用）
    checkDodge() {
        if (this.dodgeChance > 0 && this.dodgeCooldown <= 0) {
            if (Math.random() < this.dodgeChance) {
                this.dodgeCooldown = 1800; // 30秒冷却
                return true;
            }
        }
        return false;
    }
    
    // 装备技能
    equipSkill(inventoryIndex, slotIndex, isSpecial = false) {
        const slots = isSpecial ? this.specialSlots : this.slots;
        const slotCount = isSpecial ? (this.specialSlot?.slots || 0) : this.slotCount;
        
        if (inventoryIndex < 0 || inventoryIndex >= this.inventory.length) return false;
        if (slotIndex < 0 || slotIndex >= slotCount) return false;
        
        const skill = this.inventory[inventoryIndex];
        if (slots[slotIndex] !== null) {
            this.inventory.push(slots[slotIndex]);
        }
        slots[slotIndex] = skill;
        this.inventory.splice(inventoryIndex, 1);
        
        // 如果装备的是拓展技能，更新槽位数量
        if (!isSpecial && skill.id === 'expand') {
            this.updateSlotCount();
        }
        
        return true;
    }
    
    // 卸下技能
    unequipSkill(slotIndex, isSpecial = false) {
        const slots = isSpecial ? this.specialSlots : this.slots;
        const slotCount = isSpecial ? (this.specialSlot?.slots || 0) : this.slotCount;
        
        if (slotIndex < 0 || slotIndex >= slotCount) return false;
        if (slots[slotIndex] === null) return false;
        
        const skill = slots[slotIndex];
        this.inventory.push(skill);
        slots[slotIndex] = null;
        
        // 如果卸下的是拓展技能，更新槽位数量
        if (!isSpecial && skill.id === 'expand') {
            this.updateSlotCount();
        }
        
        return true;
    }
    
    // 添加技能到背包
    addSkillToInventory(skill, star = 1) {
        this.inventory.push({ ...skill, star });
        return true;
    }
}
