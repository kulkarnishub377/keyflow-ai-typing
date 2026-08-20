// ==========================================================================
// KeyFlow Components & Layout Engine
// ==========================================================================

function applyTheme() {
    document.body.classList.toggle('light', state.settings?.theme === 'light');
}

async function toggleTheme() {
    const nextTheme = state.settings?.theme === 'dark' ? 'light' : 'dark';
    state.settings = await api('update_settings', {
        ...state.settings,
        theme: nextTheme
    });
    applyTheme();
    render();
    toast(`Switched to ${nextTheme === 'dark' ? 'Obsidian Dark' : 'Clean Slate Light'} theme.`);
}

function initials(name) {
    return (name || 'KF').split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase();
}

function logo(size = 'md') {
    const isLarge = size === 'lg';
    const markSize = isLarge ? 48 : 40;
    const svgSize = isLarge ? 30 : 24;
    const titleSize = isLarge ? 'font-size:26px' : 'font-size:20px';
    const tagSize = isLarge ? 'font-size:11px' : 'font-size:10px';

    return `
        <div class="brand-mark" style="width:${markSize}px;height:${markSize}px">
            <svg width="${svgSize}" height="${svgSize}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="kfMarkFoldNav" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#6366f1"/>
                        <stop offset="50%" stop-color="#a855f7"/>
                        <stop offset="100%" stop-color="#ec4899"/>
                    </linearGradient>
                    <linearGradient id="kfMarkStemNav" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#00f2fe"/>
                        <stop offset="50%" stop-color="#4facfe"/>
                        <stop offset="100%" stop-color="#a855f7"/>
                    </linearGradient>
                    <linearGradient id="kfMarkArmNav" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#38bdf8"/>
                        <stop offset="100%" stop-color="#c084fc"/>
                    </linearGradient>
                    <linearGradient id="kfMarkLegNav" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#f472b6"/>
                        <stop offset="100%" stop-color="#818cf8"/>
                    </linearGradient>
                </defs>
                <!-- Speed Trails -->
                <rect x="6" y="21" width="8" height="3.5" rx="1.75" fill="#00f2fe"/>
                <rect x="3" y="28" width="12" height="3.5" rx="1.75" fill="#00f2fe"/>
                <rect x="5" y="35" width="9" height="3.5" rx="1.75" fill="#6366f1"/>
                <rect x="8" y="42" width="6" height="3.5" rx="1.75" fill="#ec4899"/>
                <!-- 'K' Ribbon Graphic -->
                <g transform="translate(4, 1)">
                    <path d="M28 32 L44 48 C45.5 49.5 48 49.5 49.5 48 C51 46.5 51 44 49.5 42.5 L36 29 Z" fill="url(#kfMarkLegNav)"/>
                    <path d="M26 30 L43 14 C44.5 12.5 47 12.5 48.5 14 C50 15.5 50 18 48.5 19.5 L34 34 Z" fill="url(#kfMarkArmNav)"/>
                    <path d="M21 13 C21 11.5 22.5 10.5 24 11 C26.5 12 28 15 28 19 L28 41 C28 45 26 48 23 49 C21 49.5 19.5 48 19.5 46 L19.5 17 C19.5 14.5 20 13 21 13 Z" fill="url(#kfMarkStemNav)"/>
                    <path d="M20 25 C23 25 27 26 31 29 C34 31.5 33 36 29 38 C25 39.5 21 38 20 35 Z" fill="url(#kfMarkFoldNav)"/>
                </g>
                <circle cx="34" cy="33" r="2.5" fill="#ffffff"/>
            </svg>
        </div>
        <div>
            <div class="brand-title" style="${titleSize}">Key<span>Flow</span></div>
            <div class="brand-tag" style="${tagSize}"><span class="brand-tag-dot"></span> Local Engine</div>
        </div>
    `;
}

function navItem(route, icon, label, shortcut) {
    const isActive = state.route === route ? 'active' : '';
    return `
        <button class="nav-item ${isActive}" onclick="go('${route}')">
            <span class="nav-icon">${icon}</span>
            <span>${label}</span>
            ${shortcut ? `<span class="nav-shortcut">${shortcut}</span>` : ''}
        </button>
    `;
}

function statTile(label, value, sub, hint) {
    return `
        <div class="stat-tile" title="${esc(hint || '')}">
            <span class="stat-label">${label}</span>
            <div class="stat-value">${value}</div>
            ${sub ? `<span class="stat-sub">${sub}</span>` : ''}
        </div>
    `;
}

function copilotCard() {
    const c = state.coach;
    const msg = c?.summary || 'Run the deterministic local AI coaching pipeline to generate adaptive learning recommendations.';
    
    let traceHtml = '<span class="badge badge-brand">Ready for Analysis</span>';
    if (c?.trace && c.trace.length > 0) {
        traceHtml = c.trace.slice(0, 4).map(x => {
            const name = x.agent.replaceAll('_', ' ');
            const conf = Math.round((x.confidence || 0) * 100);
            return `<span class="badge badge-brand">${esc(name)} (${conf}%)</span>`;
        }).join('');
    }

    return `
        <div class="copilot-card">
            <div class="copilot-header">
                <div class="copilot-badge">
                    <span>✦</span> AI Coach Copilot
                </div>
                <div style="display:flex;gap:8px">
                    <button class="btn btn-secondary btn-sm" onclick="runCoach()">Analyze telemetry</button>
                    <button class="btn btn-primary btn-sm" onclick="startAdaptiveDrill()">Launch Adaptive Drill</button>
                </div>
            </div>
            <div class="copilot-body">
                <div class="copilot-avatar">✦</div>
                <div style="flex:1">
                    <div class="copilot-message">${esc(msg)}</div>
                    <div class="copilot-trace-tags">
                        ${traceHtml}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function layout(content, title, subtitle) {
    const dn = esc(state.user?.display_name || state.user?.username || 'Learner');
    const isDark = state.settings?.theme !== 'light';

    return `
        <div class="app-shell">
            <aside class="sidebar">
                <div class="brand">
                    ${logo()}
                </div>
                <nav class="nav-menu">
                    <div class="nav-section-title">Core Workspace</div>
                    ${navItem('dashboard', '⌂', 'Dashboard', '1')}
                    ${navItem('practice', '⌨', 'Practice Studio', '2')}
                    ${navItem('arcade', '⚡', 'Arcade Matrix', '3')}
                    ${navItem('learn', '◎', 'Curriculum Path', '4')}
                    ${navItem('progress', '◫', 'Analytics & Heatmap', '5')}
                    <div class="nav-section-title" style="margin-top:12px">Intelligence & Setup</div>
                    ${navItem('coach', '✦', 'AI Copilot Lab', '6')}
                    ${navItem('settings', '⚙', 'Settings & Vault', '7')}
                </nav>
                <div class="sidebar-footer">
                    <div class="local-shield">
                        <span>🛡️</span> Zero Cloud • 100% Local
                    </div>
                    <div class="user-profile-bar">
                        <div class="user-avatar">${esc(initials(dn))}</div>
                        <div class="user-info">
                            <div class="user-name">${dn}</div>
                            <div class="user-role">Offline Profile</div>
                        </div>
                        <button class="btn btn-ghost btn-sm" title="Sign out" onclick="openLogoutModal()" style="padding:4px 8px">✕</button>
                    </div>
                </div>
            </aside>
            <main class="main-viewport">
                <header class="top-hud">
                    <div class="hud-breadcrumbs">
                        <span style="color:var(--text-muted)">KeyFlow</span>
                        <span style="color:var(--border-strong)">/</span>
                        <span class="hud-page-title">${esc(title || 'Workspace')}</span>
                    </div>
                    <div class="hud-actions">
                        <button class="cmd-trigger-btn" onclick="openCommandPalette()">
                            <span>Search actions...</span>
                            <span class="kbd">Ctrl K</span>
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="toggleTheme()">
                            ${isDark ? '☀ Light' : '☾ Dark'}
                        </button>
                    </div>
                </header>
                <div class="page-container">
                    ${content}
                </div>
            </main>
        </div>
    `;
}

// ==========================================================================
// Global Command Palette (Ctrl+K)
// ==========================================================================
const COMMANDS = [
    { id: 'practice', label: 'Start Free Practice Studio', category: 'Navigation', icon: '⌨', action: () => go('practice') },
    { id: 'arcade', label: 'Launch Cyber Matrix Arcade Game', category: 'Combat', icon: '⚡', action: () => go('arcade') },
    { id: 'adaptive', label: 'Launch Targeted AI Micro-Drill', category: 'Training', icon: '✦', action: () => startAdaptiveDrill() },
    { id: 'dashboard', label: 'Go to Dashboard', category: 'Navigation', icon: '⌂', action: () => go('dashboard') },
    { id: 'learn', label: 'Open Curriculum & Lessons', category: 'Navigation', icon: '◎', action: () => go('learn') },
    { id: 'analytics', label: 'View QWERTY Heatmap & Analytics', category: 'Analytics', icon: '◫', action: () => go('progress') },
    { id: 'coach', label: 'Run Local AI Coaching Pipeline', category: 'Training', icon: '✦', action: () => runCoach() },
    { id: 'settings', label: 'Open Settings & Preferences', category: 'Settings', icon: '⚙', action: () => go('settings') },
    { id: 'theme', label: 'Toggle Dark / Light Theme', category: 'Settings', icon: '◐', action: () => toggleTheme() },
    { id: 'backup', label: 'Export Encrypted Local Backup', category: 'Security', icon: '🔒', action: () => backup() },
    { id: 'logout', label: 'Sign Out of Profile', category: 'Auth', icon: '⎋', action: () => openLogoutModal() },
    { id: 'exit', label: 'Quit KeyFlow Desktop Application', category: 'System', icon: '✕', action: () => openExitModal() }
];

let selectedCommandIndex = 0;
let filteredCommands = [...COMMANDS];

function openLogoutModal() {
    const el = document.getElementById('logoutModal');
    if (!el) return;
    const dn = esc(state.user?.display_name || state.user?.username || 'Learner');
    el.style.display = 'flex';
    el.innerHTML = `
        <div class="cmd-palette-modal" style="max-width:440px;padding:32px 28px;text-align:center" onclick="event.stopPropagation()">
            <div style="font-size:38px;margin-bottom:10px">⎋</div>
            <h3 style="font-family:'Outfit',sans-serif;font-size:22px;font-weight:800;letter-spacing:-0.02em;margin-bottom:6px">
                Sign Out of ${dn}?
            </h3>
            <p style="font-size:13.5px;color:var(--text-muted);line-height:1.5;margin-bottom:24px">
                You will return to the profile authentication screen. All practice telemetry and progress remain safely stored on this computer.
            </p>
            <div style="display:flex;gap:10px;justify-content:center">
                <button class="btn btn-secondary" style="flex:1" onclick="closeLogoutModal()">Cancel</button>
                <button class="btn btn-primary" style="flex:1;background:var(--accent-rose)" onclick="confirmLogout()">Sign Out</button>
            </div>
        </div>
    `;
}

function closeLogoutModal() {
    const el = document.getElementById('logoutModal');
    if (el) el.style.display = 'none';
}

async function confirmLogout() {
    closeLogoutModal();
    if (typeof logout === 'function') {
        await logout();
    }
}

function openExitModal() {
    const el = document.getElementById('exitModal');
    if (!el) return;
    el.style.display = 'flex';
    el.innerHTML = `
        <div class="cmd-palette-modal" style="max-width:440px;padding:32px 28px;text-align:center" onclick="event.stopPropagation()">
            <div style="font-size:38px;margin-bottom:10px">🛡️</div>
            <h3 style="font-family:'Outfit',sans-serif;font-size:22px;font-weight:800;letter-spacing:-0.02em;margin-bottom:6px">
                Close KeyFlow Studio?
            </h3>
            <p style="font-size:13.5px;color:var(--text-muted);line-height:1.5;margin-bottom:24px">
                All session telemetry, custom drills, and skill mastery points are safely saved in your encrypted local database.
            </p>
            <div style="display:flex;gap:10px;justify-content:center">
                <button class="btn btn-secondary" style="flex:1" onclick="closeExitModal()">Cancel</button>
                <button class="btn btn-primary" style="flex:1;background:var(--accent-rose)" onclick="api('exit_app')">Exit Studio</button>
            </div>
        </div>
    `;
}

function closeExitModal() {
    const el = document.getElementById('exitModal');
    if (el) el.style.display = 'none';
}

function openCommandPalette() {
    const el = document.getElementById('commandPalette');
    if (!el) return;
    selectedCommandIndex = 0;
    filteredCommands = [...COMMANDS];
    el.style.display = 'flex';
    renderCommandPalette();
    setTimeout(() => {
        document.getElementById('cmdSearchInput')?.focus();
    }, 50);
}

function closeCommandPalette() {
    const el = document.getElementById('commandPalette');
    if (el) el.style.display = 'none';
}

function renderCommandPalette() {
    const el = document.getElementById('commandPalette');
    if (!el) return;

    const listHtml = filteredCommands.map((cmd, idx) => `
        <div class="cmd-item ${idx === selectedCommandIndex ? 'selected' : ''}" onclick="executeCommand(${idx})">
            <div class="cmd-item-left">
                <span class="cmd-item-icon">${cmd.icon}</span>
                <span>${esc(cmd.label)}</span>
            </div>
            <span class="badge" style="font-size:10px">${esc(cmd.category)}</span>
        </div>
    `).join('') || '<div class="empty" style="padding:20px;font-size:13px">No commands matching your query.</div>';

    el.innerHTML = `
        <div class="cmd-palette-modal" onclick="event.stopPropagation()">
            <div class="cmd-search-input-wrapper">
                <span class="cmd-search-icon">🔍</span>
                <input id="cmdSearchInput" class="cmd-search-input" placeholder="Type a command or jump to..." autocomplete="off" oninput="handleCommandSearch(this.value)">
                <span class="kbd">ESC to exit</span>
            </div>
            <div class="cmd-results-list" id="cmdResultsList">
                ${listHtml}
            </div>
        </div>
    `;
}

function handleCommandSearch(query) {
    const q = (query || '').toLowerCase().trim();
    filteredCommands = COMMANDS.filter(c => c.label.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
    selectedCommandIndex = 0;
    const list = document.getElementById('cmdResultsList');
    if (list) {
        list.innerHTML = filteredCommands.map((cmd, idx) => `
            <div class="cmd-item ${idx === selectedCommandIndex ? 'selected' : ''}" onclick="executeCommand(${idx})">
                <div class="cmd-item-left">
                    <span class="cmd-item-icon">${cmd.icon}</span>
                    <span>${esc(cmd.label)}</span>
                </div>
                <span class="badge" style="font-size:10px">${esc(cmd.category)}</span>
            </div>
        `).join('') || '<div class="empty" style="padding:20px;font-size:13px">No commands matching your query.</div>';
    }
}

function executeCommand(idx) {
    const cmd = filteredCommands[idx];
    if (cmd && typeof cmd.action === 'function') {
        closeCommandPalette();
        cmd.action();
    }
}

// Global Keyboard Navigation
window.addEventListener('keydown', e => {
    // Ctrl+K or Cmd+K
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const el = document.getElementById('commandPalette');
        if (el && el.style.display === 'flex') {
            closeCommandPalette();
        } else {
            openCommandPalette();
        }
        return;
    }

    const palette = document.getElementById('commandPalette');
    if (palette && palette.style.display === 'flex') {
        if (e.key === 'Escape') {
            e.preventDefault();
            closeCommandPalette();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedCommandIndex = (selectedCommandIndex + 1) % Math.max(1, filteredCommands.length);
            renderCommandPalette();
            document.getElementById('cmdSearchInput')?.focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedCommandIndex = (selectedCommandIndex - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length);
            renderCommandPalette();
            document.getElementById('cmdSearchInput')?.focus();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            executeCommand(selectedCommandIndex);
        }
    }
});
