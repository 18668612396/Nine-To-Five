// --- 武器基类 ---

// 武器词条定义
const WEAPON_AFFIXES = {
    // 元素类
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
        
        // 触发计数器
        this.energySpentCounter = 0;
        this.killCounter = 0;
        this.timerCounter = 0;
        this.hurtTrigger = false;
        
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
        this.slots.forEach(slot => {
            if (slot && slot.id === 'expand') {
                const star = slot.star || 1;
                expandSlots += 4;
            }
        });
        
        const newSlotCount = this.baseSlotCount + expandSlots;
        
        if (newSlotCount > this.slotCount) {
            // 扩展槽位
            while (this.slots.length < newSlotCount) {
                this.slots.push(null);
            }
        } else if (newSlotCount < this.slotCount) {
            // 缩减槽位，把多余的技能放回背包
            while (this.slots.length > newSlotCount) {
                const removed = this.slots.pop();
                if (removed) {
                    this.inventory.push(removed);
                }
            }
        }
        
        this.slotCount = newSlotCount;
    }
    
    // 获取伤害倍率
    getDamageMult() {
        let mult = this.damageMult;
        if (this.lowEnergyDamage > 0 && this.energy / this.maxEnergy < 0.3) {
            mult *= (1 + this.lowEnergyDamage);
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
        this.castAllSlots(player, this.specialSlots);
    }
    
    // 一次轮播所有槽位
    castAllSlots(player, slots) {
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
            
            this.fireSkill(player, skill, skillMods);
        });
        
        return { fired: true };
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
            bounceRange: 200,
            knockback: player.knockback || 1,
            sizeScale: 1,
            critChance: player.critChance || 0
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
