// --- Boss 系统 ---

// Boss 配置
const BOSS_TYPES = {
    sakura_treant: {
        id: 'sakura_treant',
        name: '樱花树妖',
        hp: 5000,
        damage: 15,
        speed: 0.8,
        radius: 60,
        color: '#8B4513',
        xp: 500,
        gold: 200
    },
    lava_golem: {
        id: 'lava_golem',
        name: '熔岩巨人',
        hp: 6000,
        damage: 20,
        speed: 0.6,
        radius: 70,
        color: '#FF4500',
        xp: 600,
        gold: 250
    },
    abyssal_eye: {
        id: 'abyssal_eye',
        name: '深渊之眼',
        hp: 4500,
        damage: 12,
        speed: 1.0,
        radius: 55,
        color: '#8B008B',
        xp: 450,
        gold: 180
    },
    frost_queen: {
        id: 'frost_queen',
        name: '冰霜女王',
        hp: 4000,
        damage: 10,
        speed: 1.2,
        radius: 50,
        color: '#00CED1',
        xp: 400,
        gold: 160
    }
};

// Boss 基类
class Boss {
    constructor(x, y, type) {
        const config = BOSS_TYPES[type];
        this.x = x;
        this.y = y;
        this.type = type;
        this.name = config.name;
        this.maxHp = config.hp * (Game.difficultyMult?.enemy || 1);
        this.hp = this.maxHp;
        this.damage = config.damage * (Game.difficultyMult?.enemy || 1);
        this.speed = config.speed;
        this.radius = config.radius;
        this.color = config.color;
        this.xpValue = config.xp;
        this.goldValue = config.gold * (Game.difficultyMult?.reward || 1);
        
        this.markedForDeletion = false;
        this.isBoss = true;
        this.phase = 1; // Boss阶段
        this.attackCooldown = 0;
        this.specialCooldown = 0;
        this.animationFrame = 0;
        this.knockbackX = 0;
        this.knockbackY = 0;
        
        // 特殊状态
        this.isEnraged = false;
        this.shield = 0;
        this.summonCooldown = 0;
    }
    
    update(player) {
        this.animationFrame++;
        
        // 处理击退
        if (this.knockbackX !== 0 || this.knockbackY !== 0) {
            this.x += this.knockbackX;
            this.y += this.knockbackY;
            this.knockbackX *= 0.8;
            this.knockbackY *= 0.8;
            if (Math.abs(this.knockbackX) < 0.1) this.knockbackX = 0;
            if (Math.abs(this.knockbackY) < 0.1) this.knockbackY = 0;
        }
        
        // 向玩家移动
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > this.radius + player.radius) {
            const speed = this.isEnraged ? this.speed * 1.5 : this.speed;
            this.x += (dx / dist) * speed;
            this.y += (dy / dist) * speed;
        }
        
        // 更新冷却
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.specialCooldown > 0) this.specialCooldown--;
        if (this.summonCooldown > 0) this.summonCooldown--;
        
        // 检查阶段转换
        this.checkPhaseTransition();
        
        // 执行攻击
        this.performAttacks(player);
    }
    
    checkPhaseTransition() {
        const hpPercent = this.hp / this.maxHp;
        if (hpPercent <= 0.3 && this.phase < 3) {
            this.phase = 3;
            this.onPhaseChange(3);
        } else if (hpPercent <= 0.5 && this.phase < 2) {
            this.phase = 2;
            this.onPhaseChange(2);
        }
    }
    
    onPhaseChange(phase) {
        // 子类重写
    }
    
    performAttacks(player) {
        // 子类重写
    }
    
    takeDamage(amount, kbX = 0, kbY = 0) {
        // 护盾吸收
        if (this.shield > 0) {
            const absorbed = Math.min(this.shield, amount);
            this.shield -= absorbed;
            amount -= absorbed;
            Game.addFloatingText('护盾 -' + absorbed, this.x, this.y - this.radius - 20, '#00ffff');
        }
        
        if (amount > 0) {
            this.hp -= amount;
            this.knockbackX += kbX * 0.3; // Boss击退减少
            this.knockbackY += kbY * 0.3;
            Game.addFloatingText('-' + Math.floor(amount), this.x, this.y - this.radius - 10, '#ff4444');
        }
        
        if (this.hp <= 0) {
            this.die();
        }
    }
    
    die() {
        this.markedForDeletion = true;
        
        // 掉落奖励
        Game.addXp(this.xpValue);
        const goldDrop = Math.floor(this.goldValue * (Game.goldMult || 1));
        Game.gold += goldDrop;
        Game.addFloatingText('+' + goldDrop + ' 💰', this.x, this.y - 30, '#ffd700');
        
        // 大量粒子效果
        for (let i = 0; i < 30; i++) {
            Game.particles.push({
                x: this.x,
                y: this.y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 40 + Math.random() * 30,
                color: this.color,
                size: 4 + Math.random() * 6
            });
        }
        
        Game.addFloatingText('💀 ' + this.name + ' 被击败!', this.x, this.y - 60, '#ffd700');
        Game.kills++;
        Game.bossKills++;
        
        // 武器掉落
        const weapons = WeaponGenerator.generateBossDrops(this.level || 1);
        setTimeout(() => {
            Game.showWeaponDrop(weapons);
        }, 500);
        
        // 通知武器击杀
        if (Game.player.weapon) {
            Game.player.weapon.onKill();
        }
        
        Game.updateUI();
    }
    
    draw(ctx, camX, camY) {
        // 子类重写
    }
    
    drawHealthBar(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        const barWidth = 100;
        const barHeight = 10;
        const barY = y - this.radius - 25;
        
        // 背景
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(x - barWidth/2 - 2, barY - 2, barWidth + 4, barHeight + 4);
        
        // 血条背景
        ctx.fillStyle = '#333';
        ctx.fillRect(x - barWidth/2, barY, barWidth, barHeight);
        
        // 血条
        const hpPercent = this.hp / this.maxHp;
        const hpColor = hpPercent > 0.5 ? '#ff4444' : hpPercent > 0.25 ? '#ff8800' : '#ff0000';
        ctx.fillStyle = hpColor;
        ctx.fillRect(x - barWidth/2, barY, barWidth * hpPercent, barHeight);
        
        // 护盾条
        if (this.shield > 0) {
            const shieldPercent = Math.min(this.shield / (this.maxHp * 0.3), 1);
            ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
            ctx.fillRect(x - barWidth/2, barY, barWidth * shieldPercent, barHeight);
        }
        
        // Boss名字
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, x, barY - 8);
    }
}


// ========== 樱花树妖 ==========
class SakuraTreeant extends Boss {
    constructor(x, y) {
        super(x, y, 'sakura_treant');
        this.petalAngle = 0;
        this.rootWarnings = []; // 根须警告区域
        this.fallingPetals = []; // 樱花雨
    }
    
    onPhaseChange(phase) {
        if (phase === 2) {
            Game.addFloatingText('🌸 樱花盛开!', this.x, this.y - 80, '#ffb7c5');
        } else if (phase === 3) {
            this.isEnraged = true;
            Game.addFloatingText('🌸🌸 樱花风暴!', this.x, this.y - 80, '#ff69b4');
        }
    }
    
    performAttacks(player) {
        // 花瓣风暴 - 8方向弹幕
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
            this.summonCooldown = 900; // 15秒
        }
        
        // 更新根须警告
        this.updateRootWarnings();
        
        // 樱花雨 (阶段3)
        if (this.phase >= 3 && Math.random() < 0.02) {
            this.spawnFallingPetal();
        }
        this.updateFallingPetals();
    }
    
    petalAttack() {
        const directions = 8;
        for (let i = 0; i < directions; i++) {
            const angle = (Math.PI * 2 / directions) * i + this.petalAngle;
            Game.projectiles.push(new BossProjectile(
                this.x, this.y,
                Math.cos(angle) * 4,
                Math.sin(angle) * 4,
                8, '#ffb7c5', this.damage * 0.5, 'petal'
            ));
        }
        this.petalAngle += 0.3;
    }
    
    rootAttack(player) {
        // 在玩家位置创建警告
        this.rootWarnings.push({
            x: player.x,
            y: player.y,
            timer: 60, // 1秒警告
            radius: 40,
            triggered: false
        });
    }
    
    updateRootWarnings() {
        this.rootWarnings.forEach(warning => {
            warning.timer--;
            if (warning.timer <= 0 && !warning.triggered) {
                warning.triggered = true;
                // 造成伤害
                const dx = Game.player.x - warning.x;
                const dy = Game.player.y - warning.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < warning.radius + Game.player.radius) {
                    Game.player.hp -= this.damage;
                    Game.addFloatingText('-' + this.damage, Game.player.x, Game.player.y - 30, '#8B4513');
                }
                // 粒子效果
                for (let i = 0; i < 10; i++) {
                    Game.particles.push({
                        x: warning.x,
                        y: warning.y,
                        vx: (Math.random() - 0.5) * 6,
                        vy: -Math.random() * 8,
                        life: 30,
                        color: '#8B4513',
                        size: 4
                    });
                }
            }
        });
        this.rootWarnings = this.rootWarnings.filter(w => w.timer > -30);
    }
    
    summonMinions() {
        const count = this.phase >= 3 ? 3 : 2;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 100 + Math.random() * 50;
            Game.enemies.push(new Enemy(
                this.x + Math.cos(angle) * dist,
                this.y + Math.sin(angle) * dist,
                1
            ));
        }
        Game.addFloatingText('召唤树精!', this.x, this.y - 80, '#228B22');
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
    
    updateFallingPetals() {
        this.fallingPetals.forEach(petal => {
            petal.y += petal.vy;
            petal.x += petal.vx + Math.sin(petal.y * 0.02) * 0.5;
            petal.rotation += 0.1;
            
            // 检测碰撞
            const dx = Game.player.x - petal.x;
            const dy = Game.player.y - petal.y;
            if (Math.sqrt(dx*dx + dy*dy) < Game.player.radius + 10) {
                Game.player.hp -= 3;
                petal.y = 9999; // 标记删除
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
                // 绘制根须
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
        
        // 树冠 - 多层樱花
        const crownY = y - 60;
        const layers = [
            { offset: 0, size: this.radius * 1.3, color: '#ffb7c5' },
            { offset: -20, size: this.radius * 1.1, color: '#ffc0cb' },
            { offset: -35, size: this.radius * 0.8, color: '#ffb7c5' }
        ];
        
        layers.forEach(layer => {
            ctx.fillStyle = layer.color;
            // 多个圆形组成树冠
            for (let i = 0; i < 5; i++) {
                const angle = (Math.PI * 2 / 5) * i + this.animationFrame * 0.01;
                const cx = x + Math.cos(angle) * layer.size * 0.4;
                const cy = crownY + layer.offset + Math.sin(angle) * layer.size * 0.2;
                ctx.beginPath();
                ctx.arc(cx, cy, layer.size * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        // 飘落的花瓣装饰
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
        
        // 眼睛光晕
        ctx.fillStyle = `rgba(255, 100, 100, ${eyeGlow * 0.5})`;
        ctx.beginPath();
        ctx.arc(x - 12, y - 30, 12, 0, Math.PI * 2);
        ctx.arc(x + 12, y - 30, 12, 0, Math.PI * 2);
        ctx.fill();
        
        this.drawHealthBar(ctx, camX, camY);
    }
}


// ========== 熔岩巨人 ==========
class LavaGolem extends Boss {
    constructor(x, y) {
        super(x, y, 'lava_golem');
        this.fireTrails = [];
        this.isCharging = false;
        this.chargeTarget = null;
        this.shockwaveRadius = 0;
        this.showShockwave = false;
    }
    
    onPhaseChange(phase) {
        if (phase === 2) {
            Game.addFloatingText('🔥 熔岩沸腾!', this.x, this.y - 80, '#ff6600');
        } else if (phase === 3) {
            this.isEnraged = true;
            Game.addFloatingText('🔥🔥 狂暴模式!', this.x, this.y - 80, '#ff0000');
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
            this.earthquakeSlam();
            this.specialCooldown = this.phase >= 2 ? 180 : 240;
        }
        
        // 火焰冲刺
        if (this.summonCooldown <= 0 && this.phase >= 2 && !this.isCharging) {
            this.startCharge(player);
            this.summonCooldown = 300;
        }
        
        // 更新冲刺
        this.updateCharge();
        
        // 更新火焰路径
        this.updateFireTrails();
        
        // 更新冲击波
        if (this.showShockwave) {
            this.shockwaveRadius += 8;
            if (this.shockwaveRadius > 200) {
                this.showShockwave = false;
            }
        }
        
        // 移动时留下火焰
        if (this.isCharging && this.animationFrame % 5 === 0) {
            this.fireTrails.push({
                x: this.x,
                y: this.y,
                life: 120,
                radius: 25
            });
        }
    }
    
    lavaSpray(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const baseAngle = Math.atan2(dy, dx);
        
        const count = this.phase >= 3 ? 5 : 3;
        const spread = 0.3;
        
        for (let i = 0; i < count; i++) {
            const angle = baseAngle + (i - (count-1)/2) * spread;
            Game.projectiles.push(new BossProjectile(
                this.x, this.y,
                Math.cos(angle) * 5,
                Math.sin(angle) * 5,
                12, '#ff4500', this.damage * 0.6, 'lava'
            ));
        }
    }
    
    earthquakeSlam() {
        this.showShockwave = true;
        this.shockwaveRadius = 0;
        
        // 对范围内玩家造成伤害
        setTimeout(() => {
            const dx = Game.player.x - this.x;
            const dy = Game.player.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                const damage = this.damage * (1 - dist / 200);
                Game.player.hp -= damage;
                Game.addFloatingText('-' + Math.floor(damage), Game.player.x, Game.player.y - 30, '#ff4500');
            }
        }, 200);
        
        // 屏幕震动效果
        Game.screenShake = 20;
    }
    
    startCharge(player) {
        this.isCharging = true;
        this.chargeTarget = { x: player.x, y: player.y };
        this.chargeTimer = 60;
        Game.addFloatingText('⚡ 冲锋!', this.x, this.y - 80, '#ff6600');
    }
    
    updateCharge() {
        if (!this.isCharging) return;
        
        this.chargeTimer--;
        
        if (this.chargeTimer > 0) {
            // 快速移向目标
            const dx = this.chargeTarget.x - this.x;
            const dy = this.chargeTarget.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 10) {
                this.x += (dx / dist) * 8;
                this.y += (dy / dist) * 8;
            }
            
            // 碰撞检测
            const playerDx = Game.player.x - this.x;
            const playerDy = Game.player.y - this.y;
            const playerDist = Math.sqrt(playerDx * playerDx + playerDy * playerDy);
            if (playerDist < this.radius + Game.player.radius) {
                Game.player.hp -= this.damage * 1.5;
                Game.addFloatingText('-' + Math.floor(this.damage * 1.5), Game.player.x, Game.player.y - 30, '#ff4500');
                this.isCharging = false;
            }
        } else {
            this.isCharging = false;
        }
    }
    
    updateFireTrails() {
        this.fireTrails.forEach(trail => {
            trail.life--;
            
            // 对玩家造成持续伤害
            if (trail.life > 0 && Game.frameCount % 30 === 0) {
                const dx = Game.player.x - trail.x;
                const dy = Game.player.y - trail.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < trail.radius + Game.player.radius) {
                    Game.player.hp -= 5;
                    Game.addFloatingText('-5', Game.player.x, Game.player.y - 30, '#ff6600');
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
        
        // 身体 - 岩石质感
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
        
        // 裂缝线条
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
        
        // 左臂
        ctx.beginPath();
        ctx.moveTo(x - 50, y - 10);
        ctx.lineTo(x - 70 - armSwing, y + 20);
        ctx.lineTo(x - 80 - armSwing, y + 15);
        ctx.lineTo(x - 65, y - 15);
        ctx.fill();
        
        // 右臂
        ctx.beginPath();
        ctx.moveTo(x + 50, y - 10);
        ctx.lineTo(x + 70 + armSwing, y + 20);
        ctx.lineTo(x + 80 + armSwing, y + 15);
        ctx.lineTo(x + 65, y - 15);
        ctx.fill();
        
        // 头部 - 燃烧的火焰
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


// ========== 深渊之眼 ==========
class AbyssalEye extends Boss {
    constructor(x, y) {
        super(x, y, 'abyssal_eye');
        this.pupilSize = 20;
        this.tentacles = [];
        this.laserTarget = null;
        this.laserCharging = false;
        this.laserFiring = false;
        this.laserAngle = 0;
        this.teleportCooldown = 0;
        this.distortionEffect = 0;
        
        // 初始化触手
        for (let i = 0; i < 8; i++) {
            this.tentacles.push({
                angle: (Math.PI * 2 / 8) * i,
                length: 40 + Math.random() * 20,
                phase: Math.random() * Math.PI * 2,
                segments: []
            });
        }
    }
    
    onPhaseChange(phase) {
        if (phase === 2) {
            Game.addFloatingText('👁️ 凝视深渊...', this.x, this.y - 80, '#9932cc');
        } else if (phase === 3) {
            this.isEnraged = true;
            this.distortionEffect = 1;
            Game.addFloatingText('👁️👁️ 精神干扰!', this.x, this.y - 80, '#ff00ff');
        }
    }
    
    performAttacks(player) {
        // 死亡凝视 - 追踪激光
        if (this.attackCooldown <= 0 && !this.laserCharging && !this.laserFiring) {
            this.startLaser(player);
            this.attackCooldown = this.isEnraged ? 120 : 180;
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
        
        // 更新激光
        this.updateLaser(player);
        
        // 更新触手
        this.updateTentacles();
    }
    
    startLaser(player) {
        this.laserCharging = true;
        this.laserTarget = { x: player.x, y: player.y };
        this.laserChargeTime = 60;
        this.pupilSize = 10;
        Game.addFloatingText('⚡ 凝视!', this.x, this.y - 80, '#ff00ff');
    }
    
    updateLaser(player) {
        if (this.laserCharging) {
            this.laserChargeTime--;
            // 追踪玩家
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
            
            // 激光伤害检测
            const laserLength = 500;
            const laserWidth = 20;
            
            // 简化的线段碰撞检测
            const endX = this.x + Math.cos(this.laserAngle) * laserLength;
            const endY = this.y + Math.sin(this.laserAngle) * laserLength;
            
            // 检测玩家是否在激光路径上
            const playerDist = this.pointToLineDistance(
                player.x, player.y,
                this.x, this.y,
                endX, endY
            );
            
            if (playerDist < laserWidth + player.radius && Game.frameCount % 10 === 0) {
                Game.player.hp -= this.damage;
                Game.addFloatingText('-' + this.damage, Game.player.x, Game.player.y - 30, '#ff00ff');
            }
            
            if (this.laserFireTime <= 0) {
                this.laserFiring = false;
                this.pupilSize = 20;
            }
        }
    }
    
    pointToLineDistance(px, py, x1, y1, x2, y2) {
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
    
    tentacleSweep() {
        // 触手向外延伸攻击
        this.tentacles.forEach(t => {
            t.extending = true;
            t.extendTime = 30;
        });
    }
    
    updateTentacles() {
        this.tentacles.forEach((t, i) => {
            t.angle += 0.01;
            t.phase += 0.1;
            
            if (t.extending) {
                t.extendTime--;
                t.length = 80 + Math.sin(t.extendTime * 0.2) * 40;
                
                // 检测碰撞
                const tipX = this.x + Math.cos(t.angle) * t.length;
                const tipY = this.y + Math.sin(t.angle) * t.length;
                const dx = Game.player.x - tipX;
                const dy = Game.player.y - tipY;
                if (Math.sqrt(dx*dx + dy*dy) < 20 + Game.player.radius) {
                    Game.player.hp -= this.damage * 0.5;
                    Game.addFloatingText('-' + Math.floor(this.damage * 0.5), Game.player.x, Game.player.y - 30, '#9932cc');
                }
                
                if (t.extendTime <= 0) {
                    t.extending = false;
                    t.length = 40 + Math.random() * 20;
                }
            }
        });
    }
    
    teleport(player) {
        // 传送到玩家附近
        const angle = Math.random() * Math.PI * 2;
        const dist = 150 + Math.random() * 100;
        
        // 粒子效果 - 消失
        for (let i = 0; i < 15; i++) {
            Game.particles.push({
                x: this.x,
                y: this.y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 30,
                color: '#9932cc',
                size: 5
            });
        }
        
        this.x = player.x + Math.cos(angle) * dist;
        this.y = player.y + Math.sin(angle) * dist;
        
        // 粒子效果 - 出现
        for (let i = 0; i < 15; i++) {
            Game.particles.push({
                x: this.x,
                y: this.y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 30,
                color: '#ff00ff',
                size: 5
            });
        }
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        
        // 精神干扰效果 (阶段3)
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
        this.tentacles.forEach((t, i) => {
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
            
            // 触手尖端
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
        
        // 眼球边缘
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
            // 充能效果
            const chargeAlpha = 1 - this.laserChargeTime / 60;
            ctx.strokeStyle = `rgba(255, 0, 255, ${chargeAlpha})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(
                x + Math.cos(this.laserAngle) * 100,
                y + Math.sin(this.laserAngle) * 100
            );
            ctx.stroke();
            
            // 充能圈
            ctx.strokeStyle = `rgba(255, 0, 255, ${chargeAlpha})`;
            ctx.beginPath();
            ctx.arc(x, y, this.radius + 20 * chargeAlpha, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        if (this.laserFiring) {
            // 激光主体
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
            ctx.lineTo(
                x + Math.cos(this.laserAngle) * 500,
                y + Math.sin(this.laserAngle) * 500
            );
            ctx.stroke();
            
            // 激光核心
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(
                x + Math.cos(this.laserAngle) * 500,
                y + Math.sin(this.laserAngle) * 500
            );
            ctx.stroke();
        }
        
        this.drawHealthBar(ctx, camX, camY);
    }
}


// ========== 冰霜女王 ==========
class FrostQueen extends Boss {
    constructor(x, y) {
        super(x, y, 'frost_queen');
        this.capeAngle = 0;
        this.iceZones = [];
        this.blizzardActive = false;
        this.blizzardParticles = [];
        this.staffGlow = 0;
    }
    
    onPhaseChange(phase) {
        if (phase === 2) {
            this.shield = this.maxHp * 0.2;
            Game.addFloatingText('❄️ 冰盾!', this.x, this.y - 80, '#00ffff');
        } else if (phase === 3) {
            this.isEnraged = true;
            this.blizzardActive = true;
            Game.addFloatingText('❄️❄️ 暴风雪!', this.x, this.y - 80, '#87ceeb');
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
        
        // 更新冰冻区域
        this.updateIceZones();
        
        // 暴风雪
        if (this.blizzardActive) {
            this.updateBlizzard();
        }
        
        // 护盾恢复 (阶段2+)
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
            Game.projectiles.push(new BossProjectile(
                this.x, this.y,
                Math.cos(angle) * 6,
                Math.sin(angle) * 6,
                10, '#87ceeb', this.damage * 0.7, 'icicle'
            ));
        }
    }
    
    createIceZone(player) {
        this.iceZones.push({
            x: player.x,
            y: player.y,
            radius: 80,
            life: 300, // 5秒
            slowAmount: 0.5
        });
        Game.addFloatingText('❄️ 冰冻领域', player.x, player.y - 30, '#00ffff');
    }
    
    updateIceZones() {
        this.iceZones.forEach(zone => {
            zone.life--;
            
            // 检测玩家是否在区域内
            const dx = Game.player.x - zone.x;
            const dy = Game.player.y - zone.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < zone.radius + Game.player.radius) {
                // 减速效果
                Game.player.slowEffect = zone.slowAmount;
                Game.player.slowTimer = 30;
                
                // 持续伤害
                if (Game.frameCount % 60 === 0) {
                    Game.player.hp -= 3;
                    Game.addFloatingText('-3', Game.player.x, Game.player.y - 30, '#00ffff');
                }
            }
        });
        
        this.iceZones = this.iceZones.filter(z => z.life > 0);
    }
    
    updateBlizzard() {
        // 生成暴风雪粒子
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
        
        // 更新粒子
        this.blizzardParticles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            
            // 检测碰撞
            const dx = Game.player.x - p.x;
            const dy = Game.player.y - p.y;
            if (Math.sqrt(dx*dx + dy*dy) < Game.player.radius + p.size) {
                Game.player.hp -= 1;
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
            
            // 冰晶装饰
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
        
        // 身体 - 冰晶质感
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
        
        // 身体边缘高光
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
        
        // 冰冠高光
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
        
        // 眼睛光晕
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
        
        // 杖顶冰晶
        ctx.fillStyle = `rgba(0, 255, 255, ${staffGlowAlpha})`;
        ctx.beginPath();
        ctx.moveTo(x + 30, y - 50);
        ctx.lineTo(x + 25, y - 35);
        ctx.lineTo(x + 30, y - 30);
        ctx.lineTo(x + 35, y - 35);
        ctx.closePath();
        ctx.fill();
        
        // 杖顶光晕
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
            
            // 护盾六边形
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


// ========== Boss 投射物 ==========
class BossProjectile {
    constructor(x, y, vx, vy, radius, color, damage, type) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
        this.damage = damage;
        this.type = type;
        this.life = 300;
        this.markedForDeletion = false;
        this.rotation = 0;
        this.isBossProjectile = true;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.rotation += 0.1;
        
        if (this.life <= 0) {
            this.markedForDeletion = true;
            return;
        }
        
        // 检测与玩家碰撞
        const dx = Game.player.x - this.x;
        const dy = Game.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < this.radius + Game.player.radius) {
            Game.player.hp -= this.damage;
            Game.addFloatingText('-' + Math.floor(this.damage), Game.player.x, Game.player.y - 30, this.color);
            this.markedForDeletion = true;
            
            // 粒子效果
            for (let i = 0; i < 5; i++) {
                Game.particles.push({
                    x: this.x,
                    y: this.y,
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.5) * 4,
                    life: 20,
                    color: this.color,
                    size: 3
                });
            }
        }
    }
    
    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.rotation);
        
        if (this.type === 'petal') {
            // 花瓣形状
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.radius, this.radius * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.ellipse(-2, -2, this.radius * 0.4, this.radius * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'lava') {
            // 熔岩球
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
            gradient.addColorStop(0, '#ffff00');
            gradient.addColorStop(0.5, '#ff6600');
            gradient.addColorStop(1, '#ff0000');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'icicle') {
            // 冰锥
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(this.radius, 0);
            ctx.lineTo(-this.radius * 0.5, -this.radius * 0.5);
            ctx.lineTo(-this.radius * 0.5, this.radius * 0.5);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.moveTo(this.radius * 0.5, 0);
            ctx.lineTo(-this.radius * 0.3, -this.radius * 0.3);
            ctx.lineTo(-this.radius * 0.3, this.radius * 0.3);
            ctx.closePath();
            ctx.fill();
        } else {
            // 默认圆形
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

// ========== Boss 管理器 ==========
const BossManager = {
    bosses: [],
    bossSpawnTimer: 0,
    bossSpawnInterval: 300 * 60, // 5分钟 (300秒 * 60帧)
    
    init() {
        this.bosses = [];
        this.bossSpawnTimer = 0;
    },
    
    update() {
        // 定时生成Boss
        this.bossSpawnTimer++;
        if (this.bossSpawnTimer >= this.bossSpawnInterval) {
            this.spawnRandomBoss();
            this.bossSpawnTimer = 0;
        }
        
        // 更新所有Boss
        this.bosses.forEach(boss => {
            boss.update(Game.player);
        });
        
        // 清理死亡的Boss
        this.bosses = this.bosses.filter(b => !b.markedForDeletion);
    },
    
    draw(ctx, camX, camY) {
        this.bosses.forEach(boss => {
            boss.draw(ctx, camX, camY);
        });
    },
    
    spawnRandomBoss() {
        const bossTypes = ['sakura_treant', 'lava_golem', 'abyssal_eye', 'frost_queen'];
        const randomType = bossTypes[Math.floor(Math.random() * bossTypes.length)];
        this.spawnBoss(randomType);
    },
    
    spawnBoss(type) {
        const angle = Math.random() * Math.PI * 2;
        const dist = CONFIG.ENEMY_SPAWN_DISTANCE + 100;
        const x = Game.player.x + Math.cos(angle) * dist;
        const y = Game.player.y + Math.sin(angle) * dist;
        
        let boss;
        switch(type) {
            case 'sakura_treant':
                boss = new SakuraTreeant(x, y);
                break;
            case 'lava_golem':
                boss = new LavaGolem(x, y);
                break;
            case 'abyssal_eye':
                boss = new AbyssalEye(x, y);
                break;
            case 'frost_queen':
                boss = new FrostQueen(x, y);
                break;
            default:
                boss = new SakuraTreeant(x, y);
        }
        
        this.bosses.push(boss);
        Game.addFloatingText('⚠️ ' + boss.name + ' 出现了!', Game.player.x, Game.player.y - 100, '#ff0000');
        
        return boss;
    },
    
    // 检测投射物与Boss的碰撞
    checkProjectileCollision(projectile) {
        for (const boss of this.bosses) {
            if (!boss.markedForDeletion && !projectile.markedForDeletion) {
                const dx = projectile.x - boss.x;
                const dy = projectile.y - boss.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < projectile.radius + boss.radius) {
                    return boss;
                }
            }
        }
        return null;
    }
};
