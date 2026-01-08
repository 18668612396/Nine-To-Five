// --- 玩家基类 ---
// 负责战斗逻辑，派生类负责绘制

class Player extends Entity {
    static frameCount = 0; // 由外部更新
    
    constructor(charType, config = {}) {
        super(0, 0, 20, config.color || '#fff');
        this.charType = charType;
        
        // 基础属性（统一）
        this.speed = 4;
        this.maxHp = 20;
        this.hp = this.maxHp;
        this.regen = 0;
        this.pickupRange = 100;
        
        // 战斗属性
        this.damageMult = 1.0;
        this.cooldownMult = 1.0;
        this.projSpeed = 1.0;
        this.knockback = 1.0;
        this.critChance = 0;
        this.vampirism = 0;
        this.xpMult = 1;
        this.damageAura = 0;
        this.extraProjectiles = 0;
        this.dropRate = 1;
        this.shield = 0;
        this.shieldOnKill = 0;
        this.energyOnHit = 0;

        // 武器槽系统
        this.weaponSlots = [null, null, null];
        this.currentWeaponIndex = 0;
        this.weaponInventory = [];
        
        // 共享技能背包
        this.skillInventory = [];
        
        // 初始武器
        if (typeof Weapon !== 'undefined' && typeof WEAPON_TEMPLATES !== 'undefined') {
            const starterWeapon = new Weapon(WEAPON_TEMPLATES.apprentice_wand, []);
            this.weaponSlots[0] = starterWeapon;
            this.weapon = starterWeapon;
        } else {
            this.weapon = null;
        }
        
        // 兼容旧代码
        this.wand = this.weapon;
        
        // 祝福系统
        if (typeof PerkManager !== 'undefined') {
            this.perkManager = new PerkManager(this);
        }

        this.facingRight = true;
        
        // 绘制相关状态（供子类使用）
        this.lastTailX = -8;
        this.lastTailY = 8;
        this.lastTailAngle = Math.PI / 3;
    }

    // 更新（需要传入输入和敌人列表）
    update(input, enemies = []) {
        // 移动
        this.x += input.x * this.speed;
        this.y += input.y * this.speed;
        
        if (input.x > 0) this.facingRight = true;
        if (input.x < 0) this.facingRight = false;

        // 生命恢复
        if (this.regen > 0 && this.hp < this.maxHp) {
            this.hp += this.regen / 60;
            if (this.hp > this.maxHp) this.hp = this.maxHp;
        }
        
        // 献祭 - 伤害光环
        if (this.damageAura > 0 && Player.frameCount % 30 === 0) {
            this.updateDamageAura(enemies);
        }

        // 同步傀儡
        if (typeof PuppetManager !== 'undefined') {
            PuppetManager.syncWithWeapons(this);
        }

        // 更新所有武器槽
        this.updateAllWeapons(enemies);
    }
    
    // 更新所有武器
    updateAllWeapons(enemies) {
        this.weaponSlots.forEach((weapon, idx) => {
            if (!weapon) return;
            
            const isMainWeapon = idx === this.currentWeaponIndex;
            
            // 检查是否有傀儡技能
            const hasPuppetSkill = weapon.slots.some(s => s && s.id === 'puppet') ||
                                   (weapon.specialSlots && weapon.specialSlots.some(s => s && s.id === 'puppet'));
            
            // 只有主武器或有傀儡技能的武器才发射
            if (!isMainWeapon && !hasPuppetSkill) {
                // 仍然回复能量，但不发射
                if (weapon.energy < weapon.maxEnergy) {
                    weapon.energy = Math.min(weapon.maxEnergy, weapon.energy + weapon.getEnergyRegen() / 60);
                }
                return;
            }
            
            // 确定发射位置
            let caster = this; // 默认从玩家位置发射
            
            if (!isMainWeapon && hasPuppetSkill && typeof PuppetManager !== 'undefined') {
                // 从傀儡位置发射
                const puppet = PuppetManager.getPuppetForWeapon(weapon);
                if (puppet) {
                    caster = {
                        x: puppet.x,
                        y: puppet.y,
                        facingRight: puppet.facingRight,
                        damageMult: this.damageMult,
                        projSpeed: this.projSpeed,
                        cooldownMult: this.cooldownMult,
                        knockback: this.knockback,
                        critChance: this.critChance,
                        extraProjectiles: this.extraProjectiles,
                        hp: this.hp,
                        maxHp: this.maxHp
                    };
                }
            }
            
            // 非主武器有傀儡技能时，能量回复减半
            if (!isMainWeapon && hasPuppetSkill) {
                const puppetSkill = weapon.slots.find(s => s && s.id === 'puppet') ||
                                    (weapon.specialSlots && weapon.specialSlots.find(s => s && s.id === 'puppet'));
                const star = puppetSkill ? (puppetSkill.star || 1) : 1;
                const energyMult = { 1: 0.5, 2: 0.6, 3: 0.7 }[star] || 0.5;
                
                const originalRegen = weapon.baseEnergyRegen;
                weapon.baseEnergyRegen = originalRegen * energyMult;
                weapon.update(caster, enemies);
                weapon.baseEnergyRegen = originalRegen;
            } else {
                weapon.update(caster, enemies);
            }
        });
    }
    
    updateDamageAura(enemies) {
        const auraRadius = 60 + this.damageAura * 2;
        enemies.forEach(e => {
            if (!e.markedForDeletion) {
                const dist = Math.sqrt((e.x - this.x) ** 2 + (e.y - this.y) ** 2);
                if (dist < auraRadius) {
                    e.takeDamage(this.damageAura, 0, 0);
                    Events.emit(EVENT.PARTICLES, {
                        x: e.x, y: e.y,
                        count: 5,
                        color: '#ff4400',
                        altColor: '#ffaa00'
                    });
                }
            }
        });
    }
    
    // 受伤
    takeDamage(amount) {
        amount = Math.round(amount);
        
        // 护盾吸收
        if (this.shield > 0) {
            const absorbed = Math.min(this.shield, amount);
            this.shield -= absorbed;
            amount -= absorbed;
            if (absorbed > 0) {
                Events.emit(EVENT.FLOATING_TEXT, {
                    text: '护盾 -' + absorbed,
                    x: this.x, y: this.y - 40,
                    color: '#66ccff'
                });
            }
        }
        
        if (amount > 0) {
            this.hp -= amount;
            
            // 触发受伤闪烁
            this.triggerDamageFlash();
            
            Events.emit(EVENT.FLOATING_TEXT, {
                text: '-' + amount,
                x: this.x, y: this.y - 30,
                color: '#ff4444'
            });
            Audio.play('hurt');
            
            Events.emit(EVENT.PLAYER_DAMAGE, {
                player: this,
                amount
            });
            
            // 通知武器受伤
            if (this.weapon) {
                this.weapon.onHurt();
            }
        }
        
        if (this.hp <= 0) {
            this.die();
        }
    }
    
    die() {
        Audio.play('death');
        Events.emit(EVENT.PLAYER_DEATH, { player: this });
    }
    
    // 切换武器
    switchWeapon(index) {
        if (index < 0 || index >= this.weaponSlots.length) return;
        if (!this.weaponSlots[index]) return;
        
        this.currentWeaponIndex = index;
        this.weapon = this.weaponSlots[index];
        this.wand = this.weapon;
        Events.emit(EVENT.FLOATING_TEXT, {
            text: `切换: ${this.weapon.icon} ${this.weapon.name}`,
            x: this.x, y: this.y - 40,
            color: '#ffd700'
        });
        Audio.play('pickup');
    }
    
    // 下一把武器
    nextWeapon() {
        let nextIndex = this.currentWeaponIndex;
        for (let i = 1; i <= this.weaponSlots.length; i++) {
            const idx = (this.currentWeaponIndex + i) % this.weaponSlots.length;
            if (this.weaponSlots[idx]) {
                nextIndex = idx;
                break;
            }
        }
        if (nextIndex !== this.currentWeaponIndex) {
            this.switchWeapon(nextIndex);
        }
    }
    
    // 装备武器到槽位
    equipWeaponToSlot(weaponIndex, slotIndex) {
        if (weaponIndex < 0 || weaponIndex >= this.weaponInventory.length) return false;
        if (slotIndex < 0 || slotIndex >= this.weaponSlots.length) return false;
        
        const newWeapon = this.weaponInventory[weaponIndex];
        const oldWeapon = this.weaponSlots[slotIndex];
        
        if (oldWeapon) {
            // 把旧武器上的技能放回背包
            oldWeapon.slots.forEach(skill => {
                if (skill) {
                    this.skillInventory.push(skill);
                }
            });
            oldWeapon.slots = new Array(oldWeapon.slotCount).fill(null);
            
            // 特殊槽的技能也放回背包
            if (oldWeapon.specialSlots) {
                oldWeapon.specialSlots.forEach(skill => {
                    if (skill) {
                        this.skillInventory.push(skill);
                    }
                });
                const baseSpecialSlots = oldWeapon.specialSlot ? (oldWeapon.specialSlot.slots || 0) : 0;
                oldWeapon.specialSlots = new Array(baseSpecialSlots).fill(null);
            }
            
            // 重置槽位数量（因为拓展技能被移除了）
            oldWeapon.slotCount = oldWeapon.baseSlotCount;
            oldWeapon.slots = new Array(oldWeapon.baseSlotCount).fill(null);
            
            this.weaponInventory.push(oldWeapon);
        }
        
        this.weaponSlots[slotIndex] = newWeapon;
        this.weaponInventory.splice(weaponIndex, 1);
        
        if (slotIndex === this.currentWeaponIndex) {
            this.weapon = newWeapon;
            this.wand = newWeapon;
        }
        
        return true;
    }
    
    // 卸下武器到背包
    unequipWeapon(slotIndex) {
        if (slotIndex < 0 || slotIndex >= this.weaponSlots.length) return false;
        if (!this.weaponSlots[slotIndex]) return false;
        
        const equippedCount = this.weaponSlots.filter(w => w !== null).length;
        if (equippedCount <= 1) return false;
        
        const weapon = this.weaponSlots[slotIndex];
        
        // 把武器上的技能放回背包
        weapon.slots.forEach(skill => {
            if (skill) {
                this.skillInventory.push(skill);
            }
        });
        weapon.slots = new Array(weapon.slotCount).fill(null);
        
        // 特殊槽的技能也放回背包
        if (weapon.specialSlots) {
            weapon.specialSlots.forEach(skill => {
                if (skill) {
                    this.skillInventory.push(skill);
                }
            });
            const baseSpecialSlots = weapon.specialSlot ? (weapon.specialSlot.slots || 0) : 0;
            weapon.specialSlots = new Array(baseSpecialSlots).fill(null);
        }
        
        // 重置槽位数量
        weapon.slotCount = weapon.baseSlotCount;
        weapon.slots = new Array(weapon.baseSlotCount).fill(null);
        
        this.weaponInventory.push(weapon);
        this.weaponSlots[slotIndex] = null;
        
        if (slotIndex === this.currentWeaponIndex) {
            this.nextWeapon();
        }
        
        return true;
    }

    // 绘制效果层（光环等）- 子类可调用
    drawEffects(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        
        // 献祭火焰光环
        if (this.damageAura > 0) {
            const auraRadius = 60 + this.damageAura * 2;
            const pulseAlpha = 0.12 + Math.sin(Player.frameCount * 0.15) * 0.05;
            
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, auraRadius);
            gradient.addColorStop(0, `rgba(255, 50, 0, 0)`);
            gradient.addColorStop(0.5, `rgba(255, 80, 0, ${pulseAlpha * 0.3})`);
            gradient.addColorStop(0.8, `rgba(255, 50, 0, ${pulseAlpha * 0.6})`);
            gradient.addColorStop(1, `rgba(200, 0, 0, ${pulseAlpha})`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, auraRadius, 0, Math.PI * 2);
            ctx.fill();
            
            const edgeAlpha = 0.3 + Math.sin(Player.frameCount * 0.2) * 0.15;
            ctx.strokeStyle = `rgba(255, 100, 0, ${edgeAlpha})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.lineDashOffset = -Player.frameCount * 0.5;
            ctx.beginPath();
            ctx.arc(x, y, auraRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        // 护盾光环
        if (this.shield > 0) {
            const shieldAlpha = 0.2 + Math.sin(Player.frameCount * 0.15) * 0.1;
            ctx.strokeStyle = `rgba(100, 200, 255, ${shieldAlpha})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x, y, this.radius + 8, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    // 绘制 - 子类重写
    draw(ctx, camX, camY) {
        // 更新闪烁状态
        this.updateDamageFlash();
        
        this.drawEffects(ctx, camX, camY);
        // 子类实现具体角色绘制
    }
    
    // 应用自带祝福 - 子类重写
    applyStartPerks() {
        // 子类实现
    }
    
    // 初始化（游戏开始时调用）
    init() {
        this.applyStartPerks();
    }
}

// 玩家注册表
Player.types = {};

Player.register = function(id, playerClass) {
    Player.types[id] = playerClass;
};

Player.create = function(charType) {
    const PlayerClass = Player.types[charType];
    if (PlayerClass) {
        return new PlayerClass();
    }
    console.warn('未知角色类型:', charType);
    return null;
};

Player.getAllTypes = function() {
    return Object.keys(Player.types);
};
