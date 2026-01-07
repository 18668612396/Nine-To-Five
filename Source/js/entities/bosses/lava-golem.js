// --- 熔岩巨人 Boss ---

class LavaGolem extends Boss {
    static CONFIG = {
        id: 'lava_golem',
        name: '熔岩巨人',
        hp: 6000,
        damage: 20,
        speed: 0.6,
        radius: 70,
        color: '#FF4500',
        xp: 600,
        gold: 250
    };
    
    constructor(x, y) {
        super(x, y, LavaGolem.CONFIG);
        this.fireTrails = [];
        this.isCharging = false;
        this.chargeTarget = null;
        this.chargeTimer = 0;
        this.shockwaveRadius = 0;
        this.showShockwave = false;
    }
    
    onPhaseChange(phase) {
        if (phase === 2) {
            Events.emit(EVENT.FLOATING_TEXT, {
                text: '🔥 熔岩沸腾!',
                x: this.x, y: this.y - 80,
                color: '#ff6600'
            });
        } else if (phase === 3) {
            this.isEnraged = true;
            Events.emit(EVENT.FLOATING_TEXT, {
                text: '🔥🔥 狂暴模式!',
                x: this.x, y: this.y - 80,
                color: '#ff0000'
            });
        }
    }
    
    performAttacks(player) {
        // 熔岩喷射
        if (this.attackCooldown <= 0 && !this.isCharging) {
            this.lavaSpray(player);
            this.attackCooldown = this.isEnraged ? 40 : 70;
        }
        
        // 地震冲击
        if (this.specialCooldown <= 0 && !this.isCharging) {
            this.earthquakeSlam(player);
            this.specialCooldown = this.phase >= 2 ? 180 : 240;
        }
        
        // 火焰冲刺
        if (this.summonCooldown <= 0 && this.phase >= 2 && !this.isCharging) {
            this.startCharge(player);
            this.summonCooldown = 300;
        }
        
        this.updateCharge(player);
        this.updateFireTrails(player);
        
        if (this.showShockwave) {
            this.shockwaveRadius += 8;
            if (this.shockwaveRadius > 200) {
                this.showShockwave = false;
            }
        }
        
        if (this.isCharging && this.animationFrame % 5 === 0) {
            this.fireTrails.push({
                x: this.x, y: this.y, life: 120, radius: 25
            });
        }
    }
    
    lavaSpray(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const baseAngle = Math.atan2(dy, dx);
        const count = this.phase >= 3 ? 5 : 3;
        const spread = 0.3;
        
        for (let i = 0; i < count; i++) {
            const angle = baseAngle + (i - (count-1)/2) * spread;
            const proj = new BossProjectile(
                this.x, this.y,
                Math.cos(angle) * 5, Math.sin(angle) * 5,
                12, '#ff4500', this.damage * 0.6, 'lava'
            );
            Events.emit(EVENT.PROJECTILE_FIRE, { projectile: proj, isBoss: true });
        }
    }
    
    earthquakeSlam(player) {
        this.showShockwave = true;
        this.shockwaveRadius = 0;
        this.pendingShockwavePlayer = player;
        
        setTimeout(() => {
            if (!this.pendingShockwavePlayer) return;
            const dx = this.pendingShockwavePlayer.x - this.x;
            const dy = this.pendingShockwavePlayer.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                const damage = this.damage * (1 - dist / 200);
                this.pendingShockwavePlayer.takeDamage(damage);
            }
        }, 200);
        
        Events.emit(EVENT.SCREEN_SHAKE, { intensity: 8, duration: 20 });
    }
    
    startCharge(player) {
        this.isCharging = true;
        this.chargeTarget = { x: player.x, y: player.y };
        this.chargeTimer = 60;
        Events.emit(EVENT.FLOATING_TEXT, {
            text: '⚡ 冲锋!',
            x: this.x, y: this.y - 80,
            color: '#ff6600'
        });
    }
    
    updateCharge(player) {
        if (!this.isCharging) return;
        
        this.chargeTimer--;
        
        if (this.chargeTimer > 0) {
            const dx = this.chargeTarget.x - this.x;
            const dy = this.chargeTarget.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 10) {
                this.x += (dx / dist) * 8;
                this.y += (dy / dist) * 8;
            }
            
            const playerDx = player.x - this.x;
            const playerDy = player.y - this.y;
            const playerDist = Math.sqrt(playerDx * playerDx + playerDy * playerDy);
            if (playerDist < this.radius + player.radius) {
                player.takeDamage(this.damage * 1.5);
                this.isCharging = false;
            }
        } else {
            this.isCharging = false;
        }
    }
    
    updateFireTrails(player) {
        this.fireTrails.forEach(trail => {
            trail.life--;
            
            if (trail.life > 0 && Enemy.frameCount % 30 === 0) {
                const dx = player.x - trail.x;
                const dy = player.y - trail.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < trail.radius + player.radius) {
                    player.takeDamage(5);
                }
            }
        });
        this.fireTrails = this.fireTrails.filter(t => t.life > 0);
    }

    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        
        // 绘制火焰路径
        this.fireTrails.forEach(trail => {
            const tx = trail.x - camX;
            const ty = trail.y - camY;
            const alpha = trail.life / 120;
            
            const gradient = ctx.createRadialGradient(tx, ty, 0, tx, ty, trail.radius);
            gradient.addColorStop(0, `rgba(255, 100, 0, ${alpha * 0.8})`);
            gradient.addColorStop(0.5, `rgba(255, 50, 0, ${alpha * 0.5})`);
            gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(tx, ty, trail.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // 绘制冲击波
        if (this.showShockwave) {
            ctx.strokeStyle = `rgba(255, 100, 0, ${1 - this.shockwaveRadius / 200})`;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(x, y, this.shockwaveRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // 阴影
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(x, y + this.radius * 0.7, this.radius * 1.1, this.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 腿部
        const legOffset = Math.sin(this.animationFrame * 0.1) * 5;
        ctx.fillStyle = '#4a4a4a';
        ctx.beginPath();
        ctx.moveTo(x - 30, y + 20);
        ctx.lineTo(x - 40, y + this.radius - 10 + legOffset);
        ctx.lineTo(x - 20, y + this.radius - 10 + legOffset);
        ctx.lineTo(x - 15, y + 20);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(x + 30, y + 20);
        ctx.lineTo(x + 40, y + this.radius - 10 - legOffset);
        ctx.lineTo(x + 20, y + this.radius - 10 - legOffset);
        ctx.lineTo(x + 15, y + 20);
        ctx.fill();
        
        // 身体
        ctx.fillStyle = '#5a5a5a';
        ctx.beginPath();
        ctx.moveTo(x - 45, y + 30);
        ctx.lineTo(x - 50, y - 20);
        ctx.lineTo(x - 30, y - 50);
        ctx.lineTo(x + 30, y - 50);
        ctx.lineTo(x + 50, y - 20);
        ctx.lineTo(x + 45, y + 30);
        ctx.closePath();
        ctx.fill();
        
        // 熔岩裂缝
        const glowIntensity = this.isEnraged ? 1 : 0.6 + Math.sin(this.animationFrame * 0.1) * 0.4;
        ctx.strokeStyle = `rgba(255, ${100 + glowIntensity * 100}, 0, ${glowIntensity})`;
        ctx.lineWidth = 4;
        
        ctx.beginPath();
        ctx.moveTo(x - 30, y + 20);
        ctx.lineTo(x - 20, y - 10);
        ctx.lineTo(x - 35, y - 30);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x + 25, y + 15);
        ctx.lineTo(x + 15, y - 5);
        ctx.lineTo(x + 30, y - 25);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x - 5, y + 25);
        ctx.lineTo(x, y - 20);
        ctx.lineTo(x + 5, y - 40);
        ctx.stroke();
        
        // 手臂
        const armSwing = Math.sin(this.animationFrame * 0.08) * 10;
        ctx.fillStyle = '#4a4a4a';
        
        ctx.beginPath();
        ctx.moveTo(x - 50, y - 10);
        ctx.lineTo(x - 70 - armSwing, y + 20);
        ctx.lineTo(x - 80 - armSwing, y + 15);
        ctx.lineTo(x - 65, y - 15);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(x + 50, y - 10);
        ctx.lineTo(x + 70 + armSwing, y + 20);
        ctx.lineTo(x + 80 + armSwing, y + 15);
        ctx.lineTo(x + 65, y - 15);
        ctx.fill();
        
        // 头部火焰
        const flameHeight = 30 + Math.sin(this.animationFrame * 0.2) * 10;
        const gradient = ctx.createRadialGradient(x, y - 60, 5, x, y - 60, flameHeight);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, '#ffff00');
        gradient.addColorStop(0.6, '#ff6600');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y - 60, flameHeight, 0, Math.PI * 2);
        ctx.fill();
        
        // 火焰尖端
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
            const tipX = x + Math.cos(angle + this.animationFrame * 0.1) * 15;
            const tipY = y - 60 + Math.sin(angle + this.animationFrame * 0.1) * 15 - 20;
            
            ctx.fillStyle = '#ff6600';
            ctx.beginPath();
            ctx.moveTo(tipX - 5, y - 50);
            ctx.lineTo(tipX, tipY - Math.random() * 10);
            ctx.lineTo(tipX + 5, y - 50);
            ctx.fill();
        }
        
        // 眼睛
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x - 15, y - 30, 6, 0, Math.PI * 2);
        ctx.arc(x + 15, y - 30, 6, 0, Math.PI * 2);
        ctx.fill();
        
        this.drawHealthBar(ctx, camX, camY);
    }
}

// 注册Boss
Boss.register('lava_golem', LavaGolem.CONFIG, LavaGolem);
