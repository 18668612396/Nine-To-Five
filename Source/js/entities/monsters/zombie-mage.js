// --- 法师僵尸 (放置旋转激光) ---

class ZombieMage extends Monster {
    static CONFIG = {
        id: 'zombie_mage',
        name: '法师僵尸',
        desc: '会施放旋转激光陷阱的僵尸法师',
        icon: '🧙',
        hp: 20,
        damage: 15,
        speed: 0.5,
        radius: 18,
        color: '#8a6a9a',
        xp: 5,
        gold: 3
    };
    
    // 静态激光陷阱列表（所有法师僵尸共享）
    static laserTraps = [];
    
    constructor(x, y, scaleMult = 1) {
        super(x, y, ZombieMage.CONFIG, scaleMult);
        this.bodyColor = '#8a6a9a';
        this.darkColor = '#6a4a7a';
        this.robeColor = '#5a3a6a';
        
        // 施法相关
        this.castCooldown = 180; // 初始3秒后施法
        this.castInterval = 300; // 5秒一次
        this.castRange = 250;
        this.isCasting = false;
        this.castTime = 0;
        this.castDuration = 30; // 施法动画0.5秒
        this.staffGlow = 0;
    }
    
    update(player) {
        this.animationFrame++;
        
        if (!player) {
            super.update(player);
            return;
        }
        
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // 施法中不移动
        if (this.isCasting) {
            this.castTime++;
            this.staffGlow = Math.min(1, this.staffGlow + 0.1);
            
            if (this.castTime >= this.castDuration) {
                this.placeLaserTrap(player);
                this.isCasting = false;
                this.castTime = 0;
                this.castCooldown = this.castInterval;
            }
            return;
        }
        
        this.staffGlow = Math.max(0, this.staffGlow - 0.05);
        
        // 在范围内尝试施法
        if (dist < this.castRange && this.castCooldown <= 0) {
            this.isCasting = true;
            this.castTime = 0;
        } else {
            // 保持距离，不要太近
            if (dist < 100) {
                // 后退
                this.x -= (dx / dist) * this.speed;
                this.y -= (dy / dist) * this.speed;
            } else if (dist > this.castRange) {
                // 靠近
                super.update(player);
            }
        }
        
        if (this.castCooldown > 0) this.castCooldown--;
    }
    
    placeLaserTrap(player) {
        // 在玩家附近放置激光陷阱
        const offsetX = (Math.random() - 0.5) * 100;
        const offsetY = (Math.random() - 0.5) * 100;
        
        const trap = {
            x: player.x + offsetX,
            y: player.y + offsetY,
            angle: Math.random() * Math.PI * 2,
            rotationSpeed: 0.03 + Math.random() * 0.02,
            length: 120,
            life: 300, // 5秒
            maxLife: 300,
            damage: this.damage * this.scaleMult,
            hitCooldown: 0
        };
        
        ZombieMage.laserTraps.push(trap);
        
        // 施法特效
        Events.emit(EVENT.PARTICLES, {
            x: this.x, y: this.y,
            count: 8,
            color: '#aa66ff',
            spread: 3
        });
        Events.emit(EVENT.PARTICLES, {
            x: trap.x, y: trap.y,
            count: 12,
            color: '#ff66aa',
            spread: 4
        });
    }
    
    // 静态方法：更新所有激光陷阱
    static updateTraps(player) {
        this.laserTraps.forEach(trap => {
            trap.angle += trap.rotationSpeed;
            trap.life--;
            
            if (trap.hitCooldown > 0) trap.hitCooldown--;
            
            // 检测与玩家碰撞
            if (player && trap.hitCooldown <= 0) {
                const laserEndX = trap.x + Math.cos(trap.angle) * trap.length;
                const laserEndY = trap.y + Math.sin(trap.angle) * trap.length;
                
                // 点到线段的距离
                const dist = ZombieMage.pointToLineDistance(
                    player.x, player.y,
                    trap.x, trap.y,
                    laserEndX, laserEndY
                );
                
                if (dist < player.radius + 5) {
                    player.takeDamage(trap.damage);
                    trap.hitCooldown = 30; // 0.5秒内不重复伤害
                    
                    Events.emit(EVENT.PARTICLES, {
                        x: player.x, y: player.y,
                        count: 5,
                        color: '#ff66aa',
                        spread: 3
                    });
                }
            }
        });
        
        // 移除过期的陷阱
        this.laserTraps = this.laserTraps.filter(t => t.life > 0);
    }
    
    // 点到线段的距离
    static pointToLineDistance(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        
        if (lenSq !== 0) param = dot / lenSq;
        
        let xx, yy;
        
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        
        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // 静态方法：绘制所有激光陷阱
    static drawTraps(ctx, camX, camY) {
        this.laserTraps.forEach(trap => {
            const x = trap.x - camX;
            const y = trap.y - camY;
            const alpha = Math.min(1, trap.life / 30); // 淡出效果
            
            ctx.save();
            
            // 中心点
            ctx.fillStyle = `rgba(170, 100, 255, ${alpha * 0.8})`;
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // 激光线
            const endX = x + Math.cos(trap.angle) * trap.length;
            const endY = y + Math.sin(trap.angle) * trap.length;
            
            // 激光光晕
            ctx.strokeStyle = `rgba(255, 100, 170, ${alpha * 0.3})`;
            ctx.lineWidth = 12;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            
            // 激光主体
            ctx.strokeStyle = `rgba(255, 100, 170, ${alpha})`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            
            // 激光核心
            ctx.strokeStyle = `rgba(255, 200, 230, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            
            ctx.restore();
        });
    }
    
    // 清除所有陷阱
    static clearTraps() {
        this.laserTraps = [];
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        const r = this.radius;
        const bounce = Math.sin(this.animationFrame * 0.08) * 2;
        const float = Math.sin(this.animationFrame * 0.05) * 3; // 漂浮效果
        
        ctx.save();
        this.beginDraw(ctx);
        ctx.translate(x, y + bounce - float);
        
        // 阴影
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(0, r * 0.9 + float, r * 0.6, r * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 法杖
        ctx.save();
        ctx.rotate(-0.3);
        ctx.fillStyle = '#5a3a2a';
        ctx.fillRect(r * 0.8, -r * 0.8, 4, r * 1.8);
        // 法杖顶端宝石
        const gemGlow = this.staffGlow;
        if (gemGlow > 0) {
            ctx.fillStyle = `rgba(170, 100, 255, ${gemGlow * 0.5})`;
            ctx.beginPath();
            ctx.arc(r * 0.8 + 2, -r * 0.9, 12, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = '#aa66ff';
        ctx.beginPath();
        ctx.arc(r * 0.8 + 2, -r * 0.9, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ddaaff';
        ctx.beginPath();
        ctx.arc(r * 0.8, -r * 0.95, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // 长袍
        ctx.fillStyle = this.robeColor;
        ctx.beginPath();
        ctx.moveTo(-r * 0.8, -r * 0.3);
        ctx.quadraticCurveTo(-r * 1.1, r * 0.5, -r * 0.6, r * 1.1);
        ctx.lineTo(r * 0.6, r * 1.1);
        ctx.quadraticCurveTo(r * 1.1, r * 0.5, r * 0.8, -r * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // 身体
        ctx.fillStyle = this.bodyColor;
        ctx.strokeStyle = this.darkColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.85, r * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // 兜帽
        ctx.fillStyle = this.robeColor;
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.5, r * 0.7, r * 0.5, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-r * 0.7, -r * 0.5);
        ctx.quadraticCurveTo(0, -r * 1.3, r * 0.7, -r * 0.5);
        ctx.fill();
        
        // 发光的眼睛
        const eyeGlow = 0.5 + this.staffGlow * 0.5;
        ctx.fillStyle = `rgba(170, 100, 255, ${eyeGlow})`;
        ctx.shadowColor = '#aa66ff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.ellipse(-r * 0.25, -r * 0.1, r * 0.12, r * 0.15, 0, 0, Math.PI * 2);
        ctx.ellipse(r * 0.25, -r * 0.1, r * 0.12, r * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // 施法特效
        if (this.isCasting) {
            const castProgress = this.castTime / this.castDuration;
            ctx.strokeStyle = `rgba(170, 100, 255, ${castProgress})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, r * 1.5 * castProgress, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // 血条
        if (this.hp < this.maxHp) {
            const barWidth = r * 2;
            const barHeight = 4;
            const hpPct = this.hp / this.maxHp;
            ctx.fillStyle = '#333';
            ctx.fillRect(-barWidth/2, -r - 18, barWidth, barHeight);
            ctx.fillStyle = '#aa66ff';
            ctx.fillRect(-barWidth/2, -r - 18, barWidth * hpPct, barHeight);
        }
        
        this.endDraw(ctx, x, y, r);
        ctx.restore();
    }
}

Monster.register('zombie_mage', ZombieMage.CONFIG, ZombieMage);
