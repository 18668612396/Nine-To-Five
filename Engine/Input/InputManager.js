class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        
        // Key states
        this.keys = {};
        this.previousKeys = {};
        
        // Mouse states
        this.mouse = {
            x: 0,
            y: 0,
            buttons: {}
        };
        this.previousMouse = {
            buttons: {}
        };

        // Bind methods
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);

        // Add listeners
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mousedown', this.onMouseDown);
        window.addEventListener('mouseup', this.onMouseUp);
        
        // Prevent context menu on canvas
        if (this.canvas) {
            this.canvas.addEventListener('contextmenu', e => e.preventDefault());
        }
    }

    update() {
        // Update previous states at the end of the frame
        this.previousKeys = { ...this.keys };
        this.previousMouse.buttons = { ...this.mouse.buttons };
    }

    onKeyDown(e) {
        this.keys[e.key.toLowerCase()] = true;
        this.keys[e.code] = true; // Support both 'w' and 'KeyW'
    }

    onKeyUp(e) {
        this.keys[e.key.toLowerCase()] = false;
        this.keys[e.code] = false;
    }

    onMouseMove(e) {
        if (!this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        this.mouse.x = (e.clientX - rect.left) * scaleX;
        this.mouse.y = (e.clientY - rect.top) * scaleY;
    }

    onMouseDown(e) {
        this.mouse.buttons[e.button] = true;
    }

    onMouseUp(e) {
        this.mouse.buttons[e.button] = false;
    }

    /**
     * Check if a key is currently held down
     * @param {string} key - Key name (e.g., 'w', 'ArrowUp', 'Space')
     * @returns {boolean}
     */
    getKey(key) {
        return !!this.keys[key.toLowerCase()] || !!this.keys[key];
    }

    /**
     * Check if a key was pressed this frame
     * @param {string} key 
     * @returns {boolean}
     */
    getKeyDown(key) {
        const k = key.toLowerCase();
        return (!!this.keys[k] && !this.previousKeys[k]) || (!!this.keys[key] && !this.previousKeys[key]);
    }

    /**
     * Check if a key was released this frame
     * @param {string} key 
     * @returns {boolean}
     */
    getKeyUp(key) {
        const k = key.toLowerCase();
        return (!this.keys[k] && !!this.previousKeys[k]) || (!this.keys[key] && !!this.previousKeys[key]);
    }

    /**
     * Check if a mouse button is held down
     * @param {number} button - 0: Left, 1: Middle, 2: Right
     * @returns {boolean}
     */
    getMouseButton(button) {
        return !!this.mouse.buttons[button];
    }

    getMouseButtonDown(button) {
        return !!this.mouse.buttons[button] && !this.previousMouse.buttons[button];
    }

    getMouseButtonUp(button) {
        return !this.mouse.buttons[button] && !!this.previousMouse.buttons[button];
    }

    getMousePosition() {
        return { x: this.mouse.x, y: this.mouse.y };
    }
    
    destroy() {
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mousedown', this.onMouseDown);
        window.removeEventListener('mouseup', this.onMouseUp);
    }
}
