// --- 葵葵 (蓝白英短) ---

class KuikuiPlayer extends Player {
    static CONFIG = {
        id: 'kuikui',
        name: '葵葵',
        color: COLORS.kuikui,
        // 自带祝福
        startPerks: ['extra_hp'] // 额外生命
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
    
    // 初始化时应用自带祝福
    applyStartPerks() {
        if (this.perkManager && KuikuiPlayer.CONFIG.startPerks) {
            KuikuiPlayer.CONFIG.startPerks.forEach(perkId => {
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
        const tailState = CharacterRenderer.drawKuikui(ctx, x, y, r, Game.frameCount, {
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
Player.register('kuikui', KuikuiPlayer);
