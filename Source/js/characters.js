// --- 角色绘制模块 ---

const CharacterRenderer = {
    // 绘制葵葵（蓝白英短）
    drawKuikui(ctx, x, y, r, frameCount, options = {}) {
        const { 
            input = { x: 0, y: 0 }, 
            isFlipped = false,
            lastTailX = -8,
            lastTailY = 8,
            lastTailAngle = Math.PI / 3
        } = options;

        ctx.save();
        ctx.translate(x, y);
        if (isFlipped) ctx.scale(-1, 1);

        // 阴影
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(0, r + 2, r * 0.8, r * 0.3, 0, 0, Math.PI * 2);
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
        ctx.ellipse(0, 6, r, r * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // 肚皮
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(0, 8, r * 0.6, r * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // 爪子
        const bob = Math.sin(frameCount * 0.2) * 2;
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.ellipse(-6, 13 + bob, 3.5, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(6, 13 - bob, 3.5, 3, 0, 0, Math.PI * 2); ctx.fill();

        // 头部
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, -6, r * 0.95, 0, Math.PI * 2);
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
        ctx.arc(0, -6, r * 0.95, Math.PI, 0);
        ctx.lineTo(0, -6);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-r + 1, -6);
        ctx.quadraticCurveTo(-r + 1, -20, 0, -20);
        ctx.quadraticCurveTo(r - 1, -20, r - 1, -6);
        ctx.lineTo(0, -10);
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
    },

    // 绘制瓜瓜（布偶猫）
    drawGuagua(ctx, x, y, r, frameCount, options = {}) {
        const { 
            input = { x: 0, y: 0 }, 
            isFlipped = false,
            lastTailX = -8,
            lastTailY = 5,
            lastTailAngle = Math.PI / 4
        } = options;

        ctx.save();
        ctx.translate(x, y);
        if (isFlipped) ctx.scale(-1, 1);

        // 阴影
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(0, r + 2, r * 0.8, r * 0.3, 0, 0, Math.PI * 2);
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
        ctx.ellipse(0, 6, r, r * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // 蓬松侧边
        ctx.beginPath(); ctx.arc(-r + 2, 6, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r - 2, 6, 4, 0, Math.PI * 2); ctx.fill();

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
        ctx.arc(0, -6, r * 0.95, 0, Math.PI * 2);
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
    },

    // 通用绘制方法
    draw(charType, ctx, x, y, r, frameCount, options = {}) {
        if (charType === 'kuikui') {
            return this.drawKuikui(ctx, x, y, r, frameCount, options);
        } else {
            return this.drawGuagua(ctx, x, y, r, frameCount, options);
        }
    }
};
