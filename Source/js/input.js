// --- 输入处理 (类幸存者 - 全方向移动) ---

const Input = {
    keys: {},
    touch: {
        active: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0
    },
    
    init() {
        // 键盘输入
        window.addEventListener('keydown', e => {
            this.keys[e.code] = true;
            
            // ESC 键处理
            if (e.code === 'Escape') {
                if (Game.state === 'PLAYING') {
                    // 游戏中按ESC直接打开背包
                    Game.openPauseMenu();
                } else if (Game.state === 'INVENTORY') {
                    // 背包按ESC返回游戏
                    Game.closePauseMenu();
                } else if (Game.state === 'GM') {
                    // GM面板按ESC返回背包
                    GM.closePanel();
                } else if (Game.state === 'SETTINGS') {
                    // 设置按ESC返回背包
                    Game.closeSettings();
                }
            }
        });
        window.addEventListener('keyup', e => this.keys[e.code] = false);
        
        // 触摸输入（虚拟摇杆）
        const canvas = document.getElementById('gameCanvas');
        
        canvas.addEventListener('touchstart', e => {
            e.preventDefault();
            const touch = e.touches[0];
            this.touch.active = true;
            this.touch.startX = touch.clientX;
            this.touch.startY = touch.clientY;
            this.touch.currentX = touch.clientX;
            this.touch.currentY = touch.clientY;
        });
        
        canvas.addEventListener('touchmove', e => {
            e.preventDefault();
            if (this.touch.active) {
                const touch = e.touches[0];
                this.touch.currentX = touch.clientX;
                this.touch.currentY = touch.clientY;
            }
        });
        
        canvas.addEventListener('touchend', e => {
            e.preventDefault();
            this.touch.active = false;
        });
    },
    
    getAxis() {
        let x = 0, y = 0;
        
        // 键盘输入 - WASD 和方向键
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) x -= 1;
        if (this.keys['ArrowRight'] || this.keys['KeyD']) x += 1;
        if (this.keys['ArrowUp'] || this.keys['KeyW']) y -= 1;
        if (this.keys['ArrowDown'] || this.keys['KeyS']) y += 1;
        
        // 触摸输入（虚拟摇杆）
        if (this.touch.active) {
            const deltaX = this.touch.currentX - this.touch.startX;
            const deltaY = this.touch.currentY - this.touch.startY;
            const threshold = 15;
            const maxDist = 80;
            
            if (Math.abs(deltaX) > threshold) {
                x = Math.sign(deltaX) * Math.min(Math.abs(deltaX) / maxDist, 1);
            }
            if (Math.abs(deltaY) > threshold) {
                y = Math.sign(deltaY) * Math.min(Math.abs(deltaY) / maxDist, 1);
            }
        }
        
        // 归一化（保持最大速度为1）
        if (x !== 0 || y !== 0) {
            const len = Math.sqrt(x * x + y * y);
            if (len > 1) {
                x /= len;
                y /= len;
            }
        }
        
        return { x, y };
    }
};
