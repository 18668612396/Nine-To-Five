// --- 深渊之眼 Boss ---

class AbyssalEye extends Boss {
    static CONFIG = {
        id: 'abyssal_eye',
        name: '深渊之眼',
        desc: 'Boss - 激光扫射',
        icon: '👁️',
        hp: 1600,
        damage: 12,
        speed: 1.0,
        radius: 55,
        color: '#8B008B',
        xp: 450,
        gold: 180
    };
    
    constructor(x, y, scaleMult = 1) {
        super(x, y, AbyssalEye.CONFIG, scaleMult);
        this.pupilSize = 20;
        this.tentacles = [];
        this.distortionEffect = 0;
        
        // 技能状态
        this.currentSkill = null; // 'burst' | 'beam' | null
        this.skillTimer = 0;
        this.skillPhase = 0; // 0=预警, 1=释放
        
        // 技能1: 三连弹
        this.burstCooldown = 0;
        this.burstCount = 0;
        
        // 技能2: 射线
        this.beamCooldown = 0;
        this.beamAngle = 0;
        this.beamTarget = null;
        
        // 技能3: 范围爆发
        this.novaCooldown = 0;
        this.novaRadius = 600;
        
        // 初始化触手
        for (let i = 0; i < 8; i++) {
            this.tentacles.push({
                angle: (Math.PI * 2 / 8) * i,
                length: 40 + Math.random() * 20,
                phase: Math.random() * Math.PI * 2
            });
        }
    }
    
    onPhaseChange(phase) {
        if (phase === 2) {
            Events.emit(EVENT.FLOATING_TEXT, {
                text: '👁️ 凝视深渊...',
                x: this.x, y: this.y - 80,
                color: '#9932cc'
            });
        } else if (phase === 3) {
            this.isEnraged = true;
            this.distortionEffect = 1;
            Events.emit(EVENT.FLOATING_TEXT, {
                text: '👁️👁️ 精神干扰!',
                x: this.x, y: this.y - 80,
                color: '#ff00ff'
            });
        }
    }
    
    performAttacks(player) {
        // 更新触手动画
        this.updateTentacles();
        
        // 如果正在释放技能，继续处理
        if (this.currentSkill) {
            this.updateCurrentSkill(player);
            return;
        }
        
        // 冷却减少
        this.burstCooldown--;
        this.beamCooldown--;
        this.novaCooldown--;
        
        // 技能优先级: 范围爆发 > 射线 > 三连弹
        if (this.novaCooldown <= 0) {
            this.startNova(player);
        } else if (this.beamCooldown <= 0) {
            this.startBeam(player);
        } else if (this.burstCooldown <= 0) {
            this.startBurst(player);
        }
    }
    
    // 技能1: 三连弹
    startBurst(player) {
        this.burstCount = 3;
        this.burstCooldown = 120; // 2秒休息
        this.fireBurstProjectile(player);
    }
    
    fireBurstProjectile(player) {
        if (this.burstCount <= 0) return;
        
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const angle = Math.atan2(dy, dx);
        const speed = 5;
        
        // 发射弹道
        Events.emit(EVENT.PROJECTILE_FIRE, {
            projectile: new BossProjectile(
                this.x, this.y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                12, '#9932cc', this.damage, 'normal'
            )
        });
        
        this.burstCount--;
        
        // 如果还有弹道，延迟发射下一个
        if (this.burstCount > 0) {
            setTimeout(() => this.fireBurstProjectile(player), 200);
        }
    }
    
    // 技能2: 射线 (2秒预警)
    startBeam(player) {
        this.currentSkill = 'beam';
        this.skillPhase = 0;
        this.skillTimer = 120; // 2秒预警
        this.beamTarget = { x: player.x, y: player.y };
        this.beamAngle = Math.atan2(player.y - this.y, player.x - this.x);
        this.beamCooldown = 300; // 5秒冷却
        this.pupilSize = 10;
        
        Events.emit(EVENT.FLOATING_TEXT, {
            text: '⚡ 凝视!',
            x: this.x, y: this.y - 80,
            color: '#ff00ff'
        });
    }
    
    updateBeam(player) {
        this.skillTimer--;
        
        if (this.skillPhase === 0) {
            // 预警阶段 - 锁定方向
            if (this.skillTimer <= 0) {
                this.skillPhase = 1;
                this.skillTimer = 30; // 射线持续0.5秒
            }
        } else {
            // 发射阶段
            this.pupilSize = 5;
            
            const laserLength = 600;
            const laserWidth = 25;
            const endX = this.x + Math.cos(this.beamAngle) * laserLength;
            const endY = this.y + Math.sin(this.beamAngle) * laserLength;
            
            const playerDist = this.pointToLineDistance(
                player.x, player.y, this.x, this.y, endX, endY
            );
            
            if (playerDist < laserWidth + player.radius && Enemy.frameCount % 10 === 0) {
                player.takeDamage(this.damage);
            }
            
            if (this.skillTimer <= 0) {
                this.currentSkill = null;
                this.pupilSize = 20;
            }
        }
    }
    
    // 技能3: 范围爆发 (3秒预警，中毒效果)
    startNova(player) {
        this.currentSkill = 'nova';
        this.skillPhase = 0;
        this.skillTimer = 180; // 3秒预警
        this.novaCooldown = 480; // 8秒冷却
        
        Events.emit(EVENT.FLOATING_TEXT, {
            text: '🌀 深渊凝聚!',
            x: this.x, y: this.y - 80,
            color: '#00ff00'
        });
    }
    
    updateNova(player) {
        this.skillTimer--;
        
        if (this.skillPhase === 0) {
            // 预警阶段
            if (this.skillTimer <= 0) {
                this.skillPhase = 1;
                this.skillTimer = 45; // 爆发持续0.75秒
                
                // 检测玩家是否在范围内
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < this.novaRadius) {
                    // 施加中毒效果: 每秒2点伤害，持续5秒
                    player.addPoison(2, 300); // 2伤害/秒, 5秒=300帧
                    
                    Events.emit(EVENT.FLOATING_TEXT, {
                        text: '☠️ 中毒!',
                        x: player.x, y: player.y - 40,
                        color: '#00ff00'
                    });
                }
                
                // 爆发特效
                Events.emit(EVENT.PARTICLES, {
                    x: this.x, y: this.y,
                    count: 30,
                    color: '#9932cc',
                    altColor: '#ff00ff',
                    spread: 15
                });
            }
        } else {
            // 爆发结束
            if (this.skillTimer <= 0) {
                this.currentSkill = null;
            }
        }
    }
    
    updateCurrentSkill(player) {
        if (this.currentSkill === 'beam') {
            this.updateBeam(player);
        } else if (this.currentSkill === 'nova') {
            this.updateNova(player);
        }
    }
    
    pointToLineDistance(px, py, x1, y1, x2, y2) {
        const A = px - x1, B = py - y1;
        const C = x2 - x1, D = y2 - y1;
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = lenSq !== 0 ? dot / lenSq : -1;
        
        let xx, yy;
        if (param < 0) { xx = x1; yy = y1; }
        else if (param > 1) { xx = x2; yy = y2; }
        else { xx = x1 + param * C; yy = y1 + param * D; }
        
        return Math.sqrt((px - xx) ** 2 + (py - yy) ** 2);
    }
    
    updateTentacles() {
        this.tentacles.forEach(t => {
            t.angle += 0.01;
            t.phase += 0.1;
        });
    }

    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        
        // 精神干扰效果
        if (this.distortionEffect > 0 && this.phase >= 3) {
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#ff00ff';
            const distortX = x + Math.sin(this.animationFrame * 0.1) * 20;
            const distortY = y + Math.cos(this.animationFrame * 0.1) * 20;
            ctx.beginPath();
            ctx.arc(distortX, distortY, this.radius * 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        
        // 范围爆发预警 - 红色半透明
        if (this.currentSkill === 'nova' && this.skillPhase === 0) {
            const progress = 1 - this.skillTimer / 180; // 0->1
            
            // 浅红色 - 最大伤害范围（固定大小）
            ctx.fillStyle = 'rgba(255, 0, 0, 0.15)';
            ctx.beginPath();
            ctx.arc(x, y, this.novaRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // 浅红色边框
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, this.novaRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            // 深红色 - 倒计时圈（从中心向外扩大）
            const expandRadius = this.novaRadius * progress;
            ctx.fillStyle = 'rgba(255, 0, 0, 0.35)';
            ctx.beginPath();
            ctx.arc(x, y, expandRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // 深红色边框
            ctx.strokeStyle = 'rgba(255, 50, 50, 0.7)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x, y, expandRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // 范围爆发释放
        if (this.currentSkill === 'nova' && this.skillPhase === 1) {
            const fadeProgress = this.skillTimer / 45;
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, this.novaRadius);
            gradient.addColorStop(0, `rgba(153, 50, 204, ${0.7 * fadeProgress})`);
            gradient.addColorStop(0.3, `rgba(255, 0, 255, ${0.5 * fadeProgress})`);
            gradient.addColorStop(0.7, `rgba(153, 50, 204, ${0.3 * fadeProgress})`);
            gradient.addColorStop(1, 'rgba(153, 50, 204, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, this.novaRadius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 能量光环
        const auraAlpha = 0.3 + Math.sin(this.animationFrame * 0.05) * 0.2;
        const gradient = ctx.createRadialGradient(x, y, this.radius * 0.5, x, y, this.radius * 1.5);
        gradient.addColorStop(0, `rgba(153, 50, 204, ${auraAlpha})`);
        gradient.addColorStop(1, 'rgba(153, 50, 204, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, this.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // 应用受伤闪烁
        this.beginDraw(ctx);
        
        // 绘制触手
        this.tentacles.forEach(t => {
            const segments = 8;
            ctx.strokeStyle = '#4a0080';
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            
            for (let j = 1; j <= segments; j++) {
                const segDist = (t.length / segments) * j;
                const wave = Math.sin(t.phase + j * 0.5) * 10 * (j / segments);
                const perpAngle = t.angle + Math.PI / 2;
                
                const segX = x + Math.cos(t.angle) * segDist + Math.cos(perpAngle) * wave;
                const segY = y + Math.sin(t.angle) * segDist + Math.sin(perpAngle) * wave;
                
                ctx.lineTo(segX, segY);
            }
            ctx.stroke();
            
            const tipX = x + Math.cos(t.angle) * t.length;
            const tipY = y + Math.sin(t.angle) * t.length;
            ctx.fillStyle = '#9932cc';
            ctx.beginPath();
            ctx.arc(tipX, tipY, 6, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // 眼球主体
        ctx.fillStyle = '#1a0033';
        ctx.beginPath();
        ctx.arc(x, y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#4a0080';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x, y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // 虹膜
        const irisGradient = ctx.createRadialGradient(x, y, 0, x, y, this.radius * 0.7);
        irisGradient.addColorStop(0, '#ff00ff');
        irisGradient.addColorStop(0.5, '#9932cc');
        irisGradient.addColorStop(1, '#4a0080');
        
        ctx.fillStyle = irisGradient;
        ctx.beginPath();
        ctx.arc(x, y, this.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        // 瞳孔
        const pupilPulse = this.pupilSize + Math.sin(this.animationFrame * 0.1) * 3;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x, y, pupilPulse, 0, Math.PI * 2);
        ctx.fill();
        
        // 瞳孔高光
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x - 8, y - 8, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 5, y + 5, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制射线预警 - 红色半透明
        if (this.currentSkill === 'beam' && this.skillPhase === 0) {
            const progress = 1 - this.skillTimer / 120;
            const warningAlpha = 0.3 + progress * 0.5;
            
            // 预警线 - 红色
            ctx.strokeStyle = `rgba(255, 50, 50, ${warningAlpha})`;
            ctx.lineWidth = 8 + progress * 20;
            ctx.setLineDash([15, 10]);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(this.beamAngle) * 600, y + Math.sin(this.beamAngle) * 600);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // 蓄力圈 - 红色
            ctx.strokeStyle = `rgba(255, 50, 50, ${warningAlpha})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x, y, this.radius + 25 * progress, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // 绘制射线发射
        if (this.currentSkill === 'beam' && this.skillPhase === 1) {
            const laserGradient = ctx.createLinearGradient(
                x, y,
                x + Math.cos(this.beamAngle) * 600,
                y + Math.sin(this.beamAngle) * 600
            );
            laserGradient.addColorStop(0, '#ffffff');
            laserGradient.addColorStop(0.1, '#ff00ff');
            laserGradient.addColorStop(1, 'rgba(255, 0, 255, 0)');
            
            ctx.strokeStyle = laserGradient;
            ctx.lineWidth = 25;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(this.beamAngle) * 600, y + Math.sin(this.beamAngle) * 600);
            ctx.stroke();
            
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(this.beamAngle) * 600, y + Math.sin(this.beamAngle) * 600);
            ctx.stroke();
        }
        
        // 结束受伤闪烁
        this.endDraw(ctx);
        
        this.drawHealthBar(ctx, camX, camY);
    }
}

// 注册Boss
Boss.register('abyssal_eye', AbyssalEye.CONFIG, AbyssalEye);
