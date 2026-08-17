function renderError(msg) {
    app.innerHTML = `
        <main class="auth">
            <section class="card">
                <h2>KeyFlow could not start</h2>
                <p class="subtitle">${esc(msg)}</p>
            </section>
        </main>
    `;
}

function renderAuth() {
    const isLogin = state.authMode === 'login';
    app.innerHTML = `
        <main class="auth">
            <section class="auth-wrap">
                <div class="auth-left">
                    <div class="logo-line">
                        ${logo()}
                    </div>
                    <h1>Build typing skill that actually lasts.</h1>
                    <p class="subtitle" style="color:#9eb0c8">
                        A local-first typing workspace that teaches fundamentals, measures performance, 
                        and prepares for adaptive AI coaching without requiring a cloud account.
                    </p>
                    <div class="auth-points">
                        <div class="auth-point"><span class="auth-check">✓</span><span>Private local profiles and offline learning</span></div>
                        <div class="auth-point"><span class="auth-check">✓</span><span>Immediate WPM, accuracy, and weakness feedback</span></div>
                        <div class="auth-point"><span class="auth-check">✓</span><span>Structured path from beginner fundamentals to advanced fluency</span></div>
                    </div>
                </div>
                <div class="auth-right">
                    <div class="auth-tabs">
                        <button class="button ${isLogin ? 'button-primary' : 'button-ghost'}" onclick="setAuthMode('login')">Log in</button>
                        <button class="button ${!isLogin ? 'button-primary' : 'button-ghost'}" onclick="setAuthMode('register')">Create profile</button>
                    </div>
                    <h2>${isLogin ? 'Welcome back' : 'Create your local profile'}</h2>
                    <p class="subtitle">${isLogin ? 'Your training data stays on this computer.' : 'No email or cloud account is required.'}</p>
                    
                    <form onsubmit="event.preventDefault();submitAuth()">
                        <div class="field">
                            <label>Username</label>
                            <input id="authUsername" autocomplete="username" required>
                        </div>
                        ${!isLogin ? `
                        <div class="field">
                            <label>Display name</label>
                            <input id="authDisplay" placeholder="How KeyFlow should greet you">
                        </div>` : ''}
                        <div class="field">
                            <label>Password</label>
                            <input id="authPassword" type="password" autocomplete="current-password" minlength="6" required>
                        </div>
                        <div class="error" id="authError"></div>
                        <button class="button button-primary" style="width:100%;margin-top:8px">
                            ${isLogin ? 'Enter KeyFlow' : 'Create local account'}
                        </button>
                    </form>
                    <p style="font-size:11px;color:var(--muted);margin-top:18px">Passwords are hashed locally. Core practice works without internet.</p>
                </div>
            </section>
        </main>
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
