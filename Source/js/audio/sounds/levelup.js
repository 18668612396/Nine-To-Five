// --- 升级音效 ---

class LevelUpSound extends Sound {
    constructor() {
        super({
            id: 'levelup',
            name: '升级',
            volume: 0.3
        });
    }
    
    play(ctx, masterVolume) {
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            const startTime = ctx.currentTime + i * 0.08;
            osc.frequency.setValueAtTime(freq, startTime);
            osc.type = 'sine';
            
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(masterVolume * this.volume, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
            
            osc.start(startTime);
            osc.stop(startTime + 0.3);
        });
    }
}

Sound.register(new LevelUpSound());
