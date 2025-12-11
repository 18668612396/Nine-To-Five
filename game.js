// --- Constants & Config ---
const CANVAS = document.getElementById('gameCanvas');
const CTX = CANVAS.getContext('2d');

// Adjust canvas to full screen
function resize() {
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Game Config
const TILE_SIZE = 64; // For background grid
const FPS = 60;

// Colors
const COLORS = {
    guagua: '#fff8e1', // Ragdoll Cream
    guagua_dark: '#8d6e63', // Ragdoll Brown (Points)
    kuikui: '#90a4ae', // BSH Blue-Grey
    kuikui_dark: '#607d8b', // BSH Darker Grey
    enemy_1: '#ac92ec', // Purple blob
    enemy_2: '#ec87c0', // Pink blob
    enemy_3: '#ffce54', // Yellow blob
    gem: '#48cfad',
    damage: '#ed5565'
};

// --- Upgrade Cards Data (20 Cards) ---
const UPGRADES = [
    { id: 'speed', name: '神速喵喵', desc: '移动速度 +10%', type: 'stat', stat: 'speed', val: 1.1 },
    { id: 'max_hp', name: '大橘为重', desc: '最大生命值 +20', type: 'stat', stat: 'maxHp', val: 20 },
    { id: 'regen', name: '呼噜治愈', desc: '每秒生命恢复 +1', type: 'stat', stat: 'regen', val: 1 },
    { id: 'pickup', name: '磁吸肉垫', desc: '拾取范围 +20%', type: 'stat', stat: 'pickupRange', val: 1.2 },
    { id: 'might', name: '锋利猫爪', desc: '伤害 +10%', type: 'stat', stat: 'damageMult', val: 0.1 },
    { id: 'area', name: '胖胖威压', desc: '攻击范围 +10%', type: 'stat', stat: 'areaMult', val: 0.1 },
    { id: 'haste', name: '猫猫拳', desc: '攻击冷却 -10%', type: 'stat', stat: 'cooldownMult', val: 0.9 },
    { id: 'proj_speed', name: '超声波', desc: '投射物速度 +15%', type: 'stat', stat: 'projSpeed', val: 1.15 },
    { id: 'duration', name: '持久耐力', desc: '效果持续时间 +15%', type: 'stat', stat: 'durationMult', val: 1.15 },
    { id: 'crit', name: '幸运猫', desc: '暴击率 +5%', type: 'stat', stat: 'critChance', val: 0.05 },
    
    // Weapons / Active Skills
    { id: 'garlic', name: '臭豆腐光环', desc: '周围产生持续伤害区域', type: 'weapon', weaponId: 'garlic' },
    { id: 'axe', name: '抛抛球', desc: '向上抛出毛线球', type: 'weapon', weaponId: 'axe' },
    { id: 'wand', name: '激光笔', desc: '发射激光攻击最近的敌人', type: 'weapon', weaponId: 'wand' },
    { id: 'orbit', name: '护体小鱼干', desc: '小鱼干围绕你旋转', type: 'weapon', weaponId: 'orbit' },
    
    // Advanced Stats
    { id: 'multishot', name: '多重影分身', desc: '投射物数量 +1 (针对部分武器)', type: 'stat', stat: 'amount', val: 1 },
    { id: 'knockback', name: '大力金刚掌', desc: '击退效果 +20%', type: 'stat', stat: 'knockback', val: 1.2 },
    
    // More Fillers
    { id: 'speed_2', name: '风行者', desc: '移动速度 +15%', type: 'stat', stat: 'speed', val: 1.15 },
    { id: 'max_hp_2', name: '九命猫', desc: '最大生命值 +30', type: 'stat', stat: 'maxHp', val: 30 },
    { id: 'might_2', name: '猛虎下山', desc: '伤害 +15%', type: 'stat', stat: 'damageMult', val: 0.15 },
    { id: 'regen_2', name: '深度睡眠', desc: '每秒生命恢复 +2', type: 'stat', stat: 'regen', val: 2 },
];

// --- Input Handling ---
const Input = {
    keys: {},
    init() {
        window.addEventListener('keydown', e => this.keys[e.code] = true);
        window.addEventListener('keyup', e => this.keys[e.code] = false);
    },
    getAxis() {
        let x = 0, y = 0;
        if (this.keys['ArrowUp'] || this.keys['KeyW']) y -= 1;
        if (this.keys['ArrowDown'] || this.keys['KeyS']) y += 1;
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) x -= 1;
        if (this.keys['ArrowRight'] || this.keys['KeyD']) x += 1;
        
        // Normalize
        if (x !== 0 || y !== 0) {
            const len = Math.sqrt(x*x + y*y);
            x /= len;
            y /= len;
        }
        return { x, y };
    }
};

// --- Utils ---
function checkRectCollide(r1, r2) {
    return r1.x < r2.x + r2.w && r1.x + r1.w > r2.x &&
           r1.y < r2.y + r2.h && r1.y + r1.h > r2.y;
}
function checkCircleCollide(c1, c2) {
    const dx = c1.x - c2.x;
    const dy = c1.y - c2.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    return dist < c1.radius + c2.radius;
}

// --- Classes ---

class Entity {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.markedForDeletion = false;
    }
    draw(ctx, camX, camY) {
        ctx.beginPath();
        ctx.arc(this.x - camX, this.y - camY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

class Player extends Entity {
    constructor(charType) {
        super(0, 0, 15, '#fff');
        this.charType = charType;
        
        // Base Stats
        this.speed = 3;
        this.maxHp = 100;
        this.hp = 100;
        this.regen = 0;
        this.pickupRange = 60;
        
        // Combat Stats modifiers
        this.damageMult = 1.0;
        this.areaMult = 1.0;
        this.cooldownMult = 1.0;
        this.projSpeed = 1.0;
        this.durationMult = 1.0;
        this.critChance = 0.05;
        this.amount = 0;
        this.knockback = 1.0;

        // Weapons
        this.weapons = [];

        // Apply Character specifics
        if (charType === 'guagua') { // Ragdoll (White/Tan)
            this.color = COLORS.guagua;
            this.speed = 3.5; // Faster
            this.addWeapon('fishbone'); // Starting weapon
        } else { // Xiao Kui (Grey/White BSH)
            this.color = COLORS.kuikui;
            this.maxHp = 150; // Tankier
            this.hp = 150;
            this.addWeapon('aura'); // Starting weapon
        }

        // Visuals
        this.facingRight = true;
    }

    addWeapon(id) {
        // If already has weapon, maybe upgrade it (simplified: do nothing or just add duplicate logic handled in update)
        // Check if we have a weapon class for this ID
        const w = this.weapons.find(w => w.id === id);
        if (w) {
            w.levelUp();
        } else {
            switch(id) {
                case 'fishbone': this.weapons.push(new WeaponFishbone(this)); break;
                case 'aura': this.weapons.push(new WeaponAura(this)); break;
                case 'garlic': this.weapons.push(new WeaponGarlic(this)); break;
                case 'axe': this.weapons.push(new WeaponAxe(this)); break;
                case 'wand': this.weapons.push(new WeaponWand(this)); break;
                case 'orbit': this.weapons.push(new WeaponOrbit(this)); break;
            }
        }
    }

    update() {
        // Movement
        const input = Input.getAxis();
        this.x += input.x * this.speed;
        this.y += input.y * this.speed;
        
        if (input.x > 0) this.facingRight = true;
        if (input.x < 0) this.facingRight = false;

        // Regen
        if (this.regen > 0 && this.hp < this.maxHp) {
            this.hp += this.regen / 60;
            if (this.hp > this.maxHp) this.hp = this.maxHp;
        }

        // Weapons
        this.weapons.forEach(w => w.update());
    }

    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        const r = this.radius;
        const facingRight = Input.getAxis().x >= 0; 
        
        ctx.save();
        ctx.translate(x, y);
        if (!facingRight && Input.getAxis().x !== 0) {
             ctx.scale(-1, 1);
        }

        // --- No Stroke / Flat Design ---

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(0, r + 2, r * 0.8, r * 0.3, 0, 0, Math.PI*2);
        ctx.fill();

        if (this.charType === 'kuikui') {
            // === XIAO KUI (Blue/White British Shorthair) ===
            // Grey: #90a4ae, White: #ffffff
            
            // 1. Tail (Grey, thick, round tip)
            const tailAngle = Math.sin(Game.frameCount * 0.15) * 0.3;
            ctx.save();
            ctx.translate(-8, 8);
            ctx.rotate(tailAngle + Math.PI/3);
            ctx.fillStyle = COLORS.kuikui_dark;
            ctx.beginPath();
            ctx.ellipse(10, 0, 10, 4, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.restore();

            // 2. Body (Grey back, white belly)
            // Main body (Grey)
            ctx.fillStyle = COLORS.kuikui;
            ctx.beginPath();
            ctx.ellipse(0, 6, r, r * 0.8, 0, 0, Math.PI*2);
            ctx.fill();
            
            // Belly Patch (White)
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.ellipse(0, 8, r * 0.6, r * 0.5, 0, 0, Math.PI*2);
            ctx.fill();

            // Paws (White)
            const bob = Math.sin(Game.frameCount * 0.2) * 2;
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.ellipse(-6, 13 + bob, 3.5, 3, 0, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(6, 13 - bob, 3.5, 3, 0, 0, Math.PI*2); ctx.fill();

            // 3. Head (Grey top, White bottom)
            // Base Head (White)
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(0, -6, r * 0.95, 0, Math.PI*2);
            ctx.fill();

            // Grey Mask (Top half + Ears)
            ctx.fillStyle = COLORS.kuikui;
            
            // Ears (Grey triangles)
            ctx.beginPath();
            ctx.moveTo(-10, -12); ctx.lineTo(-14, -22); ctx.lineTo(-2, -16); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(10, -12); ctx.lineTo(14, -22); ctx.lineTo(2, -16); ctx.fill();

            // Forehead Patch (Inverted V shape common in BSH bi-colors)
            ctx.beginPath();
            ctx.arc(0, -6, r * 0.95, Math.PI, 0); // Top semicircle
            ctx.lineTo(0, -6); // Down to center
            ctx.fill();
            
            // Fix the cut - let's make a nice mask shape
            ctx.beginPath();
            ctx.moveTo(-r + 1, -6);
            ctx.quadraticCurveTo(-r + 1, -20, 0, -20); // Top curve
            ctx.quadraticCurveTo(r - 1, -20, r - 1, -6);
            ctx.lineTo(0, -10); // The V point
            ctx.fill();

            // 4. Face Features
            // Eyes (Orange/Amber for BSH)
            const blink = Math.floor(Game.frameCount / 150) % 2 === 0 || Game.frameCount % 200 > 10;
            if (blink) {
                ctx.fillStyle = '#ffb74d'; // Amber
                ctx.beginPath(); ctx.arc(-5, -6, 3.5, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(5, -6, 3.5, 0, Math.PI*2); ctx.fill();
                // Pupils
                ctx.fillStyle = '#263238';
                ctx.beginPath(); ctx.arc(-5, -6, 1.5, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(5, -6, 1.5, 0, Math.PI*2); ctx.fill();
            } else {
                // Closed eyes (Dark Grey)
                ctx.fillStyle = '#263238';
                ctx.fillRect(-7, -6, 4, 1.5);
                ctx.fillRect(3, -6, 4, 1.5);
            }

            // Nose (Pink)
            ctx.fillStyle = '#f48fb1';
            ctx.beginPath(); ctx.ellipse(0, -1, 2, 1.5, 0, 0, Math.PI*2); ctx.fill();

        } else {
            // === GUAGUA (Ragdoll) ===
            // Cream: #fff8e1, Brown Points: #8d6e63
            
            // 1. Tail (Fluffy, Dark Brown)
            const tailAngle = Math.sin(Game.frameCount * 0.15) * 0.4;
            ctx.save();
            ctx.translate(-8, 8);
            ctx.rotate(tailAngle + Math.PI/4);
            ctx.fillStyle = COLORS.guagua_dark;
            // Fluffy tail made of circles
            ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(5, 0, 6, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(10, 0, 7, 0, Math.PI*2); ctx.fill();
            ctx.restore();

            // 2. Body (Fluffy Cream)
            ctx.fillStyle = COLORS.guagua;
            ctx.beginPath();
            ctx.ellipse(0, 6, r, r * 0.8, 0, 0, Math.PI*2);
            ctx.fill();
            
            // Fluff on sides
            ctx.beginPath(); ctx.arc(-r+2, 6, 4, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(r-2, 6, 4, 0, Math.PI*2); ctx.fill();

            // Paws (White - Bicolor trait)
            const bob = Math.sin(Game.frameCount * 0.2) * 2;
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.ellipse(-6, 13 + bob, 4, 3, 0, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(6, 13 - bob, 4, 3, 0, 0, Math.PI*2); ctx.fill();

            // Ears (Brown) - 先画耳朵，让头盖住耳朵根部
            ctx.fillStyle = COLORS.guagua_dark;
            ctx.beginPath();
            ctx.moveTo(-9, -14); ctx.lineTo(-14, -24); ctx.lineTo(-3, -17); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(9, -14); ctx.lineTo(14, -24); ctx.lineTo(3, -17); ctx.fill();

            // 3. Head (Cream base)
            ctx.fillStyle = COLORS.guagua;
            ctx.beginPath();
            ctx.arc(0, -6, r * 0.95, 0, Math.PI*2);
            ctx.fill();
            
            // Fluffy cheeks (Cream)
            ctx.beginPath(); ctx.arc(-9, -2, 4, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(9, -2, 4, 0, Math.PI*2); ctx.fill();

            // Mask (Brown Points - Bicolor V shape)
            ctx.fillStyle = COLORS.guagua_dark;
            ctx.beginPath();
            // Left Eye Patch (Rotated Oval) - 保持原样
            ctx.ellipse(-6, -7, 6, 7, 0.4, 0, Math.PI*2);
            ctx.fill();
            // Left side extension - 向左侧延伸
            ctx.beginPath();
            ctx.ellipse(-12, -3, 4, 5, 0.2, 0, Math.PI*2);
            ctx.fill();
            
            ctx.beginPath();
            // Right Eye Patch (Rotated Oval) - 保持原样
            ctx.ellipse(6, -7, 6, 7, -0.4, 0, Math.PI*2); 
            ctx.fill();
            // Right side extension - 向右侧延伸
            ctx.beginPath();
            ctx.ellipse(12, -3, 4, 5, -0.2, 0, Math.PI*2);
            ctx.fill();

            // 4. Face Features
            // Eyes (Blue for Ragdoll)
            const blink = Math.floor(Game.frameCount / 150) % 2 === 0 || Game.frameCount % 200 > 10;
            if (blink) {
                ctx.fillStyle = '#4fc3f7'; // Sky Blue
                ctx.beginPath(); ctx.arc(-5, -6, 3.5, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(5, -6, 3.5, 0, Math.PI*2); ctx.fill();
                // Pupils
                ctx.fillStyle = '#01579b';
                ctx.beginPath(); ctx.arc(-5, -6, 1.5, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(5, -6, 1.5, 0, Math.PI*2); ctx.fill();
                // Highlights
                ctx.fillStyle = '#fff';
                ctx.beginPath(); ctx.arc(-3.5, -7.5, 1.5, 0, Math.PI*2); ctx.fill();
            } else {
                ctx.fillStyle = '#3e2723';
                ctx.fillRect(-7, -6, 4, 1.5);
                ctx.fillRect(3, -6, 4, 1.5);
            }

            // Nose (Pink)
            ctx.fillStyle = '#f48fb1';
            ctx.beginPath(); ctx.ellipse(0, -1, 2, 1.5, 0, 0, Math.PI*2); ctx.fill();
        }

        ctx.restore();
    }
}

class Enemy extends Entity {
    constructor(x, y, type) {
        let r = 12;
        let c = COLORS.enemy_1;
        let hp = 10;
        let speed = 1.5;
        let xp = 1;

        if (type === 2) { // Fast pink
            c = COLORS.enemy_2;
            speed = 2.2;
            hp = 5;
            xp = 2;
        } else if (type === 3) { // Big yellow
            c = COLORS.enemy_3;
            r = 18;
            speed = 1.0;
            hp = 25;
            xp = 5;
        }

        // Scale by game time difficulty
        const diffMult = 1 + (Game.time / 60) * 0.1; // +10% stats per minute
        hp *= diffMult;

        super(x, y, r, c);
        this.hp = hp;
        this.maxHp = hp;
        this.speed = speed;
        this.xpValue = xp;
        this.damage = 5;
        this.knockbackX = 0;
        this.knockbackY = 0;
    }

    update(player) {
        // Knockback recovery
        this.knockbackX *= 0.9;
        this.knockbackY *= 0.9;

        if (Math.abs(this.knockbackX) < 0.1) this.knockbackX = 0;
        if (Math.abs(this.knockbackY) < 0.1) this.knockbackY = 0;

        // Move towards player
        if (this.knockbackX === 0 && this.knockbackY === 0) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist > 0) {
                this.x += (dx / dist) * this.speed;
                this.y += (dy / dist) * this.speed;
            }
        } else {
            this.x += this.knockbackX;
            this.y += this.knockbackY;
        }
    }

    takeDamage(amt, kbX, kbY) {
        this.hp -= amt;
        this.knockbackX = kbX || 0;
        this.knockbackY = kbY || 0;
        
        // Flash white (handled in draw or simple effect)
        Game.addFloatingText(Math.floor(amt), this.x, this.y, '#fff');

        if (this.hp <= 0) {
            this.markedForDeletion = true;
            Game.spawnGem(this.x, this.y, this.xpValue);
            Game.kills++;
        }
    }

    draw(ctx, camX, camY) {
        const x = this.x - camX;
        const y = this.y - camY;
        const r = this.radius;

        // Bounce effect
        const bounce = Math.sin(Game.frameCount * 0.2 + this.x) * 2;
        
        ctx.save();
        ctx.translate(x, y + bounce);

        // Body shape based on type
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;

        if (this.speed > 2.0) { 
            // Type 2: Fast (Bat/Winged)
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI*2);
            ctx.fill();
            ctx.stroke();
            
            // Wings
            ctx.fillStyle = this.color;
            const wingFlap = Math.sin(Game.frameCount * 0.5) * 5;
            ctx.beginPath();
            ctx.moveTo(-r, -5);
            ctx.lineTo(-r - 10, -15 + wingFlap);
            ctx.lineTo(-r - 5, 0);
            ctx.moveTo(r, -5);
            ctx.lineTo(r + 10, -15 + wingFlap);
            ctx.lineTo(r + 5, 0);
            ctx.fill();
            ctx.stroke();

        } else if (this.maxHp > 20) {
            // Type 3: Big (Square/Rock)
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.rect(-r, -r, r*2, r*2);
            ctx.fill();
            ctx.stroke();
            
            // Spikes
            ctx.beginPath();
            ctx.moveTo(-r, -r); ctx.lineTo(-r-5, -r-5); ctx.lineTo(0, -r);
            ctx.moveTo(r, -r); ctx.lineTo(r+5, -r-5); ctx.lineTo(0, -r);
            ctx.stroke();

        } else {
            // Type 1: Slime (Wobbly)
            const wobble = Math.sin(Game.frameCount * 0.1 + this.y) * 2;
            ctx.beginPath();
            ctx.ellipse(0, 0, r + wobble, r - wobble, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.stroke();
        }

        // Face
        ctx.fillStyle = '#fff';
        if (this.knockbackX !== 0 || this.knockbackY !== 0) {
            // Hurt face > <
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            // Left eye >
            ctx.moveTo(-5, -5); ctx.lineTo(-2, -2); ctx.lineTo(-5, 1);
            // Right eye <
            ctx.moveTo(5, -5); ctx.lineTo(2, -2); ctx.lineTo(5, 1);
            ctx.stroke();
            // Mouth o
            ctx.beginPath();
            ctx.arc(0, 5, 3, 0, Math.PI*2);
            ctx.stroke();
        } else {
            // Normal cute face
            // Eyes
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(-4, -2, 2, 0, Math.PI*2);
            ctx.arc(4, -2, 2, 0, Math.PI*2);
            ctx.fill();
            // Blush
            ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
            ctx.beginPath();
            ctx.arc(-6, 2, 2, 0, Math.PI*2);
            ctx.arc(6, 2, 2, 0, Math.PI*2);
            ctx.fill();
            // Mouth
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(0, 2, 2, 0, Math.PI, false);
            ctx.stroke();
        }

        ctx.restore();
    }
}

class Gem extends Entity {
    constructor(x, y, val) {
        super(x, y, 5, COLORS.gem);
        this.val = val;
    }
    update(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < player.pickupRange) {
            // Fly to player
            this.x += (dx / dist) * 8;
            this.y += (dy / dist) * 8;
            
            if (dist < player.radius) {
                Game.addXp(this.val);
                this.markedForDeletion = true;
            }
        }
    }
    draw(ctx, camX, camY) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x - camX, this.y - camY - 5);
        ctx.lineTo(this.x - camX + 5, this.y - camY);
        ctx.lineTo(this.x - camX, this.y - camY + 5);
        ctx.lineTo(this.x - camX - 5, this.y - camY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

class Projectile extends Entity {
    constructor(x, y, dx, dy, speed, duration, damage, knockback, radius, color, penetrate) {
        super(x, y, radius, color);
        this.dx = dx;
        this.dy = dy;
        this.speed = speed;
        this.duration = duration;
        this.damage = damage;
        this.knockback = knockback;
        this.penetrate = penetrate || 1; 
        this.hitList = []; 
        this.angle = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.5;
    }

    update() {
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;
        this.angle += this.rotationSpeed;
        this.duration--;
        if (this.duration <= 0) this.markedForDeletion = true;
    }

    draw(ctx, camX, camY) {
        ctx.save();
        ctx.translate(this.x - camX, this.y - camY);
        ctx.rotate(this.angle);
        
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;

        if (this.ownerId === 'orbit') {
            // Fish shape
            ctx.beginPath();
            ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.stroke();
            // Tail
            ctx.beginPath();
            ctx.moveTo(-8, 0); ctx.lineTo(-12, -4); ctx.lineTo(-12, 4); ctx.fill();
        } else if (this.color === '#fff') { // Fishbone
            // Bone shape
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-6, 0); ctx.lineTo(6, 0);
            ctx.moveTo(-6, -2); ctx.lineTo(-6, 2);
            ctx.moveTo(6, -2); ctx.lineTo(6, 2);
            ctx.stroke();
        } else {
            // Standard Ball
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        ctx.restore();
    }
}

// --- Weapon Classes ---
class Weapon {
    constructor(player, id, cooldown) {
        this.player = player;
        this.id = id;
        this.baseCooldown = cooldown;
        this.timer = 0;
        this.level = 1;
    }
    levelUp() { this.level++; }
    update() {
        if (this.timer > 0) {
            this.timer--;
        } else {
            this.fire();
            this.timer = this.baseCooldown * this.player.cooldownMult;
        }
    }
    fire() {}
    getStats() {
        return {
            dmg: 10 * this.player.damageMult,
            area: 1 * this.player.areaMult,
            speed: 1 * this.player.projSpeed,
            duration: 60 * this.player.durationMult,
            kb: 2 * this.player.knockback,
            amount: this.player.amount
        };
    }
}

class WeaponFishbone extends Weapon {
    constructor(player) { super(player, 'fishbone', 40); }
    fire() {
        const stats = this.getStats();
        // Find closest enemy or just shoot facing direction
        let dirX = this.player.facingRight ? 1 : -1;
        let dirY = 0;
        
        // Find closest for auto aim
        let closest = null;
        let minDist = 400;
        Game.enemies.forEach(e => {
            const d = Math.sqrt((e.x - this.player.x)**2 + (e.y - this.player.y)**2);
            if (d < minDist) {
                minDist = d;
                closest = e;
            }
        });

        if (closest) {
            const dx = closest.x - this.player.x;
            const dy = closest.y - this.player.y;
            const len = Math.sqrt(dx*dx + dy*dy);
            dirX = dx/len;
            dirY = dy/len;
        }

        const count = 1 + stats.amount;
        for(let i=0; i<count; i++) {
            // Slight spread if multiple
            const angle = (Math.random() - 0.5) * 0.2;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const fx = dirX * cos - dirY * sin;
            const fy = dirX * sin + dirY * cos;

            const p = new Projectile(
                this.player.x, this.player.y, 
                fx, fy, 
                5 * stats.speed, 
                60 * stats.duration, 
                15 * stats.dmg, 
                3 * stats.kb, 
                6, '#fff', 1 + Math.floor(this.level/2)
            );
            Game.projectiles.push(p);
        }
    }
}

class WeaponAura extends Weapon {
    constructor(player) { super(player, 'aura', 15); } // Ticks 4 times a second
    fire() {
        const stats = this.getStats();
        const r = 60 * stats.area;
        Game.enemies.forEach(e => {
            const dx = e.x - this.player.x;
            const dy = e.y - this.player.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < r + e.radius) {
                const kx = (dx/dist) * stats.kb;
                const ky = (dy/dist) * stats.kb;
                e.takeDamage(1.5 * stats.dmg, kx, ky);
            }
        });
    }
}

class WeaponGarlic extends Weapon {
    constructor(player) { super(player, 'garlic', 60); } // Ticks once per second
    fire() {
         const stats = this.getStats();
         const r = 80 * stats.area;
         
         // Visual Pulse (handled in draw slightly, but we can add particle later)

         Game.enemies.forEach(e => {
            const dx = e.x - this.player.x;
            const dy = e.y - this.player.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < r + e.radius) {
                // Push back
                const kx = (dx/dist) * 2; // Stronger push
                const ky = (dy/dist) * 2;
                e.x += kx;
                e.y += ky;
                
                // Damage
                e.takeDamage(8 * stats.dmg, kx * stats.kb, ky * stats.kb);
            }
        });
    }
}

class WeaponAxe extends Weapon {
    constructor(player) { super(player, 'axe', 50); }
    fire() {
        const stats = this.getStats();
        const count = 1 + stats.amount;
        for(let i=0; i<count; i++) {
            const vx = (Math.random() - 0.5) * 2;
            const vy = -6 * stats.speed; // Upwards
            const p = new Projectile(
                this.player.x, this.player.y,
                vx, vy,
                1, // Speed applied in vector
                120, // Duration
                20 * stats.dmg,
                2 * stats.kb,
                8, '#d35400', 999
            );
            // Custom update for gravity
            p.customUpdate = function() {
                this.dx *= 0.98; // Drag
                this.dy += 0.2; // Gravity
                this.x += this.dx;
                this.y += this.dy;
                this.duration--;
                if (this.duration <= 0) this.markedForDeletion = true;
            };
            // Override update
            p.update = p.customUpdate;
            Game.projectiles.push(p);
        }
    }
}

class WeaponWand extends Weapon {
    constructor(player) { super(player, 'wand', 45); }
    fire() {
        const stats = this.getStats();
        const count = 1 + stats.amount;
        
        for(let i=0; i<count; i++) {
             // Find closest
             let closest = null;
             let minDist = 300;
             Game.enemies.forEach(e => {
                 const d = Math.sqrt((e.x - this.player.x)**2 + (e.y - this.player.y)**2);
                 if (d < minDist) { minDist = d; closest = e; }
             });

             if (closest) {
                const dx = closest.x - this.player.x;
                const dy = closest.y - this.player.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                const p = new Projectile(
                    this.player.x, this.player.y,
                    dx/dist, dy/dist,
                    6 * stats.speed,
                    60,
                    12 * stats.dmg,
                    1 * stats.kb,
                    4, '#9b59b6', 1
                );
                Game.projectiles.push(p);
             }
        }
    }
}

class WeaponOrbit extends Weapon {
    constructor(player) { 
        super(player, 'orbit', 1); 
        this.orbitAngle = 0;
    }
    fire() {
        const stats = this.getStats();
        this.orbitAngle += 0.05 * stats.speed;

        // Remove old orbiters
        Game.projectiles = Game.projectiles.filter(p => p.ownerId !== 'orbit');

        const count = 1 + stats.amount;
        for(let i=0; i<count; i++) {
            const angle = this.orbitAngle + (Math.PI * 2 * i) / count;
            const p = new Projectile(0,0,0,0,0,2, 10*stats.dmg, 2*stats.kb, 6, '#f1c40f', 999);
            p.ownerId = 'orbit';
            
            const dist = 70 * stats.area;
            p.x = this.player.x + Math.cos(angle) * dist;
            p.y = this.player.y + Math.sin(angle) * dist;
            
            Game.projectiles.push(p);
        }
    }
}

// --- Game Engine ---

const Game = {
    state: 'MENU', 
    player: null,
    enemies: [],
    gems: [],
    projectiles: [],
    floatingTexts: [],
    particles: [], // New particle system
    trees: [], // New environment
    
    frameCount: 0,
    time: 0,
    kills: 0,
    level: 1,
    xp: 0,
    xpToNext: 10,
    
    init() {
        Input.init();
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
        
        // Generate random trees/rocks
        for(let i=0; i<50; i++) {
            this.trees.push({
                x: (Math.random() - 0.5) * 4000,
                y: (Math.random() - 0.5) * 4000,
                r: 30 + Math.random() * 20,
                type: Math.random() > 0.3 ? 'tree' : 'rock'
            });
        }
    },

    start(charType) {
        this.player = new Player(charType);
        this.enemies = [];
        this.gems = [];
        this.projectiles = [];
        this.floatingTexts = [];
        this.particles = [];
        this.frameCount = 0;
        this.time = 0;
        this.kills = 0;
        this.level = 1;
        this.xp = 0;
        this.xpToNext = 10;
        
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
        document.getElementById('gameover-screen').classList.add('hidden');
        
        this.state = 'PLAYING';
        this.updateUI();
    },

    loop() {
        if (this.state === 'PLAYING') {
            this.update();
        }
        this.draw();
        requestAnimationFrame(this.loop);
    },

    update() {
        this.frameCount++;
        if (this.frameCount % 60 === 0) {
            this.time++;
            document.getElementById('timer').innerText = this.formatTime(this.time);
        }

        this.spawnEnemies();

        // Particle update
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            p.vx *= 0.95;
            p.vy *= 0.95;
        });
        this.particles = this.particles.filter(p => p.life > 0);

        this.player.update();
        if (this.player.hp <= 0) {
            this.gameOver();
        }

        this.enemies.forEach(e => e.update(this.player));
        this.gems.forEach(g => g.update(this.player));
        this.projectiles.forEach(p => p.update());

        // Collisions
        this.projectiles.forEach(p => {
            this.enemies.forEach(e => {
                if (!e.markedForDeletion && !p.markedForDeletion) {
                    if (checkCircleCollide(p, e)) {
                        if (!p.hitList.includes(e)) {
                            e.takeDamage(p.damage, p.dx * p.knockback, p.dy * p.knockback);
                            p.hitList.push(e);
                            this.spawnParticles(e.x, e.y, e.color, 3); // Hit effect
                            if (p.hitList.length >= p.penetrate) {
                                p.markedForDeletion = true;
                            }
                        }
                    }
                }
            });
        });

        this.enemies.forEach(e => {
            if (checkCircleCollide(e, this.player)) {
                if (this.frameCount % 30 === 0) {
                    this.player.hp -= e.damage;
                    this.addFloatingText("-" + e.damage, this.player.x, this.player.y - 20, '#ff4444');
                    this.spawnParticles(this.player.x, this.player.y, '#ff0000', 5); // Blood
                    this.updateUI();
                }
            }
        });

        this.enemies = this.enemies.filter(e => !e.markedForDeletion);
        this.gems = this.gems.filter(g => !g.markedForDeletion);
        this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);
        this.floatingTexts = this.floatingTexts.filter(t => t.life > 0);
        this.floatingTexts.forEach(t => {
            t.y -= 0.5;
            t.life--;
        });
    },

    draw() {
        // Clear & Background
        CTX.fillStyle = '#8ccf7e';
        CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);

        let camX = 0;
        let camY = 0;

        if (this.player) {
            camX = this.player.x - CANVAS.width / 2;
            camY = this.player.y - CANVAS.height / 2;
        } else {
            // Auto pan in menu
            const t = Date.now() / 20;
            camX = Math.sin(t / 100) * 200;
            camY = Math.cos(t / 100) * 200;
        }

        // Grass Texture Pattern
        CTX.fillStyle = '#83c276';
        for(let i=0; i<CANVAS.width; i+=100) {
            for(let j=0; j<CANVAS.height; j+=100) {
                if ((Math.floor((i+camX)/100) + Math.floor((j+camY)/100)) % 2 === 0) {
                     // Creating a checkerboard-like subtle pattern
                     CTX.fillRect(i - (camX%100), j - (camY%100), 10, 10);
                }
            }
        }

        // Environment (Trees/Rocks)
        this.trees.forEach(t => {
            const tx = t.x - camX;
            const ty = t.y - camY;
            if (tx > -100 && tx < CANVAS.width + 100 && ty > -100 && ty < CANVAS.height + 100) {
                if (t.type === 'tree') {
                    // Tree shadow
                    CTX.fillStyle = 'rgba(0,0,0,0.2)';
                    CTX.beginPath(); CTX.arc(tx, ty + 10, t.r, 0, Math.PI*2); CTX.fill();
                    // Trunk
                    CTX.fillStyle = '#8d6e63';
                    CTX.fillRect(tx - 5, ty - 10, 10, 20);
                    // Leaves
                    CTX.fillStyle = '#4caf50';
                    CTX.beginPath(); CTX.arc(tx, ty - 20, t.r, 0, Math.PI*2); CTX.fill();
                    CTX.fillStyle = '#66bb6a';
                    CTX.beginPath(); CTX.arc(tx - 5, ty - 25, t.r * 0.7, 0, Math.PI*2); CTX.fill();
                } else {
                    // Rock
                    CTX.fillStyle = 'rgba(0,0,0,0.2)';
                    CTX.beginPath(); CTX.arc(tx, ty + 5, t.r * 0.8, 0, Math.PI*2); CTX.fill();
                    CTX.fillStyle = '#9e9e9e';
                    CTX.beginPath(); 
                    CTX.moveTo(tx - t.r, ty);
                    CTX.lineTo(tx, ty - t.r);
                    CTX.lineTo(tx + t.r, ty);
                    CTX.lineTo(tx, ty + t.r * 0.6);
                    CTX.fill();
                }
            }
        });

        if (!this.player) return;


        // Entities
        this.gems.forEach(g => g.draw(CTX, camX, camY));
        
        // Particles (under enemies/player)
        this.particles.forEach(p => {
            CTX.fillStyle = p.color;
            CTX.globalAlpha = p.life / 30;
            CTX.beginPath();
            CTX.arc(p.x - camX, p.y - camY, p.size, 0, Math.PI*2);
            CTX.fill();
            CTX.globalAlpha = 1.0;
        });

        this.enemies.forEach(e => e.draw(CTX, camX, camY));
        this.player.draw(CTX, camX, camY);
        this.projectiles.forEach(p => p.draw(CTX, camX, camY));

        // Aura Visuals
        this.player.weapons.forEach(w => {
            if (w.id === 'aura' || w.id === 'garlic') {
                const stats = w.getStats();
                const r = (w.id === 'aura' ? 60 : 80) * stats.area;
                CTX.beginPath();
                CTX.arc(this.player.x - camX, this.player.y - camY, r, 0, Math.PI*2);
                CTX.strokeStyle = w.id === 'aura' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(100, 255, 100, 0.4)';
                CTX.lineWidth = 3;
                CTX.setLineDash([10, 10]);
                CTX.stroke();
                CTX.setLineDash([]);
                CTX.fillStyle = w.id === 'aura' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(100, 255, 100, 0.1)';
                CTX.fill();
            }
        });

        // Floating Text
        this.floatingTexts.forEach(t => {
            CTX.fillStyle = t.color;
            CTX.font = 'bold 20px Fredoka';
            CTX.strokeStyle = 'black';
            CTX.lineWidth = 3;
            CTX.strokeText(t.text, t.x - camX, t.y - camY);
            CTX.fillText(t.text, t.x - camX, t.y - camY);
        });
    },

    spawnParticles(x, y, color, count) {
        for(let i=0; i<count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                life: 20 + Math.random() * 20,
                color: color,
                size: 2 + Math.random() * 3
            });
        }
    },


    spawnEnemies() {
        // Spawn rate increases with time
        const spawnRate = Math.max(10, 60 - Math.floor(this.time / 10)); // Every 10s spawn faster
        
        if (this.frameCount % spawnRate === 0) {
            // Spawn at edge of screen
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.sqrt((CANVAS.width/2)**2 + (CANVAS.height/2)**2) + 50;
            const x = this.player.x + Math.cos(angle) * dist;
            const y = this.player.y + Math.sin(angle) * dist;
            
            // Type based on time
            let type = 1;
            if (this.time > 30 && Math.random() < 0.3) type = 2;
            if (this.time > 60 && Math.random() < 0.1) type = 3;

            this.enemies.push(new Enemy(x, y, type));
        }
    },

    addXp(amount) {
        this.xp += amount;
        if (this.xp >= this.xpToNext) {
            this.xp -= this.xpToNext;
            this.levelUp();
        }
        this.updateUI();
    },

    levelUp() {
        this.level++;
        this.xpToNext = Math.floor(this.xpToNext * 1.2);
        this.state = 'LEVEL_UP';
        this.showUpgradeMenu();
        this.updateUI();
    },

    showUpgradeMenu() {
        const container = document.getElementById('cards-container');
        container.innerHTML = '';
        
        // Pick 3 random cards
        const options = [];
        const pool = [...UPGRADES];
        for(let i=0; i<3; i++) {
            if (pool.length === 0) break;
            const idx = Math.floor(Math.random() * pool.length);
            options.push(pool[idx]);
            pool.splice(idx, 1);
        }

        options.forEach(opt => {
            const div = document.createElement('div');
            div.className = 'upgrade-card';
            div.innerHTML = `<h3>${opt.name}</h3><p>${opt.desc}</p>`;
            div.onclick = () => this.selectUpgrade(opt);
            container.appendChild(div);
        });

        document.getElementById('levelup-screen').classList.remove('hidden');
        document.getElementById('levelup-level').innerText = this.level;
    },

    selectUpgrade(opt) {
        // Apply effect
        if (opt.type === 'stat') {
            if (opt.stat.includes('Mult')) {
                // Multiplier add logic (e.g. 1.0 -> 1.1)
                 // Actually simpler: just multiply? or add to base?
                 // Let's multiply existing
                 this.player[opt.stat] *= opt.val; 
                 // If the value is small like 0.1, it meant add. 
                 // My data has val: 1.1 or 0.1. Let's standardize.
                 // Actually my logic in UPGRADES is mixed. Let's fix usage.
                 // Wait, UPGRADES values: 1.1, 0.1.
                 // Let's assume val is a multiplier if > 1, and an additive % if < 1?
                 // No, let's just handle specific cases or trust the data structure I made.
                 // Reviewing data: speed 1.1 (mult), maxHp 20 (add), damageMult 0.1 (add to mult).
            }
            
            // Safe logic based on keys
            if (opt.stat === 'maxHp') {
                this.player.maxHp += opt.val;
                this.player.hp += opt.val;
            } else if (opt.stat === 'regen') {
                this.player.regen += opt.val;
            } else if (opt.stat === 'amount') {
                this.player.amount += opt.val;
            } else if (['damageMult', 'areaMult', 'cooldownMult', 'durationMult', 'knockback'].includes(opt.stat)) {
                 // if val is 0.1, it means +10%. If val is 0.9 (cooldown), it means *0.9
                 if (opt.stat === 'cooldownMult') this.player.cooldownMult *= opt.val;
                 else if (opt.val < 1) this.player[opt.stat] += opt.val;
                 else this.player[opt.stat] *= opt.val; // Knockback 1.2
            } else if (opt.stat === 'speed') {
                this.player.speed *= opt.val;
            } else if (opt.stat === 'pickupRange') {
                this.player.pickupRange *= opt.val;
            } else if (opt.stat === 'projSpeed') {
                this.player.projSpeed *= opt.val;
            } else if (opt.stat === 'critChance') {
                this.player.critChance += opt.val;
            }
        } else if (opt.type === 'weapon') {
            this.player.addWeapon(opt.weaponId);
        }

        document.getElementById('levelup-screen').classList.add('hidden');
        this.state = 'PLAYING';
        this.updateUI();
    },

    spawnGem(x, y, val) {
        this.gems.push(new Gem(x, y, val));
    },

    addFloatingText(text, x, y, color) {
        this.floatingTexts.push({text, x, y, color, life: 30});
    },

    updateUI() {
        // HP
        const hpPct = Math.max(0, (this.player.hp / this.player.maxHp) * 100);
        document.getElementById('hp-bar-fill').style.width = hpPct + '%';
        document.getElementById('hp-text').innerText = `${Math.floor(this.player.hp)}/${this.player.maxHp}`;
        
        // XP
        const xpPct = (this.xp / this.xpToNext) * 100;
        document.getElementById('xp-bar-fill').style.width = xpPct + '%';
        document.getElementById('level-text').innerText = 'Lv. ' + this.level;
        
        // Kills
        document.getElementById('kill-count').innerText = '击杀: ' + this.kills;
    },

    formatTime(sec) {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    },

    gameOver() {
        this.state = 'GAME_OVER';
        document.getElementById('gameover-screen').classList.remove('hidden');
        document.getElementById('final-time').innerText = this.formatTime(this.time);
        document.getElementById('final-kills').innerText = this.kills;
    }
};

// Global accessor for UI
window.startGame = function(charType) {
    Game.start(charType);
};

// Start Loop
Game.init();
