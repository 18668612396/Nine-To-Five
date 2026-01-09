// --- 技能系统入口 ---
// 提供向后兼容的接口

// 兼容旧的 MAGIC_SKILLS 对象
const MAGIC_SKILLS = {};
const MODIFIER_SKILLS = {};
const PERKS = {};
const ALL_SKILLS = {};

// 初始化技能注册表（在所有技能文件加载后调用）
function initSkillRegistry() {
    // 清空旧数据
    Object.keys(MAGIC_SKILLS).forEach(k => delete MAGIC_SKILLS[k]);
    Object.keys(MODIFIER_SKILLS).forEach(k => delete MODIFIER_SKILLS[k]);
    Object.keys(PERKS).forEach(k => delete PERKS[k]);
    Object.keys(ALL_SKILLS).forEach(k => delete ALL_SKILLS[k]);
    
    // 从注册表填充
    SkillRegistry.getAllMagic().forEach(skill => {
        MAGIC_SKILLS[skill.id] = {
            id: skill.id,
            name: skill.name,
            type: 'magic',
            icon: skill.icon,
            cooldown: skill.cooldown,
            energyCost: skill.energyCost,
            desc: skill.desc,
            create: (caster, mods) => skill.createProjectile(caster, mods),
            getDesc: skill.getDesc ? (star) => skill.getDesc(star) : null
        };
        ALL_SKILLS[skill.id] = MAGIC_SKILLS[skill.id];
    });
    
    SkillRegistry.getAllModifiers().forEach(skill => {
        MODIFIER_SKILLS[skill.id] = {
            id: skill.id,
            name: skill.name,
            type: 'modifier',
            icon: skill.icon,
            desc: skill.desc,
            modify: (mods, star) => skill.modify(mods, star),
            getDesc: skill.getDesc ? (star) => skill.getDesc(star) : null
        };
        ALL_SKILLS[skill.id] = MODIFIER_SKILLS[skill.id];
    });
    
    SkillRegistry.getAllPerks().forEach(perk => {
        PERKS[perk.id] = {
            id: perk.id,
            name: perk.name,
            icon: perk.icon,
            desc: perk.desc,
            stackable: perk.stackable,
            maxLevel: perk.maxLevel,
            apply: (player, level) => perk.apply(player, level)
        };
    });
    
    // 开发环境输出日志
    if (!isProduction) {
        console.log(`技能系统初始化完成: ${Object.keys(MAGIC_SKILLS).length} 主动技能, ${Object.keys(MODIFIER_SKILLS).length} 被动技能, ${Object.keys(PERKS).length} 祝福`);
    }
}

// 技能能量消耗定义
const SKILL_COSTS = {};

function initSkillCosts() {
    // 从注册表获取消耗
    SkillRegistry.getAllMagic().forEach(skill => {
        SKILL_COSTS[skill.id] = skill.energyCost || 1;
    });
    
    // 被动技能统一消耗1
    SkillRegistry.getAllModifiers().forEach(skill => {
        SKILL_COSTS[skill.id] = 1;
    });
}

// 升级选项生成
function getUpgradeOptions() {
    return Object.values(PERKS).map(perk => ({
        id: perk.id,
        name: perk.icon + ' ' + perk.name,
        desc: perk.desc,
        type: 'perk',
        perkId: perk.id
    }));
}

// 升级选项（兼容旧代码）
let UPGRADES = [];

function initUpgrades() {
    UPGRADES = getUpgradeOptions();
}

// 技能掉落
class SkillDrop {
    constructor(x, y, skillId, star = 1) {
        this.x = x;
        this.y = y;
        this.skillId = skillId;
        this.skill = ALL_SKILLS[skillId];
        this.star = star;
        this.radius = 12 + (star - 1) * 2; // 高星级稍大
        this.floatOffset = Math.random() * Math.PI * 2;
        this.markedForDeletion = false;
        this.life = 600;
    }
    
    update(player) {
        this.life--;
        if (this.life <= 0) {
            this.markedForDeletion = true;
            return;
        }
        
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < player.pickupRange) {
            this.x += (dx / dist) * 6;
            this.y += (dy / dist) * 6;
            if (dist < player.radius + this.radius) {
                const skill = ALL_SKILLS[this.skillId];
                if (skill) {
                    player.skillInventory.push({ ...skill, star: this.star });
                    const starText = this.star > 1 ? ` ★${this.star}` : '';
                    const color = this.star >= 2 ? '#ffaa00' : '#00ff00';
                    Game.addFloatingText('+' + this.skill.name + starText, this.x, this.y, color);
                    this.markedForDeletion = true;
                }
            }
        }
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        const float = Math.sin(Game.frameCount * 0.08 + this.floatOffset) * 4;
        const flash = this.life < 120 ? (Math.sin(Game.frameCount * 0.3) > 0 ? 1 : 0.3) : 1;
        
        ctx.save();
        ctx.globalAlpha = flash;
        
        const isMagic = this.skill.type === 'magic';
        // 2星技能有金色光环
        if (this.star >= 2) {
            ctx.fillStyle = 'rgba(255,215,0,0.5)';
            ctx.beginPath();
            ctx.arc(x, y + float, this.radius + 10, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.fillStyle = isMagic ? 'rgba(255,200,0,0.4)' : 'rgba(100,200,255,0.4)';
        ctx.beginPath();
        ctx.arc(x, y + float, this.radius + 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = isMagic ? '#ffcc00' : '#66ccff';
        ctx.strokeStyle = this.star >= 2 ? '#ffd700' : '#000';
        ctx.lineWidth = this.star >= 2 ? 3 : 2;
        ctx.beginPath();
        ctx.arc(x, y + float, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000';
        ctx.fillText(this.skill.icon, x, y + float);
        
        // 显示星级
        if (this.star >= 2) {
            ctx.font = 'bold 10px Arial';
            ctx.fillStyle = '#ffd700';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeText('★' + this.star, x, y + float - this.radius - 5);
            ctx.fillText('★' + this.star, x, y + float - this.radius - 5);
        }
        
        ctx.restore();
    }
}

function trySpawnSkillDrop(x, y, player, bonusChance = 0) {
    const baseChance = 0.06 * (player.dropRate || 1);
    const dropChance = baseChance + bonusChance;
    if (Math.random() > dropChance) return;
    
    const skillIds = Object.keys(ALL_SKILLS);
    const randomSkillId = skillIds[Math.floor(Math.random() * skillIds.length)];
    
    // 15%概率掉落2星技能
    const star = Math.random() < 0.15 ? 2 : 1;
    
    Game.skillDrops = Game.skillDrops || [];
    Game.skillDrops.push(new SkillDrop(x, y, randomSkillId, star));
}
