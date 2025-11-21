class Button extends Component {
    constructor() {
        super('Button');
        this.width = 100;
        this.height = 50;
        this.isHovered = false;
        this.listeners = [];
    }

    onLoad(props) {
        if (props.width !== undefined) this.width = props.width;
        if (props.height !== undefined) this.height = props.height;
    }

    /**
     * Add a click listener
     * @param {Function} callback 
     */
    onClick(callback) {
        this.listeners.push(callback);
    }

    update() {
        if (!this.gameObject || !this.gameObject.active) return;

        const input = window.game.inputManager;
        const mouse = input.getMousePosition();
        
        // Convert mouse to world space
        const worldMouseX = mouse.x + window.game.camera.x;
        const worldMouseY = mouse.y + window.game.camera.y;

        const t = this.gameObject.transform;

        // Simple AABB check (assuming center anchor)
        // World position is center of button
        const left = t.x - this.width / 2;
        const right = t.x + this.width / 2;
        const top = t.y - this.height / 2;
        const bottom = t.y + this.height / 2;

        const isInside = worldMouseX >= left && worldMouseX <= right && worldMouseY >= top && worldMouseY <= bottom;

        if (isInside) {
            if (!this.isHovered) {
                this.isHovered = true;
                document.body.style.cursor = 'pointer';
            }

            if (input.getMouseButtonDown(0)) {
                console.log(`Button clicked`);
                this.listeners.forEach(cb => cb());
            }
        } else {
            if (this.isHovered) {
                this.isHovered = false;
                document.body.style.cursor = 'default';
            }
        }
    }
    
    onDestroy() {
        if (this.isHovered) {
            document.body.style.cursor = 'default';
        }
        this.listeners = [];
    }
}

window.Button = Button;
