class SpriteShader extends Shader {
    constructor() {
        super('SpriteShader');
    }

    render(ctx, cmd) {
        const { texture, x, y, rotation, scaleX, scaleY, width, height, color, offsetX, offsetY, opacity } = cmd;
        
        if (!texture) return;
        // Check if image is loaded
        if (texture.complete === false && texture.naturalWidth === 0) return;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.scale(scaleX, scaleY);
        
        // Combine opacity
        ctx.globalAlpha = (color.a !== undefined ? color.a : 1.0) * opacity;

        const w = width || texture.width;
        const h = height || texture.height;
        
        ctx.drawImage(
            texture,
            -w / 2 + offsetX,
            -h / 2 + offsetY,
            w,
            h
        );
        
        ctx.restore();
    }
}

window.SpriteShader = SpriteShader;
