// --- 新武器系统 ---
// 武器属性：能量、回复、攻击间隔、槽位、词条、特殊槽

// ========== 武器词条定义 ==========
const WEAPON_AFFIXES = {
    // 元素类
    fire_affinity: {
        id: 'fire_affinity',
        name: '火焰亲和',
        desc: '火焰技能有{value}%概率免费施法',
        type: 'element',
        element: 'fire',
        valueRange: [10, 25],
        apply: (weapon, value) => { weapon.freecastChance = { fire: value / 100 }; }
    },
    ice_affinity: {
        id: 'ice_affinity',
        name: '冰霜亲和',
        desc: '冰霜技能减速效果+{value}%',
        type: 'element',
        element: 'ice',
        valueRange: [15, 35],
        apply: (weapon, value) => { weapon.elementBonus = { ice: { slow: value / 100 } }; }
    },
    lightning_affinity: {
        id: 'lightning_affinity',
        name: '雷电亲和',
        desc: '雷电技能有{value}%概率连锁',
        type: 'element',
        element: 'lightning',
        valueRange: [10, 30],
        apply: (weapon, value) => { weapon.elementBonus = { lightning: { chain: value / 100 } }; }
    },
    
    // 能量类
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
    
    // 攻击类
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
    
    // 特殊类
    overload: {
        id: 'overload',
        name: '过载',
        desc: '能量耗尽后可消耗生命继续施法',
        type: 'special',
        valueRange: [1, 1],
        apply: (weapon, value) => { weapon.canOverload = true; }
    }
};

// ========== 特殊槽触发条件 ==========
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
    }
};

// ========== 武器模板定义 ==========
const WEAPON_TEMPLATES = {
    apprentice_wand: {
        id: 'apprentice_wand',
        name: '学徒法杖',
        icon: '🪄',
        rarity: 'common',
        desc: '初学者的法杖，平衡的属性',
        maxEnergy: 100,
        energyRegen: 10,
        castInterval: 18, // 0.3秒 (18帧)
        slotCount: 6,
        specialSlot: null,
        affixCount: 1
    },
    rapid_wand: {
        id: 'rapid_wand',
        name: '速射短杖',
        icon: '⚡',
        rarity: 'common',
        desc: '快速施法，但槽位较少',
        maxEnergy: 60,
        energyRegen: 15,
        castInterval: 6, // 0.1秒
        slotCount: 4,
        specialSlot: null,
        affixCount: 1
    },
    power_staff: {
        id: 'power_staff',
        name: '蓄能长杖',
        icon: '🔮',
        rarity: 'uncommon',
        desc: '缓慢但强力，大量槽位',
        maxEnergy: 200,
        energyRegen: 5,
        castInterval: 30, // 0.5秒
        slotCount: 8,
        specialSlot: null,
        affixCount: 2
    },
    trigger_wand: {
        id: 'trigger_wand',
        name: '触发法杖',
        icon: '✨',
        rarity: 'uncommon',
        desc: '带有特殊触发槽',
        maxEnergy: 80,
        energyRegen: 8,
        castInterval: 15,
        slotCount: 5,
        specialSlot: { trigger: 'energy_spent', value: 20, slots: 1 },
        affixCount: 1
    },
    inferno_rod: {
        id: 'inferno_rod',
        name: '炎魔之杖',
        icon: '🔥',
        rarity: 'rare',
        desc: '火焰专精，高伤害',
        maxEnergy: 120,
        energyRegen: 8,
        castInterval: 20,
        slotCount: 6,
        specialSlot: { trigger: 'kills', value: 5, slots: 2 },
        affixCount: 2,
        fixedAffix: 'fire_affinity'
    },
    storm_caller: {
        id: 'storm_caller',
        name: '唤雷者',
        icon: '⛈️',
        rarity: 'rare',
        desc: '雷电专精，连锁攻击',
        maxEnergy: 90,
        energyRegen: 12,
        castInterval: 12,
        slotCount: 5,
        specialSlot: { trigger: 'timer', value: 5, slots: 2 },
        affixCount: 2,
        fixedAffix: 'lightning_affinity'
    },
    vampiric_scepter: {
        id: 'vampiric_scepter',
        name: '吸血权杖',
        icon: '🦇',
        rarity: 'epic',
        desc: '击杀回能，持久作战',
        maxEnergy: 150,
        energyRegen: 3,
        castInterval: 15,
        slotCount: 7,
        specialSlot: { trigger: 'on_hurt', value: 1, slots: 2 },
        affixCount: 3,
        fixedAffix: 'energy_on_kill'
    }
};


// ========== 技能能量消耗定义 ==========
const SKILL_COSTS = {
    // 魔法技能消耗
    spark_bolt: 1,
    fireball: 1,
    magic_arrow: 1,
    energy_orb: 1,
    magic_missile: 1,
    
    // 被动技能消耗（统一为1）
    double_cast: 1,
    triple_cast: 1,
    homing: 1,
    piercing: 1,
    chainsaw: 1,
    speed_up: 1,
    damage_plus: 1,
    explosive: 1,
    bouncing: 1,
    reduce_cooldown: 1,
    flame_crystal: 1,
    power_pull: 1,
    thunder_crystal: 1,
    collapse_crystal: 1,
    flying_sword: 1,
    poison_crystal: 1,
    arcane_barrier: 1,
    rune_hammer: 1,
    prism_core: 1,
    reflect: 1,
    split: 1,
    hover: 1,
    lightning_chain: 1,
    light_pillar: 1
};

// ========== 新武器类 ==========
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
        
        // 词条效果（由词条apply填充）
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
        
        // 触发计数器
        this.energySpentCounter = 0;
        this.killCounter = 0;
        this.timerCounter = 0;
        this.hurtTrigger = false;
        
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
    
    // 获取实际能量回复
    getEnergyRegen() {
        return this.baseEnergyRegen * this.energyRegenMult;
    }
    
    // 获取实际攻击间隔
    getCastInterval() {
        return Math.max(3, Math.floor(this.baseCastInterval * this.castIntervalMult));
    }
    
    // 获取技能消耗
    getSkillCost(skill) {
        const baseCost = SKILL_COSTS[skill.id] || 5;
        return Math.max(1, Math.floor(baseCost * this.costMult));
    }
    
    // 获取伤害倍率
    getDamageMult() {
        let mult = this.damageMult;
        // 背水一战
        if (this.lowEnergyDamage > 0 && this.energy / this.maxEnergy < 0.3) {
            mult *= (1 + this.lowEnergyDamage);
        }
        return mult;
    }
    
    // 检查是否免费施法
    checkFreecast(skill) {
        // 检查元素亲和
        if (skill.element && this.freecastChance[skill.element]) {
            if (Math.random() < this.freecastChance[skill.element]) {
                return true;
            }
        }
        return false;
    }
    
    // 更新
    update(player) {
        // 能量回复
        if (this.energy < this.maxEnergy) {
            this.energy = Math.min(this.maxEnergy, this.energy + this.getEnergyRegen() / 60);
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
        const result = this.castFromIndex(player, this.currentIndex, this.slots);
        if (result.fired) {
            this.currentIndex = result.nextIndex;
            this.castTimer = this.getCastInterval();
        } else {
            this.currentIndex = 0;
        }
    }
    
    // 特殊槽施法
    castSpecialSlots(player) {
        this.castFromIndex(player, 0, this.specialSlots, true);
    }
    
    // 从指定索引开始施法
    castFromIndex(player, startIndex, slots, isSpecial = false) {
        const mods = this.getDefaultMods(player);
        let index = startIndex;
        let loopCount = 0;
        let totalCost = 0;
        const slotCount = slots.length;
        
        // 先收集所有被动效果和计算总消耗
        const modifierList = [];
        let magicSkill = null;
        let magicIndex = -1;
        
        while (loopCount < slotCount) {
            const slot = slots[index];
            if (slot === null) {
                index = (index + 1) % slotCount;
                loopCount++;
                continue;
            }
            
            if (slot.type === 'modifier') {
                modifierList.push(slot);
                totalCost += this.getSkillCost(slot);
                index = (index + 1) % slotCount;
                loopCount++;
            } else if (slot.type === 'magic') {
                magicSkill = slot;
                magicIndex = index;
                totalCost += this.getSkillCost(slot);
                break;
            }
        }
        
        if (!magicSkill) {
            return { fired: false, nextIndex: 0 };
        }
        
        // 检查免费施法
        const isFree = this.checkFreecast(magicSkill);
        
        // 检查能量
        if (!isFree && this.energy < totalCost) {
            // 过载检查
            if (this.canOverload && player.hp > totalCost) {
                player.hp -= totalCost;
                Game.addFloatingText('过载!', player.x, player.y - 40, '#ff0000');
                Game.screenShake(3, 5);
            } else {
                return { fired: false, nextIndex: 0 };
            }
        } else if (!isFree) {
            this.energy -= totalCost;
            this.energySpentCounter += totalCost;
        }
        
        if (isFree) {
            Game.addFloatingText('免费!', player.x, player.y - 30, '#00ffff');
        }
        
        // 应用被动效果
        modifierList.forEach(mod => {
            const starMult = this.getStarMultiplier(mod.star || 1);
            if (mod.modify) {
                mod.modify(mods);
                // 星级增强数值效果
                Object.keys(mods).forEach(key => {
                    if (typeof mods[key] === 'number' && mods[key] > 1) {
                        mods[key] = 1 + (mods[key] - 1) * starMult;
                    }
                });
            }
        });
        
        // 应用武器伤害加成
        mods.damage *= this.getDamageMult();
        
        // 星级加成
        const starMult = this.getStarMultiplier(magicSkill.star || 1);
        mods.damage *= starMult;
        
        // 发射
        this.fireSkill(player, magicSkill, mods);
        
        return { 
            fired: true, 
            nextIndex: (magicIndex + 1) % slotCount 
        };
    }
    
    getStarMultiplier(star) {
        const multipliers = { 1: 1, 2: 1.5, 3: 2.5 };
        return multipliers[star] || 1;
    }
    
    getDefaultMods(player) {
        return {
            damage: 1.0 * player.damageMult,
            speed: 1.0 * player.projSpeed,
            penetrate: 1,
            splitCount: 1 + (player.extraProjectiles || 0),
            homing: false,
            turnSpeed: 0,
            chainCount: 0,
            cooldownMult: player.cooldownMult,
            explosive: false,
            explosionRadius: 0,
            bounceCount: 0,
            knockback: player.knockback || 1
        };
    }
    
    fireSkill(player, skill, mods) {
        let targetAngle = 0;
        let nearest = null;
        let minDist = 800;

        Game.enemies.forEach(e => {
            const dist = Math.sqrt((e.x - player.x) ** 2 + (e.y - player.y) ** 2);
            if (dist < minDist) {
                minDist = dist;
                nearest = e;
            }
        });

        if (nearest) {
            targetAngle = Math.atan2(nearest.y - player.y, nearest.x - player.x);
        }

        const count = mods.splitCount || 1;
        const spreadAngle = count > 1 ? Math.PI / 6 : 0;

        for (let i = 0; i < count; i++) {
            let angle = targetAngle;
            if (count > 1) {
                angle = targetAngle + (i - (count - 1) / 2) * (spreadAngle / (count - 1 || 1));
            }
            const proj = skill.create(player, { ...mods, angle, weapon: this });
            if (proj) Game.projectiles.push(proj);
        }
        
        Audio.play('shoot');
    }
    
    // 击杀回调
    onKill() {
        this.killCounter++;
        if (this.energyOnKill > 0) {
            this.energy = Math.min(this.maxEnergy, this.energy + this.energyOnKill);
        }
    }
    
    // 暴击回调
    onCrit() {
        if (this.energyOnCrit > 0) {
            this.energy = Math.min(this.maxEnergy, this.energy + this.energyOnCrit);
        }
    }
    
    // 受伤回调
    onHurt() {
        this.hurtTrigger = true;
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
        return true;
    }
    
    // 卸下技能
    unequipSkill(slotIndex, isSpecial = false) {
        const slots = isSpecial ? this.specialSlots : this.slots;
        const slotCount = isSpecial ? (this.specialSlot?.slots || 0) : this.slotCount;
        
        if (slotIndex < 0 || slotIndex >= slotCount) return false;
        if (slots[slotIndex] === null) return false;
        
        this.inventory.push(slots[slotIndex]);
        slots[slotIndex] = null;
        return true;
    }
    
    // 添加技能到背包
    addSkillToInventory(skillId, star = 1) {
        const skill = ALL_SKILLS[skillId];
        if (!skill) return false;
        this.inventory.push({ ...skill, star: star });
        return true;
    }
}

// ========== 武器生成器 ==========
const WeaponGenerator = {
    // 生成随机武器
    generate(rarity = 'common') {
        // 根据稀有度筛选模板
        const templates = Object.values(WEAPON_TEMPLATES).filter(t => {
            if (rarity === 'common') return t.rarity === 'common';
            if (rarity === 'uncommon') return ['common', 'uncommon'].includes(t.rarity);
            if (rarity === 'rare') return ['uncommon', 'rare'].includes(t.rarity);
            if (rarity === 'epic') return ['rare', 'epic'].includes(t.rarity);
            return true;
        });
        
        const template = templates[Math.floor(Math.random() * templates.length)];
        return this.createFromTemplate(template);
    },
    
    // 从模板创建武器
    createFromTemplate(template) {
        const affixes = [];
        
        // 固定词条
        if (template.fixedAffix) {
            const def = WEAPON_AFFIXES[template.fixedAffix];
            if (def) {
                const value = this.rollValue(def.valueRange);
                affixes.push({ id: def.id, value });
            }
        }
        
        // 随机词条
        const affixPool = Object.values(WEAPON_AFFIXES).filter(a => a.id !== template.fixedAffix);
        const affixCount = template.affixCount - (template.fixedAffix ? 1 : 0);
        
        for (let i = 0; i < affixCount && affixPool.length > 0; i++) {
            const idx = Math.floor(Math.random() * affixPool.length);
            const def = affixPool[idx];
            const value = this.rollValue(def.valueRange);
            affixes.push({ id: def.id, value });
            affixPool.splice(idx, 1);
        }
        
        return new Weapon(template, affixes);
    },
    
    // 生成Boss掉落的三选一
    generateBossDrops(bossLevel = 1) {
        const rarities = ['common', 'uncommon', 'rare'];
        if (bossLevel >= 2) rarities.push('epic');
        
        const weapons = [];
        for (let i = 0; i < 3; i++) {
            const rarity = rarities[Math.floor(Math.random() * rarities.length)];
            weapons.push(this.generate(rarity));
        }
        return weapons;
    },
    
    rollValue(range) {
        return Math.floor(range[0] + Math.random() * (range[1] - range[0] + 1));
    }
};
