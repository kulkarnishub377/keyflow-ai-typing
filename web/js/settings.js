function renderSettings() {
    const isDark = state.settings.theme === 'dark';
    
    const content = `
        <section class="card" style="max-width:800px">
            <div class="section-head">
                <div>
                    <h2>Workspace settings</h2>
                    <p>Comfort, practice targets, and local data controls.</p>
                </div>
            </div>
            <div class="form-grid">
                <div class="field">
                    <label>Theme</label>
                    <select id="theme">
                        <option value="dark" ${isDark ? 'selected' : ''}>Dark</option>
                        <option value="light" ${!isDark ? 'selected' : ''}>Light</option>
                    </select>
                </div>
                <div class="field">
                    <label>Daily practice goal (minutes)</label>
                    <input id="goal" type="number" min="1" max="240" value="${state.settings.daily_goal_minutes}">
                </div>
            </div>
            <button class="button button-primary" onclick="saveSettings()">Save settings</button>
        </section>
        <section class="card" style="max-width:800px;margin-top:16px">
            <div class="section-head">
                <div>
                    <h2>Local backup</h2>
                    <p>Export a portable JSON copy. KeyFlow never uploads it automatically.</p>
                </div>
            </div>
            <button class="button button-ghost" onclick="backup()">Export profile backup</button>
        </section>
        <section class="card" style="max-width:800px;margin-top:16px">
            <div class="section-head">
                <div>
                    <h2>About this build</h2>
                    <p>HTML/CSS/JavaScript + Python + pywebview + SQLite.</p>
                </div>
            </div>
            <div class="evidence">
                <span class="pill">Offline-first</span>
                <span class="pill">Local profiles</span>
                <span class="pill">Deterministic metrics</span>
                <span class="pill">Multi-agent foundation</span>
            </div>
        </section>
    `;
    app.innerHTML = layout(content, 'Settings', 'Keep the workspace comfortable while keeping control of your local data.');
}

async function saveSettings() {
    state.settings = await api('update_settings', {
        theme: document.getElementById('theme').value,
        daily_goal_minutes: Number(document.getElementById('goal').value)
    });
    applyTheme();
    render();
    toast('Settings saved.');
}

async function backup() {
    try {
        const pick = await api('choose_backup_path');
        if (!pick.path) return;
        await api('export_backup', pick.path);
        toast('Backup exported locally.');
    } catch (e) {
        toast(e.message || String(e));
    }
}
