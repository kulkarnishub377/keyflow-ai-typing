function renderDashboard() {
    const d = state.dashboard || {};
    const goal = Number(state.settings.daily_goal_minutes) || 15;
    const today = Number(d.today_minutes) || 0;
    const goalPct = Math.min(100, today / goal * 100);
    
    let weakKeysHtml = '<div class="empty">Complete a few sessions to build local weakness data.</div>';
    if (d.weak_keys && d.weak_keys.length > 0) {
        weakKeysHtml = d.weak_keys.slice(0, 6).map(x => `
            <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--line)">
                <span style="font-weight:850">${esc(x.expected_key.toUpperCase())}</span>
                <span style="color:var(--muted);font-size:12px">${x.mistakes} mistakes</span>
            </div>
        `).join('');
    }

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
                            <h2>Today's training</h2>
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
                </div>
                ${weakKeysHtml}
            </section>
        </div>
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
            <div class="eyebrow">Lesson ${l.level}</div>
            <h3 style="margin:9px 0 6px;font-size:19px">${esc(l.title)}</h3>
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
    const listHtml = state.progress.map(l => `
        <div class="lesson">
            <div class="lesson-num">${l.level}</div>
            <div>
                <div class="lesson-title">${esc(l.title)}</div>
                <div class="lesson-desc">${esc(l.description)}</div>
                <div class="lesson-meta">
                    <span class="mini">${esc(l.focus_keys || 'general')}</span>
                    <span class="mini">${l.duration_minutes} min</span>
                    ${l.completed_count ? `<span class="mini">Best ${Math.round(l.best_wpm)} WPM</span>` : '<span class="mini">Not started</span>'}
                </div>
            </div>
            <button class="button button-ghost button-small" onclick="startLesson(${l.id})">
                ${l.completed_count ? 'Practice' : 'Learn'}
            </button>
        </div>
    `).join('');

    const content = `
        <section class="card hero">
            <div class="eyebrow">Structured curriculum</div>
            <h2 style="font-size:24px;margin:8px 0">From keyboard fundamentals to fluency</h2>
            <p class="subtitle">Each lesson is a building block. Later adaptive agents can use your measured weaknesses to select the next best drill automatically.</p>
        </section>
        <div class="lesson-list" style="margin-top:16px">
            ${listHtml}
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
