// ================================
// Sound Manager
// ================================

type SoundType = 'type' | 'error' | 'success' | 'fanfare' | 'countdown' | 'try-again';

class SoundManager {
    ctx: AudioContext | null = null;
    availableVoices: SpeechSynthesisVoice[] = [];

    constructor() {
        this.loadVoices();
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
        }
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }

    loadVoices() {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            this.availableVoices = window.speechSynthesis.getVoices();
        }
    }

    playSE(type: SoundType) {
        if (!this.ctx) this.init();
        const ctx = this.ctx!;
        if (ctx.state === 'suspended') ctx.resume();

        const now = ctx.currentTime;

        if (type === 'type') {
            // Key stroke sound (High click)
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === 'error') {
            // Buzzer (Low Sawtooth)
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.15);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
        } else if (type === 'fanfare') {
            // Success Fanfare (Arpeggio)
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, High C
            notes.forEach((freq, i) => {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.connect(g);
                g.connect(ctx.destination);
                o.type = 'triangle';
                o.frequency.value = freq;
                g.gain.setValueAtTime(0, now + i * 0.1);
                g.gain.linearRampToValueAtTime(0.3, now + i * 0.1 + 0.05);
                g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.5);
                o.start(now + i * 0.1);
                o.stop(now + i * 0.1 + 0.6);
            });
        } else if (type === 'success') {
            // Standard Success Chime (Major Third)
            const notes = [523.25, 659.25]; // C, E
            notes.forEach((freq, i) => {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.connect(g);
                g.connect(ctx.destination);
                o.type = 'sine';
                o.frequency.value = freq;
                g.gain.setValueAtTime(0, now + i * 0.15);
                g.gain.linearRampToValueAtTime(0.2, now + i * 0.15 + 0.05);
                g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.4);
                o.start(now + i * 0.15);
                o.stop(now + i * 0.15 + 0.5);
            });
        } else if (type === 'try-again') {
            // Try Again (Low Descending)
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.4);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
        } else if (type === 'countdown') {
            // Countdown Blip
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        }
    }

    speak(text: string) {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;

        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        u.rate = 1.0;
        u.pitch = 1.0;

        if (this.availableVoices.length === 0) {
            this.availableVoices = window.speechSynthesis.getVoices();
        }

        // 英語のボイスのみを抽出 (日本語訛りを排除するため en- で始まるもののみ)
        const englishVoices = this.availableVoices.filter(v =>
            v.lang.startsWith('en') && !v.name.includes('Japanese') && !v.name.includes('Japan')
        );

        // 高品質な英語ボイスを優先的に検索
        const preferredVoice =
            englishVoices.find(v => v.name.includes('Google') && v.name.includes('US')) ||
            englishVoices.find(v => v.name.includes('Zira')) ||
            englishVoices.find(v => v.name.includes('Samantha')) ||
            englishVoices.find(v => v.name.includes('Tom')) ||
            englishVoices.find(v => v.lang === 'en-US' && v.localService === false) ||
            englishVoices.find(v => v.lang === 'en-US') ||
            englishVoices.find(v => v.lang.startsWith('en'));

        if (preferredVoice) {
            u.voice = preferredVoice;
        }

        window.speechSynthesis.speak(u);
    }
}

export const soundManager = new SoundManager();
