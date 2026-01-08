// --- 深渊之眼 Boss ---

class AbyssalEye extends Boss {
    static CONFIG = {
        id: 'abyssal_eye',
        name: '深渊之眼',
        desc: 'Boss - 激光扫射',
        icon: '👁️',
        hp: 4500,
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
        this.laserTarget = null;
        this.laserCharging = false;
        this.laserFiring = false;
        this.laserAngle = 0;
        this.laserChargeTime = 0;
        this.laserFireTime = 0;
        this.teleportCooldown = 0;
        this.distortionEffect = 0;
        
        // 初始化触手
        for (let i = 0; i < 8; i++) {
            this.tentacles.push({
                angle: (Math.PI * 2 / 8) * i,
                length: 40 + Math.random() * 20,
                phase: Math.random() * Math.PI * 2,
                extending: false,
                extendTime: 0
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
        // 死亡凝视
        if (this.attackCooldown <= 0 && !this.laserCharging && !this.laserFiring) {
            this.startLaser(player);
        }
        
        // 触手横扫
        if (this.specialCooldown <= 0) {
            this.tentacleSweep();
            this.specialCooldown = this.phase >= 2 ? 90 : 150;
        }
        
        // 虚空传送
        if (this.teleportCooldown <= 0 && this.phase >= 2) {
            this.teleport(player);
            this.teleportCooldown = 240;
        }
        
        this.teleportCooldown--;
        this.updateLaser(player);
        this.updateTentacles(player);
    }
    
    startLaser(player) {
        this.laserCharging = true;
        this.laserTarget = { x: player.x, y: player.y };
        this.laserChargeTime = 60;
        this.pupilSize = 10;
        this.attackCooldown = 120;
        Events.emit(EVENT.FLOATING_TEXT, {
            text: '⚡ 凝视!',
            x: this.x, y: this.y - 80,
            color: '#ff00ff'
        });
    }
    
    updateLaser(player) {
        if (this.laserCharging) {
            this.laserChargeTime--;
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            this.laserAngle = Math.atan2(dy, dx);
            
            if (this.laserChargeTime <= 0) {
                this.laserCharging = false;
                this.laserFiring = true;
                this.laserFireTime = 30;
            }
        }
        
        if (this.laserFiring) {
            this.laserFireTime--;
            this.pupilSize = 5;
            
            const laserLength = 500;
            const laserWidth = 20;
            const endX = this.x + Math.cos(this.laserAngle) * laserLength;
            const endY = this.y + Math.sin(this.laserAngle) * laserLength;
            
            const playerDist = this.pointToLineDistance(
                player.x, player.y, this.x, this.y, endX, endY
            );
            
            if (playerDist < laserWidth + player.radius && Enemy.frameCount % 10 === 0) {
                player.takeDamage(this.damage);
            }
            
            if (this.laserFireTime <= 0) {
                this.laserFiring = false;
                this.pupilSize = 20;
            }
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
    
    tentacleSweep() {
        this.tentacles.forEach(t => {
            t.extending = true;
            t.extendTime = 30;
        });
    }
    
    updateTentacles(player) {
        this.tentacles.forEach(t => {
            t.angle += 0.01;
            t.phase += 0.1;
            
            if (t.extending) {
                t.extendTime--;
                t.length = 80 + Math.sin(t.extendTime * 0.2) * 40;
                
                const tipX = this.x + Math.cos(t.angle) * t.length;
                const tipY = this.y + Math.sin(t.angle) * t.length;
                const dx = player.x - tipX;
                const dy = player.y - tipY;
                if (Math.sqrt(dx*dx + dy*dy) < 20 + player.radius) {
                    player.takeDamage(this.damage * 0.5);
                }
                
                if (t.extendTime <= 0) {
                    t.extending = false;
                    t.length = 40 + Math.random() * 20;
                }
            }
        });
    }
    
    teleport(player) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 150 + Math.random() * 100;
        
        Events.emit(EVENT.PARTICLES, {
            x: this.x, y: this.y,
            count: 15,
            color: '#9932cc',
            spread: 8
        });
        
        this.x = player.x + Math.cos(angle) * dist;
        this.y = player.y + Math.sin(angle) * dist;
        
        Events.emit(EVENT.PARTICLES, {
            x: this.x, y: this.y,
            count: 15,
            color: '#ff00ff',
            spread: 8
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
        
        // 能量光环
        const auraAlpha = 0.3 + Math.sin(this.animationFrame * 0.05) * 0.2;
        const gradient = ctx.createRadialGradient(x, y, this.radius * 0.5, x, y, this.radius * 1.5);
        gradient.addColorStop(0, `rgba(153, 50, 204, ${auraAlpha})`);
        gradient.addColorStop(1, 'rgba(153, 50, 204, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, this.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
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
        
        // 绘制激光
        if (this.laserCharging) {
            const chargeAlpha = 1 - this.laserChargeTime / 60;
            ctx.strokeStyle = `rgba(255, 0, 255, ${chargeAlpha})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(this.laserAngle) * 100, y + Math.sin(this.laserAngle) * 100);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(x, y, this.radius + 20 * chargeAlpha, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        if (this.laserFiring) {
            const laserGradient = ctx.createLinearGradient(
                x, y,
                x + Math.cos(this.laserAngle) * 500,
                y + Math.sin(this.laserAngle) * 500
            );
            laserGradient.addColorStop(0, '#ffffff');
            laserGradient.addColorStop(0.1, '#ff00ff');
            laserGradient.addColorStop(1, 'rgba(255, 0, 255, 0)');
            
            ctx.strokeStyle = laserGradient;
            ctx.lineWidth = 20;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(this.laserAngle) * 500, y + Math.sin(this.laserAngle) * 500);
            ctx.stroke();
            
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(this.laserAngle) * 500, y + Math.sin(this.laserAngle) * 500);
            ctx.stroke();
        }
        
        this.drawHealthBar(ctx, camX, camY);
    }
}

// 注册Boss
Boss.register('abyssal_eye', AbyssalEye.CONFIG, AbyssalEye);
