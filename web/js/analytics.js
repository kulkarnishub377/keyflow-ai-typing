let selectedHeatmapChar = null;

async function loadHeatmapData() {
    try {
        state.heatmap = await api('get_key_heatmap');
    } catch (e) {
        state.heatmap = null;
    }
}

async function renderProgress() {
    if (!state.heatmap) {
        await loadHeatmapData();
    }

    const d = state.dashboard || {};
    const recent = [...(d.recent || [])].reverse();
    const hm = state.heatmap?.heatmap || {};

    const renderKey = k => {
        const item = hm[k.toLowerCase()] || { status: 'untested', accuracy: 100, avg_latency_ms: 0, mistakes: 0, attempts: 0 };
        const statusClass = item.status || 'untested';
        const label = k.toUpperCase();
        const accText = item.attempts > 0 ? `${Math.round(item.accuracy)}%` : (item.mistakes > 0 ? 'ERR' : '—');
        return `
            <div class="heatmap-key ${statusClass}" onclick="inspectHeatmapKey('${k}')" title="${label}: ${item.mistakes} errors, ${item.avg_latency_ms}ms">
                <b>${label}</b>
                <small>${accText}</small>
            </div>
        `;
    };

    const row0 = '1234567890-='.split('').map(renderKey).join('');
    const row1 = 'QWERTYUIOP'.split('').map(renderKey).join('');
    const row2 = 'ASDFGHJKL;'.split('').map(renderKey).join('');
    const row3 = 'ZXCVBNM,./'.split('').map(renderKey).join('');

    let detailHtml = '';
    if (selectedHeatmapChar && hm[selectedHeatmapChar.toLowerCase()]) {
        const item = hm[selectedHeatmapChar.toLowerCase()];
        detailHtml = `
            <div class="heatmap-detail-card">
                <div>
                    <h3 style="margin:0 0 4px;font-size:18px">Key "${selectedHeatmapChar.toUpperCase()}" Diagnostics</h3>
                    <div style="font-size:13px;color:var(--muted)">
                        Accuracy: <b>${item.accuracy}%</b> • Attempts: <b>${item.attempts}</b> • Errors: <b>${item.mistakes}</b> • Latency: <b>${item.avg_latency_ms} ms</b> (P95: ${item.p95_latency_ms} ms) • Finger: <b>${item.finger}</b>
                    </div>
                </div>
                <button class="button button-primary button-small" onclick="startAdaptiveDrill()">Train this key</button>
            </div>
        `;
    }

    let recentRows = '<tr><td colspan="4" class="empty">No sessions yet.</td></tr>';
    if (recent.length > 0) {
        recentRows = recent.slice().reverse().map(x => `
            <tr>
                <td>${esc(x.created_at)}</td>
                <td>${Math.round(x.wpm)}</td>
                <td>${Number(x.accuracy).toFixed(1)}%</td>
                <td>${Number(x.duration_seconds).toFixed(1)}s</td>
            </tr>
        `).join('');
    }

    const masteryHtml = state.progress.map(l => `
        <div style="margin:13px 0">
            <div style="display:flex;justify-content:space-between;font-size:12px">
                <span>${esc(l.title)} ${l.is_custom ? '<span class="custom-badge">CUSTOM</span>' : ''}</span>
                <b>${l.completed_count ? Math.round(l.best_wpm) + ' WPM' : 'Not started'}</b>
            </div>
            <div class="progress" style="margin-top:7px">
                <i style="width:${l.completed_count ? 100 : 0}%"></i>
            </div>
        </div>
    `).join('');

    const content = `
        <div class="grid split">
            <section class="card">
                <div class="section-head">
                    <div>
                        <h2>WPM trajectory</h2>
                        <p>Most recent saved sessions</p>
                    </div>
                </div>
                ${recentChart(d.recent || [])}
            </section>
            <section class="card">
                <div class="section-head">
                    <div>
                        <h2>Learning mastery</h2>
                        <p>Best saved performance across lessons</p>
                    </div>
                </div>
                ${masteryHtml}
            </section>
        </div>

        <section class="card" style="margin-top:16px">
            <div class="section-head">
                <div>
                    <h2>Interactive QWERTY Heatmap</h2>
                    <p>Live per-key accuracy, latency, and mistake frequency</p>
                </div>
                <button class="button button-primary button-small" onclick="startAdaptiveDrill()">Launch Adaptive Drill</button>
            </div>
            
            <div class="heatmap-wrap">
                <div class="heatmap-row">${row0}</div>
                <div class="heatmap-row">${row1}</div>
                <div class="heatmap-row">${row2}</div>
                <div class="heatmap-row">${row3}</div>
                <div class="heatmap-row">
                    <div class="heatmap-key space-key good" onclick="inspectHeatmapKey(' ')">
                        <b>SPACEBAR</b>
                    </div>
                </div>
            </div>

            <div class="heatmap-legend">
                <div class="legend-item"><span class="legend-dot" style="background:#10b981"></span> Excellent (&gt;96% acc, &lt;250ms)</div>
                <div class="legend-item"><span class="legend-dot" style="background:#6366f1"></span> Stable / Good</div>
                <div class="legend-item"><span class="legend-dot" style="background:#fbbf24"></span> Moderate Error Warning</div>
                <div class="legend-item"><span class="legend-dot" style="background:#f43f5e"></span> Critical Weakness</div>
                <div class="legend-item"><span class="legend-dot" style="background:var(--line-strong)"></span> Untested</div>
            </div>

            ${detailHtml}
        </section>

        <section class="card" style="margin-top:16px">
            <div class="section-head">
                <div>
                    <h2>Session history</h2>
                    <p>All data stays private on this computer</p>
                </div>
            </div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>WPM</th>
                        <th>Accuracy</th>
                        <th>Duration</th>
                    </tr>
                </thead>
                <tbody>
                    ${recentRows}
                </tbody>
            </table>
        </section>
    `;
    app.innerHTML = layout(content, 'Analytics', 'Deep local metrics with visual QWERTY heatmaps and rhythm diagnostics.');
}

function inspectHeatmapKey(k) {
    selectedHeatmapChar = k;
    renderProgress();
}

async function startAdaptiveDrill() {
    try {
        const drill = await api('generate_adaptive_drill');
        state.selectedLesson = {
            id: 9999,
            title: drill.title,
            level: 'Adaptive',
            description: drill.description,
            content: drill.content,
            focus_keys: drill.focus_keys,
            duration_minutes: drill.duration_minutes,
            is_custom: true
        };
        state.route = 'practice';
        state.practice = null;
        render();
        toast('Adaptive drill loaded!');
    } catch (e) {
        toast(e.message || String(e));
    }
}

async function runCoach() {
    try {
        state.coach = await api('ai_coach');
        render();
        toast('10-Agent pipeline executed successfully.');
    } catch (e) {
        toast(e.message || String(e));
    }
}

function renderCoach() {
    const c = state.coach;
    const agentRoster = [
        'Performance Analyst', 'Weakness Detector', 'Curriculum Planner', 'Exercise Generator',
        'Difficulty Controller', 'Session Reviewer', 'Coach', 'Privacy Guard', 'LLM Coach', 'Quality Validator'
    ];

    const agentChainHtml = agentRoster.map((x, i) => `
        <div style="display:flex;gap:11px;align-items:center;padding:9px 0;border-bottom:1px solid var(--line)">
            <div class="avatar" style="width:28px;height:28px;font-size:10px">${i + 1}</div>
            <div style="font-size:12px;font-weight:700">${x}</div>
            <span style="margin-left:auto;color:var(--success);font-size:10px">DETERMINISTIC / LOCAL</span>
        </div>
    `).join('');

    let resultHtml = '<section class="card" style="margin-top:16px"><div class="empty">Run the local coach to create your first structured multi-agent analysis.</div></section>';

    if (c) {
        const modeStr = esc(c.plan?.mode?.replaceAll('_', ' ') || 'Practice');
        const evidenceHtml = (c.weaknesses?.weak_keys || []).map(k => `<span class="pill">Focus ${esc(k)}</span>`).join('');
        const traceHtml = (c.trace || []).map(r => `
            <tr>
                <td><b>${esc(r.agent.replaceAll('_', ' '))}</b></td>
                <td><span class="pill" style="font-size:10px">${esc(r.status)}</span></td>
                <td>${Math.round(r.confidence * 100)}%</td>
                <td>${esc((r.evidence || []).join(' • '))}</td>
            </tr>
        `).join('');

        const exerciseText = c.exercise?.exercise_text;
        const review = c.session_review;

        resultHtml = `
            <section class="card" style="margin-top:16px">
                <div class="section-head">
                    <div>
                        <h2>Targeted Coach Recommendation</h2>
                        <p>Evidence-backed priority with automatic bounds validation</p>
                    </div>
                </div>
                <div class="coach">
                    <div class="coach-icon">✦</div>
                    <div class="coach-copy">
                        <h3>${modeStr}</h3>
                        <p>${esc(c.summary)}</p>
                        <div class="evidence">
                            ${evidenceHtml}
                            <span class="pill">${c.plan?.minutes || 5} minutes</span>
                            <span class="pill">Confidence ${Math.round((c.confidence_floor || 0.9) * 100)}%</span>
                        </div>
                    </div>
                </div>
            </section>

            ${review ? `
            <section class="card" style="margin-top:16px">
                <div class="section-head">
                    <div>
                        <h2>Session Reviewer & Trend</h2>
                        <p>Comparative baseline analysis</p>
                    </div>
                </div>
                <div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap">
                    <div class="streak-chip">Trend: ${esc(review.trend || 'stable')}</div>
                    <div><b>Δ WPM:</b> ${review.wpm_delta >= 0 ? '+' : ''}${review.wpm_delta}</div>
                    <div><b>Δ Accuracy:</b> ${review.acc_delta >= 0 ? '+' : ''}${review.acc_delta}%</div>
                    <div style="color:var(--muted);font-size:13px">${esc(review.notable_change || '')}</div>
                </div>
            </section>` : ''}

            ${exerciseText ? `
            <section class="card" style="margin-top:16px">
                <div class="section-head">
                    <div>
                        <h2>Generated Practice Content (Exercise Generator)</h2>
                        <p>Constrained procedural drill string</p>
                    </div>
                    <button class="button button-primary button-small" onclick="startAdaptiveDrill()">Practice this drill</button>
                </div>
                <div style="padding:14px;background:var(--surface-2);border-radius:12px;font-family:'JetBrains Mono',monospace;font-size:14px">
                    ${esc(exerciseText)}
                </div>
            </section>` : ''}

            <section class="card" style="margin-top:16px">
                <div class="section-head">
                    <div>
                        <h2>Complete Multi-Agent Trace</h2>
                        <p>Auditable, structured execution log across all 10 production agents.</p>
                    </div>
                </div>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Agent</th>
                            <th>Status</th>
                            <th>Confidence</th>
                            <th>Evidence References</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${traceHtml}
                    </tbody>
                </table>
            </section>
        `;
    }

    const content = `
        <div class="grid split">
            <section class="card hero">
                <div class="eyebrow">Production Agentic System</div>
                <h2 style="font-size:26px;margin:8px 0">Your Private Multi-Agent Coach</h2>
                <p class="subtitle">KeyFlow executes 10 specialized local agents in controlled sequence with explicit schemas, privacy firewalls, and hard difficulty gates. No raw telemetry is sent to the cloud.</p>
                <button class="button button-primary" style="margin-top:14px" onclick="runCoach()">${c ? 'Run analysis again' : 'Analyze my performance'}</button>
            </section>
            <section class="card">
                <div class="section-head">
                    <div>
                        <h2>10-Agent Production Pipeline</h2>
                        <p>Stage 4 Multi-Agent Roster</p>
                    </div>
                </div>
                ${agentChainHtml}
            </section>
        </div>
        ${resultHtml}
    `;

    app.innerHTML = layout(content, 'AI Coach', 'Private-by-default agentic coaching with deterministic measurements at the center.');
}
