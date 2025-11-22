class SpriteShader extends Shader {
    constructor() {
        super('SpriteShader');
    }

    render(ctx, cmd) {
        const { texture, x, y, rotation, scaleX, scaleY, width, height, color, offsetX, offsetY, opacity } = cmd;
        
        if (!texture) return;
        // Check if image is loaded
        if (texture instanceof HTMLImageElement && texture.complete === false && texture.naturalWidth === 0) return;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.scale(scaleX, scaleY);
        
        // Combine opacity
        ctx.globalAlpha = (color.a !== undefined ? color.a : 1.0) * opacity;

        const w = width || texture.width;
        const h = height || texture.height;
        
        // Debug Draw
        // ctx.strokeStyle = 'red';
        // ctx.strokeRect(-w / 2 + offsetX, -h / 2 + offsetY, w, h);

        try {
            ctx.drawImage(
                texture,
                -w / 2 + offsetX,
                -h / 2 + offsetY,
                w,
                h
            );
        } catch (e) {
            console.warn("SpriteShader: Failed to draw image", e);
        }
        
        ctx.restore();
    }
}

window.SpriteShader = SpriteShader;
