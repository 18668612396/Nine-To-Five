class Camera extends Component {
    constructor() {
        super('Camera');
        this.viewport = { x: 0, y: 0, width: 1280, height: 720 };
        this.backgroundColor = '#000000';
        this.zoom = 1;
    }

    start() {
        // Register this camera as the main camera if none exists
        if (!window.Camera.main) {
            window.Camera.main = this;
        }
    }

    /**
     * Convert World Position to Screen Position
     * @param {number} x 
     * @param {number} y 
     */
    worldToScreen(x, y) {
        // Assuming camera is centered on its transform position
        const camX = this.gameObject.transform.x;
        const camY = this.gameObject.transform.y;
        
        const screenX = (x - camX) * this.zoom + this.viewport.width / 2;
        const screenY = (y - camY) * this.zoom + this.viewport.height / 2;
        
        return { x: screenX, y: screenY };
    }

    /**
     * Convert Screen Position to World Position
     * @param {number} x 
     * @param {number} y 
     */
    screenToWorld(x, y) {
        const camX = this.gameObject.transform.x;
        const camY = this.gameObject.transform.y;

        const worldX = (x - this.viewport.width / 2) / this.zoom + camX;
        const worldY = (y - this.viewport.height / 2) / this.zoom + camY;

        return { x: worldX, y: worldY };
    }

    /**
     * Apply camera transform to the canvas context
     * @param {CanvasRenderingContext2D} ctx 
     */
    apply(ctx) {
        // Clear screen
        // Note: RenderPipeline.beginFrame() already clears.
        // We disable Camera clear to allow RenderPipeline's debug color to show.
        // ctx.fillStyle = this.backgroundColor;
        // ctx.fillRect(0, 0, this.viewport.width, this.viewport.height);

        ctx.save();
        
        // Move to center of screen
        ctx.translate(this.viewport.width / 2, this.viewport.height / 2);
        
        // Apply Zoom
        ctx.scale(this.zoom, this.zoom);
        
        // Move camera to its position (inverse of object movement)
        const camX = this.gameObject ? this.gameObject.transform.x : 0;
        const camY = this.gameObject ? this.gameObject.transform.y : 0;
        ctx.translate(-camX, -camY);
    }

    /**
     * Restore canvas context
     * @param {CanvasRenderingContext2D} ctx 
     */
    reset(ctx) {
        ctx.restore();
    }
}

// Static reference to main camera
Camera.main = null;

window.Camera = Camera;
