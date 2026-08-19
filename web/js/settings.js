// ==========================================================================
// KeyFlow Settings & Local Vault Engine
// ==========================================================================

function renderSettings() {
    const isDark = state.settings?.theme !== 'light';
    const sound = state.settings?.sound_enabled || 'off';
    const metronome = Number(state.settings?.metronome_bpm || 0);
    const blockBackspace = Boolean(state.settings?.block_backspace);

    const content = `
        <div style="max-width:840px;display:flex;flex-direction:column;gap:18px">
            <div>
                <h1 style="font-family:'Outfit',sans-serif;font-size:24px;font-weight:800">Workspace Settings & Vault</h1>
                <p style="font-size:13px;color:var(--text-muted)">Customize your typing environment, audio feedback, strict accuracy gates, and local data controls.</p>
            </div>

            <div class="kf-card">
                <div class="kf-card-header">
                    <div>
                        <div class="kf-card-title">Typing Experience & Audio</div>
                        <div class="kf-card-subtitle">Visual themes, mechanical sounds, and rhythmic pacing</div>
                    </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                    <div class="form-field">
                        <label class="form-label">Theme Appearance</label>
                        <select id="theme" class="form-select">
                            <option value="dark" ${isDark ? 'selected' : ''}>Obsidian Dark (Midnight Glass)</option>
                            <option value="light" ${!isDark ? 'selected' : ''}>Clean Slate Light</option>
                        </select>
                    </div>

                    <div class="form-field">
                        <label class="form-label">Daily Goal Target (Minutes)</label>
                        <input id="goal" class="form-input" type="number" min="1" max="240" value="${state.settings?.daily_goal_minutes || 15}">
                    </div>

                    <div class="form-field">
                        <label class="form-label">Keyboard Typing Sound Feedback</label>
                        <select id="soundEnabled" class="form-select">
                            <option value="off" ${sound === 'off' ? 'selected' : ''}>Muted (Silent Typing)</option>
                            <option value="click" ${sound === 'click' ? 'selected' : ''}>Mechanical Switch Click (Synthesized)</option>
                            <option value="beep" ${sound === 'beep' ? 'selected' : ''}>Soft Studio Beep</option>
                            <option value="typewriter" ${sound === 'typewriter' ? 'selected' : ''}>Vintage Typewriter (Clack & Ding)</option>
                        </select>
                    </div>

                    <div class="form-field">
                        <label class="form-label">Rhythm Metronome Pacing</label>
                        <select id="metronomeBpm" class="form-select">
                            <option value="0" ${metronome === 0 ? 'selected' : ''}>Off (Free Pace)</option>
                            <option value="60" ${metronome === 60 ? 'selected' : ''}>60 BPM (Foundations)</option>
                            <option value="80" ${metronome === 80 ? 'selected' : ''}>80 BPM (Steady Cadence)</option>
                            <option value="100" ${metronome === 100 ? 'selected' : ''}>100 BPM (Moderate Fluency)</option>
                            <option value="120" ${metronome === 120 ? 'selected' : ''}>120 BPM (High Cadence)</option>
                        </select>
                    </div>

                    <div class="form-field" style="grid-column: 1 / -1">
                        <label class="form-label">Strict Accuracy Restriction (No Backspace)</label>
                        <select id="blockBackspace" class="form-select">
                            <option value="0" ${!blockBackspace ? 'selected' : ''}>Allow Backspace (Standard — corrections permitted)</option>
                            <option value="1" ${blockBackspace ? 'selected' : ''}>🔒 Block Backspace (Strict Accuracy Mode — forces forward momentum)</option>
                        </select>
                    </div>
                </div>

                <div style="display:flex;gap:10px;margin-top:16px">
                    <button class="btn btn-primary" onclick="saveSettings()">Save Workspace Preferences</button>
                    <button type="button" class="btn btn-secondary" onclick="testAudioFeedback()">Test Audio Sound</button>
                </div>
            </div>

            <div class="kf-card">
                <div class="kf-card-header">
                    <div>
                        <div class="kf-card-title">Encrypted Local Data Vault</div>
                        <div class="kf-card-subtitle">Export an AES-Fernet encrypted backup of your profile and telemetry data</div>
                    </div>
                </div>
                <p style="font-size:13px;color:var(--text-muted);margin-bottom:14px">
                    All telemetry, custom lessons, and mastery data remain exclusively on your local hard drive. You can export an encrypted snapshot anytime.
                </p>
                <button class="btn btn-secondary" onclick="backup()">Export Encrypted Backup (AES-Fernet) ➔</button>
            </div>

            <div class="kf-card">
                <div class="kf-card-header">
                    <div>
                        <div class="kf-card-title">Session & Application Lifecycle</div>
                        <div class="kf-card-subtitle">Manage active profile session and desktop application exit</div>
                    </div>
                </div>
                <p style="font-size:13px;color:var(--text-muted);margin-bottom:14px">
                    All telemetry, custom lessons, and progress are securely persisted in local SQLite. You will always be asked for confirmation before signing out or exiting.
                </p>
                <div style="display:flex;gap:10px;flex-wrap:wrap">
                    <button class="btn btn-secondary" onclick="openLogoutModal()">⎋ Sign Out of Profile...</button>
                    <button class="btn btn-secondary" style="color:var(--accent-rose)" onclick="openExitModal()">✕ Exit KeyFlow Studio...</button>
                </div>
            </div>

            <div class="kf-card">
                <div class="kf-card-header">
                    <div>
                        <div class="kf-card-title">Local Architectural Guarantees</div>
                        <div class="kf-card-subtitle">System architecture and offline zero-leakage security model</div>
                    </div>
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap">
                    <span class="badge badge-success">✓ 100% Offline-First</span>
                    <span class="badge badge-brand">✓ Zero Telemetry Leakage</span>
                    <span class="badge badge-brand">✓ Scrypt & AES-Fernet Crypto</span>
                    <span class="badge badge-purple">✓ 10-Agent Deterministic Core</span>
                    <span class="badge badge-warning">✓ Sub-Millisecond Input Latency</span>
                </div>
            </div>
        </div>
    `;

    app.innerHTML = layout(content, 'Settings', 'Keep your workspace comfortable and maintain local control of your telemetry.');
}

async function saveSettings() {
    try {
        state.settings = await api('update_settings', {
            theme: document.getElementById('theme').value,
            daily_goal_minutes: Number(document.getElementById('goal').value),
            sound_enabled: document.getElementById('soundEnabled').value,
            metronome_bpm: Number(document.getElementById('metronomeBpm').value),
            block_backspace: Number(document.getElementById('blockBackspace').value)
        });
        applyTheme();
        render();
        toast('Workspace settings updated successfully.');
    } catch (e) {
        toast(e.message || String(e));
    }
}

async function backup() {
    try {
        const pick = await api('choose_backup_path');
        if (!pick || !pick.path) return;
        const result = await api('export_backup', pick.path);
        toast(`Encrypted backup exported to ${result.path}`);
    } catch (e) {
        toast(e.message || String(e));
    }
}
