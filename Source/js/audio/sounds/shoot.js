// --- 发射音效 ---

class ShootSound extends Sound {
    constructor() {
        super({
            id: 'shoot',
            name: '发射',
            volume: 0.2
        });
    }
    
    play(ctx, masterVolume) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
        osc.type = 'square';
        
        gain.gain.setValueAtTime(masterVolume * this.volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    }
}

Sound.register(new ShootSound());
