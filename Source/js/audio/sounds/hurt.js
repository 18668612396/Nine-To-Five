// --- 受伤音效 ---

class HurtSound extends Sound {
    constructor() {
        super({
            id: 'hurt',
            name: '受伤',
            volume: 0.3
        });
    }
    
    play(ctx, masterVolume) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);
        osc.type = 'sawtooth';
        
        gain.gain.setValueAtTime(masterVolume * this.volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
    }
}

Sound.register(new HurtSound());
