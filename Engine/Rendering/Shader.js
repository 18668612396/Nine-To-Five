class Shader extends Asset {
    constructor(name) {
        super(name);
    }

    /**
     * Execute the rendering logic for this shader
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Object} cmd 
     */
    render(ctx, cmd) {
        // To be implemented by subclasses
    }
}

window.Shader = Shader;
