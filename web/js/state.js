const state = {
    user: null,
    lessons: [],
    progress: [],
    dashboard: null,
    settings: { theme: 'dark', daily_goal_minutes: 15, sound_enabled: 'off', metronome_bpm: 0 },
    streak_stats: null,
    heatmap: null,
    route: 'dashboard',
    selectedLesson: null,
    practice: null,
    coach: null,
    authMode: 'login'
};

const app = document.getElementById('app');

const esc = v => String(v ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[c]));

async function api(method, ...args) {
    if (!window.pywebview?.api) throw Error('Desktop bridge is not ready.');
    return await window.pywebview.api[method](...args);
}

function toast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    clearTimeout(window.__toast);
    window.__toast = setTimeout(() => el.style.display = 'none', 2600);
}

// Pure Web Audio Synthesis (Zero External Files, Zero Network Calls)
let audioCtx = null;
function getAudioContext() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playKeySound(type = 'click') {
    if (state.settings?.sound_enabled === 'off') return;
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        if (state.settings?.sound_enabled === 'beep' || type === 'beep') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(580, now);
            osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
            osc.start(now);
            osc.stop(now + 0.04);
        } else {
            // Mechanical switch click emulation
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.exponentialRampToValueAtTime(180, now + 0.025);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
            osc.start(now);
            osc.stop(now + 0.025);
        }
    } catch (e) {
        // Audio policy or device error handled silently
    }
}

// Web Audio Metronome Engine
let metronomeTimer = null;
function startMetronome(bpm) {
    stopMetronome();
    if (!bpm || bpm <= 0) return;
    const intervalMs = (60 / bpm) * 1000;
    
    metronomeTimer = setInterval(() => {
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            const now = ctx.currentTime;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, now);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
            osc.start(now);
            osc.stop(now + 0.03);

            const pulseEl = document.getElementById('metronomePulse');
            if (pulseEl) {
                pulseEl.classList.add('active');
                setTimeout(() => pulseEl.classList.remove('active'), 120);
            }
        } catch (e) {}
    }, intervalMs);
}

function stopMetronome() {
    if (metronomeTimer) {
        clearInterval(metronomeTimer);
        metronomeTimer = null;
    }
}

// ==========================================================================
// Arcade Cyber-Matrix DSP Sound Synthesizer
// ==========================================================================
function playLaserSound(pitchFactor = 1.0) {
    if (state.settings?.sound_enabled === 'off') return;
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        const startFreq = 1400 * pitchFactor;
        const endFreq = 260 * pitchFactor;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.07);

        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        osc.start(now);
        osc.stop(now + 0.07);
    } catch (e) {}
}

function playExplosionSound() {
    if (state.settings?.sound_enabled === 'off') return;
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        // Sub-bass thump
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(28, now + 0.22);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.start(now);
        osc.stop(now + 0.22);
    } catch (e) {}
}

function playComboChime(comboLevel = 1) {
    if (state.settings?.sound_enabled === 'off') return;
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const baseFrequencies = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
        const freq = baseFrequencies[Math.min(baseFrequencies.length - 1, comboLevel)];

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.start(now);
        osc.stop(now + 0.18);
    } catch (e) {}
}

function playShieldDamageSound() {
    if (state.settings?.sound_enabled === 'off') return;
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(190, now);
        osc.frequency.exponentialRampToValueAtTime(75, now + 0.15);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.start(now);
        osc.stop(now + 0.15);
    } catch (e) {}
}

function playEmpSound() {
    if (state.settings?.sound_enabled === 'off') return;
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.4);

        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.start(now);
        osc.stop(now + 0.4);
    } catch (e) {}
}

function playWaveVictorySound() {
    if (state.settings?.sound_enabled === 'off') return;
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        [440, 554.37, 659.25, 880].forEach((f, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            const now = ctx.currentTime + i * 0.08;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

            osc.start(now);
            osc.stop(now + 0.2);
        });
    } catch (e) {}
}

