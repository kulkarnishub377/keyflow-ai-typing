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
