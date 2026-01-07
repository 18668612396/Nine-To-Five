// --- 瓜瓜 (布偶猫) ---

class GuaguaPlayer extends Player {
    static CONFIG = {
        id: 'guagua',
        name: '瓜瓜',
        color: COLORS.guagua,
        // 自带祝福
        startPerks: ['movement_speed'] // 移动速度
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
    
    // 初始化时应用自带祝福
    applyStartPerks() {
        if (this.perkManager && GuaguaPlayer.CONFIG.startPerks) {
            GuaguaPlayer.CONFIG.startPerks.forEach(perkId => {
                this.perkManager.addPerk(perkId);
            });
        }
    }
    
    draw(ctx, camX, camY) {
        // 绘制效果层
        this.drawEffects(ctx, camX, camY);
        
        const x = this.x - camX;
        const y = this.y - camY;
        const r = this.radius;
        const input = Input.getAxis();
        const isFlipped = !this.facingRight;
        
        // 使用 CharacterRenderer 绘制
        const tailState = CharacterRenderer.drawGuagua(ctx, x, y, r, Game.frameCount, {
            input,
            isFlipped,
            lastTailX: this.lastTailX,
            lastTailY: this.lastTailY,
            lastTailAngle: this.lastTailAngle
        });
        
        // 更新尾巴状态
        if (tailState) {
            this.lastTailX = tailState.tailX;
            this.lastTailY = tailState.tailY;
            this.lastTailAngle = tailState.tailBaseAngle;
        }
    }
}

// 注册角色
Player.register('guagua', GuaguaPlayer);
