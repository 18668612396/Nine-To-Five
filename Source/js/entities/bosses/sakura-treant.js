// --- 樱花树妖 Boss ---

class SakuraTreeant extends Boss {
    static CONFIG = {
        id: 'sakura_treant',
        name: '樱花树妖',
        hp: 5000,
        damage: 15,
        speed: 0.8,
        radius: 60,
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
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(x, y + this.radius * 0.8, this.radius * 1.2, this.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 树根
        ctx.fillStyle = '#5D4037';
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i + Math.sin(this.animationFrame * 0.02) * 0.1;
            const rootX = x + Math.cos(angle) * this.radius * 0.8;
            const rootY = y + this.radius * 0.5;
            ctx.beginPath();
            ctx.moveTo(x, y + 20);
            ctx.quadraticCurveTo(rootX, rootY - 10, rootX, rootY + 20);
            ctx.lineTo(rootX - 8, rootY + 20);
            ctx.quadraticCurveTo(rootX - 8, rootY - 5, x, y + 20);
            ctx.fill();
        }
        
        // 树干
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.moveTo(x - 25, y + 30);
        ctx.lineTo(x - 35, y - 20);
        ctx.lineTo(x - 20, y - 60);
        ctx.lineTo(x + 20, y - 60);
        ctx.lineTo(x + 35, y - 20);
        ctx.lineTo(x + 25, y + 30);
        ctx.fill();
        
        // 树皮纹理
        ctx.strokeStyle = '#5D4037';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(x - 15 + i * 10, y + 20);
            ctx.lineTo(x - 20 + i * 12, y - 40);
            ctx.stroke();
        }
        
        // 树冠
        const crownY = y - 60;
        const layers = [
            { offset: 0, size: this.radius * 1.3, color: '#ffb7c5' },
            { offset: -20, size: this.radius * 1.1, color: '#ffc0cb' },
            { offset: -35, size: this.radius * 0.8, color: '#ffb7c5' }
        ];
        
        layers.forEach(layer => {
            ctx.fillStyle = layer.color;
            for (let i = 0; i < 5; i++) {
                const angle = (Math.PI * 2 / 5) * i + this.animationFrame * 0.01;
                const cx = x + Math.cos(angle) * layer.size * 0.4;
                const cy = crownY + layer.offset + Math.sin(angle) * layer.size * 0.2;
                ctx.beginPath();
                ctx.arc(cx, cy, layer.size * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        // 飘落花瓣装饰
        ctx.fillStyle = '#ffb7c5';
        for (let i = 0; i < 8; i++) {
            const petalX = x + Math.sin(this.animationFrame * 0.03 + i) * 50;
            const petalY = crownY - 30 + Math.cos(this.animationFrame * 0.02 + i * 0.5) * 20 + i * 15;
            ctx.beginPath();
            ctx.ellipse(petalX, petalY, 6, 4, this.animationFrame * 0.05 + i, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 眼睛
        const eyeGlow = this.isEnraged ? 1 : 0.7 + Math.sin(this.animationFrame * 0.1) * 0.3;
        ctx.fillStyle = `rgba(255, 0, 0, ${eyeGlow})`;
        ctx.beginPath();
        ctx.arc(x - 12, y - 30, 8, 0, Math.PI * 2);
        ctx.arc(x + 12, y - 30, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = `rgba(255, 100, 100, ${eyeGlow * 0.5})`;
        ctx.beginPath();
        ctx.arc(x - 12, y - 30, 12, 0, Math.PI * 2);
        ctx.arc(x + 12, y - 30, 12, 0, Math.PI * 2);
        ctx.fill();
        
        this.drawHealthBar(ctx, camX, camY);
    }
}

// 注册Boss
Boss.register('sakura_treant', SakuraTreeant.CONFIG, SakuraTreeant);
