function renderDashboard() {
    const d = state.dashboard || {};
    const goal = Number(state.settings?.daily_goal_minutes) || 15;
    const today = Number(d.today_minutes) || 0;
    const goalPct = Math.min(100, today / goal * 100);
    const streak = state.streak_stats?.streak_days || 0;
    const badges = state.streak_stats?.badges || [];

    let weakKeysHtml = '<div class="empty">Complete a few sessions to build local weakness data.</div>';
    if (d.weak_keys && d.weak_keys.length > 0) {
        weakKeysHtml = d.weak_keys.slice(0, 6).map(x => `
            <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--line)">
                <span style="font-weight:850">${esc(x.expected_key.toUpperCase())}</span>
                <span style="color:var(--muted);font-size:12px">${x.mistakes} mistakes</span>
            </div>
        `).join('');
    }

    const badgesHtml = badges.length > 0 ? badges.map(b => `
        <div class="badge-card">
            <div class="badge-icon">🏆</div>
            <div class="badge-info">
                <b>${esc(b.title)}</b>
                <small>${esc(b.desc)}</small>
            </div>
        </div>
    `).join('') : '<div class="empty" style="padding:16px">Earn achievement badges by practicing daily and hitting speed gates!</div>';

    const content = `
        <div class="grid stats">
            ${stat('Best WPM', Math.round(d.best_wpm || 0), 'Personal record')}
            ${stat('Average WPM', Math.round(d.avg_wpm || 0), 'Across saved sessions')}
            ${stat('Accuracy', `${Number(d.avg_accuracy || 0).toFixed(1)}%`, 'Average correctness')}
            ${stat('Practice time', `${Number(d.total_minutes || 0).toFixed(1)}m`, 'Total on this profile')}
        </div>

        <div class="grid split" style="margin-top:16px">
            <div class="grid">
                <section class="card hero">
                    <div class="section-head">
                        <div>
                            <div style="display:flex;align-items:center;gap:10px">
                                <h2>Today's training</h2>
                                <span class="streak-chip">🔥 ${streak} Day Streak</span>
                            </div>
                            <p>${today.toFixed(1)} of ${goal} minutes completed</p>
                        </div>
                        <button class="button button-primary" onclick="go('practice')">Start practice</button>
                    </div>
                    <div class="goal-line">
                        <span>Daily goal</span>
                        <b>${Math.round(goalPct)}%</b>
                    </div>
                    <div class="progress">
                        <i style="width:${goalPct}%"></i>
                    </div>
                </section>
                ${coachCard()}
            </div>

            <section class="card">
                <div class="section-head">
                    <div>
                        <h2>Weakest keys</h2>
                        <p>Most frequent expected-key errors</p>
                    </div>
                    <button class="button button-ghost button-small" onclick="go('progress')">Heatmap</button>
                </div>
                ${weakKeysHtml}
            </section>
        </div>

        <section class="card" style="margin-top:16px">
            <div class="section-head">
                <div>
                    <h2>Milestones & Badges</h2>
                    <p>Calculated entirely from local verified telemetry</p>
                </div>
            </div>
            <div class="badge-grid">
                ${badgesHtml}
            </div>
        </section>

        <div class="grid split" style="margin-top:16px">
            <section class="card">
                <div class="section-head">
                    <div>
                        <h2>Recent performance</h2>
                        <p>Saved locally on this computer</p>
                    </div>
                    <button class="button button-ghost button-small" onclick="go('progress')">View analytics</button>
                </div>
                ${recentChart(d.recent || [])}
            </section>

            <section class="card">
                <div class="section-head">
                    <div>
                        <h2>Next lesson</h2>
                        <p>Continue your structured path</p>
                    </div>
                </div>
                ${nextLesson()}
            </section>
        </div>
    `;
    app.innerHTML = layout(content, 'Dashboard', 'A focused overview of your local learning progress.');
}

function recentChart(recent) {
    const arr = [...(recent || [])].reverse();
    if (!arr.length) return '<div class="empty">Your first saved session will appear here.</div>';
    const max = Math.max(1, ...arr.map(x => Number(x.wpm) || 0));

    const barsHtml = arr.map((x, i) => `
        <div class="bar" style="height:${Math.max(8, (Number(x.wpm) || 0) / max * 170)}px">
            <span>${Math.round(x.wpm)}</span>
            <em>${i + 1}</em>
        </div>
    `).join('');

    return `<div class="chart">${barsHtml}</div>`;
}

function nextLesson() {
    const l = state.progress.find(x => !x.completed_count) || state.progress[0];
    if (!l) return '<div class="empty">No lessons are available.</div>';

    return `
        <div style="padding-top:4px">
            <div class="eyebrow">${l.is_custom ? 'Custom' : `Level ${l.level}`}</div>
            <h3 style="margin:9px 0 6px;font-size:19px">${esc(l.title)} ${l.is_custom ? '<span class="custom-badge">CUSTOM</span>' : ''}</h3>
            <p class="subtitle">${esc(l.description)}</p>
            <div class="lesson-meta">
                <span class="mini">Focus: ${esc(l.focus_keys || 'foundations')}</span>
                <span class="mini">${l.duration_minutes} min</span>
            </div>
            <button class="button button-primary" style="margin-top:18px" onclick="startLesson(${l.id})">Continue lesson</button>
        </div>
    `;
}

function renderLearn() {
    const officialLessons = state.progress.filter(x => !x.is_custom);
    const customLessons = state.progress.filter(x => Boolean(x.is_custom));

    const renderLessonItem = l => `
        <div class="lesson">
            <div class="lesson-num">${l.is_custom ? '★' : l.level}</div>
            <div>
                <div class="lesson-title">
                    ${esc(l.title)}
                    ${l.is_custom ? '<span class="custom-badge">CUSTOM</span>' : ''}
                </div>
                <div class="lesson-desc">${esc(l.description)}</div>
                <div class="lesson-meta">
                    <span class="mini">${esc(l.focus_keys || 'general')}</span>
                    <span class="mini">${l.duration_minutes} min</span>
                    ${l.completed_count ? `<span class="mini">Best ${Math.round(l.best_wpm)} WPM</span>` : '<span class="mini">Not started</span>'}
                </div>
            </div>
            <div style="display:flex;gap:8px">
                <button class="button button-ghost button-small" onclick="startLesson(${l.id})">
                    ${l.completed_count ? 'Practice' : 'Learn'}
                </button>
                ${l.is_custom ? `<button class="button button-ghost button-small" style="color:var(--danger)" onclick="deleteCustomLesson(${l.id})">×</button>` : ''}
            </div>
        </div>
    `;

    const officialHtml = officialLessons.map(renderLessonItem).join('');
    const customHtml = customLessons.length > 0
        ? customLessons.map(renderLessonItem).join('')
        : '<div class="empty" style="padding:20px">No custom lessons created yet. Click "+ Create Custom Lesson" below to add code or texts!</div>';

    const content = `
        <section class="card hero">
            <div class="section-head">
                <div>
                    <div class="eyebrow">Comprehensive 7-Level Curriculum</div>
                    <h2 style="font-size:24px;margin:8px 0">From Keyboard Fundamentals to Coding Mastery</h2>
                    <p class="subtitle">Structured progression covering home row anchors, reaches, digraphs, punctuation, numbers, Python/JS syntax, and zen fluency.</p>
                </div>
                <button class="button button-primary" onclick="openCustomLessonModal()">+ Create Custom Lesson</button>
            </div>
        </section>

        ${customLessons.length > 0 || true ? `
        <div style="margin-top:24px">
            <div class="section-head" style="margin-bottom:12px">
                <h3>Your Custom Lessons</h3>
                <button class="button button-ghost button-small" onclick="openCustomLessonModal()">+ New Custom Lesson</button>
            </div>
            <div class="lesson-list">
                ${customHtml}
            </div>
        </div>` : ''}

        <div style="margin-top:28px">
            <div class="section-head" style="margin-bottom:12px">
                <h3>Official 7-Level Progression</h3>
            </div>
            <div class="lesson-list">
                ${officialHtml}
            </div>
        </div>
    `;
    app.innerHTML = layout(content, 'Learning', 'A deliberate path that teaches the keyboard before chasing speed.');
}

function startLesson(id) {
    state.selectedLesson = state.progress.find(x => x.id === id) || state.lessons.find(x => x.id === id);
    state.route = 'practice';
    state.practice = null;
    render();
}

function openCustomLessonModal() {
    const existing = document.querySelector('.modal-backdrop');
    if (existing) existing.remove();

    const node = document.createElement('div');
    node.className = 'modal-backdrop';
    node.innerHTML = `
        <div class="modal-card">
            <div class="section-head" style="margin-bottom:16px">
                <div>
                    <h2>Create Custom Lesson</h2>
                    <p>Practice any text, code snippet, or paragraph locally.</p>
                </div>
                <button class="button button-ghost button-small" onclick="this.closest('.modal-backdrop').remove()">Close</button>
            </div>
            <form onsubmit="event.preventDefault();submitCustomLesson()">
                <div class="field">
                    <label>Lesson Title</label>
                    <input id="customTitle" placeholder="e.g. Python Async Drill, React Hook Snippet" required>
                </div>
                <div class="field">
                    <label>Target Focus Keys (optional)</label>
                    <input id="customKeys" placeholder="e.g. (){}=> or asdf">
                </div>
                <div class="field">
                    <label>Lesson Text / Code Content</label>
                    <textarea id="customContent" rows="6" style="width:100%;border:1px solid var(--line);border-radius:12px;background:var(--surface-2);color:var(--text);padding:12px;font-family:'JetBrains Mono',monospace;outline:none" placeholder="Paste the text or code snippet to practice here..." required></textarea>
                </div>
                <div class="field">
                    <label>Estimated Minutes</label>
                    <input id="customMinutes" type="number" min="1" max="60" value="5">
                </div>
                <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px">
                    <button type="button" class="button button-ghost" onclick="this.closest('.modal-backdrop').remove()">Cancel</button>
                    <button type="submit" class="button button-primary">Save & Practice</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(node);
}

async function submitCustomLesson() {
    const title = document.getElementById('customTitle')?.value || '';
    const focus = document.getElementById('customKeys')?.value || '';
    const content = document.getElementById('customContent')?.value || '';
    const mins = Number(document.getElementById('customMinutes')?.value || 5);

    try {
        const created = await api('create_custom_lesson', title, content, focus, mins);
        document.querySelector('.modal-backdrop')?.remove();
        state.progress = await api('progress');
        state.lessons = await api('get_bootstrap').then(b => b.lessons || []);
        startLesson(created.id);
        toast('Custom lesson created!');
    } catch (e) {
        toast(e.message || String(e));
    }
}

async function deleteCustomLesson(id) {
    if (!confirm('Are you sure you want to delete this custom lesson?')) return;
    try {
        await api('delete_custom_lesson', id);
        state.progress = await api('progress');
        render();
        toast('Custom lesson deleted.');
    } catch (e) {
        toast(e.message || String(e));
    }
}
