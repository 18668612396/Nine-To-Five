// --- 冰霜女王 Boss ---

class FrostQueen extends Boss {
    static CONFIG = {
        id: 'frost_queen',
        name: '冰霜女王',
        hp: 4000,
        damage: 10,
        speed: 1.2,
        radius: 50,
        color: '#00CED1',
        xp: 400,
        gold: 160
    };
    
    constructor(x, y) {
        super(x, y, FrostQueen.CONFIG);
        this.capeAngle = 0;
        this.iceZones = [];
        this.blizzardActive = false;
        this.blizzardParticles = [];
        this.staffGlow = 0;
    }
    
    onPhaseChange(phase) {
        if (phase === 2) {
            this.shield = this.maxHp * 0.2;
            Events.emit(EVENT.FLOATING_TEXT, {
                text: '❄️ 冰盾!',
                x: this.x, y: this.y - 80,
                color: '#00ffff'
            });
        } else if (phase === 3) {
            this.isEnraged = true;
            this.blizzardActive = true;
            Events.emit(EVENT.FLOATING_TEXT, {
                text: '❄️❄️ 暴风雪!',
                x: this.x, y: this.y - 80,
                color: '#87ceeb'
            });
        }
    }
    
    performAttacks(player) {
        // 冰锥术
        if (this.attackCooldown <= 0) {
            this.icicleAttack(player);
            this.attackCooldown = this.isEnraged ? 50 : 80;
        }
        
        // 冰冻领域
        if (this.specialCooldown <= 0) {
            this.createIceZone(player);
            this.specialCooldown = this.phase >= 2 ? 150 : 200;
        }
        
        this.updateIceZones(player);
        
        if (this.blizzardActive) {
            this.updateBlizzard(player);
        }
        
        // 护盾恢复
        if (this.phase >= 2 && this.shield < this.maxHp * 0.2 && this.animationFrame % 120 === 0) {
            this.shield = Math.min(this.shield + this.maxHp * 0.05, this.maxHp * 0.2);
        }
    }
    
    icicleAttack(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const baseAngle = Math.atan2(dy, dx);
        const count = this.phase >= 3 ? 5 : 3;
        const spread = 0.25;
        
        this.staffGlow = 1;
        
        for (let i = 0; i < count; i++) {
            const angle = baseAngle + (i - (count-1)/2) * spread;
            const proj = new BossProjectile(
                this.x, this.y,
                Math.cos(angle) * 6, Math.sin(angle) * 6,
                10, '#87ceeb', this.damage * 0.7, 'icicle'
            );
            Events.emit(EVENT.PROJECTILE_FIRE, { projectile: proj, isBoss: true });
        }
    }
    
    createIceZone(player) {
        this.iceZones.push({
            x: player.x, y: player.y,
            radius: 80, life: 300, slowAmount: 0.5
        });
        Events.emit(EVENT.FLOATING_TEXT, {
            text: '❄️ 冰冻领域',
            x: player.x, y: player.y - 30,
            color: '#00ffff'
        });
    }
    
    updateIceZones(player) {
        this.iceZones.forEach(zone => {
            zone.life--;
            
            const dx = player.x - zone.x;
            const dy = player.y - zone.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < zone.radius + player.radius) {
                player.slowEffect = zone.slowAmount;
                player.slowTimer = 30;
                
                if (Enemy.frameCount % 60 === 0) {
                    player.takeDamage(3);
                }
            }
        });
        
        this.iceZones = this.iceZones.filter(z => z.life > 0);
    }
    
    updateBlizzard(player) {
        if (Math.random() < 0.3) {
            const range = 400;
            this.blizzardParticles.push({
                x: this.x + (Math.random() - 0.5) * range * 2,
                y: this.y - 200,
                vx: (Math.random() - 0.5) * 4 - 2,
                vy: 3 + Math.random() * 3,
                size: 3 + Math.random() * 4,
                life: 120
            });
        }
        
        this.blizzardParticles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            
            const dx = player.x - p.x;
            const dy = player.y - p.y;
            if (Math.sqrt(dx*dx + dy*dy) < player.radius + p.size) {
                player.takeDamage(1);
                p.life = 0;
            }
        });
        
        this.blizzardParticles = this.blizzardParticles.filter(p => p.life > 0);
    }

    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        
        // 绘制冰冻区域
        this.iceZones.forEach(zone => {
            const zx = zone.x - camX;
            const zy = zone.y - camY;
            const alpha = zone.life / 300;
            
            const gradient = ctx.createRadialGradient(zx, zy, 0, zx, zy, zone.radius);
            gradient.addColorStop(0, `rgba(135, 206, 235, ${alpha * 0.5})`);
            gradient.addColorStop(0.7, `rgba(0, 255, 255, ${alpha * 0.3})`);
            gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(zx, zy, zone.radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
            ctx.lineWidth = 2;
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI * 2 / 6) * i;
                ctx.beginPath();
                ctx.moveTo(zx, zy);
                ctx.lineTo(zx + Math.cos(angle) * zone.radius * 0.8, zy + Math.sin(angle) * zone.radius * 0.8);
                ctx.stroke();
            }
        });
        
        // 绘制暴风雪粒子
        ctx.fillStyle = '#ffffff';
        this.blizzardParticles.forEach(p => {
            const px = p.x - camX;
            const py = p.y - camY;
            ctx.globalAlpha = p.life / 120;
            ctx.beginPath();
            ctx.arc(px, py, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        
        // 阴影
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(x, y + this.radius * 0.6, this.radius * 0.8, this.radius * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 冰雾斗篷
        this.capeAngle += 0.02;
        const capeGradient = ctx.createLinearGradient(x - 40, y - 30, x + 40, y + 50);
        capeGradient.addColorStop(0, 'rgba(135, 206, 235, 0.6)');
        capeGradient.addColorStop(1, 'rgba(135, 206, 235, 0)');
        
        ctx.fillStyle = capeGradient;
        ctx.beginPath();
        ctx.moveTo(x - 20, y - 30);
        ctx.quadraticCurveTo(
            x - 50 + Math.sin(this.capeAngle) * 10, y + 20,
            x - 30 + Math.sin(this.capeAngle + 1) * 15, y + 60
        );
        ctx.lineTo(x + 30 + Math.sin(this.capeAngle + 2) * 15, y + 60);
        ctx.quadraticCurveTo(
            x + 50 + Math.sin(this.capeAngle + 0.5) * 10, y + 20,
            x + 20, y - 30
        );
        ctx.fill();
        
        // 身体
        const bodyGradient = ctx.createLinearGradient(x - 25, y - 40, x + 25, y + 30);
        bodyGradient.addColorStop(0, 'rgba(200, 240, 255, 0.9)');
        bodyGradient.addColorStop(0.5, 'rgba(135, 206, 235, 0.8)');
        bodyGradient.addColorStop(1, 'rgba(100, 180, 220, 0.7)');
        
        ctx.fillStyle = bodyGradient;
        ctx.beginPath();
        ctx.moveTo(x, y - 50);
        ctx.lineTo(x - 25, y - 20);
        ctx.lineTo(x - 20, y + 30);
        ctx.lineTo(x + 20, y + 30);
        ctx.lineTo(x + 25, y - 20);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 头部
        ctx.fillStyle = 'rgba(220, 240, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(x, y - 55, 18, 0, Math.PI * 2);
        ctx.fill();
        
        // 冰冠
        ctx.fillStyle = '#87ceeb';
        ctx.beginPath();
        ctx.moveTo(x - 20, y - 65);
        ctx.lineTo(x - 15, y - 85);
        ctx.lineTo(x - 5, y - 70);
        ctx.lineTo(x, y - 95);
        ctx.lineTo(x + 5, y - 70);
        ctx.lineTo(x + 15, y - 85);
        ctx.lineTo(x + 20, y - 65);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.moveTo(x - 10, y - 70);
        ctx.lineTo(x - 5, y - 80);
        ctx.lineTo(x, y - 72);
        ctx.closePath();
        ctx.fill();
        
        // 眼睛
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(x - 6, y - 55, 4, 0, Math.PI * 2);
        ctx.arc(x + 6, y - 55, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(x - 6, y - 55, 7, 0, Math.PI * 2);
        ctx.arc(x + 6, y - 55, 7, 0, Math.PI * 2);
        ctx.fill();
        
        // 冰杖
        const staffGlowAlpha = this.staffGlow > 0 ? this.staffGlow : 0.3 + Math.sin(this.animationFrame * 0.1) * 0.2;
        if (this.staffGlow > 0) this.staffGlow -= 0.05;
        
        ctx.strokeStyle = '#4a90a4';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x + 30, y - 30);
        ctx.lineTo(x + 45, y + 40);
        ctx.stroke();
        
        ctx.fillStyle = `rgba(0, 255, 255, ${staffGlowAlpha})`;
        ctx.beginPath();
        ctx.moveTo(x + 30, y - 50);
        ctx.lineTo(x + 25, y - 35);
        ctx.lineTo(x + 30, y - 30);
        ctx.lineTo(x + 35, y - 35);
        ctx.closePath();
        ctx.fill();
        
        const glowGradient = ctx.createRadialGradient(x + 30, y - 40, 0, x + 30, y - 40, 20);
        glowGradient.addColorStop(0, `rgba(0, 255, 255, ${staffGlowAlpha * 0.8})`);
        glowGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x + 30, y - 40, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // 护盾效果
        if (this.shield > 0) {
            const shieldAlpha = 0.3 + Math.sin(this.animationFrame * 0.1) * 0.1;
            ctx.strokeStyle = `rgba(0, 255, 255, ${shieldAlpha})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x, y - 20, this.radius + 15, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI * 2 / 6) * i + this.animationFrame * 0.02;
                const hx = x + Math.cos(angle) * (this.radius + 15);
                const hy = y - 20 + Math.sin(angle) * (this.radius + 15);
                if (i === 0) ctx.moveTo(hx, hy);
                else ctx.lineTo(hx, hy);
            }
            ctx.closePath();
            ctx.stroke();
        }
        
        this.drawHealthBar(ctx, camX, camY);
    }
}

// 注册Boss
Boss.register('frost_queen', FrostQueen.CONFIG, FrostQueen);
