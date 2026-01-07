// --- 音频基类 + 管理器 ---

// 音效基类
class Sound {
    constructor(config) {
        this.id = config.id;
        this.name = config.name || config.id;
        this.volume = config.volume || 1.0;
    }
    
    // 播放音效 - 子类重写
    play(ctx, masterVolume) {
        throw new Error('Sound.play must be overridden');
    }
    
    // 注册音效
    static register(sound) {
        Audio.register(sound);
    }
}

// 音频管理器
const Audio = {
    ctx: null,
    enabled: true,
    volume: 0.3,
    sounds: {},
    
    init() {
        document.addEventListener('click', () => this.ensureContext(), { once: true });
        document.addEventListener('touchstart', () => this.ensureContext(), { once: true });
    },
    
    ensureContext() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },
    
    // 注册音效
    register(sound) {
        this.sounds[sound.id] = sound;
    },
    
    // 获取所有音效ID
    getAllSoundIds() {
        return Object.keys(this.sounds);
    },
    
    // 播放音效
    play(id) {
        if (!this.enabled || !this.ctx) return;
        
        const sound = this.sounds[id];
        if (sound) {
            sound.play(this.ctx, this.volume);
        } else {
            console.warn('未知音效:', id);
        }
    },
    
    // 切换音效开关
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    },
    
    // 设置音量
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    },
    
    // 创建振荡器（工具方法）
    createOscillator(type = 'sine') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = type;
        return { osc, gain };
    }
};
