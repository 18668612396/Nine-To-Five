// --- 瓜瓜 (布偶猫) ---

class GuaguaPlayer extends Player {
    // 基准半径（所有坐标都基于此尺寸设计）
    static BASE_RADIUS = 15;
    
    static CONFIG = {
        id: 'guagua',
        name: '瓜瓜',
        color: COLORS.guagua,
        startPerks: ['movement_speed']
    };
    
    constructor() {
        super('guagua', {
            color: GuaguaPlayer.CONFIG.color
        });
        
        // 尾巴状态
        this.lastTailX = -8;
        this.lastTailY = 5;
        this.lastTailAngle = Math.PI / 4;
    }
    
    applyStartPerks() {
        if (this.perkManager && GuaguaPlayer.CONFIG.startPerks) {
            GuaguaPlayer.CONFIG.startPerks.forEach(perkId => {
                this.perkManager.addPerk(perkId);
            });
        }
    }
    
    draw(ctx, camX, camY) {
        this.drawEffects(ctx, camX, camY);
        
        const x = this.x - camX;
        const y = this.y - camY;
        const input = Input.getAxis();
        const isFlipped = !this.facingRight;
        
        const tailState = GuaguaPlayer.drawCharacter(ctx, x, y, this.radius, Entity.frameCount, {
            input,
            isFlipped,
            lastTailX: this.lastTailX,
            lastTailY: this.lastTailY,
            lastTailAngle: this.lastTailAngle
        });
        
        if (tailState) {
            this.lastTailX = tailState.tailX;
            this.lastTailY = tailState.tailY;
            this.lastTailAngle = tailState.tailBaseAngle;
        }
    }
    
    // 静态绘制方法 - 供 UI 等外部使用
    static drawCharacter(ctx, x, y, r, frameCount, options = {}) {
        const { 
            input = { x: 0, y: 0 }, 
            isFlipped = false,
            lastTailX = -8,
            lastTailY = 5,
            lastTailAngle = Math.PI / 4
        } = options;

        const scale = r / GuaguaPlayer.BASE_RADIUS;

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        if (isFlipped) ctx.scale(-1, 1);

        // 阴影
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(0, 17, 12, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // 尾巴
        const tailWag = Math.sin(frameCount * 0.15) * 0.3;
        const isMovingUp = input.y < 0 && input.x === 0;
        
        let tailX, tailY, tailBaseAngle;
        if (isMovingUp) {
            tailX = lastTailX;
            tailY = lastTailY;
            tailBaseAngle = lastTailAngle;
        } else if (input.x !== 0 || input.y !== 0) {
            const dirX = isFlipped ? input.x : -input.x;
            tailX = dirX * 10;
            tailY = -input.y * 8 + 5;
            tailBaseAngle = Math.atan2(-input.y, dirX);
        } else {
            tailX = -8;
            tailY = 5;
            tailBaseAngle = Math.PI / 4;
        }
        
        ctx.save();
        ctx.translate(tailX, tailY);
        ctx.rotate(tailWag + tailBaseAngle);
        ctx.fillStyle = COLORS.guagua_dark;
        ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(4, 0, 5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(9, 0, 5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // 身体
        ctx.fillStyle = COLORS.guagua;
        ctx.beginPath();
        ctx.ellipse(0, 6, 15, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // 蓬松侧边
        ctx.beginPath(); ctx.arc(-13, 6, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(13, 6, 4, 0, Math.PI * 2); ctx.fill();

        // 爪子
        const bob = Math.sin(frameCount * 0.2) * 2;
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.ellipse(-6, 13 + bob, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(6, 13 - bob, 4, 3, 0, 0, Math.PI * 2); ctx.fill();

        // 耳朵
        ctx.fillStyle = COLORS.guagua_dark;
        ctx.beginPath();
        ctx.moveTo(-9, -14); ctx.lineTo(-14, -24); ctx.lineTo(-3, -17); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(9, -14); ctx.lineTo(14, -24); ctx.lineTo(3, -17); ctx.fill();

        // 头部
        ctx.fillStyle = COLORS.guagua;
        ctx.beginPath();
        ctx.arc(0, -6, 14.25, 0, Math.PI * 2);
        ctx.fill();

        // 蓬松脸颊
        ctx.beginPath(); ctx.arc(-9, -2, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(9, -2, 4, 0, Math.PI * 2); ctx.fill();

        // 面罩（棕色斑点）
        ctx.fillStyle = COLORS.guagua_dark;
        ctx.beginPath();
        ctx.ellipse(-6, -7, 6, 7, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-12, -3, 4, 5, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(6, -7, 6, 7, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(12, -3, 4, 5, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // 眼睛
        const blink = Math.floor(frameCount / 150) % 2 === 0 || frameCount % 200 > 10;
        if (blink) {
            ctx.fillStyle = '#4fc3f7';
            ctx.beginPath(); ctx.arc(-5, -6, 3.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(5, -6, 3.5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#01579b';
            ctx.beginPath(); ctx.arc(-5, -6, 1.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(5, -6, 1.5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(-3.5, -7.5, 1.5, 0, Math.PI * 2); ctx.fill();
        } else {
            ctx.fillStyle = '#3e2723';
            ctx.fillRect(-7, -6, 4, 1.5);
            ctx.fillRect(3, -6, 4, 1.5);
        }

        // 鼻子
        ctx.fillStyle = '#f48fb1';
        ctx.beginPath(); ctx.ellipse(0, -1, 2, 1.5, 0, 0, Math.PI * 2); ctx.fill();

        ctx.restore();
        return { tailX, tailY, tailBaseAngle };
    }
}

// 注册角色
Player.register('guagua', GuaguaPlayer);
