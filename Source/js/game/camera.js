// --- 相机系统 ---

const Camera = {
    x: 0,
    y: 0,
    
    // 屏幕震动
    shakeX: 0,
    shakeY: 0,
    shakeDuration: 0,
    shakeIntensity: 0,
    
    // 更新相机位置
    update(targetX, targetY) {
        // 更新震动
        if (this.shakeDuration > 0) {
            this.shakeDuration--;
            this.shakeX = (Math.random() - 0.5) * this.shakeIntensity;
            this.shakeY = (Math.random() - 0.5) * this.shakeIntensity;
        } else {
            this.shakeX = 0;
            this.shakeY = 0;
        }
        
        // 跟随目标 + 震动
        this.x = targetX - CONFIG.GAME_WIDTH / 2 + this.shakeX;
        this.y = targetY - CONFIG.GAME_HEIGHT / 2 + this.shakeY;
    },
    
    // 屏幕震动
    shake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    },
    
    // 世界坐标转屏幕坐标
    worldToScreen(worldX, worldY) {
        return {
            x: worldX - this.x,
            y: worldY - this.y
        };
    },
    
    // 屏幕坐标转世界坐标
    screenToWorld(screenX, screenY) {
        return {
            x: screenX + this.x,
            y: screenY + this.y
        };
    },
    
    // 检查是否在屏幕内
    isOnScreen(worldX, worldY, margin = 100) {
        const screen = this.worldToScreen(worldX, worldY);
        return screen.x >= -margin && 
               screen.x <= CONFIG.GAME_WIDTH + margin &&
               screen.y >= -margin && 
               screen.y <= CONFIG.GAME_HEIGHT + margin;
    }
};

// 兼容旧代码的全局变量
let cameraX = 0;
let cameraY = 0;
