class DynamicRenderer extends Renderer {
    constructor(sprites, speed = 10) {
        super('DynamicRenderer');
        this.sprites = sprites || []; // Array of Images
        this.animSpeed = speed; // Ticks per frame
        
        this.currentFrame = 0;
        this.timer = 0;
        this.isPlaying = true;
        this.loop = true;
        this.width = 0;
        this.height = 0;
        this.flipX = false;
    }

    update(dt) {
        if (!this.isPlaying || this.sprites.length === 0) return;

        this.timer++;
        if (this.timer >= this.animSpeed) {
            this.timer = 0;
            this.currentFrame++;
            if (this.currentFrame >= this.sprites.length) {
                if (this.loop) {
                    this.currentFrame = 0;
                } else {
                    this.currentFrame = this.sprites.length - 1;
                    this.isPlaying = false;
                }
            }
        }
    }

    draw(ctx) {
        if (!this.visible || this.sprites.length === 0) return;

        const t = this.gameObject.transform;
        if (!t) return;

        let img = this.sprites[this.currentFrame];
        
        // Fix flickering: if current frame is not ready, try to find a ready frame
        if (!img || !img.complete || img.naturalWidth === 0) {
            const readyImg = this.sprites.find(s => s && s.complete && s.naturalWidth > 0);
            if (readyImg) {
                img = readyImg;
            } else {
                return;
            }
        }

        const w = this.width || img.width;
        const h = this.height || img.height;

        // Safety check
        if (!Number.isFinite(w) || !Number.isFinite(h) || w === 0 || h === 0) return;

        ctx.save();
        try {
            ctx.translate(t.x + this.offsetX, t.y + this.offsetY);
            ctx.rotate(t.rotation);
            ctx.scale(this.flipX ? -t.scale.x : t.scale.x, t.scale.y);

            ctx.drawImage(img, -w/2, -h/2, w, h);
        } catch (e) {
            console.error("DynamicRenderer draw error:", e);
        } finally {
            ctx.restore();
        }
    }
    
    play() { this.isPlaying = true; }
    stop() { this.isPlaying = false; }
}
