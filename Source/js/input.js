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
    joystick: null, // 虚拟摇杆DOM元素
    
    init() {
        // 键盘输入
        window.addEventListener('keydown', e => {
            this.keys[e.code] = true;
            
            // ESC 键处理
            if (e.code === 'Escape') {
                if (Game.state === 'PLAYING') {
                    Game.openPauseMenu();
                } else if (Game.state === 'INVENTORY') {
                    Game.closePauseMenu();
                } else if (Game.state === 'GM') {
                    GM.closePanel();
                } else if (Game.state === 'SETTINGS') {
                    Game.closeSettings();
                }
            }
        });
        window.addEventListener('keyup', e => this.keys[e.code] = false);
        
        // 手机端：创建虚拟摇杆
        if (isMobile) {
            this.createJoystick();
        }
        
        // 触摸输入
        const canvas = document.getElementById('gameCanvas');
        
        canvas.addEventListener('touchstart', e => {
            if (Game.state !== 'PLAYING') return;
            e.preventDefault();
            const touch = e.touches[0];
            this.touch.active = true;
            this.touch.startX = touch.clientX;
            this.touch.startY = touch.clientY;
            this.touch.currentX = touch.clientX;
            this.touch.currentY = touch.clientY;
            
            if (isMobile && this.joystick) {
                this.showJoystick(touch.clientX, touch.clientY);
            }
        });
        
        canvas.addEventListener('touchmove', e => {
            if (Game.state !== 'PLAYING') return;
            e.preventDefault();
            if (this.touch.active) {
                const touch = e.touches[0];
                this.touch.currentX = touch.clientX;
                this.touch.currentY = touch.clientY;
                
                if (isMobile && this.joystick) {
                    this.updateJoystick();
                }
            }
        });
        
        canvas.addEventListener('touchend', e => {
            e.preventDefault();
            this.touch.active = false;
            
            if (isMobile && this.joystick) {
                this.hideJoystick();
            }
        });
    },
    
    createJoystick() {
        // 摇杆容器
        const joystick = document.createElement('div');
        joystick.id = 'virtual-joystick';
        joystick.innerHTML = `
            <div class="joystick-base"></div>
            <div class="joystick-stick"></div>
        `;
        document.getElementById('ui-layer').appendChild(joystick);
        this.joystick = joystick;
        this.joystickStick = joystick.querySelector('.joystick-stick');
    },
    
    showJoystick(x, y) {
        this.joystick.style.display = 'block';
        this.joystick.style.left = (x - 60) + 'px';
        this.joystick.style.top = (y - 60) + 'px';
        this.joystickStick.style.transform = 'translate(-50%, -50%)';
    },
    
    updateJoystick() {
        const deltaX = this.touch.currentX - this.touch.startX;
        const deltaY = this.touch.currentY - this.touch.startY;
        const maxDist = 40;
        const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        let moveX = deltaX;
        let moveY = deltaY;
        
        if (dist > maxDist) {
            moveX = (deltaX / dist) * maxDist;
            moveY = (deltaY / dist) * maxDist;
        }
        
        this.joystickStick.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
    },
    
    hideJoystick() {
        this.joystick.style.display = 'none';
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
