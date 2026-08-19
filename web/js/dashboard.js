// ==========================================================================
// KeyFlow Dashboard & Curriculum Engine
// ==========================================================================

function renderDashboard() {
    const d = state.dashboard || {};
    const goal = Number(state.settings?.daily_goal_minutes) || 15;
    const today = Number(d.today_minutes) || 0;
    const goalPct = Math.min(100, Math.round(today / goal * 100));
    const streak = state.streak_stats?.streak_days || 0;
    const badges = state.streak_stats?.badges || [];

    let weakKeysHtml = '<div class="empty" style="padding:20px;font-size:13px">Complete sessions to generate local weakness diagnostics.</div>';
    if (d.weak_keys && d.weak_keys.length > 0) {
        weakKeysHtml = d.weak_keys.slice(0, 5).map(x => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-subtle)">
                <div style="display:flex;align-items:center;gap:8px">
                    <span class="keycap" style="min-width:32px;height:32px;font-size:12px;padding:2px 6px">${esc(x.expected_key.toUpperCase())}</span>
                    <span style="font-size:13px;font-weight:600">Key '${esc(x.expected_key.toUpperCase())}'</span>
                </div>
                <span class="badge badge-danger" style="font-size:10.5px">${x.mistakes} errors</span>
            </div>
        `).join('');
    }

    const badgesHtml = badges.length > 0 ? badges.map(b => `
        <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--surface-2);border:1px solid var(--border-subtle);border-radius:var(--radius-md)">
            <div style="font-size:24px;width:40px;height:40px;border-radius:var(--radius-sm);background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.3);display:grid;place-items:center">🏆</div>
            <div>
                <div style="font-weight:800;font-size:13px">${esc(b.title)}</div>
                <div style="font-size:11px;color:var(--text-muted)">${esc(b.desc)}</div>
            </div>
        </div>
    `).join('') : '<div class="empty" style="padding:16px;font-size:12.5px">Practice consistently to earn verified telemetry achievement badges.</div>';

    const content = `
        <!-- Top Stats Row -->
        <div class="stats-grid">
            ${statTile('Personal Best', `${Math.round(d.best_wpm || 0)} <small style="font-size:13px;color:var(--text-muted)">WPM</small>`, 'Peak verified speed', 'All-time best session WPM')}
            ${statTile('Average Pace', `${Math.round(d.avg_wpm || 0)} <small style="font-size:13px;color:var(--text-muted)">WPM</small>`, 'Rolling average', 'Overall typing speed')}
            ${statTile('Accuracy Rate', `${Number(d.avg_accuracy || 0).toFixed(1)}%`, 'Average precision', 'Overall accuracy')}
            ${statTile('Practice Time', `${Number(d.total_minutes || 0).toFixed(1)} <small style="font-size:13px;color:var(--text-muted)">min</small>`, 'Total local time', 'Total practice duration')}
        </div>

        <!-- AI Copilot Card -->
        ${copilotCard()}

        <!-- 2-Column Split: Daily Training & Weak Keys -->
        <div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:16px">
            <div class="kf-card">
                <div class="kf-card-header">
                    <div>
                        <div class="kf-card-title">Today's Training Goal</div>
                        <div class="kf-card-subtitle">${today.toFixed(1)} of ${goal} minutes completed today</div>
                    </div>
                    <span class="badge badge-warning" style="font-size:12px;padding:5px 12px">
                        🔥 ${streak} Day Streak
                    </span>
                </div>
                <div style="margin:16px 0 12px">
                    <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;margin-bottom:6px">
                        <span>Progress</span>
                        <span>${goalPct}%</span>
                    </div>
                    <div style="height:8px;border-radius:999px;background:var(--surface-2);overflow:hidden">
                        <div style="height:100%;width:${goalPct}%;background:var(--gradient-brand);border-radius:999px;transition:width 0.6s var(--ease-spring)"></div>
                    </div>
                </div>
                <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:14px">
                    <button class="btn btn-secondary" onclick="go('arcade')">⚡ Arcade Defense</button>
                    <button class="btn btn-primary" onclick="go('practice')">Start Daily Practice</button>
                </div>
            </div>

            <div class="kf-card">
                <div class="kf-card-header">
                    <div>
                        <div class="kf-card-title">Priority Weak Keys</div>
                        <div class="kf-card-subtitle">Highest error frequency</div>
                    </div>
                    <button class="btn btn-secondary btn-sm" onclick="startAdaptiveDrill()">Train Weak Keys</button>
                </div>
                <div style="display:flex;flex-direction:column;gap:4px">
                    ${weakKeysHtml}
                </div>
            </div>
        </div>

        <!-- 2-Column Split: Recent Chart & Next Recommended Lesson -->
        <div style="display:grid;grid-template-columns:1.1fr 0.9fr;gap:16px">
            <div class="kf-card">
                <div class="kf-card-header">
                    <div>
                        <div class="kf-card-title">WPM Progression Trajectory</div>
                        <div class="kf-card-subtitle">Recent verified sessions</div>
                    </div>
                    <button class="btn btn-ghost btn-sm" onclick="go('progress')">Full Analytics ➔</button>
                </div>
                ${recentChart(d.recent || [])}
            </div>

            <div class="kf-card">
                <div class="kf-card-header">
                    <div>
                        <div class="kf-card-title">Structured Curriculum</div>
                        <div class="kf-card-subtitle">Next progressive milestone</div>
                    </div>
                    <button class="btn btn-ghost btn-sm" onclick="go('learn')">View All ➔</button>
                </div>
                ${nextLesson()}
            </div>
        </div>

        <!-- Badges & Achievements -->
        <div class="kf-card">
            <div class="kf-card-header">
                <div>
                    <div class="kf-card-title">Milestone Achievements</div>
                    <div class="kf-card-subtitle">Deterministic telemetry badges</div>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">
                ${badgesHtml}
            </div>
        </div>
    `;

    app.innerHTML = layout(content, 'Dashboard', 'Your high-performance typing workspace and local learning overview.');
}

function recentChart(recent) {
    const arr = [...(recent || [])].reverse();
    if (!arr.length) return '<div class="empty" style="padding:32px;font-size:13px">Your first saved session will appear here.</div>';
    const max = Math.max(1, ...arr.map(x => Number(x.wpm) || 0));

    const barsHtml = arr.map((x, i) => `
        <div class="chart-bar-col" style="height:${Math.max(10, (Number(x.wpm) || 0) / max * 160)}px" title="${Math.round(x.wpm)} WPM • ${Number(x.accuracy).toFixed(1)}% Acc • ${x.created_at}">
            <div class="chart-bar-top">${Math.round(x.wpm)}</div>
            <div class="chart-bar-bottom">#${i + 1}</div>
        </div>
    `).join('');

    return `<div class="chart-container">${barsHtml}</div>`;
}

function nextLesson() {
    const l = state.progress.find(x => !x.completed_count) || state.progress[0];
    if (!l) return '<div class="empty">No lessons available.</div>';

    return `
        <div style="display:flex;flex-direction:column;gap:10px">
            <div style="display:flex;align-items:center;gap:8px">
                <span class="badge badge-brand">${l.is_custom ? 'Custom Drill' : `Level ${l.level}`}</span>
                <span style="font-size:12px;color:var(--text-muted)">${l.duration_minutes} min estimated</span>
            </div>
            <h3 style="font-size:18px;font-weight:800;letter-spacing:-0.02em;margin:2px 0">${esc(l.title)}</h3>
            <p style="font-size:13px;color:var(--text-muted);line-height:1.5">${esc(l.description || 'Focus on clean finger movements and smooth rhythm.')}</p>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin:4px 0">
                <span class="badge" style="font-size:11px">Focus: ${esc(l.focus_keys || 'Core')}</span>
            </div>
            <div style="margin-top:6px">
                <button class="btn btn-primary" onclick="startLesson(${l.id})">Launch Next Lesson ➔</button>
            </div>
        </div>
    `;
}

function renderLearn() {
    const officialLessons = state.progress.filter(x => !x.is_custom);
    const customLessons = state.progress.filter(x => Boolean(x.is_custom));

    const renderLessonItem = l => `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 18px;background:var(--surface-1);border:1px solid var(--border-subtle);border-radius:var(--radius-md);transition:all var(--transition-fast)" onmouseover="this.style.borderColor='var(--border-medium)'" onmouseout="this.style.borderColor='var(--border-subtle)'">
            <div style="display:flex;align-items:center;gap:16px">
                <div style="width:40px;height:40px;border-radius:var(--radius-sm);background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);color:var(--brand-light);font-weight:900;font-size:16px;display:grid;place-items:center">
                    ${l.is_custom ? '★' : l.level}
                </div>
                <div>
                    <div style="font-size:15px;font-weight:800;letter-spacing:-0.01em">${esc(l.title)}</div>
                    <div style="font-size:12.5px;color:var(--text-muted);margin-top:2px">${esc(l.description || '')}</div>
                    <div style="display:flex;gap:6px;margin-top:6px">
                        <span class="badge" style="font-size:10.5px">Focus: ${esc(l.focus_keys || 'Core')}</span>
                        <span class="badge" style="font-size:10.5px">${l.duration_minutes} min</span>
                        ${l.completed_count ? `<span class="badge badge-success" style="font-size:10.5px">✓ Completed (${Math.round(l.best_wpm)} WPM)</span>` : ''}
                    </div>
                </div>
            </div>
            <div style="display:flex;gap:8px">
                <button class="btn btn-primary btn-sm" onclick="startLesson(${l.id})">
                    ${l.completed_count ? 'Practice Again' : 'Start Lesson'}
                </button>
                ${l.is_custom ? `<button class="btn btn-ghost btn-sm" style="color:var(--accent-rose)" onclick="deleteCustomLesson(${l.id})">Delete</button>` : ''}
            </div>
        </div>
    `;

    const content = `
        <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
                <h1 style="font-family:'Outfit',sans-serif;font-size:24px;font-weight:800">Curriculum Path</h1>
                <p style="font-size:13px;color:var(--text-muted)">Master touch typing from foundation home-row mechanics to high-speed fluency.</p>
            </div>
            <button class="btn btn-primary" onclick="showCustomLessonModal()">+ Create Custom Drill</button>
        </div>

        <div class="kf-card">
            <div class="kf-card-header">
                <div>
                    <div class="kf-card-title">Official Progressive Lessons</div>
                    <div class="kf-card-subtitle">Structured step-by-step learning roadmap</div>
                </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:10px">
                ${officialLessons.map(renderLessonItem).join('')}
            </div>
        </div>

        ${customLessons.length > 0 ? `
            <div class="kf-card">
                <div class="kf-card-header">
                    <div>
                        <div class="kf-card-title">Custom User Drills & Passages</div>
                        <div class="kf-card-subtitle">Locally created custom practice sets</div>
                    </div>
                </div>
                <div style="display:flex;flex-direction:column;gap:10px">
                    ${customLessons.map(renderLessonItem).join('')}
                </div>
            </div>
        ` : ''}
    `;

    app.innerHTML = layout(content, 'Curriculum', 'Structured progression path with custom drill support.');
}

function startLesson(id) {
    const l = state.lessons.find(x => x.id === id) || state.progress.find(x => x.id === id);
    if (!l) return;
    state.selectedLesson = l;
    go('practice');
}

function showCustomLessonModal() {
    const title = prompt('Enter custom drill title:');
    if (!title) return;
    const content = prompt('Enter text passage to practice:');
    if (!content) return;
    const focus = prompt('Enter focus keys (optional, e.g. "th, er"):') || '';
    const mins = Number(prompt('Duration in minutes (e.g. 5):') || 5);

    createCustomLesson(title, content, focus, mins);
}

async function createCustomLesson(title, content, focus, mins) {
    try {
        await api('create_custom_lesson', title, content, focus, mins);
        state.progress = await api('progress');
        const b = await api('get_bootstrap');
        state.lessons = b.lessons || [];
        toast('Custom drill created successfully.');
        renderLearn();
    } catch (e) {
        toast(e.message || String(e));
    }
}

async function deleteCustomLesson(id) {
    if (!confirm('Are you sure you want to delete this custom drill?')) return;
    try {
        await api('delete_custom_lesson', id);
        state.progress = await api('progress');
        const b = await api('get_bootstrap');
        state.lessons = b.lessons || [];
        toast('Custom drill deleted.');
        if (state.route === 'practice') go('learn');
        else renderLearn();
    } catch (e) {
        toast(e.message || String(e));
    }
}
