// --- 拾取音效 ---

class PickupSound extends Sound {
    constructor() {
        super({
            id: 'pickup',
            name: '拾取',
            volume: 0.15
        });
    }
    
    play(ctx, masterVolume) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(masterVolume * this.volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    }
}

Sound.register(new PickupSound());
