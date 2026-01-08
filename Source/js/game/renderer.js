// --- 渲染器 ---

let CANVAS = null;
let CTX = null;
const dpr = window.devicePixelRatio || 1;

// 移动端视野缩放（值越小看到越多）
const mobileZoom = isMobile ? 0.6 : 1.0;

function initCanvas() {
    CANVAS = document.getElementById('gameCanvas');
    if (!CANVAS) return;
    CTX = CANVAS.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    if (!CANVAS || !CTX) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    CANVAS.width = width * dpr;
    CANVAS.height = height * dpr;
    CANVAS.style.width = width + 'px';
    CANVAS.style.height = height + 'px';
    
    // 移动端应用缩放，让视野更广
    const scale = dpr * mobileZoom;
    CTX.setTransform(scale, 0, 0, scale, 0, 0);
    
    // 逻辑尺寸 = 实际尺寸 / 缩放
    CONFIG.GAME_WIDTH = width / mobileZoom;
    CONFIG.GAME_HEIGHT = height / mobileZoom;
}

const Renderer = {
    // 特效列表
    particles: [],
    floatingTexts: [],
    lightningEffects: [],
    distortEffects: [],
    explosionEffects: [],
    lightPillars: [],
    
    // 清空所有特效
    clearEffects() {
        this.particles = [];
        this.floatingTexts = [];
        this.lightningEffects = [];
        this.distortEffects = [];
        this.explosionEffects = [];
        this.lightPillars = [];
    },
    
    // 更新特效
    updateEffects() {
        // 粒子
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            p.vx *= 0.95;
            p.vy *= 0.95;
        });
        this.particles = this.particles.filter(p => p.life > 0);
        
        // 闪电
        this.lightningEffects = this.lightningEffects.filter(l => l.life-- > 0);
        
        // 扭曲
        this.distortEffects = this.distortEffects.filter(d => d.life-- > 0);
        
        // 爆炸
        this.explosionEffects = this.explosionEffects.filter(e => e.life-- > 0);
        
        // 光柱
        this.lightPillars = this.lightPillars.filter(p => p.life-- > 0);
        
        // 浮动文字
        this.floatingTexts.forEach(t => {
            t.y -= 0.5;
            t.life--;
        });
        this.floatingTexts = this.floatingTexts.filter(t => t.life > 0);
    },
    
    // 生成粒子
    spawnParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                life: 20 + Math.random() * 20,
                color,
                size: 2 + Math.random() * 3
            });
        }
    },
    
    // 添加浮动文字
    addFloatingText(text, x, y, color) {
        this.floatingTexts.push({ text, x, y, color, life: 40 });
    },
    
    // 添加闪电效果
    addLightning(x1, y1, x2, y2, color = '#ffdd00') {
        this.lightningEffects.push({ x1, y1, x2, y2, color, life: 15 });
    },
    
    // 添加扭曲效果
    addDistort(x, y, targetX, targetY) {
        this.distortEffects.push({ x, y, targetX, targetY, life: 15 });
    },
    
    // 添加爆炸效果
    addExplosion(x, y, radius) {
        this.explosionEffects.push({ x, y, radius, life: 30, maxLife: 30 });
    },
    
    // 添加光柱
    addLightPillar(x, y, radius, damage) {
        this.lightPillars.push({ x, y, radius, damage, life: 60 });
    },
    
    // 绘制粒子
    drawParticles() {
        this.particles.forEach(p => {
            CTX.fillStyle = p.color;
            CTX.globalAlpha = p.life / 30;
            CTX.beginPath();
            CTX.arc(p.x - cameraX, p.y - cameraY, p.size, 0, Math.PI * 2);
            CTX.fill();
            CTX.globalAlpha = 1.0;
        });
    },
    
    // 绘制浮动文字
    drawFloatingTexts() {
        this.floatingTexts.forEach(t => {
            CTX.fillStyle = t.color;
            CTX.font = 'bold 20px Arial';
            CTX.textAlign = 'center';
            CTX.strokeStyle = 'black';
            CTX.lineWidth = 3;
            CTX.strokeText(t.text, t.x - cameraX, t.y - cameraY);
            CTX.fillText(t.text, t.x - cameraX, t.y - cameraY);
        });
    },
    
    // 绘制闪电效果
    drawLightningEffects() {
        this.lightningEffects.forEach(l => {
            const alpha = l.life / 15;
            const color = l.color || '#ffdd00';
            let r = 255, g = 221, b = 0;
            if (color.startsWith('#')) {
                r = parseInt(color.slice(1, 3), 16);
                g = parseInt(color.slice(3, 5), 16);
                b = parseInt(color.slice(5, 7), 16);
            }
            CTX.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            CTX.lineWidth = 3;
            CTX.shadowColor = color;
            CTX.shadowBlur = 10;
            CTX.beginPath();
            const segments = 5;
            const dx = (l.x2 - l.x1) / segments;
            const dy = (l.y2 - l.y1) / segments;
            CTX.moveTo(l.x1 - cameraX, l.y1 - cameraY);
            for (let i = 1; i < segments; i++) {
                CTX.lineTo(
                    l.x1 + dx * i + (Math.random() - 0.5) * 20 - cameraX,
                    l.y1 + dy * i + (Math.random() - 0.5) * 20 - cameraY
                );
            }
            CTX.lineTo(l.x2 - cameraX, l.y2 - cameraY);
            CTX.stroke();
            CTX.shadowBlur = 0;
        });
    },
    
    // 绘制扭曲效果
    drawDistortEffects() {
        this.distortEffects.forEach(d => {
            const x = d.x - cameraX;
            const y = d.y - cameraY;
            const tx = d.targetX - cameraX;
            const ty = d.targetY - cameraY;
            const alpha = d.life / 15;
            
            CTX.strokeStyle = `rgba(153, 102, 255, ${alpha})`;
            CTX.lineWidth = 2;
            CTX.beginPath();
            CTX.moveTo(x, y);
            const midX = (x + tx) / 2 + (Math.random() - 0.5) * 20;
            const midY = (y + ty) / 2 + (Math.random() - 0.5) * 20;
            CTX.quadraticCurveTo(midX, midY, tx, ty);
            CTX.stroke();
            
            CTX.strokeStyle = `rgba(153, 102, 255, ${alpha * 0.5})`;
            CTX.beginPath();
            CTX.arc(x, y, 10 + (15 - d.life) * 2, 0, Math.PI * 2);
            CTX.stroke();
        });
    },
    
    // 绘制光柱
    drawLightPillars() {
        this.lightPillars.forEach(pillar => {
            const x = pillar.x - cameraX;
            const y = pillar.y - cameraY;
            const alpha = pillar.life / 60;
            
            const gradient = CTX.createRadialGradient(x, y, 0, x, y, pillar.radius);
            gradient.addColorStop(0, `rgba(255, 255, 200, ${alpha * 0.8})`);
            gradient.addColorStop(0.5, `rgba(255, 220, 100, ${alpha * 0.4})`);
            gradient.addColorStop(1, `rgba(255, 200, 50, 0)`);
            
            CTX.fillStyle = gradient;
            CTX.beginPath();
            CTX.arc(x, y, pillar.radius, 0, Math.PI * 2);
            CTX.fill();
            
            CTX.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            CTX.beginPath();
            CTX.arc(x, y, 5, 0, Math.PI * 2);
            CTX.fill();
        });
    },

    // 绘制爆炸效果
    drawExplosionEffects() {
        this.explosionEffects.forEach(exp => {
            const x = exp.x - cameraX;
            const y = exp.y - cameraY;
            const progress = 1 - exp.life / exp.maxLife;
            const radius = exp.radius;
            
            // 阶段1: 扩张的火球 (0-0.3)
            if (progress < 0.3) {
                const expandProgress = progress / 0.3;
                const currentRadius = radius * expandProgress;
                const alpha = 0.8 - expandProgress * 0.3;
                
                const gradient = CTX.createRadialGradient(x, y, 0, x, y, currentRadius);
                gradient.addColorStop(0, `rgba(255, 255, 200, ${alpha})`);
                gradient.addColorStop(0.3, `rgba(255, 150, 0, ${alpha * 0.8})`);
                gradient.addColorStop(0.7, `rgba(255, 80, 0, ${alpha * 0.5})`);
                gradient.addColorStop(1, `rgba(200, 50, 0, 0)`);
                
                CTX.fillStyle = gradient;
                CTX.beginPath();
                CTX.arc(x, y, currentRadius, 0, Math.PI * 2);
                CTX.fill();
            }
            
            // 阶段2: 蘑菇云上升 (0.2-0.8)
            if (progress > 0.2 && progress < 0.8) {
                const cloudProgress = (progress - 0.2) / 0.6;
                const cloudY = y - cloudProgress * 60;
                const cloudRadius = 20 + cloudProgress * 25;
                const alpha = 0.6 * (1 - cloudProgress);
                
                const cloudGradient = CTX.createRadialGradient(x, cloudY, 0, x, cloudY, cloudRadius);
                cloudGradient.addColorStop(0, `rgba(100, 100, 100, ${alpha})`);
                cloudGradient.addColorStop(0.5, `rgba(80, 80, 80, ${alpha * 0.7})`);
                cloudGradient.addColorStop(1, `rgba(60, 60, 60, 0)`);
                
                CTX.fillStyle = cloudGradient;
                CTX.beginPath();
                CTX.arc(x, cloudY, cloudRadius, 0, Math.PI * 2);
                CTX.fill();
                
                const stemWidth = 15 - cloudProgress * 5;
                const stemAlpha = alpha * 0.8;
                CTX.fillStyle = `rgba(80, 80, 80, ${stemAlpha})`;
                CTX.beginPath();
                CTX.moveTo(x - stemWidth, y);
                CTX.lineTo(x + stemWidth, y);
                CTX.lineTo(x + stemWidth * 0.6, cloudY + cloudRadius * 0.5);
                CTX.lineTo(x - stemWidth * 0.6, cloudY + cloudRadius * 0.5);
                CTX.closePath();
                CTX.fill();
            }
            
            // 阶段3: 冲击波环 (0-0.5)
            if (progress < 0.5) {
                const ringProgress = progress / 0.5;
                const ringRadius = radius * ringProgress;
                const ringAlpha = 0.5 * (1 - ringProgress);
                
                CTX.strokeStyle = `rgba(255, 200, 100, ${ringAlpha})`;
                CTX.lineWidth = 4 * (1 - ringProgress);
                CTX.beginPath();
                CTX.arc(x, y, ringRadius, 0, Math.PI * 2);
                CTX.stroke();
            }
        });
    },
    
    // 绘制所有特效
    drawAllEffects() {
        this.drawParticles();
        this.drawLightningEffects();
        this.drawDistortEffects();
        this.drawLightPillars();
        this.drawExplosionEffects();
        this.drawFloatingTexts();
    },
    
    // 绘制技能槽 UI
    drawWandSlots(player) {
        if (!player || !player.weapon) return;
        
        const weapon = player.weapon;
        const slotSize = 36;
        const padding = 4;
        
        // 计算总槽位数（普通槽 + 特殊槽）
        const specialSlotCount = (weapon.specialSlot && weapon.specialSlots) ? weapon.specialSlots.length : 0;
        const totalSlots = weapon.slotCount + specialSlotCount;
        const startX = (CONFIG.GAME_WIDTH - (totalSlots * (slotSize + padding))) / 2;
        const startY = CONFIG.GAME_HEIGHT - 60;
        
        // 绘制普通技能槽
        for (let i = 0; i < weapon.slotCount; i++) {
            const x = startX + i * (slotSize + padding);
            const y = startY;
            const slot = weapon.slots[i];
            
            CTX.fillStyle = 'rgba(0, 0, 0, 0.5)';
            CTX.strokeStyle = '#666666';
            CTX.lineWidth = 1;
            CTX.fillRect(x, y, slotSize, slotSize);
            CTX.strokeRect(x, y, slotSize, slotSize);
            
            if (slot) {
                const isActive = slot.type === 'magic';
                CTX.fillStyle = isActive ? 'rgba(255, 150, 0, 0.3)' : 'rgba(100, 150, 255, 0.3)';
                CTX.fillRect(x + 2, y + 2, slotSize - 4, slotSize - 4);
                
                CTX.font = '20px Arial';
                CTX.textAlign = 'center';
                CTX.textBaseline = 'middle';
                CTX.fillStyle = '#fff';
                CTX.fillText(slot.icon, x + slotSize / 2, y + slotSize / 2);
            }
        }
        
        // 绘制特殊技能槽（紫色边框）
        if (weapon.specialSlot && weapon.specialSlots) {
            const specialSlotCount = weapon.specialSlots.length;
            for (let i = 0; i < specialSlotCount; i++) {
                const x = startX + (weapon.slotCount + i) * (slotSize + padding);
                const y = startY;
                const slot = weapon.specialSlots[i];
                
                // 特殊槽背景
                CTX.fillStyle = 'rgba(80, 0, 120, 0.5)';
                CTX.fillRect(x, y, slotSize, slotSize);
                
                // 特殊槽紫色边框
                CTX.strokeStyle = '#cc66ff';
                CTX.lineWidth = 2;
                CTX.strokeRect(x, y, slotSize, slotSize);
                
                if (slot) {
                    const isActive = slot.type === 'magic';
                    CTX.fillStyle = isActive ? 'rgba(200, 100, 255, 0.3)' : 'rgba(150, 100, 200, 0.3)';
                    CTX.fillRect(x + 2, y + 2, slotSize - 4, slotSize - 4);
                    
                    CTX.font = '20px Arial';
                    CTX.textAlign = 'center';
                    CTX.textBaseline = 'middle';
                    CTX.fillStyle = '#fff';
                    CTX.fillText(slot.icon, x + slotSize / 2, y + slotSize / 2);
                }
            }
        }
        
        if (weapon.castTimer > 0) {
            CTX.fillStyle = 'rgba(255, 255, 255, 0.7)';
            CTX.font = '14px Arial';
            CTX.textAlign = 'center';
            CTX.fillText('CD', CONFIG.GAME_WIDTH / 2, startY - 10);
        }
    }
};
