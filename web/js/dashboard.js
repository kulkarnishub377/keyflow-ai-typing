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
    const el = document.getElementById('customLessonModal');
    if (!el) return;
    el.style.display = 'flex';
    el.innerHTML = `
        <div class="cmd-palette-modal" style="max-width:620px;padding:32px 28px" onclick="event.stopPropagation()">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
                <div style="display:flex;align-items:center;gap:10px">
                    <span style="font-size:24px">★</span>
                    <div>
                        <h2 style="font-family:'Outfit',sans-serif;font-size:22px;font-weight:800;letter-spacing:-0.02em">
                            Create Custom Practice Drill
                        </h2>
                        <p style="font-size:12.5px;color:var(--text-muted)">Craft a tailored drill or import code/text to practice locally.</p>
                    </div>
                </div>
                <button class="btn btn-ghost btn-sm" onclick="closeCustomLessonModal()" style="font-size:18px">✕</button>
            </div>

            <form onsubmit="event.preventDefault();submitCustomLessonForm()">
                <div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:14px">
                    <div class="form-field">
                        <label class="form-label">Drill Title</label>
                        <input id="customTitle" class="form-input" placeholder="e.g. Python Async/Await Patterns" required>
                    </div>
                    <div class="form-field">
                        <label class="form-label">Focus Keys (Optional)</label>
                        <input id="customFocus" class="form-input" placeholder="e.g. async, await, def">
                    </div>
                </div>

                <div class="form-field">
                    <div style="display:flex;justify-content:space-between;align-items:center">
                        <label class="form-label">Practice Text Passage / Code Block</label>
                        <span id="charCountLabel" style="font-size:11px;color:var(--text-muted)">0 chars</span>
                    </div>
                    <textarea id="customContent" class="form-input font-mono" rows="6" placeholder="Paste or type your custom drill passage here..." required style="resize:vertical;line-height:1.6" oninput="document.getElementById('charCountLabel').textContent = this.value.length + ' chars'"></textarea>
                </div>

                <div style="display:flex;align-items:center;justify-content:space-between;margin-top:14px">
                    <div style="display:flex;align-items:center;gap:8px">
                        <label class="form-label" style="margin:0">Duration:</label>
                        <select id="customDuration" class="form-select" style="width:auto;padding:6px 12px">
                            <option value="2">2 Minutes</option>
                            <option value="5" selected>5 Minutes</option>
                            <option value="10">10 Minutes</option>
                            <option value="15">15 Minutes</option>
                        </select>
                    </div>
                    <div style="display:flex;gap:10px">
                        <button type="button" class="btn btn-secondary" onclick="closeCustomLessonModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save & Launch Drill ➔</button>
                    </div>
                </div>
            </form>
        </div>
    `;
    setTimeout(() => document.getElementById('customTitle')?.focus(), 50);
}

function closeCustomLessonModal() {
    const el = document.getElementById('customLessonModal');
    if (el) el.style.display = 'none';
}

async function submitCustomLessonForm() {
    const title = document.getElementById('customTitle')?.value.trim();
    const content = document.getElementById('customContent')?.value.trim();
    const focus = document.getElementById('customFocus')?.value.trim() || '';
    const mins = Number(document.getElementById('customDuration')?.value || 5);

    if (!title || !content) {
        toast('Please provide a title and passage.');
        return;
    }

    try {
        const result = await api('create_custom_lesson', title, content, focus, mins);
        closeCustomLessonModal();
        state.progress = await api('progress');
        const b = await api('get_bootstrap');
        state.lessons = b.lessons || [];
        toast('Custom drill created successfully.');
        
        // Auto-launch the newly created drill
        const created = state.progress.find(x => x.id === result?.id) || state.lessons.find(x => x.title === title);
        if (created) {
            state.selectedLesson = created;
            go('practice');
        } else {
            renderLearn();
        }
    } catch (e) {
        toast(e.message || String(e));
    }
}

async function deleteCustomLesson(id) {
    try {
        await api('delete_custom_lesson', id);
        state.progress = await api('progress');
        const b = await api('get_bootstrap');
        state.lessons = b.lessons || [];
        toast('Custom drill removed from library.');
        if (state.route === 'practice') go('learn');
        else renderLearn();
    } catch (e) {
        toast(e.message || String(e));
    }
}
