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

// ==========================================================================
// Bridge & Client-Side Web Demo Engine (for GitHub Pages / Web Preview)
// ==========================================================================
const DEMO_DEFAULT_LESSONS = [
    { id: 1, title: "Home Row: Anchors", level: 1, description: "Learn the anchor keys F and J with index finger touch.", target_keys: "fj", target_wpm: 25, content: "ffff jjjj ff jj fj jf\n\njf fj fff jjj ffff jjjj\n\nfjf jfj ffjj jjff fj fj" },
    { id: 2, title: "Home Row: Index Fingers", level: 1, description: "Expand to G and H while returning to anchors.", target_keys: "fghj", target_wpm: 28, content: "fg hj gf jh fghg jhkj\n\ngf hj hg jh fgh jhk ghfj\n\nhgjf fjhg ghhg ffjj fghj" },
    { id: 3, title: "Home Row: Left Hand", level: 1, description: "Build left hand muscle memory on A, S, D, F.", target_keys: "asdfg", target_wpm: 30, content: "asdf fdsa sad dad fasad\n\na fad a dad sad fall as alas\n\nsad dad fast flask glass salad" },
    { id: 4, title: "Home Row: Right Hand", level: 1, description: "Build right hand muscle memory on J, K, L, ;.", target_keys: "hjkl;", target_wpm: 30, content: "jkl; ;lkj all fall hall\n\nask fall half flash dash gash\n\nall fall hall shall look hook" },
    { id: 5, title: "Home Row: Full Integration", level: 1, description: "Combine both hands smoothly without looking down.", target_keys: "asdfghjkl;", target_wpm: 35, content: "a glass falls half a flash a dash a gash\n\nall lads ask dad as a salad falls flat\n\nhalf a flask falls as lads glad ask" },
    { id: 6, title: "Top Row: Left Reaches", level: 2, description: "Reach for Q, W, E, R, T with precision.", target_keys: "qwert", target_wpm: 35, content: "water tree free draw read tear\n\nred raw war wet saw treat weed raw\n\nwe draw water from a sweet tree" },
    { id: 7, title: "Top Row: Right Reaches", level: 2, description: "Reach for Y, U, I, O, P smoothly.", target_keys: "yuiop", target_wpm: 35, content: "you pop out pot top your up rip\n\npoor plot tour port trip pout root\n\nyou put out your pot to pour tea" },
    { id: 8, title: "Top Row: Common Vowel Pairs", level: 2, description: "Practice fluid rolls across EA, OU, IE, and OO.", target_keys: "eaiou", target_wpm: 38, content: "great clear look house quiet round\n\nclean brain train sound voice choice\n\neach quiet thought brings deep peace" },
    { id: 9, title: "Top Row: Full Integration", level: 2, description: "Mix top and home rows gracefully.", target_keys: "qwertyuiopasdfghjkl;", target_wpm: 40, content: "the quick weight thought right height flight\n\nwrite high words with quiet light power\n\nflight through white clouds at great speed" },
    { id: 10, title: "Bottom Row: Left Drops", level: 3, description: "Drop to Z, X, C, V, B with steady fingers.", target_keys: "zxcvb", target_wpm: 38, content: "cab bad vac cab back brave\n\ncave base crab black blade carve\n\nbrave cats climb back into the cave" },
    { id: 11, title: "Bottom Row: Right Drops", level: 3, description: "Drop to N, M, comma, period, and slash.", target_keys: "nm,./", target_wpm: 38, content: "man men name moon noon sun\n\nroom normal common human sound\n\nmen learn modern forms and names" },
    { id: 12, title: "Full Alphabet Integration", level: 3, description: "All 26 letters in flowing prose.", target_keys: "abcdefghijklmnopqrstuvwxyz", target_wpm: 45, content: "the quick brown fox jumps over the lazy dog\n\npack my box with five dozen liquor jugs\n\nhow quickly daft jumping zebras vex" },
    { id: 13, title: "Numbers & Punctuation", level: 4, description: "Number row 0-9 and common punctuation.", target_keys: "0123456789.,;:'\"-", target_wpm: 40, content: "in 1984, the team scored 250 points in 30 minutes.\n\ncall 555-0199 or 555-0142 for support.\n\nroute 66 spans 2,448 miles across 8 states." },
    { id: 14, title: "Code Syntax: Python & JS", level: 4, description: "Brackets, colons, arrows, and keywords.", target_keys: "{}[]()<>=:;+-*/_!@#$", target_wpm: 45, content: "def calculate_wpm(words: list[str], time_sec: float) -> float:\n    return len(words) / (time_sec / 60.0)\n\nconst handler = (e) => { e.preventDefault(); };" }
];

function getStoredSessions() {
    try {
        return JSON.parse(localStorage.getItem('kf_sessions') || '[]');
    } catch {
        return [];
    }
}

function getStoredCustomLessons() {
    try {
        return JSON.parse(localStorage.getItem('kf_custom_lessons') || '[]');
    } catch {
        return [];
    }
}

async function webDemoApi(method, ...args) {
    if (method === 'get_bootstrap') {
        const user = await webDemoApi('get_current_user');
        const lessons = await webDemoApi('get_lessons');
        const dashboard = await webDemoApi('get_dashboard');
        const settings = await webDemoApi('get_settings');
        const streak = await webDemoApi('get_streak_stats');
        return {
            user: user,
            lessons: lessons,
            progress: [],
            dashboard: dashboard,
            settings: settings,
            streak_stats: streak
        };
    }
    if (method === 'get_current_user') {
        const username = localStorage.getItem('kf_user') || 'Demo Pilot';
        return { id: 1, username: username, created_at: new Date().toISOString() };
    }
    if (method === 'login' || method === 'register') {
        const username = args[0] || 'Demo Pilot';
        localStorage.setItem('kf_user', username);
        return { id: 1, username: username, created_at: new Date().toISOString() };
    }
    if (method === 'logout') {
        localStorage.removeItem('kf_user');
        return true;
    }
    if (method === 'get_settings') {
        try {
            return JSON.parse(localStorage.getItem('kf_settings') || '{}') || {
                theme: 'dark',
                daily_goal_minutes: 15,
                sound_enabled: 'click',
                metronome_bpm: 0,
                block_backspace: 0
            };
        } catch {
            return { theme: 'dark', daily_goal_minutes: 15, sound_enabled: 'click', metronome_bpm: 0 };
        }
    }
    if (method === 'update_settings') {
        const patch = args[0] || {};
        const cur = await webDemoApi('get_settings');
        const updated = { ...cur, ...patch };
        localStorage.setItem('kf_settings', JSON.stringify(updated));
        return updated;
    }
    if (method === 'get_lessons') {
        const custom = getStoredCustomLessons();
        return [...DEMO_DEFAULT_LESSONS, ...custom];
    }
    if (method === 'get_lesson_detail') {
        const id = args[0];
        const all = await webDemoApi('get_lessons');
        return all.find(l => l.id === id) || all[0];
    }
    if (method === 'save_session') {
        const payload = args[0] || {};
        const sessions = getStoredSessions();
        const session = {
            id: sessions.length + 1,
            user_id: 1,
            lesson_id: payload.lesson_id || null,
            wpm: Number(payload.wpm) || 0,
            accuracy: Number(payload.accuracy) || 0,
            raw_wpm: Number(payload.raw_wpm) || Number(payload.wpm) || 0,
            error_count: Number(payload.error_count) || 0,
            duration_seconds: Number(payload.duration_seconds) || 30,
            created_at: new Date().toISOString()
        };
        sessions.push(session);
        localStorage.setItem('kf_sessions', JSON.stringify(sessions));
        return session;
    }
    if (method === 'get_dashboard') {
        const sessions = getStoredSessions();
        const count = sessions.length;
        const avgWpm = count ? Math.round(sessions.reduce((a, b) => a + b.wpm, 0) / count) : 48;
        const avgAcc = count ? Math.round(sessions.reduce((a, b) => a + b.accuracy, 0) / count) : 96;
        const recentWpm = count ? sessions.slice(-5).map(s => s.wpm) : [42, 45, 48, 52, 55];
        return {
            total_sessions: Math.max(count, 5),
            avg_wpm: avgWpm,
            avg_accuracy: avgAcc,
            recent_wpm: recentWpm,
            weak_keys: [{ expected_key: 'q', error_count: 3 }, { expected_key: 'p', error_count: 2 }],
            badges: [
                { id: 'first_flight', name: 'First Flight', desc: 'Completed your first typing session', icon: '🚀', unlocked: true },
                { id: 'speed_demon', name: 'Velocity Titan', desc: 'Achieved 60+ WPM', icon: '⚡', unlocked: avgWpm >= 60 },
                { id: 'precision', name: 'Sniper Precision', desc: 'Achieved 98%+ Accuracy', icon: '🎯', unlocked: avgAcc >= 98 }
            ]
        };
    }
    if (method === 'get_analytics') {
        const sessions = getStoredSessions();
        return {
            sessions: sessions.slice(-20),
            slow_transitions: [
                { digraph: "th", avg_latency_ms: 120 },
                { digraph: "qu", avg_latency_ms: 180 },
                { digraph: "tr", avg_latency_ms: 140 }
            ],
            hand_balance: { left_hand_pct: 52, right_hand_pct: 48 },
            rhythm_score: 94
        };
    }
    if (method === 'get_streak_stats') {
        return { current_streak: 3, longest_streak: 7, today_completed: true };
    }
    if (method === 'get_heatmap') {
        return {
            error_frequencies: { 'q': 4, 'p': 3, 'z': 2, 'b': 1 },
            latency_averages: { 'q': 190, 'p': 175, 'z': 210, 'b': 140 }
        };
    }
    if (method === 'get_custom_lessons') {
        return getStoredCustomLessons();
    }
    if (method === 'save_custom_lesson') {
        const [title, text] = args;
        const custom = getStoredCustomLessons();
        const newLesson = {
            id: 1000 + custom.length + 1,
            title: title || "Custom Practice",
            level: 5,
            description: "Custom user-generated practice session.",
            target_keys: "custom",
            target_wpm: 50,
            content: text || "Practice makes permanent."
        };
        custom.push(newLesson);
        localStorage.setItem('kf_custom_lessons', JSON.stringify(custom));
        return newLesson;
    }
    if (method === 'get_ai_coach_advice') {
        return {
            advice: "Great cadence! Focus on left-hand precision when reaching for 'Q' and 'Z' to sustain accuracy above 97%."
        };
    }
    if (method === 'generate_adaptive_drill') {
        return {
            drill_text: "quiet queue quote quickly require request equal liquid conquer sequence"
        };
    }
    if (method === 'get_arcade_leaderboard') {
        try {
            return JSON.parse(localStorage.getItem('kf_arcade_scores') || '[]') || [
                { score: 14200, mode: 'defense', wave: 6, wpm: 68, accuracy: 97, date: 'Today' }
            ];
        } catch {
            return [];
        }
    }
    if (method === 'save_arcade_score') {
        const [score, mode, wave, wpm, acc] = args;
        const scores = await webDemoApi('get_arcade_leaderboard');
        scores.unshift({ score, mode, wave, wpm, accuracy: acc, date: new Date().toLocaleDateString() });
        localStorage.setItem('kf_arcade_scores', JSON.stringify(scores.slice(0, 10)));
        return true;
    }
    if (method === 'choose_backup_path') {
        return { path: "keyflow-vault-backup.json" };
    }
    if (method === 'export_backup') {
        const data = {
            user: await webDemoApi('get_current_user'),
            settings: await webDemoApi('get_settings'),
            sessions: getStoredSessions(),
            custom_lessons: getStoredCustomLessons()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'keyflow-backup.json';
        a.click();
        return { path: 'keyflow-backup.json' };
    }
    if (method === 'exit_app') {
        toast('In web mode: you can close this browser tab.');
        return true;
    }
    return null;
}

async function api(method, ...args) {
    if (window.pywebview?.api && typeof window.pywebview.api[method] === 'function') {
        return await window.pywebview.api[method](...args);
    }
    return await webDemoApi(method, ...args);
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
        } else if (state.settings?.sound_enabled === 'typewriter') {
            if (type === '\n' || type === 'enter') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(820, now + 0.1);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.4);
            } else {
                osc.type = 'square';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(120, now + 0.03);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
                osc.start(now);
                osc.stop(now + 0.03);
            }
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

function playNitroBoostSound() {
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
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(680, now + 0.35);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.start(now);
        osc.stop(now + 0.35);
    } catch (e) {}
}

function playCrystalShatterSound() {
    if (state.settings?.sound_enabled === 'off') return;
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        [880, 1174.66, 1760, 2349.32].forEach((f, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            const now = ctx.currentTime + i * 0.03;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            osc.start(now);
            osc.stop(now + 0.12);
        });
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

