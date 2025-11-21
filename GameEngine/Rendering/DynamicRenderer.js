class DynamicRenderer extends Renderer {
    constructor(source, arg2, arg3, arg4) {
        super('DynamicRenderer');
        
        this.mode = 'spritesheet'; // or 'frames'
        this.frames = [];
        this.width = 0;
        this.height = 0;
        
        if (Array.isArray(source)) {
            this.mode = 'frames';
            this.frames = source; // Array of Image objects
            this.frameRate = arg2 || 10;
            this.loaded = true;
        } else if (source) {
            this.mode = 'spritesheet';
            this.image = new Image();
            this.image.src = source;
            this.frameWidth = arg2;
            this.frameHeight = arg3;
            this.frameRate = arg4 || 10;
            this.loaded = false;
            this.image.onload = () => { 
                this.loaded = true; 
                this.cols = Math.floor(this.image.width / this.frameWidth);
            };
        } else {
            // No source provided (e.g. loaded from SceneLoader)
            this.mode = 'spritesheet';
            this.image = new Image();
            this.loaded = false;
        }
        
        this.currentFrame = 0;
        this.timer = 0;
        
        this.animations = {};
        this.currentAnim = null;
    }

    addAnimation(name, frames) {
        this.animations[name] = frames;
    }

    play(name) {
        if (this.currentAnim !== name && this.animations[name]) {
            this.currentAnim = name;
            this.currentFrame = 0;
            this.timer = 0;
        }
    }

    update(dt) {
        if (!this.loaded) return;
        
        // If in frames mode and no animation set, just loop through all frames
        if (this.mode === 'frames' && !this.currentAnim) {
             this.timer += dt;
             if (this.timer >= 1 / this.frameRate) {
                 this.timer = 0;
                 this.currentFrame = (this.currentFrame + 1) % this.frames.length;
             }
             return;
        }

        if (!this.currentAnim) return;
        
        this.timer += dt;
        if (this.timer >= 1 / this.frameRate) {
            this.timer = 0;
            this.currentFrame++;
            const frames = this.animations[this.currentAnim];
            if (this.currentFrame >= frames.length) {
                this.currentFrame = 0;
            }
        }
    }

    draw(ctx) {
        if (!this.loaded || !this.gameObject) return;
        
        const t = this.gameObject.transform;
        
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.rotate(t.rotation);
        ctx.scale(t.scale.x, t.scale.y);
        
        if (this.mode === 'frames') {
            const img = this.frames[this.currentFrame];
            if (img && img.complete) {
                const w = this.width || img.width;
                const h = this.height || img.height;
                ctx.drawImage(img, -w/2 + this.offsetX, -h/2 + this.offsetY, w, h);
            }
        } else {
            let frameIndex = 0;
            if (this.currentAnim) {
                frameIndex = this.animations[this.currentAnim][this.currentFrame];
            }
            
            const col = frameIndex % this.cols;
            const row = Math.floor(frameIndex / this.cols);
            
            const w = this.width || this.frameWidth;
            const h = this.height || this.frameHeight;

            ctx.drawImage(
                this.image,
                col * this.frameWidth, row * this.frameHeight,
                this.frameWidth, this.frameHeight,
                -w/2 + this.offsetX, -h/2 + this.offsetY,
                w, h
            );
        }
        
        ctx.restore();
    }
}

window.DynamicRenderer = DynamicRenderer;
