function renderSettings() {
    const isDark = state.settings.theme === 'dark';
    const sound = state.settings.sound_enabled || 'off';
    const metronome = Number(state.settings.metronome_bpm || 0);

    const content = `
        <section class="card" style="max-width:800px">
            <div class="section-head">
                <div>
                    <h2>Workspace & Audio Settings</h2>
                    <p>Comfort, practice pacing, audio feedback, and local data controls.</p>
                </div>
            </div>
            <div class="form-grid">
                <div class="field">
                    <label>Theme</label>
                    <select id="theme">
                        <option value="dark" ${isDark ? 'selected' : ''}>Dark (Midnight Glass)</option>
                        <option value="light" ${!isDark ? 'selected' : ''}>Light (Clean Slate)</option>
                    </select>
                </div>
                <div class="field">
                    <label>Daily Practice Goal (minutes)</label>
                    <input id="goal" type="number" min="1" max="240" value="${state.settings.daily_goal_minutes}">
                </div>
                <div class="field">
                    <label>Keyboard Typing Audio</label>
                    <select id="soundEnabled">
                        <option value="off" ${sound === 'off' ? 'selected' : ''}>Muted (Silent)</option>
                        <option value="click" ${sound === 'click' ? 'selected' : ''}>Mechanical Switch Click (Synthesized)</option>
                        <option value="beep" ${sound === 'beep' ? 'selected' : ''}>Soft Audio Tone</option>
                    </select>
                </div>
                <div class="field">
                    <label>Rhythm Metronome Pacing</label>
                    <select id="metronomeBpm">
                        <option value="0" ${metronome === 0 ? 'selected' : ''}>Off (Free Pace)</option>
                        <option value="60" ${metronome === 60 ? 'selected' : ''}>60 BPM (Slow Foundations)</option>
                        <option value="80" ${metronome === 80 ? 'selected' : ''}>80 BPM (Steady Practice)</option>
                        <option value="100" ${metronome === 100 ? 'selected' : ''}>100 BPM (Moderate Fluency)</option>
                        <option value="120" ${metronome === 120 ? 'selected' : ''}>120 BPM (High Cadence)</option>
                    </select>
                </div>
            </div>
            <div style="display:flex;gap:12px;margin-top:16px">
                <button class="button button-primary" onclick="saveSettings()">Save settings</button>
                <button type="button" class="button button-ghost" onclick="testAudioFeedback()">Test Sound</button>
            </div>
        </section>

        <section class="card" style="max-width:800px;margin-top:16px">
            <div class="section-head">
                <div>
                    <h2>Encrypted Local Backup</h2>
                    <p>Export an AES-Fernet encrypted copy of your profile and telemetry data.</p>
                </div>
            </div>
            <button class="button button-ghost" onclick="backup()">Export encrypted backup</button>
        </section>

        <section class="card" style="max-width:800px;margin-top:16px">
            <div class="section-head">
                <div>
                    <h2>Architecture & Local Guarantees</h2>
                    <p>PyWebview + Python API + SQLite WAL + 10-Agent Pipeline.</p>
                </div>
            </div>
            <div class="evidence">
                <span class="pill">Offline-First</span>
                <span class="pill">Zero Telemetry Leakage</span>
                <span class="pill">Scrypt & Fernet Crypto</span>
                <span class="pill">10-Agent Deterministic Core</span>
                <span class="pill">Web Audio API</span>
            </div>
        </section>
    `;
    app.innerHTML = layout(content, 'Settings', 'Keep the workspace comfortable while keeping control of your local data.');
}

async function saveSettings() {
    state.settings = await api('update_settings', {
        theme: document.getElementById('theme').value,
        daily_goal_minutes: Number(document.getElementById('goal').value),
        sound_enabled: document.getElementById('soundEnabled').value,
        metronome_bpm: Number(document.getElementById('metronomeBpm').value)
    });
    applyTheme();
    render();
    toast('Settings saved.');
}

function testAudioFeedback() {
    const sound = document.getElementById('soundEnabled')?.value || 'click';
    state.settings.sound_enabled = sound;
    playKeySound(sound);
    toast('Audio test played');
}

async function backup() {
    try {
        const pick = await api('choose_backup_path');
        if (!pick.path) return;
        await api('export_backup', pick.path);
        toast('Encrypted backup exported.');
    } catch (e) {
        toast(e.message || String(e));
    }
}
