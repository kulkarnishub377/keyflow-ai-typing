function applyTheme() {
    document.body.classList.toggle('light', state.settings.theme === 'light');
}

async function toggleTheme() {
    state.settings = await api('update_settings', {
        ...state.settings,
        theme: state.settings.theme === 'dark' ? 'light' : 'dark'
    });
    applyTheme();
    render();
}

function initials(name) {
    return (name || 'KF').split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase();
}

function logo() {
    return `<img class="brand-mark" src="../keyflow_logo.png" alt="KeyFlow logo">`;
}

function navButton(route, icon, label) {
    const isActive = state.route === route ? 'active' : '';
    return `<button class="${isActive}" onclick="go('${route}')"><span class="nav-icon">${icon}</span>${label}</button>`;
}

function stat(label, value, hint) {
    return `
        <div class="card stat">
            <div class="label">${label}</div>
            <div class="value">${value}</div>
            <div class="hint">${hint}</div>
        </div>
    `;
}

function coachCard() {
    const c = state.coach;
    const msg = c?.summary || 'Run the local coaching pipeline to get a performance-based recommendation.';
    
    let evidenceHtml = '<span class="pill">Awaiting analysis</span>';
    if (c?.trace && c.trace.length > 0) {
        const evidence = c.trace.slice(0, 4).map(x => x.agent.replaceAll('_', ' '));
        evidenceHtml = evidence.map(x => `<span class="pill">${esc(x)}</span>`).join('');
    }
    
    return `
        <section class="card">
            <div class="section-head">
                <div>
                    <h2>Local AI coaching</h2>
                    <p>Deterministic multi-agent analysis • no cloud required</p>
                </div>
                <button class="button button-primary button-small" onclick="runCoach()">Analyze now</button>
            </div>
            <div class="coach">
                <div class="coach-icon">✦</div>
                <div class="coach-copy">
                    <h3>Next best action</h3>
                    <p>${esc(msg)}</p>
                    <div class="evidence">
                        ${evidenceHtml}
                    </div>
                </div>
            </div>
        </section>
    `;
}

function layout(content, title, subtitle) {
    const themeIcon = state.settings.theme === 'dark' ? '☀ Light' : '☾ Dark';
    const dn = esc(state.user?.display_name || 'User');
    
    return `
        <div class="app-shell">
            <aside class="sidebar">
                <div class="brand">
                    ${logo()}
                </div>
                <nav class="nav">
                    ${navButton('dashboard', '⌂', 'Dashboard')}
                    ${navButton('learn', '◎', 'Learning')}
                    ${navButton('practice', '⌨', 'Practice')}
                    ${navButton('progress', '◫', 'Analytics')}
                    ${navButton('coach', '✦', 'AI Coach')}
                    ${navButton('settings', '⚙', 'Settings')}
                </nav>
                <div class="sidebar-spacer"></div>
                <div class="local-status">
                    <div class="status-row">
                        <span>Local mode</span>
                        <span class="status-dot"></span>
                    </div>
                    <div style="color:var(--muted);font-size:10px;margin-top:7px">Data stays on this computer</div>
                </div>
                <button class="button button-ghost" onclick="logout()">Sign out</button>
            </aside>
            <main class="main">
                <header class="topbar">
                    <div class="title-block">
                        <div class="eyebrow">${esc(title || 'KeyFlow Workspace')}</div>
                        <h1>${esc(title || 'Your typing workspace')}</h1>
                        <div class="subtitle">${esc(subtitle || 'Train with intent. Measure what matters. Improve one skill at a time.')}</div>
                    </div>
                    <div class="top-actions">
                        <button class="button button-ghost button-small" onclick="toggleTheme()">${themeIcon}</button>
                        <div class="user-chip">
                            <div class="avatar">${esc(initials(state.user?.display_name))}</div>
                            <div>
                                <b style="font-size:12px">${dn}</b>
                                <small>Local profile</small>
                            </div>
                        </div>
                    </div>
                </header>
                ${content}
            </main>
        </div>
    `;
}
