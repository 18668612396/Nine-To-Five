// --- 樱花树妖 Boss ---

class SakuraTreeant extends Boss {
    static CONFIG = {
        id: 'sakura_treant',
        name: '樱花树妖',
        desc: 'Boss - 召唤花瓣攻击',
        icon: '🌸',
        hp: 5000,
        damage: 15,
        speed: 0.8,
        radius: 100,
        color: '#8B4513',
        xp: 500,
        gold: 200
    };
    
    constructor(x, y, scaleMult = 1) {
        super(x, y, SakuraTreeant.CONFIG, scaleMult);
        this.petalAngle = 0;
        this.rootWarnings = [];
        this.fallingPetals = [];
    }
    
    onPhaseChange(phase) {
        if (phase === 2) {
            Events.emit(EVENT.FLOATING_TEXT, {
                text: '🌸 樱花盛开!',
                x: this.x, y: this.y - 80,
                color: '#ffb7c5'
            });
        } else if (phase === 3) {
            this.isEnraged = true;
            Events.emit(EVENT.FLOATING_TEXT, {
                text: '🌸🌸 樱花风暴!',
                x: this.x, y: this.y - 80,
                color: '#ff69b4'
            });
        }
    }
    
    performAttacks(player) {
        // 花瓣风暴
        if (this.attackCooldown <= 0) {
            this.petalAttack();
            this.attackCooldown = this.phase >= 3 ? 60 : 90;
        }
        
        // 根须突刺
        if (this.specialCooldown <= 0 && this.phase >= 1) {
            this.rootAttack(player);
            this.specialCooldown = this.phase >= 2 ? 120 : 180;
        }
        
        // 召唤小树精
        if (this.summonCooldown <= 0 && this.phase >= 2) {
            this.summonMinions();
            this.summonCooldown = 900;
        }
        
        this.updateRootWarnings(player);
        
        if (this.phase >= 3 && Math.random() < 0.02) {
            this.spawnFallingPetal();
        }
        this.updateFallingPetals(player);
    }
    
    petalAttack() {
        const directions = 8;
        for (let i = 0; i < directions; i++) {
            const angle = (Math.PI * 2 / directions) * i + this.petalAngle;
            const proj = new BossProjectile(
                this.x, this.y,
                Math.cos(angle) * 4, Math.sin(angle) * 4,
                8, '#ffb7c5', this.damage * 0.5, 'petal'
            );
            Events.emit(EVENT.PROJECTILE_FIRE, { projectile: proj, isBoss: true });
        }
        this.petalAngle += 0.3;
    }
    
    rootAttack(player) {
        this.rootWarnings.push({
            x: player.x, y: player.y,
            timer: 60, radius: 40, triggered: false
        });
    }
    
    updateRootWarnings(player) {
        this.rootWarnings.forEach(warning => {
            warning.timer--;
            if (warning.timer <= 0 && !warning.triggered) {
                warning.triggered = true;
                const dx = player.x - warning.x;
                const dy = player.y - warning.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < warning.radius + player.radius) {
                    player.takeDamage(this.damage);
                }
                Events.emit(EVENT.PARTICLES, {
                    x: warning.x, y: warning.y,
                    count: 10,
                    color: '#8B4513',
                    spread: 6,
                    vy: -8
                });
            }
        });
        this.rootWarnings = this.rootWarnings.filter(w => w.timer > -30);
    }
    
    summonMinions() {
        const count = this.phase >= 3 ? 3 : 2;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 100 + Math.random() * 50;
            const enemy = new Enemy(
                this.x + Math.cos(angle) * dist,
                this.y + Math.sin(angle) * dist,
                { hp: 20, damage: 5, speed: 1.5, xp: 1 }
            );
            Events.emit(EVENT.ENEMY_SPAWN, { enemy });
        }
        Events.emit(EVENT.FLOATING_TEXT, {
            text: '召唤树精!',
            x: this.x, y: this.y - 80,
            color: '#228B22'
        });
    }
    
    spawnFallingPetal() {
        const range = 300;
        this.fallingPetals.push({
            x: this.x + (Math.random() - 0.5) * range * 2,
            y: this.y - 200,
            vy: 2 + Math.random() * 2,
            vx: (Math.random() - 0.5) * 2,
            rotation: Math.random() * Math.PI * 2
        });
    }
    
    updateFallingPetals(player) {
        this.fallingPetals.forEach(petal => {
            petal.y += petal.vy;
            petal.x += petal.vx + Math.sin(petal.y * 0.02) * 0.5;
            petal.rotation += 0.1;
            
            const dx = player.x - petal.x;
            const dy = player.y - petal.y;
            if (Math.sqrt(dx*dx + dy*dy) < player.radius + 10) {
                player.takeDamage(3);
                petal.y = 9999;
            }
        });
        this.fallingPetals = this.fallingPetals.filter(p => p.y < this.y + 400);
    }

    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        const r = this.radius;
        const sway = Math.sin(this.animationFrame * 0.03) * 3;
        
        // 绘制根须警告
        this.rootWarnings.forEach(warning => {
            const wx = warning.x - camX;
            const wy = warning.y - camY;
            const alpha = warning.triggered ? 0.3 : 0.5 + Math.sin(warning.timer * 0.2) * 0.3;
            ctx.fillStyle = `rgba(139, 69, 19, ${alpha})`;
            ctx.beginPath();
            ctx.arc(wx, wy, warning.radius, 0, Math.PI * 2);
            ctx.fill();
            
            if (warning.triggered) {
                ctx.strokeStyle = '#8B4513';
                ctx.lineWidth = 6;
                for (let i = 0; i < 5; i++) {
                    const angle = (Math.PI * 2 / 5) * i;
                    ctx.beginPath();
                    ctx.moveTo(wx, wy);
                    ctx.lineTo(wx + Math.cos(angle) * warning.radius, wy + Math.sin(angle) * warning.radius);
                    ctx.stroke();
                }
            }
        });
        
        // 绘制樱花雨
        ctx.fillStyle = '#ffb7c5';
        this.fallingPetals.forEach(petal => {
            const px = petal.x - camX;
            const py = petal.y - camY;
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(petal.rotation);
            ctx.beginPath();
            ctx.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        
        // 阴影
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(x, y + r * 0.6, r * 0.8, r * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 应用受伤闪烁
        this.beginDraw(ctx);
        
        ctx.save();
        ctx.translate(x, y);
        
        // 树根 - 粗壮的根须
        ctx.fillStyle = '#5D4037';
        ctx.strokeStyle = '#3E2723';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i + 0.3;
            const rootLen = r * 0.6;
            ctx.beginPath();
            ctx.moveTo(0, r * 0.3);
            ctx.quadraticCurveTo(
                Math.cos(angle) * rootLen * 0.5, r * 0.4,
                Math.cos(angle) * rootLen, r * 0.5
            );
            ctx.quadraticCurveTo(
                Math.cos(angle) * rootLen * 0.5, r * 0.35,
                0, r * 0.2
            );
            ctx.fill();
            ctx.stroke();
        }
        
        // 树干主体 - 粗壮的树干
        const trunkGrad = ctx.createLinearGradient(-r * 0.3, 0, r * 0.3, 0);
        trunkGrad.addColorStop(0, '#5D4037');
        trunkGrad.addColorStop(0.3, '#8B5A2B');
        trunkGrad.addColorStop(0.7, '#8B5A2B');
        trunkGrad.addColorStop(1, '#5D4037');
        
        ctx.fillStyle = trunkGrad;
        ctx.beginPath();
        ctx.moveTo(-r * 0.35, r * 0.3);
        ctx.quadraticCurveTo(-r * 0.4, 0, -r * 0.3, -r * 0.4);
        ctx.lineTo(-r * 0.15, -r * 0.6);
        ctx.lineTo(r * 0.15, -r * 0.6);
        ctx.lineTo(r * 0.3, -r * 0.4);
        ctx.quadraticCurveTo(r * 0.4, 0, r * 0.35, r * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // 树皮纹理
        ctx.strokeStyle = '#4E342E';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-r * 0.1, r * 0.2);
        ctx.quadraticCurveTo(-r * 0.15, -r * 0.1, -r * 0.1, -r * 0.4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(r * 0.1, r * 0.25);
        ctx.quadraticCurveTo(r * 0.12, 0, r * 0.08, -r * 0.35);
        ctx.stroke();
        
        // 树枝 - 左右伸展
        ctx.fillStyle = '#6D4C41';
        // 左枝
        ctx.beginPath();
        ctx.moveTo(-r * 0.25, -r * 0.3);
        ctx.quadraticCurveTo(-r * 0.6 + sway, -r * 0.5, -r * 0.8 + sway, -r * 0.4);
        ctx.quadraticCurveTo(-r * 0.6 + sway, -r * 0.4, -r * 0.2, -r * 0.25);
        ctx.fill();
        // 右枝
        ctx.beginPath();
        ctx.moveTo(r * 0.25, -r * 0.35);
        ctx.quadraticCurveTo(r * 0.6 - sway, -r * 0.55, r * 0.85 - sway, -r * 0.45);
        ctx.quadraticCurveTo(r * 0.6 - sway, -r * 0.45, r * 0.2, -r * 0.3);
        ctx.fill();
        
        // 樱花树冠 - 多层花团
        const drawFlowerCluster = (cx, cy, size, color) => {
            ctx.fillStyle = color;
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI * 2 / 6) * i + this.animationFrame * 0.01;
                const fx = cx + Math.cos(angle) * size * 0.4;
                const fy = cy + Math.sin(angle) * size * 0.3;
                ctx.beginPath();
                ctx.arc(fx, fy, size * 0.45, 0, Math.PI * 2);
                ctx.fill();
            }
            // 中心
            ctx.beginPath();
            ctx.arc(cx, cy, size * 0.35, 0, Math.PI * 2);
            ctx.fill();
        };
        
        // 后层花团（深色）
        drawFlowerCluster(-r * 0.5 + sway, -r * 0.7, r * 0.35, '#e091a3');
        drawFlowerCluster(r * 0.5 - sway, -r * 0.75, r * 0.35, '#e091a3');
        drawFlowerCluster(0, -r * 0.9, r * 0.4, '#e091a3');
        
        // 中层花团
        drawFlowerCluster(-r * 0.6 + sway, -r * 0.5, r * 0.4, '#ffb7c5');
        drawFlowerCluster(r * 0.55 - sway, -r * 0.55, r * 0.38, '#ffb7c5');
        drawFlowerCluster(0, -r * 0.75, r * 0.45, '#ffb7c5');
        drawFlowerCluster(-r * 0.25, -r * 0.85, r * 0.32, '#ffb7c5');
        drawFlowerCluster(r * 0.3, -r * 0.88, r * 0.3, '#ffb7c5');
        
        // 前层花团（亮色）
        drawFlowerCluster(-r * 0.35 + sway * 0.5, -r * 0.6, r * 0.3, '#ffd0dc');
        drawFlowerCluster(r * 0.4 - sway * 0.5, -r * 0.65, r * 0.28, '#ffd0dc');
        drawFlowerCluster(0, -r * 0.55, r * 0.25, '#ffd0dc');
        
        // 飘落的花瓣点缀
        ctx.fillStyle = '#ffb7c5';
        for (let i = 0; i < 6; i++) {
            const petalX = Math.sin(this.animationFrame * 0.04 + i * 1.2) * r * 0.7;
            const petalY = -r * 0.3 + Math.cos(this.animationFrame * 0.03 + i) * r * 0.2 - i * 8;
            ctx.save();
            ctx.translate(petalX, petalY);
            ctx.rotate(this.animationFrame * 0.05 + i);
            ctx.beginPath();
            ctx.ellipse(0, 0, 5, 3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        
        // 脸部区域 - 树干上的凹陷
        ctx.fillStyle = '#4E342E';
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.15, r * 0.22, r * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 眼睛 - 发光的树灵之眼
        const eyeGlow = this.isEnraged ? 1 : 0.6 + Math.sin(this.animationFrame * 0.08) * 0.4;
        
        // 眼睛光晕
        ctx.fillStyle = `rgba(255, 180, 200, ${eyeGlow * 0.4})`;
        ctx.beginPath();
        ctx.arc(-r * 0.1, -r * 0.18, 12, 0, Math.PI * 2);
        ctx.arc(r * 0.1, -r * 0.18, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // 眼睛主体
        ctx.fillStyle = this.isEnraged ? '#ff4466' : '#ff8fa3';
        ctx.shadowColor = this.isEnraged ? '#ff0044' : '#ff6b8a';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(-r * 0.1, -r * 0.18, 7, 0, Math.PI * 2);
        ctx.arc(r * 0.1, -r * 0.18, 7, 0, Math.PI * 2);
        ctx.fill();
        
        // 眼睛高光
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(-r * 0.12, -r * 0.2, 2, 0, Math.PI * 2);
        ctx.arc(r * 0.08, -r * 0.2, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 嘴巴 - 树洞形状
        ctx.fillStyle = '#3E2723';
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.02, r * 0.08, r * 0.05, 0, 0, Math.PI);
        ctx.fill();
        
        ctx.restore();
        
        // 结束受伤闪烁
        this.endDraw(ctx);
        
        this.drawHealthBar(ctx, camX, camY);
    }
}

// 注册Boss
Boss.register('sakura_treant', SakuraTreeant.CONFIG, SakuraTreeant);
