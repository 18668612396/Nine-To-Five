// --- 死亡音效 ---

class DeathSound extends Sound {
    constructor() {
        super({
            id: 'death',
            name: '死亡',
            volume: 0.4
        });
    }
    
    play(ctx, masterVolume) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.8);
        osc.type = 'sawtooth';
        
        gain.gain.setValueAtTime(masterVolume * this.volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
    }
}

Sound.register(new DeathSound());
