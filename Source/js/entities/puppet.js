// --- 傀儡娃娃实体 ---
// 纯视觉实体，提供发射位置

class Puppet extends Entity {
    constructor(owner) {
        super(owner.x, owner.y, 15, '#cc88ff');
        
        this.owner = owner;
        this.weapon = null;  // 绑定的武器，由外部设置
        
        // 飘荡参数
        this.floatAngle = Math.random() * Math.PI * 2;
        this.floatRadius = 50 + Math.random() * 30;
        this.floatSpeed = 0.02 + Math.random() * 0.01;
        this.bobOffset = Math.random() * Math.PI * 2;
        
        // 朝向
        this.facingRight = true;
        
        // 动画
        this.animFrame = 0;
    }
    
    update() {
        if (!this.owner || this.owner.markedForDeletion) {
            this.markedForDeletion = true;
            return;
        }
        
        this.animFrame++;
        
        // 更新飘荡角度
        this.floatAngle += this.floatSpeed;
        
        // 计算目标位置（围绕主人飘荡）
        const offsetX = Math.cos(this.floatAngle) * this.floatRadius;
        const offsetY = Math.sin(this.floatAngle) * this.floatRadius * 0.5;
        const bobY = Math.sin(this.animFrame * 0.1 + this.bobOffset) * 5;
        
        const targetX = this.owner.x + offsetX;
        const targetY = this.owner.y + offsetY + bobY;
        
        // 平滑移动
        const smoothing = 0.08;
        this.x += (targetX - this.x) * smoothing;
        this.y += (targetY - this.y) * smoothing;
        
        // 更新朝向
        if (targetX > this.x + 1) this.facingRight = true;
        if (targetX < this.x - 1) this.facingRight = false;
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        const frame = this.animFrame;
        
        // 浮动效果
        const floatY = Math.sin(frame * 0.08) * 2;
        const drawY = y + floatY;
        
        ctx.save();
        
        // 发光效果
        ctx.shadowColor = '#cc88ff';
        ctx.shadowBlur = 10;
        
        // 身体
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#e0c0ff';
        ctx.beginPath();
        ctx.arc(x, drawY, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // 内部渐变
        const gradient = ctx.createRadialGradient(x - 3, drawY - 3, 0, x, drawY, 12);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        gradient.addColorStop(0.5, 'rgba(200, 150, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(150, 100, 200, 0.2)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, drawY, 12, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        
        // 眼睛
        const eyeOffsetX = this.facingRight ? 3 : -3;
        ctx.fillStyle = '#6633aa';
        ctx.beginPath();
        ctx.arc(x + eyeOffsetX - 3, drawY - 2, 2.5, 0, Math.PI * 2);
        ctx.arc(x + eyeOffsetX + 3, drawY - 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        // 眼睛高光
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x + eyeOffsetX - 2, drawY - 3, 1, 0, Math.PI * 2);
        ctx.arc(x + eyeOffsetX + 4, drawY - 3, 1, 0, Math.PI * 2);
        ctx.fill();
        
        // 小嘴巴
        ctx.fillStyle = '#9966cc';
        ctx.beginPath();
        ctx.arc(x + eyeOffsetX, drawY + 4, 2, 0, Math.PI);
        ctx.fill();
        
        // 魔法粒子环绕
        for (let i = 0; i < 3; i++) {
            const angle = (frame * 0.05) + (i * Math.PI * 2 / 3);
            const px = x + Math.cos(angle) * 18;
            const py = drawY + Math.sin(angle) * 10;
            const size = 2 + Math.sin(frame * 0.1 + i) * 1;
            
            ctx.globalAlpha = 0.6;
            ctx.fillStyle = '#ffaaff';
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
        ctx.restore();
        
        // 显示绑定的武器图标
        if (this.weapon) {
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#fff';
            ctx.fillText(this.weapon.icon, x, drawY - 18);
        }
    }
}

// 傀儡管理器
const PuppetManager = {
    puppets: [],
    
    update() {
        this.puppets.forEach(p => p.update());
        this.puppets = this.puppets.filter(p => !p.markedForDeletion);
    },
    
    draw(ctx, camX, camY) {
        this.puppets.forEach(p => p.draw(ctx, camX, camY));
    },
    
    clear() {
        this.puppets = [];
    },
    
    // 获取武器对应的傀儡（如果有）
    getPuppetForWeapon(weapon) {
        return this.puppets.find(p => p.weapon === weapon) || null;
    },
    
    // 同步傀儡与武器槽
    syncWithWeapons(player) {
        if (!player) return;
        
        // 收集所有需要傀儡的武器
        const weaponsNeedingPuppet = [];
        player.weaponSlots.forEach((weapon, idx) => {
            if (!weapon) return;
            if (idx === player.currentWeaponIndex) return; // 主武器不需要傀儡
            
            // 检查是否有傀儡技能
            const hasPuppetSkill = weapon.slots.some(s => s && s.id === 'puppet') ||
                                   (weapon.specialSlots && weapon.specialSlots.some(s => s && s.id === 'puppet'));
            if (hasPuppetSkill) {
                weaponsNeedingPuppet.push(weapon);
            }
        });
        
        // 移除不再需要的傀儡
        this.puppets = this.puppets.filter(puppet => {
            if (weaponsNeedingPuppet.includes(puppet.weapon)) {
                return true;
            }
            puppet.markedForDeletion = true;
            return false;
        });
        
        // 为需要但没有傀儡的武器创建傀儡
        weaponsNeedingPuppet.forEach(weapon => {
            if (!this.getPuppetForWeapon(weapon)) {
                const puppet = new Puppet(player);
                puppet.weapon = weapon;
                this.puppets.push(puppet);
            }
        });
    }
};
