// --- 飞剑 ---

class FlyingSwordSkill extends MagicSkill {
    constructor() {
        super({
            id: 'flying_sword',
            name: '飞剑',
            icon: '🗡️',
            desc: '挥舞飞剑攻击前方，可抵挡敌人弹道',
            cooldown: 15,
            energyCost: 1
        });
    }
    
    createProjectile(caster, mods) {
        return new FlyingSwordProjectile(caster, mods);
    }
}

class FlyingSwordProjectile extends SkillProjectile {
    constructor(caster, mods) {
        super(caster, mods);
        const star = mods.star || 1;
        this.baseDamage = 12;
        this.damage = this.baseDamage * (mods.damage || 1) * (1 + (star - 1) * 0.5);
        this.speed = 0;
        this.radius = (30 + star * 10) * this.sizeScale;
        
        // 剑的长度：1星50，2星100，3星200
        const swordLengths = { 1: 50, 2: 100, 3: 200 };
        this.swordLength = (swordLengths[star] || 50) * this.sizeScale;
        this.duration = 30;
        this.swingAngle = 0;
        this.swingSpeed = 0.08;
        this.startAngle = mods.angle || 0;
        this.swingRange = Math.PI * 0.8;
        this.swingProgress = 0;
        this.hitList = [];
        this.penetrate = 999;
        this.star = star;
        
        // 残影记录
        this.trailHistory = [];
        this.maxTrailLength = 8;
        
        // 剑的颜色随星级变化
        this.swordColors = ['#88ccff', '#aaffaa', '#ffdd66'];
        this.glowColors = ['#4488ff', '#44ff88', '#ffaa00'];
    }
    
    update() {
        this.swingProgress += this.swingSpeed;
        if (this.swingProgress >= 1) {
            this.markedForDeletion = true;
            return;
        }
        
        this.swingAngle = this.startAngle - this.swingRange / 2 + this.swingRange * this.swingProgress;
        
        this.trailHistory.push(this.swingAngle);
        if (this.trailHistory.length > this.maxTrailLength) {
            this.trailHistory.shift();
        }
        
        const swordOffset = 40;
        this.x = this.caster.x + Math.cos(this.swingAngle) * (this.swordLength * 0.5 + swordOffset);
        this.y = this.caster.y + Math.sin(this.swingAngle) * (this.swordLength * 0.5 + swordOffset);
        
        const effectiveRange = this.swordLength + swordOffset;
        const enemies = SkillProjectile.enemies;
        const bosses = SkillProjectile.bosses;
        
        // 检测敌人碰撞
        enemies.forEach(e => {
            if (!e.markedForDeletion && !this.hitList.includes(e)) {
                const dx = e.x - this.caster.x;
                const dy = e.y - this.caster.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < effectiveRange + e.radius && dist > swordOffset - 5) {
                    const enemyAngle = Math.atan2(dy, dx);
                    let angleDiff = Math.abs(enemyAngle - this.swingAngle);
                    if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;
                    
                    if (angleDiff < 0.5) {
                        e.takeDamage(this.damage, dx / dist * 5, dy / dist * 5, this);
                        this.hitList.push(e);
                        Events.emit(EVENT.PARTICLES, {
                            x: e.x, y: e.y,
                            color: this.swordColors[Math.min(this.star - 1, 2)],
                            count: 5
                        });
                        this.onHit(e);
                    }
                }
            }
        });
        
        // 检测Boss
        bosses.forEach(boss => {
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
                        Events.emit(EVENT.PARTICLES, {
                            x: boss.x, y: boss.y,
                            color: this.swordColors[Math.min(this.star - 1, 2)],
                            count: 8
                        });
                    }
                }
            }
        });
        
        // 抵挡敌人弹道 - 通过事件系统处理
        Events.emit(EVENT.SKILL_CAST, {
            type: 'swordBlock',
            casterX: this.caster.x,
            casterY: this.caster.y,
            effectiveRange: effectiveRange,
            swordOffset: swordOffset,
            swingAngle: this.swingAngle,
            swordColor: this.swordColors[Math.min(this.star - 1, 2)]
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
        
        // 挥舞弧线
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = this.glowColors[colorIdx];
        ctx.lineWidth = Math.min(3 * scale, 8);
        ctx.beginPath();
        ctx.arc(0, 0, swordOffset + this.swordLength * 0.7, this.startAngle - this.swingRange / 2, this.swingAngle);
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        // 剑身
        ctx.rotate(this.swingAngle);
        
        // 外发光
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

// 注册技能
SkillRegistry.registerMagic(new FlyingSwordSkill());
