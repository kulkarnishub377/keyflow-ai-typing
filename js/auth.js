// ==========================================================================
// KeyFlow Authentication & Profile Setup
// ==========================================================================

function renderError(msg) {
    app.innerHTML = `
        <div style="min-height:100vh;display:grid;place-items:center;padding:24px">
            <div class="kf-card" style="max-width:480px;text-align:center">
                <h2 style="font-family:'Outfit',sans-serif;font-size:22px;color:var(--accent-rose)">KeyFlow Startup Error</h2>
                <p style="font-size:14px;color:var(--text-muted);margin:10px 0 16px">${esc(msg)}</p>
                <button class="btn btn-primary" onclick="location.reload()">Retry</button>
            </div>
        </div>
    `;
}

function renderAuth() {
    const isLogin = state.authMode === 'login';
    app.innerHTML = `
        <div style="min-height:100vh;display:grid;place-items:center;padding:32px">
            <div style="width:min(940px,100%);display:grid;grid-template-columns:1.15fr 0.85fr;background:var(--surface-0);backdrop-filter:var(--blur);-webkit-backdrop-filter:var(--blur);border:1px solid var(--border-medium);border-radius:var(--radius-lg);overflow:hidden;box-shadow:var(--shadow-lg)">
                <div style="padding:48px;background:radial-gradient(ellipse at top left,rgba(99,102,241,0.3) 0%,transparent 65%),linear-gradient(160deg,#0a0f1d,#04060c);display:flex;flex-direction:column;justify-content:space-between;color:#ffffff">
                    <div>
                        <div style="display:flex;align-items:center;gap:12px;margin-bottom:28px">
                            ${logo()}
                        </div>
                        <h1 style="font-family:'Outfit',sans-serif;font-size:38px;font-weight:900;letter-spacing:-0.04em;line-height:1.15;margin-bottom:14px;color:#ffffff">
                            Build typing speed that actually lasts.
                        </h1>
                        <p style="font-size:14px;color:#94a3b8;line-height:1.6">
                            A high-performance local typing studio with real-time telemetry diagnostics, adaptive curriculum planning, and zero cloud dependency.
                        </p>
                    </div>

                    <div style="display:flex;flex-direction:column;gap:12px;margin-top:32px">
                        <div style="display:flex;gap:10px;align-items:center;font-size:13px;color:#e2e8f0">
                            <span style="color:var(--accent-green);font-weight:900">✓</span>
                            <span>100% Private local telemetry on your machine</span>
                        </div>
                        <div style="display:flex;gap:10px;align-items:center;font-size:13px;color:#e2e8f0">
                            <span style="color:var(--accent-green);font-weight:900">✓</span>
                            <span>Live WPM, accuracy health, and QWERTY heatmap</span>
                        </div>
                        <div style="display:flex;gap:10px;align-items:center;font-size:13px;color:#e2e8f0">
                            <span style="color:var(--accent-green);font-weight:900">✓</span>
                            <span>Adaptive multi-agent exercises targeting your exact weaknesses</span>
                        </div>
                    </div>
                </div>

                <div style="padding:42px 38px;background:var(--surface-1);display:flex;flex-direction:column;justify-content:center">
                    <div style="display:flex;gap:6px;padding:4px;background:var(--surface-2);border-radius:var(--radius-sm);margin-bottom:24px;border:1px solid var(--border-subtle)">
                        <button class="btn ${isLogin ? 'btn-primary' : 'btn-ghost'}" style="flex:1;padding:8px" onclick="setAuthMode('login')">Log In</button>
                        <button class="btn ${!isLogin ? 'btn-primary' : 'btn-ghost'}" style="flex:1;padding:8px" onclick="setAuthMode('register')">Create Profile</button>
                    </div>

                    <h2 style="font-family:'Outfit',sans-serif;font-size:22px;font-weight:800;letter-spacing:-0.02em;margin-bottom:4px">
                        ${isLogin ? 'Welcome Back' : 'Create Local Profile'}
                    </h2>
                    <p style="font-size:12.5px;color:var(--text-muted);margin-bottom:18px">
                        ${isLogin ? 'Enter your local credentials to open your workspace.' : 'No email or internet connection required.'}
                    </p>

                    <form onsubmit="event.preventDefault();submitAuth()">
                        <div class="form-field">
                            <label class="form-label">Username</label>
                            <input id="authUsername" class="form-input" autocomplete="username" placeholder="e.g. alex" required>
                        </div>
                        ${!isLogin ? `
                        <div class="form-field">
                            <label class="form-label">Display Name</label>
                            <input id="authDisplay" class="form-input" placeholder="How KeyFlow should greet you">
                        </div>` : ''}
                        <div class="form-field">
                            <label class="form-label">Password</label>
                            <input id="authPassword" class="form-input" type="password" autocomplete="current-password" placeholder="••••••••" minlength="6" required>
                        </div>
                        <div id="authError" style="color:var(--accent-rose);font-size:12px;min-height:18px;margin-bottom:8px"></div>
                        <button class="btn btn-primary" style="width:100%;padding:11px">
                            ${isLogin ? 'Enter Workspace ➔' : 'Create Local Account ➔'}
                        </button>
                    </form>
                    <p style="font-size:11px;color:var(--text-muted);text-align:center;margin-top:16px">
                        Passwords hashed with local Scrypt. Zero data leaves this computer.
                    </p>
                </div>
            </div>
        </div>
    `;
}

function setAuthMode(mode) {
    state.authMode = mode;
    renderAuth();
}

async function submitAuth() {
    const u = document.getElementById('authUsername')?.value || '';
    const p = document.getElementById('authPassword')?.value || '';
    const d = document.getElementById('authDisplay')?.value || '';
    const er = document.getElementById('authError');

    try {
        state.user = state.authMode === 'login' ? await api('login', u, p) : await api('register', u, p, d);
        const b = await api('get_bootstrap');
        state.lessons = b.lessons || [];
        state.progress = b.progress || [];
        state.dashboard = b.dashboard;
        state.settings = b.settings || state.settings;
        applyTheme();
        render();
    } catch (e) {
        if (er) er.textContent = e.message || String(e);
    }
}

async function logout() {
    await api('logout');
    state.user = null;
    state.dashboard = null;
    state.progress = [];
    state.coach = null;
    renderAuth();
}
