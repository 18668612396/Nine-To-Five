// --- 击杀音效 ---

class KillSound extends Sound {
    constructor() {
        super({
            id: 'kill',
            name: '击杀',
            volume: 0.2
        });
    }
    
    play(ctx, masterVolume) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(masterVolume * this.volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
    }
}

Sound.register(new KillSound());
