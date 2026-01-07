// --- 魔法工艺风格技能系统 (类幸存者版) ---
// 技能分为三类：
// 1. 魔法技能 (Magic) - 主动技能，产生投射物
// 2. 被动技能 (Modifier) - 修饰魔法技能
// 3. 祝福 (Perk) - 角色永久增益，升级获取

// ========== 魔法技能 (主动) ==========
const MAGIC_SKILLS = {
    spark_bolt: {
        id: 'spark_bolt',
        name: '火花弹',
        type: 'magic',
        icon: '✨',
        cooldown: 8,
        desc: '快速的小型魔法弹',
        create: (caster, mods) => new SparkProjectile(caster, mods)
    },
    fireball: {
        id: 'fireball',
        name: '火球术',
        type: 'magic',
        icon: '🔥',
        cooldown: 25,
        desc: '燃烧的火球',
        create: (caster, mods) => new FireballProjectile(caster, mods)
    },
    magic_arrow: {
        id: 'magic_arrow',
        name: '魔法箭',
        type: 'magic',
        icon: '➤',
        cooldown: 12,
        desc: '精准的魔法箭矢',
        create: (caster, mods) => new LaserProjectile(caster, mods)
    },
    energy_orb: {
        id: 'energy_orb',
        name: '能量球',
        type: 'magic',
        icon: '💠',
        cooldown: 40,
        desc: '缓慢但强力的能量球',
        create: (caster, mods) => new PlasmaProjectile(caster, mods)
    },
    magic_missile: {
        id: 'magic_missile',
        name: '魔导弹',
        type: 'magic',
        icon: '🚀',
        cooldown: 35,
        desc: '追踪敌人的导弹',
        create: (caster, mods) => new MissileProjectile(caster, mods)
    },
    flying_sword: {
        id: 'flying_sword',
        name: '飞剑',
        type: 'magic',
        icon: '🗡️',
        cooldown: 15,
        desc: '挥舞飞剑攻击前方，可抵挡敌人弹道',
        create: (caster, mods) => new FlyingSwordProjectile(caster, mods)
    }
};


// ========== 被动技能 (修饰符) ==========
const MODIFIER_SKILLS = {
    scatter: {
        id: 'scatter',
        name: '散射',
        type: 'modifier',
        icon: '🔱',
        desc: '同时发射3个投射物',
        modify: (mods) => { mods.splitCount = (mods.splitCount || 1) + 2; }
    },
    homing: {
        id: 'homing',
        name: '追踪',
        type: 'modifier',
        icon: '🎯',
        desc: '投射物追踪敌人',
        modify: (mods) => { mods.homing = true; mods.turnSpeed = (mods.turnSpeed || 0) + 0.05; }
    },
    piercing: {
        id: 'piercing',
        name: '穿透',
        type: 'modifier',
        icon: '📍',
        desc: '穿透多个敌人',
        modify: (mods) => { mods.penetrate = (mods.penetrate || 1) + 2; }
    },
    lightning_chain: {
        id: 'lightning_chain',
        name: '闪电链',
        type: 'modifier',
        icon: '⚡',
        desc: '命中后连锁攻击附近敌人',
        modify: (mods) => { mods.chainCount = (mods.chainCount || 0) + 2; }
    },
    speed_up: {
        id: 'speed_up',
        name: '加速',
        type: 'modifier',
        icon: '💨',
        desc: '投射物速度+50%',
        modify: (mods) => { mods.speed = (mods.speed || 1) * 1.5; }
    },
    damage_plus: {
        id: 'damage_plus',
        name: '伤害增幅',
        type: 'modifier',
        icon: '💪',
        desc: '伤害+50%',
        modify: (mods) => { mods.damage = (mods.damage || 1) * 1.5; }
    },
    explosive: {
        id: 'explosive',
        name: '爆炸',
        type: 'modifier',
        icon: '💥',
        desc: '击杀敌人时产生爆炸',
        modify: (mods) => { mods.explosiveOnKill = true; mods.explosionRadius = (mods.explosionRadius || 30) + 30; }
    },
    bouncing: {
        id: 'bouncing',
        name: '弹射',
        type: 'modifier',
        icon: '🔄',
        desc: '弹射到其他敌人',
        modify: (mods) => { mods.bounceCount = (mods.bounceCount || 0) + 2; }
    },
    reduce_cooldown: {
        id: 'reduce_cooldown',
        name: '急速施法',
        type: 'modifier',
        icon: '⏱️',
        desc: '冷却时间-30%',
        modify: (mods) => { mods.cooldownMult = (mods.cooldownMult || 1) * 0.7; }
    },
    // 新增被动技能
    burn: {
        id: 'burn',
        name: '灼烧',
        type: 'modifier',
        icon: '🔶',
        desc: '附带灼烧效果，持续伤害',
        modify: (mods) => { mods.burning = true; mods.burnDamage = (mods.burnDamage || 0) + 3; }
    },
    pull: {
        id: 'pull',
        name: '牵引',
        type: 'modifier',
        icon: '🌀',
        desc: '击中敌人时拉扯周围敌人',
        modify: (mods) => { mods.pull = true; mods.pullRange = (mods.pullRange || 80) + 40; mods.pullStrength = (mods.pullStrength || 0) + 5; }
    },
    thunder: {
        id: 'thunder',
        name: '落雷',
        type: 'modifier',
        icon: '⚡',
        desc: '击中敌人时落下金色闪电',
        modify: (mods) => { mods.lightning = true; mods.lightningChance = (mods.lightningChance || 0) + 0.2; }
    },
    poison: {
        id: 'poison',
        name: '中毒',
        type: 'modifier',
        icon: '☠️',
        desc: '附带中毒效果，叠加伤害',
        modify: (mods) => { mods.poison = true; mods.poisonStacks = (mods.poisonStacks || 0) + 4; }
    },
    rune_hammer: {
        id: 'rune_hammer',
        name: '符文战锤',
        type: 'modifier',
        icon: '🔨',
        desc: '法术环绕角色攻击',
        modify: (mods) => { mods.orbital = true; mods.orbitalCount = (mods.orbitalCount || 0) + 1; }
    },
    prism_core: {
        id: 'prism_core',
        name: '棱镜核心',
        type: 'modifier',
        icon: '💎',
        desc: '持续命中伤害递增',
        modify: (mods) => { mods.rampingDamage = true; mods.rampingRate = (mods.rampingRate || 0) + 0.1; }
    },
    reflect: {
        id: 'reflect',
        name: '反弹',
        type: 'modifier',
        icon: '↩️',
        desc: '反弹3次，每次伤害-20%',
        modify: (mods) => { mods.reflect = true; mods.reflectCount = (mods.reflectCount || 0) + 3; mods.reflectDamageDecay = 0.8; }
    },
    split: {
        id: 'split',
        name: '分裂',
        type: 'modifier',
        icon: '✴️',
        desc: '命中敌人后分裂3个小弹(30%伤害)',
        modify: (mods) => { mods.splitOnHit = true; mods.splitAmount = (mods.splitAmount || 0) + 3; mods.splitDamageMult = 0.3; }
    },
    hover: {
        id: 'hover',
        name: '悬停',
        type: 'modifier',
        icon: '⏸️',
        desc: '命中后停留0.5秒，伤害-30%',
        modify: (mods) => { mods.hover = true; mods.hoverDuration = (mods.hoverDuration || 0) + 30; mods.damage = (mods.damage || 1) * 0.7; }
    },
    light_pillar: {
        id: 'light_pillar',
        name: '光之柱',
        type: 'modifier',
        icon: '🌟',
        desc: '召唤光柱1秒，冷却+20%',
        modify: (mods) => { mods.lightPillar = true; mods.pillarDamage = (mods.pillarDamage || 0) + 8; mods.cooldownMult = (mods.cooldownMult || 1) * 1.2; }
    },
    frenzy: {
        id: 'frenzy',
        name: '狂暴',
        type: 'modifier',
        icon: '😈',
        desc: '持续攻击同一敌人时冷却递减',
        modify: (mods) => { mods.frenzy = true; mods.frenzyReduction = (mods.frenzyReduction || 0) + 0.05; }
    },
    enlarge: {
        id: 'enlarge',
        name: '膨胀',
        type: 'modifier',
        icon: '🎈',
        desc: '技能体积+25%',
        modify: (mods) => { mods.sizeScale = (mods.sizeScale || 1) * 1.25; }
    }
};


// ========== 祝福 (Perks) - 升级获取 ==========
const PERKS = {
    // 生存类
    extra_hp: {
        id: 'extra_hp',
        name: '生命强化',
        icon: '❤️',
        desc: '最大生命+20',
        stackable: true,
        apply: (player, level) => { 
            player.maxHp += 20 * level; 
            player.hp += 20 * level; 
        }
    },
    regeneration: {
        id: 'regeneration',
        name: '生命再生',
        icon: '💚',
        desc: '每秒恢复生命',
        stackable: true,
        apply: (player, level) => { player.regen += 0.5 * level; }
    },
    vampirism: {
        id: 'vampirism',
        name: '吸血',
        icon: '🧛',
        desc: '击杀敌人恢复生命',
        stackable: true,
        apply: (player, level) => { player.vampirism = (player.vampirism || 0) + 2 * level; }
    },
    
    // 攻击类
    damage_boost: {
        id: 'damage_boost',
        name: '伤害提升',
        icon: '⚔️',
        desc: '所有伤害+15%',
        stackable: true,
        apply: (player, level) => { player.damageMult *= Math.pow(1.15, level); }
    },
    attack_speed: {
        id: 'attack_speed',
        name: '攻击速度',
        icon: '⚡',
        desc: '施法冷却-10%',
        stackable: true,
        apply: (player, level) => { player.cooldownMult *= Math.pow(0.9, level); }
    },
    critical_hit: {
        id: 'critical_hit',
        name: '暴击',
        icon: '💢',
        desc: '10%几率双倍伤害',
        stackable: true,
        apply: (player, level) => { player.critChance = (player.critChance || 0) + 0.1 * level; }
    },
    
    // 移动类
    movement_speed: {
        id: 'movement_speed',
        name: '疾风',
        icon: '🏃',
        desc: '移动速度+15%',
        stackable: true,
        apply: (player, level) => { player.speed *= Math.pow(1.15, level); }
    },
    
    // 拾取类
    greed: {
        id: 'greed',
        name: '贪婪',
        icon: '💰',
        desc: '经验获取+20%',
        stackable: true,
        apply: (player, level) => { player.xpMult = (player.xpMult || 1) * Math.pow(1.2, level); }
    },
    magnet: {
        id: 'magnet',
        name: '磁铁',
        icon: '🧲',
        desc: '拾取范围+30%',
        stackable: true,
        apply: (player, level) => { player.pickupRange *= Math.pow(1.3, level); }
    },
    
    // 特殊类
    sacrifice: {
        id: 'sacrifice',
        name: '献祭',
        icon: '�',
        desc: '周围产生献祭火焰',
        stackable: true,
        apply: (player, level) => { player.damageAura = (player.damageAura || 0) + 5 * level; }
    },
    luck: {
        id: 'luck',
        name: '幸运',
        icon: '🍀',
        desc: '技能掉落率+25%',
        stackable: true,
        apply: (player, level) => { player.dropRate = (player.dropRate || 1) * Math.pow(1.25, level); }
    },
    arcane_barrier: {
        id: 'arcane_barrier',
        name: '奥术屏障',
        icon: '�️',
        desc: '击杀敌人时获得5护盾',
        stackable: true,
        apply: (player, level) => { player.shieldOnKill = (player.shieldOnKill || 0) + 5 * level; }
    }
};


// 合并魔法和被动技能供掉落使用
const ALL_SKILLS = { ...MAGIC_SKILLS, ...MODIFIER_SKILLS };

// 升级选项 - 祝福(Perks)
const UPGRADES = Object.values(PERKS).map(perk => ({
    id: perk.id,
    name: perk.icon + ' ' + perk.name,
    desc: perk.desc,
    type: 'perk',
    perkId: perk.id
}));

// ========== 法杖/技能槽系统 ==========
class Wand {
    constructor(player, slotCount = 8) {
        this.player = player;
        this.slots = new Array(slotCount).fill(null);
        this.slotCount = slotCount;
        this.currentIndex = 0;
        this.cooldownTimer = 0;
        this.baseCooldown = 5;
        this.inventory = [];
    }

    addSkillToInventory(skillId, star = 1) {
        const skill = ALL_SKILLS[skillId];
        if (!skill) return false;
        this.inventory.push({ ...skill, star: star });
        return true;
    }

    // 合成技能：3个同类型同星级合成为高一星级
    canMergeSkills() {
        // 统计背包中每种技能每个星级的数量
        const counts = {};
        this.inventory.forEach((skill, idx) => {
            const key = `${skill.id}_${skill.star || 1}`;
            if (!counts[key]) {
                counts[key] = { skill, indices: [], star: skill.star || 1 };
            }
            counts[key].indices.push(idx);
        });
        
        // 找出可以合成的技能（数量>=3且星级<3）
        const mergeable = [];
        Object.values(counts).forEach(item => {
            if (item.indices.length >= 3 && item.star < 3) {
                mergeable.push(item);
            }
        });
        return mergeable;
    }

    mergeSkill(skillId, star) {
        // 找到3个相同技能
        const indices = [];
        for (let i = 0; i < this.inventory.length && indices.length < 3; i++) {
            const skill = this.inventory[i];
            if (skill.id === skillId && (skill.star || 1) === star) {
                indices.push(i);
            }
        }
        
        if (indices.length < 3) return false;
        if (star >= 3) return false;
        
        // 从后往前删除，避免索引变化
        indices.sort((a, b) => b - a);
        indices.forEach(idx => this.inventory.splice(idx, 1));
        
        // 添加高星级技能
        this.addSkillToInventory(skillId, star + 1);
        return true;
    }

    equipSkill(inventoryIndex, slotIndex) {
        if (inventoryIndex < 0 || inventoryIndex >= this.inventory.length) return false;
        if (slotIndex < 0 || slotIndex >= this.slotCount) return false;
        const skill = this.inventory[inventoryIndex];
        if (this.slots[slotIndex] !== null) {
            this.inventory.push(this.slots[slotIndex]);
        }
        this.slots[slotIndex] = skill;
        this.inventory.splice(inventoryIndex, 1);
        return true;
    }

    unequipSkill(slotIndex) {
        if (slotIndex < 0 || slotIndex >= this.slotCount) return false;
        if (this.slots[slotIndex] === null) return false;
        this.inventory.push(this.slots[slotIndex]);
        this.slots[slotIndex] = null;
        return true;
    }

    swapSlots(i, j) {
        if (i >= 0 && i < this.slotCount && j >= 0 && j < this.slotCount) {
            [this.slots[i], this.slots[j]] = [this.slots[j], this.slots[i]];
        }
    }

    update() {
        if (this.cooldownTimer > 0) {
            this.cooldownTimer--;
            return;
        }
        const result = this.castFromIndex(this.currentIndex);
        if (result.fired) {
            this.currentIndex = result.nextIndex;
            this.cooldownTimer = result.cooldown;
        } else {
            this.currentIndex = 0;
        }
    }

    castFromIndex(startIndex) {
        const mods = this.getDefaultMods();
        let index = startIndex;
        let loopCount = 0;

        while (loopCount < this.slotCount) {
            const slot = this.slots[index];
            if (slot === null) {
                index = (index + 1) % this.slotCount;
                loopCount++;
                continue;
            }
            if (slot.type === 'modifier') {
                // 被动技能星级加成
                const starMult = this.getStarMultiplier(slot.star || 1);
                const originalModify = slot.modify;
                // 临时增强modify效果
                const enhancedMods = { ...mods };
                originalModify(enhancedMods);
                // 根据星级增强效果
                Object.keys(enhancedMods).forEach(key => {
                    if (typeof enhancedMods[key] === 'number' && key !== 'cooldownMult') {
                        const diff = enhancedMods[key] - mods[key];
                        if (diff > 0) {
                            mods[key] = mods[key] + diff * starMult;
                        } else {
                            mods[key] = enhancedMods[key];
                        }
                    } else {
                        mods[key] = enhancedMods[key];
                    }
                });
                index = (index + 1) % this.slotCount;
                loopCount++;
            } else if (slot.type === 'magic') {
                // 主动技能星级加成
                console.log('slot数据:', slot); // 调试：查看slot结构
                const starMult = this.getStarMultiplier(slot.star || 1);
                mods.damage *= starMult;
                mods.star = slot.star || 1; // 传递星级给技能
                this.fireSkill(slot, mods);
                const cooldown = Math.max(this.baseCooldown, slot.cooldown * (mods.cooldownMult || 1) / starMult);
                return { fired: true, nextIndex: (index + 1) % this.slotCount, cooldown };
            }
        }
        return { fired: false, nextIndex: 0, cooldown: this.baseCooldown };
    }

    getStarMultiplier(star) {
        // 1星=1x, 2星=1.5x, 3星=2.5x
        const multipliers = { 1: 1, 2: 1.5, 3: 2.5 };
        return multipliers[star] || 1;
    }

    getDefaultMods() {
        return {
            damage: 1.0 * this.player.damageMult,
            speed: 1.0 * this.player.projSpeed,
            penetrate: 1,
            splitCount: 1 + (this.player.extraProjectiles || 0),
            homing: false,
            turnSpeed: 0,
            chainCount: 0,
            cooldownMult: this.player.cooldownMult,
            explosive: false,
            explosionRadius: 0,
            bounceCount: 0,
            knockback: this.player.knockback || 1
        };
    }

    fireSkill(skill, mods) {
        let targetAngle = 0;
        let nearest = null;
        let minDist = 800;

        Game.enemies.forEach(e => {
            const dist = Math.sqrt((e.x - this.player.x) ** 2 + (e.y - this.player.y) ** 2);
            if (dist < minDist) {
                minDist = dist;
                nearest = e;
            }
        });

        if (nearest) {
            targetAngle = Math.atan2(nearest.y - this.player.y, nearest.x - this.player.x);
        }

        const count = mods.splitCount || 1;
        const spreadAngle = count > 1 ? Math.PI / 6 : 0;

        for (let i = 0; i < count; i++) {
            let angle = targetAngle;
            if (count > 1) {
                angle = targetAngle + (i - (count - 1) / 2) * (spreadAngle / (count - 1 || 1));
            }
            const proj = skill.create(this.player, { ...mods, angle });
            if (proj) Game.projectiles.push(proj);
        }
    }
}


// ========== 祝福管理系统 ==========
class PerkManager {
    constructor(player) {
        this.player = player;
        this.perks = {}; // { perkId: level }
    }
    
    addPerk(perkId) {
        const perk = PERKS[perkId];
        if (!perk) return false;
        
        const currentLevel = this.perks[perkId] || 0;
        const newLevel = currentLevel + 1;
        
        // 应用效果（增量）
        perk.apply(this.player, 1);
        this.perks[perkId] = newLevel;
        
        return { perk, level: newLevel };
    }
    
    getPerkLevel(perkId) {
        return this.perks[perkId] || 0;
    }
    
    getAllPerks() {
        return Object.entries(this.perks).map(([id, level]) => ({
            ...PERKS[id],
            level
        }));
    }
}

// ========== 投射物基类 ==========
class SkillProjectile {
    constructor(caster, mods) {
        this.x = caster.x;
        this.y = caster.y;
        this.caster = caster;
        this.angle = mods.angle || 0;
        this.dx = Math.cos(this.angle);
        this.dy = Math.sin(this.angle);

        // 体积缩放
        this.sizeScale = mods.sizeScale || 1;

        this.speed = 10 * (mods.speed || 1);
        this.damage = 10 * (mods.damage || 1);
        this.knockback = mods.knockback || 1;
        this.penetrate = mods.penetrate || 1;
        this.hitList = [];

        this.homing = mods.homing || false;
        this.turnSpeed = mods.turnSpeed || 0.05;
        this.target = null;

        this.chainCount = mods.chainCount || 0;
        this.explosiveOnKill = mods.explosiveOnKill || false;
        this.explosionRadius = mods.explosionRadius || 30;
        this.bounceCount = mods.bounceCount || 0;

        // 新增效果属性
        this.burning = mods.burning || false;
        this.burnDamage = mods.burnDamage || 0;
        this.critChance = mods.critChance || 0;
        this.lightning = mods.lightning || false;
        this.lightningChance = mods.lightningChance || 0;
        this.poison = mods.poison || false;
        this.poisonStacks = mods.poisonStacks || 0;
        this.shieldOnHit = mods.shieldOnHit || false;
        this.shieldAmount = mods.shieldAmount || 0;
        this.pull = mods.pull || false;
        this.pullRange = mods.pullRange || 0;
        this.pullStrength = mods.pullStrength || 0;
        this.rampingDamage = mods.rampingDamage || false;
        this.rampingRate = mods.rampingRate || 0;
        this.rampingBonus = 0;
        this.reflect = mods.reflect || false;
        this.reflectCount = mods.reflectCount || 0;
        this.reflectDamageDecay = mods.reflectDamageDecay || 0.8;
        this.splitOnDeath = mods.splitOnDeath || false;
        this.splitOnHit = mods.splitOnHit || false;
        this.splitAmount = mods.splitAmount || 0;
        this.splitDamageMult = mods.splitDamageMult || 0.3;
        this.hover = mods.hover || false;
        this.hoverDuration = mods.hoverDuration || 0;
        this.isHovering = false;
        this.hoverTimer = 0;
        this.lightPillar = mods.lightPillar || false;
        this.pillarDamage = mods.pillarDamage || 0;
        
        // 狂暴
        this.frenzy = mods.frenzy || false;
        this.frenzyReduction = mods.frenzyReduction || 0;
        
        // 符文战锤 - 环绕效果
        this.orbital = mods.orbital || false;
        this.orbitalRadius = 80; // 环绕半径
        this.orbitalSpeed = 0.08; // 环绕速度
        this.orbitalAngle = mods.angle || 0; // 初始角度

        this.duration = 180;
        this.radius = 6;
        this.color = '#fff';
        this.markedForDeletion = false;
    }

    update() {
        // 悬停状态
        if (this.isHovering) {
            this.hoverTimer--;
            if (this.hoverTimer <= 0) {
                this.isHovering = false;
                this.markedForDeletion = true;
            }
            // 悬停时持续伤害周围敌人
            Game.enemies.forEach(e => {
                if (!e.markedForDeletion) {
                    const dist = Math.sqrt((e.x - this.x) ** 2 + (e.y - this.y) ** 2);
                    if (dist < this.radius + e.radius + 10) {
                        e.takeDamage(this.damage * 0.1, 0, 0);
                    }
                }
            });
            return;
        }
        
        // 符文战锤 - 环绕玩家
        if (this.orbital) {
            this.orbitalAngle += this.orbitalSpeed;
            this.x = this.caster.x + Math.cos(this.orbitalAngle) * this.orbitalRadius;
            this.y = this.caster.y + Math.sin(this.orbitalAngle) * this.orbitalRadius;
            this.duration--;
            if (this.duration <= 0) {
                // 分裂效果
                if (this.splitOnDeath && this.splitAmount > 0) {
                    this.spawnSplitProjectiles();
                }
                this.markedForDeletion = true;
            }
            return;
        }

        if (this.homing) this.updateHoming();
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;
        this.duration--;
        
        // 棱镜核心 - 持续增加伤害
        if (this.rampingDamage) {
            this.rampingBonus += this.rampingRate;
        }
        
        if (this.duration <= 0) {
            // 分裂效果
            if (this.splitOnDeath && this.splitAmount > 0) {
                this.spawnSplitProjectiles();
            }
            this.markedForDeletion = true;
        }
    }

    updateHoming() {
        if (!this.target || this.target.markedForDeletion) this.findTarget();
        if (this.target && !this.target.markedForDeletion) {
            const targetAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
            const currentAngle = Math.atan2(this.dy, this.dx);
            let angleDiff = targetAngle - currentAngle;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            const turn = Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), this.turnSpeed);
            const newAngle = currentAngle + turn;
            this.dx = Math.cos(newAngle);
            this.dy = Math.sin(newAngle);
        }
    }

    findTarget() {
        let minDist = 500;
        this.target = null;
        
        // 遍历普通敌人
        Game.enemies.forEach(e => {
            if (!e.markedForDeletion && !this.hitList.includes(e)) {
                const dist = Math.sqrt((e.x - this.x) ** 2 + (e.y - this.y) ** 2);
                if (dist < minDist) { minDist = dist; this.target = e; }
            }
        });
        
        // 遍历Boss
        if (typeof BossManager !== 'undefined' && BossManager.bosses) {
            BossManager.bosses.forEach(boss => {
                if (!boss.markedForDeletion && !this.hitList.includes(boss)) {
                    const dist = Math.sqrt((boss.x - this.x) ** 2 + (boss.y - this.y) ** 2);
                    if (dist < minDist) { minDist = dist; this.target = boss; }
                }
            });
        }
    }

    getFinalDamage() {
        let dmg = this.damage;
        // 棱镜核心加成
        if (this.rampingDamage) {
            dmg *= (1 + this.rampingBonus);
        }
        // 暴击判定
        if (Math.random() < this.critChance) {
            dmg *= 2;
            Game.spawnParticles(this.x, this.y, '#ffff00', 5);
        }
        return dmg;
    }

    onHit(enemy) {
        const finalDamage = this.getFinalDamage();
        
        // 连锁攻击
        if (this.chainCount > 0) this.chainToNext(enemy);
        
        // 弹射
        if (this.bounceCount > 0) this.bounceToEnemy(enemy);
        
        // 分裂效果（命中时）
        if (this.splitOnHit && this.splitAmount > 0) {
            this.spawnSplitProjectiles();
            Game.spawnParticles(enemy.x, enemy.y, '#ffaaff', 5);
        }
        
        // 灼烧效果
        if (this.burning && this.burnDamage > 0) {
            enemy.addBurn(this.burnDamage, 180); // 3秒灼烧
            Game.spawnParticles(enemy.x, enemy.y, '#ff6600', 3);
        }
        
        // 雷霆效果
        if (this.lightning && Math.random() < this.lightningChance) {
            this.spawnLightning(enemy);
        }
        
        // 中毒效果
        if (this.poison && this.poisonStacks > 0) {
            enemy.addPoison(this.poisonStacks);
            Game.spawnParticles(enemy.x, enemy.y, '#00ff00', 3);
        }
        
        // 护盾效果
        if (this.shieldOnHit && this.shieldAmount > 0) {
            this.caster.shield = (this.caster.shield || 0) + this.shieldAmount;
            Game.addFloatingText('+🛡️', this.caster.x, this.caster.y - 20, '#66ccff');
        }
        
        // 牵引效果 - 拉扯周围敌人
        if (this.pull && this.pullRange > 0) {
            this.pullNearbyEnemies(enemy);
        }
        
        // 光之柱
        if (this.lightPillar && this.pillarDamage > 0) {
            Game.lightPillars = Game.lightPillars || [];
            Game.lightPillars.push({
                x: enemy.x,
                y: enemy.y,
                damage: this.pillarDamage,
                life: 60,
                radius: 40
            });
        }
        
        // 悬停效果
        if (this.hover && this.hoverDuration > 0 && !this.isHovering) {
            this.isHovering = true;
            this.hoverTimer = this.hoverDuration;
            this.speed = 0;
        }
        
        // 反弹效果
        if (this.reflect && this.reflectCount > 0) {
            this.dx = -this.dx + (Math.random() - 0.5) * 0.5;
            this.dy = -this.dy + (Math.random() - 0.5) * 0.5;
            const len = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
            this.dx /= len;
            this.dy /= len;
            this.reflectCount--;
            this.damage *= this.reflectDamageDecay; // 每次反弹伤害衰减
            this.duration += 30;
            this.penetrate++;
            Game.spawnParticles(this.x, this.y, '#aaaaff', 5);
        }
    }

    onKill(enemy) {
        // 爆炸 - 击杀时爆炸
        if (this.explosiveOnKill && this.explosionRadius > 0) {
            // 保存当前位置用于爆炸
            const oldX = this.x;
            const oldY = this.y;
            this.x = enemy.x;
            this.y = enemy.y;
            this.explode();
            this.x = oldX;
            this.y = oldY;
        }
    }

    spawnLightning(enemy) {
        // 落雷效果 - 金色闪电
        Game.lightningEffects = Game.lightningEffects || [];
        Game.lightningEffects.push({
            x1: enemy.x,
            y1: enemy.y - 200,
            x2: enemy.x,
            y2: enemy.y,
            life: 25,
            color: '#ffdd00'
        });
        // 范围伤害
        Game.enemies.forEach(e => {
            if (!e.markedForDeletion) {
                const dist = Math.sqrt((e.x - enemy.x) ** 2 + (e.y - enemy.y) ** 2);
                if (dist < 60) {
                    e.takeDamage(this.damage * 0.5, 0, 0);
                }
            }
        });
        Game.spawnParticles(enemy.x, enemy.y, '#ffdd00', 12);
        Game.spawnParticles(enemy.x, enemy.y, '#ffffff', 5);
    }

    // 牵引效果 - 拉扯周围敌人
    pullNearbyEnemies(enemy) {
        Game.enemies.forEach(e => {
            if (!e.markedForDeletion && e !== enemy) {
                const dx = enemy.x - e.x;
                const dy = enemy.y - e.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < this.pullRange && dist > 10) {
                    // 拉扯敌人向命中点移动
                    const pullForce = this.pullStrength / dist * 10;
                    e.x += dx / dist * pullForce;
                    e.y += dy / dist * pullForce;
                    
                    // 添加扭曲特效
                    Game.distortEffects = Game.distortEffects || [];
                    Game.distortEffects.push({
                        x: e.x,
                        y: e.y,
                        targetX: enemy.x,
                        targetY: enemy.y,
                        life: 15
                    });
                }
            }
        });
        // 中心扭曲粒子
        Game.spawnParticles(enemy.x, enemy.y, '#9966ff', 8);
    }

    spawnSplitProjectiles() {
        for (let i = 0; i < this.splitAmount; i++) {
            const angle = (Math.PI * 2 / this.splitAmount) * i;
            const proj = new SplitProjectile(this, angle, this.splitDamageMult);
            Game.projectiles.push(proj);
        }
    }

    explode() {
        const x = this.x;
        const y = this.y;
        const radius = this.explosionRadius;
        
        // 对范围内敌人造成伤害
        Game.enemies.forEach(e => {
            if (!e.markedForDeletion) {
                const dist = Math.sqrt((e.x - x) ** 2 + (e.y - y) ** 2);
                if (dist < radius) {
                    const dmgMult = 1 - dist / radius * 0.5;
                    e.takeDamage(this.damage * 0.5 * dmgMult, (e.x - x) / dist * 3, (e.y - y) / dist * 3);
                }
            }
        });
        
        // 对Boss也造成伤害
        if (typeof BossManager !== 'undefined' && BossManager.bosses) {
            BossManager.bosses.forEach(boss => {
                if (!boss.markedForDeletion) {
                    const dist = Math.sqrt((boss.x - x) ** 2 + (boss.y - y) ** 2);
                    if (dist < radius) {
                        const dmgMult = 1 - dist / radius * 0.5;
                        boss.takeDamage(this.damage * 0.5 * dmgMult, 0, 0);
                    }
                }
            });
        }
        
        // 添加爆炸效果到游戏
        Game.explosionEffects = Game.explosionEffects || [];
        Game.explosionEffects.push({
            x: x,
            y: y,
            radius: radius,
            life: 30,
            maxLife: 30
        });
        
        // 爆炸粒子 - 火焰核心
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            Game.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 25 + Math.random() * 15,
                color: Math.random() > 0.5 ? '#ff6600' : '#ffaa00',
                size: 4 + Math.random() * 6
            });
        }
        
        // 烟雾粒子 - 向上飘
        for (let i = 0; i < 15; i++) {
            Game.particles.push({
                x: x + (Math.random() - 0.5) * 30,
                y: y,
                vx: (Math.random() - 0.5) * 1.5,
                vy: -2 - Math.random() * 3,
                life: 40 + Math.random() * 20,
                color: '#444444',
                size: 8 + Math.random() * 10
            });
        }
        
        // 屏幕震动
        Game.screenShake(8, 12);
    }

    chainToNext(fromEnemy) {
        let nextTarget = null, minDist = 200;
        Game.enemies.forEach(e => {
            if (!e.markedForDeletion && e !== fromEnemy && !this.hitList.includes(e)) {
                const dist = Math.sqrt((e.x - fromEnemy.x) ** 2 + (e.y - fromEnemy.y) ** 2);
                if (dist < minDist) { minDist = dist; nextTarget = e; }
            }
        });
        if (nextTarget) {
            Game.lightningEffects = Game.lightningEffects || [];
            Game.lightningEffects.push({ x1: fromEnemy.x, y1: fromEnemy.y, x2: nextTarget.x, y2: nextTarget.y, life: 15, color: '#ffdd00' });
            nextTarget.takeDamage(this.damage * 0.7, 0, 0);
            this.hitList.push(nextTarget);
            this.chainCount--;
            if (this.chainCount > 0) setTimeout(() => this.chainToNext(nextTarget), 50);
        }
    }

    bounceToEnemy(fromEnemy) {
        let nextTarget = null, minDist = 300;
        Game.enemies.forEach(e => {
            if (!e.markedForDeletion && e !== fromEnemy && !this.hitList.includes(e)) {
                const dist = Math.sqrt((e.x - this.x) ** 2 + (e.y - this.y) ** 2);
                if (dist < minDist) { minDist = dist; nextTarget = e; }
            }
        });
        if (nextTarget) {
            const dx = nextTarget.x - this.x, dy = nextTarget.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            this.dx = dx / dist; this.dy = dy / dist;
            this.bounceCount--; this.penetrate++;
        }
    }

    draw(ctx, camX, camY) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x - camX, this.y - camY, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 悬停效果绘制
        if (this.isHovering) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x - camX, this.y - camY, this.radius + 10, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }
}

// 分裂小弹 - 继承主技能的特性（除分裂外）
class SplitProjectile extends SkillProjectile {
    constructor(parent, angle, damageMult = 0.3) {
        // 创建一个基础的 mods 对象
        const mods = {
            angle: angle,
            damage: (parent.baseDamage || parent.damage) * damageMult / 10,
            speed: parent.speed * 0.8,
            penetrate: parent.penetrate,
            // 继承主技能的被动效果（除分裂外）
            homing: parent.homing,
            turnSpeed: parent.turnSpeed,
            bounceCount: parent.bounceCount,
            chainCount: parent.chainCount,
            chainRange: parent.chainRange,
            chainDamageDecay: parent.chainDamageDecay,
            reflect: parent.reflect,
            reflectCount: parent.reflectCount,
            reflectDamageDecay: parent.reflectDamageDecay,
            // 不继承分裂效果，避免无限分裂
            splitOnHit: false,
            splitOnDeath: false,
            splitAmount: 0
        };
        
        super({ x: parent.x, y: parent.y }, mods);
        
        this.parentType = parent.constructor.name;
        this.damage = (parent.baseDamage || parent.damage) * damageMult;
        this.speed = parent.speed * 0.8;
        this.radius = Math.max(2, parent.radius * 0.5); // 缩小版
        this.color = parent.color || '#fff';
        this.duration = 45;
        this.penetrate = parent.penetrate;
        this.scale = 0.5; // 缩放比例
        
        // 保存父弹的绘制方法引用
        this.parentDraw = parent.draw.bind(this);
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX, y = this.y - camY;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(this.scale, this.scale);
        ctx.translate(-x, -y);
        
        // 使用简化的绘制（基于颜色）
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 6;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x, y, this.radius / this.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, this.radius * 0.4 / this.scale, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}


// ========== 具体投射物类型 ==========
class SparkProjectile extends SkillProjectile {
    constructor(caster, mods) {
        super(caster, mods);
        this.damage = 5 * (mods.damage || 1);
        this.speed = 14 * (mods.speed || 1);
        this.radius = 4 * this.sizeScale;
        this.color = '#ffff00';
        this.duration = 60;
    }
    draw(ctx, camX, camY) {
        const x = this.x - camX, y = this.y - camY;
        ctx.save();
        ctx.shadowColor = '#ffff00'; ctx.shadowBlur = 8 * this.sizeScale;
        ctx.fillStyle = '#ffff00';
        ctx.beginPath(); ctx.arc(x, y, this.radius, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(x, y, this.radius * 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
}

class FireballProjectile extends SkillProjectile {
    constructor(caster, mods) {
        super(caster, mods);
        this.damage = 15 * (mods.damage || 1);
        this.speed = 8 * (mods.speed || 1);
        this.radius = 8 * this.sizeScale;
        this.color = '#ff6600';
        this.duration = 120;
        this.trailTimer = 0;
    }
    update() {
        super.update();
        this.trailTimer++;
        if (this.trailTimer % 3 === 0) {
            Game.particles.push({ x: this.x, y: this.y, vx: (Math.random()-0.5)*2, vy: (Math.random()-0.5)*2, life: 15, color: Math.random()>0.5?'#ff6600':'#ffaa00', size: (3+Math.random()*3) * this.sizeScale });
        }
    }
    draw(ctx, camX, camY) {
        const x = this.x - camX, y = this.y - camY;
        ctx.save();
        const g = ctx.createRadialGradient(x, y, 0, x, y, this.radius * 2);
        g.addColorStop(0, 'rgba(255,150,0,0.8)'); g.addColorStop(0.5, 'rgba(255,100,0,0.3)'); g.addColorStop(1, 'rgba(255,50,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, this.radius * 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffff00'; ctx.beginPath(); ctx.arc(x, y, this.radius * 0.6, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
}

class LaserProjectile extends SkillProjectile {
    constructor(caster, mods) {
        super(caster, mods);
        this.damage = 8 * (mods.damage || 1);
        this.speed = 18 * (mods.speed || 1);
        this.radius = 4 * this.sizeScale;
        this.color = '#00ffff';
        this.duration = 90;
        this.length = 20 * this.sizeScale;
    }
    draw(ctx, camX, camY) {
        const x = this.x - camX, y = this.y - camY;
        const angle = Math.atan2(this.dy, this.dx);
        ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
        ctx.shadowColor = '#00ffff'; ctx.shadowBlur = 10 * this.sizeScale;
        ctx.fillStyle = '#00ffff'; ctx.fillRect(-this.length, -2 * this.sizeScale, this.length * 2, 4 * this.sizeScale);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(-this.length + 2, -1 * this.sizeScale, this.length * 2 - 4, 2 * this.sizeScale);
        ctx.restore();
    }
}

class PlasmaProjectile extends SkillProjectile {
    constructor(caster, mods) {
        super(caster, mods);
        this.damage = 35 * (mods.damage || 1);
        this.speed = 6 * (mods.speed || 1);
        this.radius = 14 * this.sizeScale;
        this.color = '#ff00ff';
        this.duration = 150;
        this.penetrate = Math.max(5, mods.penetrate || 5);
        this.pulsePhase = 0;
    }
    update() { super.update(); this.pulsePhase += 0.2; }
    draw(ctx, camX, camY) {
        const x = this.x - camX, y = this.y - camY, pulse = Math.sin(this.pulsePhase) * 3 * this.sizeScale;
        ctx.save();
        const g = ctx.createRadialGradient(x, y, 0, x, y, this.radius + 10 * this.sizeScale + pulse);
        g.addColorStop(0, 'rgba(255,100,255,0.9)'); g.addColorStop(0.5, 'rgba(255,0,255,0.4)'); g.addColorStop(1, 'rgba(200,0,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, this.radius + 10 * this.sizeScale + pulse, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, this.radius * 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
}

class MissileProjectile extends SkillProjectile {
    constructor(caster, mods) {
        super(caster, mods);
        this.damage = 25 * (mods.damage || 1);
        this.speed = 5 * (mods.speed || 1);
        this.radius = 6 * this.sizeScale;
        this.duration = 240;
        this.homing = true;
        this.turnSpeed = Math.max(0.03, mods.turnSpeed || 0.03);
        this.trailParticles = [];
    }
    update() {
        super.update();
        this.trailParticles.push({ x: this.x - this.dx * 10, y: this.y - this.dy * 10, life: 12 });
        this.trailParticles = this.trailParticles.filter(p => p.life-- > 0);
    }
    draw(ctx, camX, camY) {
        const x = this.x - camX, y = this.y - camY, angle = Math.atan2(this.dy, this.dx);
        const s = this.sizeScale;
        ctx.save();
        this.trailParticles.forEach(p => {
            ctx.fillStyle = `rgba(255,100,0,${p.life/12})`;
            ctx.beginPath(); ctx.arc(p.x - camX, p.y - camY, 4 * s * p.life / 12, 0, Math.PI * 2); ctx.fill();
        });
        ctx.translate(x, y); ctx.rotate(angle + Math.PI / 2);
        ctx.fillStyle = '#666'; ctx.beginPath(); ctx.moveTo(0, -10 * s); ctx.lineTo(-5 * s, 8 * s); ctx.lineTo(5 * s, 8 * s); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ff4400'; ctx.beginPath(); ctx.arc(0, -5 * s, 3 * s, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
}

// 飞剑 - 挥舞攻击
class FlyingSwordProjectile extends SkillProjectile {
    constructor(caster, mods) {
        super(caster, mods);
        const star = mods.star || 1;
        this.baseDamage = 12;
        this.damage = this.baseDamage * (mods.damage || 1) * (1 + (star - 1) * 0.5);
        this.speed = 0; // 不移动，围绕玩家挥舞
        this.radius = (30 + star * 10) * this.sizeScale;
        // 剑的长度：1星50，2星100，3星200，再乘以膨胀系数
        const swordLengths = { 1: 50, 2: 100, 3: 200 };
        this.swordLength = (swordLengths[star] || 50) * this.sizeScale;
        this.duration = 30; // 挥舞持续时间
        this.swingAngle = 0; // 当前挥舞角度
        this.swingSpeed = 0.08; // 挥舞速度（调慢）
        this.startAngle = mods.angle || 0; // 起始角度（朝向敌人）
        this.swingRange = Math.PI * 0.8; // 挥舞范围（弧度）
        this.swingProgress = 0;
        this.hitList = [];
        this.penetrate = 999; // 可以打到多个敌人
        this.star = star;
        
        // 残影记录
        this.trailHistory = [];
        this.maxTrailLength = 8;
        
        // 剑的颜色随星级变化
        this.swordColors = ['#88ccff', '#aaffaa', '#ffdd66'];
        this.glowColors = ['#4488ff', '#44ff88', '#ffaa00'];
    }
    
    update() {
        // 挥舞动画
        this.swingProgress += this.swingSpeed;
        if (this.swingProgress >= 1) {
            this.markedForDeletion = true;
            return;
        }
        
        // 计算当前挥舞角度（从左到右）
        this.swingAngle = this.startAngle - this.swingRange / 2 + this.swingRange * this.swingProgress;
        
        // 记录残影
        this.trailHistory.push(this.swingAngle);
        if (this.trailHistory.length > this.maxTrailLength) {
            this.trailHistory.shift();
        }
        
        // 更新剑的位置（围绕玩家，剑伸出一定距离）
        const swordOffset = 40; // 剑柄距离角色中心的偏移量
        this.x = this.caster.x + Math.cos(this.swingAngle) * (this.swordLength * 0.5 + swordOffset);
        this.y = this.caster.y + Math.sin(this.swingAngle) * (this.swordLength * 0.5 + swordOffset);
        
        // 碰撞检测的有效范围（剑长度 + 偏移量）
        const effectiveRange = this.swordLength + swordOffset;
        
        // 检测碰撞（扇形范围）
        Game.enemies.forEach(e => {
            if (!e.markedForDeletion && !this.hitList.includes(e)) {
                const dx = e.x - this.caster.x;
                const dy = e.y - this.caster.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < effectiveRange + e.radius && dist > swordOffset - 5) {
                    // 检查是否在挥舞弧度内
                    const enemyAngle = Math.atan2(dy, dx);
                    let angleDiff = Math.abs(enemyAngle - this.swingAngle);
                    if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;
                    
                    if (angleDiff < 0.5) { // 在剑的范围内
                        e.takeDamage(this.damage, dx / dist * 5, dy / dist * 5, this);
                        this.hitList.push(e);
                        Game.spawnParticles(e.x, e.y, this.swordColors[Math.min(this.star - 1, 2)], 5);
                        
                        // 触发被动效果
                        if (this.onHit) this.onHit(e);
                    }
                }
            }
        });
        
        // 检测Boss
        if (typeof BossManager !== 'undefined' && BossManager.bosses) {
            BossManager.bosses.forEach(boss => {
                if (!boss.markedForDeletion && !this.hitList.includes(boss)) {
                    const dx = boss.x - this.caster.x;
                    const dy = boss.y - this.caster.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < effectiveRange + boss.radius && dist > swordOffset - 5) {
                        const enemyAngle = Math.atan2(dy, dx);
                        let angleDiff = Math.abs(enemyAngle - this.swingAngle);
                        if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;
                        
                        if (angleDiff < 0.5) {
                            boss.takeDamage(this.damage, dx / dist * 3, dy / dist * 3);
                            this.hitList.push(boss);
                            Game.spawnParticles(boss.x, boss.y, this.swordColors[Math.min(this.star - 1, 2)], 8);
                        }
                    }
                }
            });
        }
        
        // 抵挡敌人弹道
        Game.projectiles.forEach(p => {
            if (p.isBossProjectile && !p.markedForDeletion) {
                const dx = p.x - this.caster.x;
                const dy = p.y - this.caster.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < effectiveRange + p.radius && dist > swordOffset - 5) {
                    const projAngle = Math.atan2(dy, dx);
                    let angleDiff = Math.abs(projAngle - this.swingAngle);
                    if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;
                    
                    if (angleDiff < 0.6) { // 在剑的范围内
                        p.markedForDeletion = true;
                        // 抵挡特效
                        Game.spawnParticles(p.x, p.y, '#ffffff', 8);
                        Game.spawnParticles(p.x, p.y, this.swordColors[Math.min(this.star - 1, 2)], 5);
                    }
                }
            }
        });
        
        this.duration--;
    }
    
    draw(ctx, camX, camY) {
        const cx = this.caster.x - camX;
        const cy = this.caster.y - camY;
        const colorIdx = Math.min(this.star - 1, 2);
        const swordOffset = 15 * this.sizeScale;
        const scale = this.swordLength / 50;
        
        ctx.save();
        ctx.translate(cx, cy);
        
        // 绘制挥舞弧线（简化）
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = this.glowColors[colorIdx];
        ctx.lineWidth = Math.min(3 * scale, 8);
        ctx.beginPath();
        ctx.arc(0, 0, swordOffset + this.swordLength * 0.7, this.startAngle - this.swingRange / 2, this.swingAngle);
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        // 绘制当前剑身
        ctx.rotate(this.swingAngle);
        
        // 外发光（用描边代替shadowBlur）
        ctx.strokeStyle = this.glowColors[colorIdx];
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(swordOffset + 10 * scale, 0);
        ctx.lineTo(swordOffset + this.swordLength - 5 * scale, -4 * scale);
        ctx.lineTo(swordOffset + this.swordLength + 5 * scale, 0);
        ctx.lineTo(swordOffset + this.swordLength - 5 * scale, 4 * scale);
        ctx.closePath();
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        // 剑身
        ctx.fillStyle = this.swordColors[colorIdx];
        ctx.beginPath();
        ctx.moveTo(swordOffset + 10 * scale, 0);
        ctx.lineTo(swordOffset + this.swordLength - 5 * scale, -4 * scale);
        ctx.lineTo(swordOffset + this.swordLength + 5 * scale, 0);
        ctx.lineTo(swordOffset + this.swordLength - 5 * scale, 4 * scale);
        ctx.closePath();
        ctx.fill();
        
        // 剑身高光
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(swordOffset + 15 * scale, 0);
        ctx.lineTo(swordOffset + this.swordLength - 10 * scale, -1 * scale);
        ctx.lineTo(swordOffset + this.swordLength - 10 * scale, 1 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        
        // 剑柄
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(swordOffset, -3 * scale, 12 * scale, 6 * scale);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(swordOffset + 10 * scale, -4 * scale, 3 * scale, 8 * scale);
        
        ctx.restore();
    }
}


// ========== 技能掉落系统 ==========
class SkillDrop {
    constructor(x, y, skillId) {
        this.x = x; this.y = y;
        this.skillId = skillId;
        this.skill = ALL_SKILLS[skillId];
        this.radius = 12;
        this.floatOffset = Math.random() * Math.PI * 2;
        this.markedForDeletion = false;
        this.life = 600;
    }
    update(player) {
        this.life--;
        if (this.life <= 0) { this.markedForDeletion = true; return; }
        const dx = player.x - this.x, dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < player.pickupRange) {
            this.x += (dx / dist) * 6; this.y += (dy / dist) * 6;
            if (dist < player.radius + this.radius) {
                // 添加到共享技能背包
                const skill = ALL_SKILLS[this.skillId];
                if (skill) {
                    player.skillInventory.push({ ...skill, star: 1 });
                    Game.addFloatingText('+' + this.skill.name, this.x, this.y, '#00ff00');
                    this.markedForDeletion = true;
                }
            }
        }
    }
    draw(ctx, camX, camY) {
        const x = this.x - camX, y = this.y - camY;
        const float = Math.sin(Game.frameCount * 0.08 + this.floatOffset) * 4;
        const flash = this.life < 120 ? (Math.sin(Game.frameCount * 0.3) > 0 ? 1 : 0.3) : 1;
        ctx.save(); ctx.globalAlpha = flash;
        const isMagic = this.skill.type === 'magic';
        ctx.fillStyle = isMagic ? 'rgba(255,200,0,0.4)' : 'rgba(100,200,255,0.4)';
        ctx.beginPath(); ctx.arc(x, y + float, this.radius + 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = isMagic ? '#ffcc00' : '#66ccff';
        ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y + float, this.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.font = '14px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000'; ctx.fillText(this.skill.icon, x, y + float);
        ctx.restore();
    }
}

function trySpawnSkillDrop(x, y, player) {
    const dropChance = 0.06 * (player.dropRate || 1);
    if (Math.random() > dropChance) return;
    const skillIds = Object.keys(ALL_SKILLS);
    const randomSkillId = skillIds[Math.floor(Math.random() * skillIds.length)];
    Game.skillDrops = Game.skillDrops || [];
    Game.skillDrops.push(new SkillDrop(x, y, randomSkillId));
}
