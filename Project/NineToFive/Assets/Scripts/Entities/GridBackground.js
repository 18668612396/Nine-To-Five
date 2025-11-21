class GridBackground extends GameBehaviour {
    constructor() {
        super('GridBackground');
        this.gridSize = 100;
        this.width = 3000;
        this.height = 3000;
    }

    start() {
        let renderer = this.gameObject.getComponent('CanvasRenderer');
        if (!renderer) {
            renderer = new CanvasRenderer();
            this.gameObject.addComponent(renderer);
        }
        
        // Ensure background is drawn first
        renderer.sortingOrder = -1000;

        // Custom draw callback for efficient grid rendering
        renderer.drawCallback = (ctx) => {
            const startX = -this.width / 2;
            const startY = -this.height / 2;
            const endX = this.width / 2;
            const endY = this.height / 2;

            // 1. Draw Base Background
            ctx.fillStyle = '#222'; // Dark gray background
            ctx.fillRect(startX, startY, this.width, this.height);

            // 2. Draw Grid Lines
            ctx.strokeStyle = '#333'; // Lighter gray for grid
            ctx.lineWidth = 2;
            ctx.beginPath();

            // Vertical lines
            for (let x = startX; x <= endX; x += this.gridSize) {
                ctx.moveTo(x, startY);
                ctx.lineTo(x, endY);
            }

            // Horizontal lines
            for (let y = startY; y <= endY; y += this.gridSize) {
                ctx.moveTo(startX, y);
                ctx.lineTo(endX, y);
            }
            ctx.stroke();

            // 3. Draw World Border
            ctx.strokeStyle = '#ff5252'; // Reddish border
            ctx.lineWidth = 5;
            ctx.strokeRect(startX, startY, this.width, this.height);
        };
        
        // Ensure it's drawn behind everything
        renderer.sortingOrder = -100;
    }
}

window.GridBackground = GridBackground;