// --- 输入处理 ---

const Input = {
    keys: {},
    touch: {
        active: false,
        startX: 0,
        currentX: 0
    },
    
    init() {
        // 键盘输入
        window.addEventListener('keydown', e => this.keys[e.code] = true);
        window.addEventListener('keyup', e => this.keys[e.code] = false);
        
        // 触摸输入
        const canvas = document.getElementById('gameCanvas');
        canvas.addEventListener('touchstart', e => {
            e.preventDefault();
            this.touch.active = true;
            this.touch.startX = e.touches[0].clientX;
            this.touch.currentX = e.touches[0].clientX;
        });
        
        canvas.addEventListener('touchmove', e => {
            e.preventDefault();
            if (this.touch.active) {
                this.touch.currentX = e.touches[0].clientX;
            }
        });
        
        canvas.addEventListener('touchend', e => {
            e.preventDefault();
            this.touch.active = false;
        });
        
        // 鼠标输入（用于PC测试）
        canvas.addEventListener('mousedown', e => {
            this.touch.active = true;
            this.touch.startX = e.clientX;
            this.touch.currentX = e.clientX;
        });
        
        canvas.addEventListener('mousemove', e => {
            if (this.touch.active) {
                this.touch.currentX = e.clientX;
            }
        });
        
        canvas.addEventListener('mouseup', e => {
            this.touch.active = false;
        });
    },
    
    getAxis() {
        let x = 0, y = 0;
        
        // 键盘输入 - 只允许左右移动
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) x -= 1;
        if (this.keys['ArrowRight'] || this.keys['KeyD']) x += 1;
        
        // 上下移动也支持，但范围受限
        if (this.keys['ArrowUp'] || this.keys['KeyW']) y -= 1;
        if (this.keys['ArrowDown'] || this.keys['KeyS']) y += 1;
        
        // 触摸/鼠标输入
        if (this.touch.active) {
            const deltaX = this.touch.currentX - this.touch.startX;
            const threshold = 10;
            if (Math.abs(deltaX) > threshold) {
                x = Math.sign(deltaX) * Math.min(Math.abs(deltaX) / 50, 1);
            }
        }
        
        // 归一化
        if (x !== 0 || y !== 0) {
            const len = Math.sqrt(x * x + y * y);
            x /= len;
            y /= len;
        }
        return { x, y };
    }
};
