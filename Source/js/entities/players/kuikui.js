// --- 葵葵 (蓝白英短) ---

class KuikuiPlayer extends Player {
    // 基准半径（所有坐标都基于此尺寸设计）
    static BASE_RADIUS = 15;
    
    static CONFIG = {
        id: 'kuikui',
        name: '葵葵',
        color: COLORS.kuikui,
        startPerks: ['extra_hp']
    };
    
    constructor() {
        super('kuikui', {
            color: KuikuiPlayer.CONFIG.color
        });
        
        // 尾巴状态
        this.lastTailX = -8;
        this.lastTailY = 8;
        this.lastTailAngle = Math.PI / 3;
    }
    
    applyStartPerks() {
        if (this.perkManager && KuikuiPlayer.CONFIG.startPerks) {
            KuikuiPlayer.CONFIG.startPerks.forEach(perkId => {
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
        
        const tailState = KuikuiPlayer.drawCharacter(ctx, x, y, this.radius, Entity.frameCount, {
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
            lastTailY = 8,
            lastTailAngle = Math.PI / 3
        } = options;

        const scale = r / KuikuiPlayer.BASE_RADIUS;

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
            tailY = -input.y * 8 + 8;
            tailBaseAngle = Math.atan2(-input.y, dirX);
        } else {
            tailX = -8;
            tailY = 8;
            tailBaseAngle = Math.PI / 3;
        }
        
        ctx.save();
        ctx.translate(tailX, tailY);
        ctx.rotate(tailWag + tailBaseAngle);
        ctx.fillStyle = COLORS.kuikui_dark;
        ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(4, 0, 5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(9, 0, 5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // 身体
        ctx.fillStyle = COLORS.kuikui;
        ctx.beginPath();
        ctx.ellipse(0, 6, 15, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // 蓬松侧边
        ctx.fillStyle = '#a8bfc9';
        ctx.beginPath(); ctx.arc(-13, 6, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(13, 6, 4, 0, Math.PI * 2); ctx.fill();

        // 肚皮
        ctx.fillStyle = '#f0f0f0';
        ctx.beginPath();
        ctx.ellipse(0, 4, 9, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // 爪子
        const bob = Math.sin(frameCount * 0.2) * 2;
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.ellipse(-10, 12 + bob, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(10, 12 - bob, 4, 3, 0, 0, Math.PI * 2); ctx.fill();

        // 项圈
        ctx.strokeStyle = '#e53935';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI);
        ctx.stroke();
        
        // 铃铛
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(0, 12, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffb300';
        ctx.beginPath();
        ctx.arc(0, 13, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // 头部
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, -6, 14.25, 0, Math.PI * 2);
        ctx.fill();

        // 灰色面罩
        ctx.fillStyle = COLORS.kuikui;

        // 耳朵
        ctx.beginPath();
        ctx.moveTo(-10, -12); ctx.lineTo(-14, -22); ctx.lineTo(-2, -16); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(10, -12); ctx.lineTo(14, -22); ctx.lineTo(2, -16); ctx.fill();

        // 额头斑纹
        ctx.beginPath();
        ctx.moveTo(-14, -6);
        ctx.quadraticCurveTo(-14, -20, 0, -20);
        ctx.quadraticCurveTo(14, -20, 14, -6);
        ctx.lineTo(12, -2);
        ctx.lineTo(0, -10);
        ctx.lineTo(-12, -2);
        ctx.lineTo(-14, -6);
        ctx.fill();

        // 眼睛
        const blink = Math.floor(frameCount / 150) % 2 === 0 || frameCount % 200 > 10;
        if (blink) {
            ctx.fillStyle = '#ffb74d';
            ctx.beginPath(); ctx.arc(-5, -6, 3.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(5, -6, 3.5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#263238';
            ctx.beginPath(); ctx.arc(-5, -6, 1.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(5, -6, 1.5, 0, Math.PI * 2); ctx.fill();
        } else {
            ctx.fillStyle = '#263238';
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
Player.register('kuikui', KuikuiPlayer);
