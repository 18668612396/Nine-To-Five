// --- 冰霜女王 Boss ---

class FrostQueen extends Boss {
    static CONFIG = {
        id: 'frost_queen',
        name: '冰霜女王',
        desc: 'Boss - 冰冻领域',
        icon: '❄️',
        hp: 1500,
        damage: 10,
        speed: 1.2,
        radius: 50,
        color: '#00CED1',
        xp: 400,
        gold: 160
    };
    
    constructor(x, y, scaleMult = 1) {
        super(x, y, FrostQueen.CONFIG, scaleMult);
        this.capeAngle = 0;
        this.staffGlow = 0;
        
        // 常规攻击 - 连续冰锥 (1、2、3 -> 休息2秒 -> 1、2、3)
        this.icicleQueue = [];        // 待发射的冰锥队列
        this.icicleDelay = 0;         // 冰锥发射间隔计时
        this.icicleRound = 0;         // 当前轮次已发射数量
        this.icicleRestTimer = 0;     // 休息计时器
        
        // 特殊技能1 - 周身爆发
        this.burstCooldown = 0;
        this.isBursting = false;
        this.burstTimer = 0;
        
        // 特殊技能2 - 天降冰锥
        this.fallingIcicles = [];     // 正在下落的冰锥
        this.fallingCooldown = 0;
        
        // 被动 - 寒冰领域
        this.frostAuraRadius = 250;
        this.frostParticles = [];
        
        // 预警系统
        this.warnings = [];
    }

    onPhaseChange(phase) {
        if (phase === 2) {
            this.frostAuraRadius = 300;
            Events.emit(EVENT.FLOATING_TEXT, {
                text: '❄️ 寒冰扩散!',
                x: this.x, y: this.y - 80,
                color: '#00ffff'
            });
        } else if (phase === 3) {
            this.isEnraged = true;
            this.frostAuraRadius = 350;
            Events.emit(EVENT.FLOATING_TEXT, {
                text: '❄️❄️ 绝对零度!',
                x: this.x, y: this.y - 80,
                color: '#87ceeb'
            });
        }
    }
    
    performAttacks(player) {
        // 更新预警
        this.updateWarnings();
        
        // 被动：寒冰领域 - 持续减速范围内敌人
        this.applyFrostAura(player);
        
        // 常规攻击：连续冰锥 (1、2、3 -> 休息2秒 -> 循环)
        if (this.icicleRestTimer > 0) {
            this.icicleRestTimer--;
        } else if (this.icicleQueue.length === 0 && this.icicleRound < 3) {
            // 发射单个冰锥
            this.fireIcicle(player);
            this.icicleRound++;
            
            if (this.icicleRound >= 3) {
                // 发射完3个，休息2秒
                this.icicleRestTimer = 120;
                this.icicleRound = 0;
            } else {
                // 下一个冰锥间隔
                this.icicleQueue.push({ delay: this.isEnraged ? 20 : 30 });
            }
        }
        this.updateIcicleQueue(player);
        
        // 特殊技能1：周身爆发 (频率低，伤害高)
        if (this.burstCooldown <= 0 && !this.isBursting) {
            this.startBurstWarning();
            this.burstCooldown = this.phase >= 2 ? 480 : 600; // 8-10秒
        }
        this.updateBurst(player);
        
        // 特殊技能2：天降冰锥 (频率中等，3秒预警)
        if (this.fallingCooldown <= 0) {
            this.spawnFallingIcicle(player);
            this.fallingCooldown = this.isEnraged ? 120 : 180; // 2-3秒一个
        }
        this.updateFallingIcicles(player);
        
        if (this.burstCooldown > 0) this.burstCooldown--;
        if (this.fallingCooldown > 0) this.fallingCooldown--;
    }

    // ========== 预警系统 ==========
    updateWarnings() {
        this.warnings.forEach(w => {
            w.progress++;
            if (w.progress >= w.maxTime) {
                if (w.onComplete) w.onComplete();
                w.done = true;
            }
        });
        this.warnings = this.warnings.filter(w => !w.done);
    }
    
    // ========== 被动：寒冰领域 ==========
    applyFrostAura(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // 范围内减速
        if (dist < this.frostAuraRadius) {
            player.slowEffect = 0.6;
            player.slowTimer = 10;
            
            // 添加寒冰粒子特效到玩家身上
            if (this.animationFrame % 15 === 0) {
                this.frostParticles.push({
                    x: player.x + (Math.random() - 0.5) * 30,
                    y: player.y + (Math.random() - 0.5) * 30,
                    vy: -1 - Math.random(),
                    life: 40,
                    size: 3 + Math.random() * 3
                });
            }
        }
        
        // 更新寒冰粒子
        this.frostParticles.forEach(p => {
            p.y += p.vy;
            p.life--;
        });
        this.frostParticles = this.frostParticles.filter(p => p.life > 0);
    }

    // ========== 常规攻击：连续冰锥 ==========
    fireIcicle(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.2;
        
        // 发射冰锥
        const proj = new BossProjectile(
            this.x, this.y,
            Math.cos(angle) * 6, Math.sin(angle) * 6,
            10, '#87ceeb', this.damage * 0.8, 'icicle'
        );
        Events.emit(EVENT.PROJECTILE_FIRE, { projectile: proj, isBoss: true });
        
        this.staffGlow = 0.8;
        
        // 发射粒子
        Events.emit(EVENT.PARTICLES, {
            x: this.x, y: this.y,
            count: 3,
            color: '#00ffff',
            spread: 4
        });
    }
    
    updateIcicleQueue(player) {
        if (this.icicleQueue.length === 0) return;
        
        this.icicleDelay++;
        const next = this.icicleQueue[0];
        
        if (this.icicleDelay >= next.delay) {
            // 队列中的延迟结束，移除并继续
            this.icicleQueue.shift();
            this.icicleDelay = 0;
        }
    }

    // ========== 特殊技能1：周身爆发 ==========
    startBurstWarning() {
        // 红色圆形预警，2秒蓄力
        this.warnings.push({
            type: 'circle',
            x: this.x,
            y: this.y,
            radius: 180,
            progress: 0,
            maxTime: 120, // 2秒
            color: 'red',
            followBoss: true,
            onComplete: () => this.startBurst()
        });
    }
    
    startBurst() {
        this.isBursting = true;
        this.burstTimer = 30;
        
        Events.emit(EVENT.FLOATING_TEXT, {
            text: '❄️ 冰霜爆发!',
            x: this.x, y: this.y - 80,
            color: '#ff6666'
        });
    }
    
    updateBurst(player) {
        if (!this.isBursting) return;
        
        this.burstTimer--;
        
        if (this.burstTimer === 25) {
            // 爆发伤害
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 180) {
                player.takeDamage(this.damage * 2.5);
                player.slowEffect = 0.3;
                player.slowTimer = 120;
                
                Events.emit(EVENT.FLOATING_TEXT, {
                    text: '冻伤!',
                    x: player.x, y: player.y - 40,
                    color: '#00ffff'
                });
            }
            
            // 爆发特效
            Events.emit(EVENT.SCREEN_SHAKE, { intensity: 12, duration: 20 });
            Events.emit(EVENT.PARTICLES, {
                x: this.x, y: this.y,
                count: 30,
                color: '#00ffff',
                spread: 15
            });
        }
        
        if (this.burstTimer <= 0) {
            this.isBursting = false;
        }
    }

    // ========== 特殊技能2：天降冰锥 ==========
    spawnFallingIcicle(player) {
        // 在玩家附近随机位置生成预警
        const offsetX = (Math.random() - 0.5) * 200;
        const offsetY = (Math.random() - 0.5) * 200;
        const targetX = player.x + offsetX;
        const targetY = player.y + offsetY;
        
        // 3秒预警
        this.warnings.push({
            type: 'fallingIcicle',
            x: targetX,
            y: targetY,
            radius: 40,
            progress: 0,
            maxTime: 120, // 2秒
            color: 'ice',
            onComplete: () => this.dropIcicle(targetX, targetY)
        });
    }
    
    dropIcicle(x, y) {
        this.fallingIcicles.push({
            x: x,
            y: y - 300,
            targetY: y,
            speed: 15,
            damage: this.damage * 1.5,
            radius: 35,
            hit: false
        });
    }
    
    updateFallingIcicles(player) {
        this.fallingIcicles.forEach(ice => {
            if (ice.hit) return;
            
            ice.y += ice.speed;
            
            // 到达目标位置
            if (ice.y >= ice.targetY) {
                ice.y = ice.targetY;
                ice.hit = true;
                
                // 检测伤害
                const dx = player.x - ice.x;
                const dy = player.y - ice.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < ice.radius + player.radius) {
                    player.takeDamage(ice.damage);
                    player.slowEffect = 0.4;
                    player.slowTimer = 90;
                }
                
                // 落地特效
                Events.emit(EVENT.PARTICLES, {
                    x: ice.x, y: ice.y,
                    count: 10,
                    color: '#87ceeb',
                    spread: 8
                });
                Events.emit(EVENT.SCREEN_SHAKE, { intensity: 4, duration: 8 });
                
                // 延迟移除
                setTimeout(() => {
                    ice.remove = true;
                }, 500);
            }
        });
        
        this.fallingIcicles = this.fallingIcicles.filter(i => !i.remove);
    }

    // ========== 绘制 ==========
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        const r = this.radius;
        const bounce = Math.sin(this.animationFrame * 0.08) * 2;
        const wobble = Math.sin(this.animationFrame * 0.06) * 1.5;
        
        // 绘制寒冰领域
        this.drawFrostAura(ctx, camX, camY);
        
        // 绘制攻击预警
        this.drawWarnings(ctx, camX, camY);
        
        // 绘制天降冰锥
        this.drawFallingIcicles(ctx, camX, camY);
        
        // 绘制寒冰粒子
        this.drawFrostParticles(ctx, camX, camY);
        
        // 应用受伤闪烁
        this.beginDraw(ctx);
        
        ctx.save();
        ctx.translate(x, y + bounce);
        
        // 阴影
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(0, r * 0.5, r * 0.8, r * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 爆发蓄力效果
        if (this.isBursting) {
            const burstAlpha = 0.5 + Math.sin(this.animationFrame * 0.3) * 0.3;
            const burstGrad = ctx.createRadialGradient(0, 0, r, 0, 0, 180);
            burstGrad.addColorStop(0, `rgba(0, 255, 255, ${burstAlpha})`);
            burstGrad.addColorStop(0.5, `rgba(135, 206, 250, ${burstAlpha * 0.5})`);
            burstGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = burstGrad;
            ctx.beginPath();
            ctx.arc(0, 0, 180, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 冰雾光环
        this.capeAngle += 0.02;
        const auraAlpha = 0.3 + Math.sin(this.animationFrame * 0.05) * 0.1;
        const auraGradient = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 1.3);
        auraGradient.addColorStop(0, 'rgba(135, 206, 235, 0)');
        auraGradient.addColorStop(0.7, `rgba(200, 240, 255, ${auraAlpha})`);
        auraGradient.addColorStop(1, 'rgba(135, 206, 235, 0)');
        ctx.fillStyle = auraGradient;
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.3, 0, Math.PI * 2);
        ctx.fill();

        // 飘动的冰晶粒子
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i + this.animationFrame * 0.02;
            const dist = r * 0.9 + Math.sin(this.animationFrame * 0.1 + i) * 5;
            const px = Math.cos(angle) * dist;
            const py = Math.sin(angle) * dist * 0.6;
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 小手臂
        const armWave = Math.sin(this.animationFrame * 0.1) * 0.1;
        ctx.fillStyle = '#b0e0e6';
        ctx.strokeStyle = '#87ceeb';
        ctx.lineWidth = 2;
        
        // 左手
        ctx.save();
        ctx.rotate(-0.4 + armWave);
        ctx.beginPath();
        ctx.ellipse(-r * 0.85, 0, r * 0.2, r * 0.28, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        
        // 右手 (拿着冰杖)
        ctx.save();
        ctx.rotate(0.3 - armWave);
        ctx.fillStyle = '#b0e0e6';
        ctx.beginPath();
        ctx.ellipse(r * 0.85, 0, r * 0.2, r * 0.28, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // 冰杖
        const staffGlowAlpha = this.staffGlow > 0 ? this.staffGlow : 0.5 + Math.sin(this.animationFrame * 0.1) * 0.3;
        if (this.staffGlow > 0) this.staffGlow -= 0.03;
        
        ctx.strokeStyle = '#4a90a4';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(r * 0.9, -r * 0.1);
        ctx.lineTo(r * 1.1, -r * 0.8);
        ctx.stroke();
        
        // 杖顶冰晶
        ctx.fillStyle = `rgba(0, 255, 255, ${staffGlowAlpha})`;
        ctx.beginPath();
        ctx.moveTo(r * 1.1, -r * 1.1);
        ctx.lineTo(r * 1.0, -r * 0.85);
        ctx.lineTo(r * 1.1, -r * 0.8);
        ctx.lineTo(r * 1.2, -r * 0.85);
        ctx.closePath();
        ctx.fill();
        
        // 杖顶光芒
        const glowGradient = ctx.createRadialGradient(r * 1.1, -r * 0.95, 0, r * 1.1, -r * 0.95, r * 0.3);
        glowGradient.addColorStop(0, `rgba(0, 255, 255, ${staffGlowAlpha * 0.8})`);
        glowGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(r * 1.1, -r * 0.95, r * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 身体 - 圆润的冰晶体
        const bodyGradient = ctx.createRadialGradient(-r * 0.2, -r * 0.2, 0, 0, 0, r);
        bodyGradient.addColorStop(0, '#e0f7ff');
        bodyGradient.addColorStop(0.4, '#b0e0e6');
        bodyGradient.addColorStop(0.8, '#87ceeb');
        bodyGradient.addColorStop(1, '#5f9ea0');
        
        ctx.fillStyle = bodyGradient;
        ctx.strokeStyle = '#4682b4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, r + wobble, r - wobble * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // 冰晶纹理
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-r * 0.3, r * 0.4);
        ctx.lineTo(-r * 0.1, -r * 0.2);
        ctx.lineTo(-r * 0.4, -r * 0.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(r * 0.2, r * 0.3);
        ctx.lineTo(r * 0.3, -r * 0.1);
        ctx.lineTo(r * 0.1, -r * 0.4);
        ctx.stroke();
        
        // 冰冠
        ctx.fillStyle = '#87ceeb';
        ctx.strokeStyle = '#5f9ea0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-r * 0.5, -r * 0.7);
        ctx.lineTo(-r * 0.35, -r * 1.1);
        ctx.lineTo(-r * 0.15, -r * 0.85);
        ctx.lineTo(0, -r * 1.3);
        ctx.lineTo(r * 0.15, -r * 0.85);
        ctx.lineTo(r * 0.35, -r * 1.1);
        ctx.lineTo(r * 0.5, -r * 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // 冠上的宝石
        ctx.fillStyle = '#00ffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, -r * 0.95, r * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // 眼睛 (冰蓝色大眼睛)
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(-r * 0.25, -r * 0.15, r * 0.18, r * 0.22, 0, 0, Math.PI * 2);
        ctx.ellipse(r * 0.25, -r * 0.15, r * 0.18, r * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 瞳孔
        ctx.fillStyle = '#00ced1';
        ctx.beginPath();
        ctx.arc(-r * 0.25, -r * 0.12, r * 0.1, 0, Math.PI * 2);
        ctx.arc(r * 0.25, -r * 0.12, r * 0.1, 0, Math.PI * 2);
        ctx.fill();
        
        // 高光
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-r * 0.28, -r * 0.18, r * 0.04, 0, Math.PI * 2);
        ctx.arc(r * 0.22, -r * 0.18, r * 0.04, 0, Math.PI * 2);
        ctx.fill();
        
        // 睫毛
        ctx.strokeStyle = '#4682b4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-r * 0.4, -r * 0.3);
        ctx.lineTo(-r * 0.35, -r * 0.38);
        ctx.moveTo(-r * 0.3, -r * 0.32);
        ctx.lineTo(-r * 0.28, -r * 0.42);
        ctx.moveTo(-r * 0.2, -r * 0.32);
        ctx.lineTo(-r * 0.22, -r * 0.4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(r * 0.4, -r * 0.3);
        ctx.lineTo(r * 0.35, -r * 0.38);
        ctx.moveTo(r * 0.3, -r * 0.32);
        ctx.lineTo(r * 0.28, -r * 0.42);
        ctx.moveTo(r * 0.2, -r * 0.32);
        ctx.lineTo(r * 0.22, -r * 0.4);
        ctx.stroke();
        
        // 腮红
        ctx.fillStyle = 'rgba(255, 182, 193, 0.3)';
        ctx.beginPath();
        ctx.ellipse(-r * 0.4, r * 0.05, r * 0.12, r * 0.08, 0, 0, Math.PI * 2);
        ctx.ellipse(r * 0.4, r * 0.05, r * 0.12, r * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 小嘴巴
        ctx.strokeStyle = '#5f9ea0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, r * 0.2, r * 0.12, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // 护盾效果
        if (this.shield > 0) {
            const shieldAlpha = 0.4 + Math.sin(this.animationFrame * 0.1) * 0.15;
            ctx.strokeStyle = `rgba(0, 255, 255, ${shieldAlpha})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, r + 10, 0, Math.PI * 2);
            ctx.stroke();
            
            // 六边形护盾
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI * 2 / 6) * i + this.animationFrame * 0.02;
                const hx = Math.cos(angle) * (r + 10);
                const hy = Math.sin(angle) * (r + 10);
                if (i === 0) ctx.moveTo(hx, hy);
                else ctx.lineTo(hx, hy);
            }
            ctx.closePath();
            ctx.stroke();
        }
        
        ctx.restore();
        
        // 结束受伤闪烁
        this.endDraw(ctx);
        
        // 血条
        this.drawHealthBar(ctx, camX, camY);
    }

    // 绘制寒冰领域
    drawFrostAura(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        
        // 领域边界
        const auraAlpha = 0.15 + Math.sin(this.animationFrame * 0.03) * 0.05;
        const gradient = ctx.createRadialGradient(x, y, this.radius, x, y, this.frostAuraRadius);
        gradient.addColorStop(0, 'rgba(135, 206, 250, 0)');
        gradient.addColorStop(0.6, `rgba(135, 206, 250, ${auraAlpha})`);
        gradient.addColorStop(1, 'rgba(200, 240, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, this.frostAuraRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // 领域边缘虚线
        ctx.strokeStyle = `rgba(135, 206, 250, ${auraAlpha + 0.1})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.arc(x, y, this.frostAuraRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    // 绘制寒冰粒子（玩家身上的）
    drawFrostParticles(ctx, camX, camY) {
        ctx.fillStyle = 'rgba(200, 240, 255, 0.8)';
        this.frostParticles.forEach(p => {
            const px = p.x - camX;
            const py = p.y - camY;
            const alpha = p.life / 40;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(px, py, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    // 绘制天降冰锥
    drawFallingIcicles(ctx, camX, camY) {
        this.fallingIcicles.forEach(ice => {
            const ix = ice.x - camX;
            const iy = ice.y - camY;
            
            if (!ice.hit) {
                // 下落中的冰锥 - 更大更明显
                ctx.save();
                ctx.translate(ix, iy);
                
                // 冰锥阴影/光晕
                ctx.shadowColor = '#00ffff';
                ctx.shadowBlur = 15;
                
                // 冰锥本体 - 加大尺寸
                const grad = ctx.createLinearGradient(0, -50, 0, 30);
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.3, '#e0f7ff');
                grad.addColorStop(0.6, '#87ceeb');
                grad.addColorStop(1, '#4682b4');
                
                ctx.fillStyle = grad;
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(0, -50);
                ctx.lineTo(-18, 30);
                ctx.lineTo(18, 30);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                
                ctx.shadowBlur = 0;
                
                // 冰锥高光
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.beginPath();
                ctx.moveTo(-3, -35);
                ctx.lineTo(-10, 15);
                ctx.lineTo(-3, 15);
                ctx.closePath();
                ctx.fill();
                
                // 拖尾效果
                ctx.strokeStyle = 'rgba(135, 206, 250, 0.5)';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(0, -50);
                ctx.lineTo(0, -100);
                ctx.stroke();
                
                ctx.restore();
            } else {
                // 落地后的冰锥碎片
                ctx.fillStyle = 'rgba(135, 206, 250, 0.7)';
                ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
                ctx.lineWidth = 2;
                
                // 碎冰效果
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI * 2 / 6) * i;
                    const dist = 20 + Math.random() * 15;
                    const sx = ix + Math.cos(angle) * dist;
                    const sy = iy + Math.sin(angle) * dist;
                    const size = 6 + Math.random() * 4;
                    
                    ctx.beginPath();
                    ctx.moveTo(sx, sy - size);
                    ctx.lineTo(sx - size * 0.6, sy + size * 0.5);
                    ctx.lineTo(sx + size * 0.6, sy + size * 0.5);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }
            }
        });
    }

    // 绘制攻击预警
    drawWarnings(ctx, camX, camY) {
        this.warnings.forEach(w => {
            // 跟随Boss的预警
            const wx = (w.followBoss ? this.x : w.x) - camX;
            const wy = (w.followBoss ? this.y : w.y) - camY;
            const progress = w.progress / w.maxTime;
            
            ctx.save();
            
            if (w.type === 'circle' && w.color === 'red') {
                // 红色圆形预警（周身爆发）
                const alpha = 0.2 + progress * 0.3;
                
                // 外圈
                ctx.strokeStyle = `rgba(255, 80, 80, ${alpha + 0.2})`;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(wx, wy, w.radius, 0, Math.PI * 2);
                ctx.stroke();
                
                // 填充进度 - 从外向内收缩
                ctx.fillStyle = `rgba(255, 50, 50, ${alpha * 0.5})`;
                ctx.beginPath();
                ctx.arc(wx, wy, w.radius * (1 - progress * 0.3), 0, Math.PI * 2);
                ctx.fill();
                
                // 内圈进度
                ctx.fillStyle = `rgba(255, 100, 100, ${alpha * 0.7})`;
                ctx.beginPath();
                ctx.arc(wx, wy, w.radius * progress, 0, Math.PI * 2);
                ctx.fill();
                
                // 边缘闪烁
                if (progress > 0.7) {
                    const flash = Math.sin(this.animationFrame * 0.5) * 0.4 + 0.5;
                    ctx.strokeStyle = `rgba(255, 255, 100, ${flash})`;
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.arc(wx, wy, w.radius, 0, Math.PI * 2);
                    ctx.stroke();
                }
                
                // 警告图标
                ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + progress * 0.5})`;
                ctx.font = 'bold 24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('⚠️', wx, wy - w.radius - 10);
            }
            else if (w.type === 'fallingIcicle') {
                // 天降冰锥预警
                const alpha = 0.3 + progress * 0.4;
                
                // 外圈
                ctx.strokeStyle = `rgba(255, 100, 100, ${alpha})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(wx, wy, w.radius, 0, Math.PI * 2);
                ctx.stroke();
                
                // 填充进度
                ctx.fillStyle = `rgba(255, 80, 80, ${alpha * 0.4})`;
                ctx.beginPath();
                ctx.arc(wx, wy, w.radius * progress, 0, Math.PI * 2);
                ctx.fill();
                
                // 十字准星
                ctx.strokeStyle = `rgba(255, 150, 150, ${alpha})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(wx - w.radius * 0.7, wy);
                ctx.lineTo(wx + w.radius * 0.7, wy);
                ctx.moveTo(wx, wy - w.radius * 0.7);
                ctx.lineTo(wx, wy + w.radius * 0.7);
                ctx.stroke();
                
                // 边缘闪烁
                if (progress > 0.8) {
                    const flash = Math.sin(this.animationFrame * 0.6) * 0.4 + 0.5;
                    ctx.strokeStyle = `rgba(255, 255, 0, ${flash})`;
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(wx, wy, w.radius, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
            
            ctx.restore();
        });
    }
}

// 注册Boss
Boss.register('frost_queen', FrostQueen.CONFIG, FrostQueen);
