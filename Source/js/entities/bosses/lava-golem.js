// --- 熔岩巨人 Boss ---

class LavaGolem extends Boss {
    static CONFIG = {
        id: 'lava_golem',
        name: '熔岩巨人',
        desc: 'Boss - 喷射火焰',
        icon: '🔥',
        hp: 6000,
        damage: 20,
        speed: 0.6,
        radius: 70,
        color: '#FF4500',
        xp: 600,
        gold: 250
    };
    
    constructor(x, y, scaleMult = 1) {
        super(x, y, LavaGolem.CONFIG, scaleMult);
        this.fireTrails = [];
        this.isCharging = false;
        this.chargeTarget = null;
        this.chargeTimer = 0;
        this.shockwaveRadius = 0;
        this.showShockwave = false;
        
        // 攻击预警系统
        this.warnings = [];  // { type, x, y, angle, radius, progress, maxTime, ... }
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
        // 更新预警
        this.updateWarnings();
        
        // 熔岩喷射 - 添加扇形预警
        if (this.attackCooldown <= 0 && !this.isCharging) {
            this.startLavaSprayWarning(player);
            this.attackCooldown = this.isEnraged ? 40 : 70;
        }
        
        // 地震冲击 - 添加圆形预警
        if (this.specialCooldown <= 0 && !this.isCharging) {
            this.startEarthquakeWarning(player);
            this.specialCooldown = this.phase >= 2 ? 180 : 240;
        }
        
        // 火焰冲刺 - 添加线形预警
        if (this.summonCooldown <= 0 && this.phase >= 2 && !this.isCharging) {
            this.startChargeWarning(player);
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
    
    // 预警系统
    updateWarnings() {
        this.warnings.forEach(w => {
            w.progress++;
            if (w.progress >= w.maxTime) {
                // 预警结束，执行攻击
                if (w.onComplete) w.onComplete();
                w.done = true;
            }
        });
        this.warnings = this.warnings.filter(w => !w.done);
    }
    
    // 熔岩喷射预警
    startLavaSprayWarning(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const angle = Math.atan2(dy, dx);
        const count = this.phase >= 3 ? 5 : 3;
        const spread = 0.3 * count;
        
        this.warnings.push({
            type: 'cone',
            x: this.x,
            y: this.y,
            angle: angle,
            spread: spread,
            radius: 250,
            progress: 0,
            maxTime: 30,
            color: '#ff4500',
            onComplete: () => this.lavaSpray(player)
        });
    }
    
    // 地震预警
    startEarthquakeWarning(player) {
        this.warnings.push({
            type: 'circle',
            x: this.x,
            y: this.y,
            radius: 150,
            progress: 0,
            maxTime: 45,
            color: '#ff6600',
            onComplete: () => this.earthquakeSlam(player)
        });
    }
    
    // 冲刺预警
    startChargeWarning(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        this.warnings.push({
            type: 'line',
            x: this.x,
            y: this.y,
            angle: angle,
            length: dist + 100,
            width: this.radius * 2,
            progress: 0,
            maxTime: 40,
            color: '#ff0000',
            targetX: player.x,
            targetY: player.y,
            onComplete: () => this.startCharge({ x: player.x, y: player.y })
        });
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
    
    startCharge(target) {
        this.isCharging = true;
        this.chargeTarget = { x: target.x, y: target.y };
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
        const r = this.radius;
        const bounce = Math.sin(this.animationFrame * 0.08) * 3;
        const wobble = Math.sin(this.animationFrame * 0.06) * 2;
        
        // 绘制攻击预警
        this.drawWarnings(ctx, camX, camY);
        
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
        
        ctx.save();
        ctx.translate(x, y + bounce);
        
        // 阴影
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(0, r * 0.6, r * 0.9, r * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 小手臂 (岩浆滴落效果)
        const armWave = Math.sin(this.animationFrame * 0.1) * 0.15;
        ctx.fillStyle = '#8B4513';
        ctx.strokeStyle = '#5a3010';
        ctx.lineWidth = 2;
        
        // 左手
        ctx.save();
        ctx.rotate(-0.5 + armWave);
        ctx.beginPath();
        ctx.ellipse(-r * 0.9, r * 0.1, r * 0.25, r * 0.35, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // 手上的熔岩
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.ellipse(-r * 0.9, r * 0.1, r * 0.12, r * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // 右手
        ctx.save();
        ctx.rotate(0.5 - armWave);
        ctx.beginPath();
        ctx.fillStyle = '#8B4513';
        ctx.ellipse(r * 0.9, r * 0.1, r * 0.25, r * 0.35, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.ellipse(r * 0.9, r * 0.1, r * 0.12, r * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // 身体 - 圆润的岩石
        const bodyGradient = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r);
        bodyGradient.addColorStop(0, '#8B5A2B');
        bodyGradient.addColorStop(0.5, '#6B4423');
        bodyGradient.addColorStop(1, '#4a3020');
        
        ctx.fillStyle = bodyGradient;
        ctx.strokeStyle = '#3a2010';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, r + wobble, r - wobble * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // 熔岩裂缝 (发光效果)
        const glowIntensity = this.isEnraged ? 1 : 0.6 + Math.sin(this.animationFrame * 0.1) * 0.4;
        ctx.strokeStyle = `rgba(255, ${Math.floor(150 * glowIntensity)}, 0, ${glowIntensity})`;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        
        // 裂缝1
        ctx.beginPath();
        ctx.moveTo(-r * 0.5, r * 0.3);
        ctx.quadraticCurveTo(-r * 0.3, 0, -r * 0.4, -r * 0.4);
        ctx.stroke();
        
        // 裂缝2
        ctx.beginPath();
        ctx.moveTo(r * 0.4, r * 0.4);
        ctx.quadraticCurveTo(r * 0.2, r * 0.1, r * 0.5, -r * 0.3);
        ctx.stroke();
        
        // 裂缝3 (中间)
        ctx.beginPath();
        ctx.moveTo(0, r * 0.5);
        ctx.quadraticCurveTo(-r * 0.1, 0, r * 0.1, -r * 0.5);
        ctx.stroke();
        
        // 熔岩发光核心
        const coreGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.4);
        coreGlow.addColorStop(0, `rgba(255, 200, 50, ${glowIntensity * 0.3})`);
        coreGlow.addColorStop(1, 'rgba(255, 100, 0, 0)');
        ctx.fillStyle = coreGlow;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // 眼睛 (愤怒的火焰眼)
        const eyeGlow = this.isEnraged ? '#ff0000' : '#ff6600';
        
        // 左眼
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.ellipse(-r * 0.3, -r * 0.2, r * 0.18, r * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = eyeGlow;
        ctx.shadowColor = eyeGlow;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(-r * 0.3, -r * 0.2, r * 0.12, r * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(-r * 0.3, -r * 0.22, r * 0.05, 0, Math.PI * 2);
        ctx.fill();
        
        // 右眼
        ctx.fillStyle = '#111';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.ellipse(r * 0.3, -r * 0.2, r * 0.18, r * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = eyeGlow;
        ctx.shadowColor = eyeGlow;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(r * 0.3, -r * 0.2, r * 0.12, r * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(r * 0.3, -r * 0.22, r * 0.05, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        
        // 愤怒的眉毛
        ctx.strokeStyle = '#3a2010';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-r * 0.5, -r * 0.45);
        ctx.lineTo(-r * 0.15, -r * 0.35);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(r * 0.5, -r * 0.45);
        ctx.lineTo(r * 0.15, -r * 0.35);
        ctx.stroke();
        
        // 嘴巴 (熔岩口)
        ctx.fillStyle = '#220000';
        ctx.beginPath();
        ctx.ellipse(0, r * 0.25, r * 0.25, r * 0.15, 0, 0, Math.PI);
        ctx.fill();
        
        // 嘴里的熔岩
        ctx.fillStyle = `rgba(255, ${Math.floor(100 + glowIntensity * 100)}, 0, ${glowIntensity})`;
        ctx.beginPath();
        ctx.ellipse(0, r * 0.28, r * 0.18, r * 0.08, 0, 0, Math.PI);
        ctx.fill();
        
        // 头顶火焰
        const flameCount = 5;
        for (let i = 0; i < flameCount; i++) {
            const flameAngle = (i / flameCount) * Math.PI - Math.PI / 2;
            const flameX = Math.cos(flameAngle) * r * 0.5;
            const flameBaseY = -r * 0.8;
            const flameHeight = r * 0.4 + Math.sin(this.animationFrame * 0.2 + i) * r * 0.15;
            
            const flameGrad = ctx.createLinearGradient(flameX, flameBaseY, flameX, flameBaseY - flameHeight);
            flameGrad.addColorStop(0, '#ff6600');
            flameGrad.addColorStop(0.5, '#ffcc00');
            flameGrad.addColorStop(1, 'rgba(255, 255, 200, 0)');
            
            ctx.fillStyle = flameGrad;
            ctx.beginPath();
            ctx.moveTo(flameX - r * 0.1, flameBaseY);
            ctx.quadraticCurveTo(flameX - r * 0.05, flameBaseY - flameHeight * 0.5, flameX, flameBaseY - flameHeight);
            ctx.quadraticCurveTo(flameX + r * 0.05, flameBaseY - flameHeight * 0.5, flameX + r * 0.1, flameBaseY);
            ctx.fill();
        }
        
        ctx.restore();
        
        // 血条
        this.drawHealthBar(ctx, camX, camY);
    }
    
    // 绘制攻击预警
    drawWarnings(ctx, camX, camY) {
        this.warnings.forEach(w => {
            const wx = w.x - camX;
            const wy = w.y - camY;
            const progress = w.progress / w.maxTime;
            const alpha = 0.3 + progress * 0.2;
            
            ctx.save();
            
            if (w.type === 'circle') {
                // 圆形预警 - 外圈
                ctx.strokeStyle = `rgba(255, 100, 0, ${alpha})`;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(wx, wy, w.radius, 0, Math.PI * 2);
                ctx.stroke();
                
                // 填充进度
                ctx.fillStyle = `rgba(255, 50, 0, ${alpha * 0.5})`;
                ctx.beginPath();
                ctx.arc(wx, wy, w.radius * progress, 0, Math.PI * 2);
                ctx.fill();
                
                // 边缘闪烁
                if (progress > 0.7) {
                    const flash = Math.sin(this.animationFrame * 0.5) * 0.3 + 0.5;
                    ctx.strokeStyle = `rgba(255, 255, 0, ${flash})`;
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.arc(wx, wy, w.radius, 0, Math.PI * 2);
                    ctx.stroke();
                }
            } 
            else if (w.type === 'cone') {
                // 扇形预警
                ctx.translate(wx, wy);
                ctx.rotate(w.angle);
                
                // 外圈扇形
                ctx.strokeStyle = `rgba(255, 100, 0, ${alpha})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, w.radius, -w.spread / 2, w.spread / 2);
                ctx.closePath();
                ctx.stroke();
                
                // 填充进度
                ctx.fillStyle = `rgba(255, 50, 0, ${alpha * 0.4})`;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, w.radius * progress, -w.spread / 2, w.spread / 2);
                ctx.closePath();
                ctx.fill();
                
                // 边缘闪烁
                if (progress > 0.7) {
                    const flash = Math.sin(this.animationFrame * 0.5) * 0.3 + 0.5;
                    ctx.fillStyle = `rgba(255, 200, 0, ${flash * 0.3})`;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.arc(0, 0, w.radius, -w.spread / 2, w.spread / 2);
                    ctx.closePath();
                    ctx.fill();
                }
            }
            else if (w.type === 'line') {
                // 线形预警（冲刺）
                ctx.translate(wx, wy);
                ctx.rotate(w.angle);
                
                // 外框
                ctx.strokeStyle = `rgba(255, 50, 0, ${alpha})`;
                ctx.lineWidth = 2;
                ctx.strokeRect(0, -w.width / 2, w.length, w.width);
                
                // 填充进度
                ctx.fillStyle = `rgba(255, 0, 0, ${alpha * 0.4})`;
                ctx.fillRect(0, -w.width / 2, w.length * progress, w.width);
                
                // 箭头指示
                ctx.fillStyle = `rgba(255, 200, 0, ${alpha})`;
                ctx.beginPath();
                ctx.moveTo(w.length * progress, 0);
                ctx.lineTo(w.length * progress - 15, -10);
                ctx.lineTo(w.length * progress - 15, 10);
                ctx.closePath();
                ctx.fill();
                
                // 边缘闪烁
                if (progress > 0.7) {
                    const flash = Math.sin(this.animationFrame * 0.5) * 0.3 + 0.5;
                    ctx.strokeStyle = `rgba(255, 255, 0, ${flash})`;
                    ctx.lineWidth = 3;
                    ctx.strokeRect(0, -w.width / 2, w.length, w.width);
                }
            }
            
            ctx.restore();
        });
    }
}

// 注册Boss
Boss.register('lava_golem', LavaGolem.CONFIG, LavaGolem);
