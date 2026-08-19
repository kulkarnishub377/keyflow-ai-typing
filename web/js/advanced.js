// ==========================================================================
// KeyFlow AI Copilot Lab & Developer Observability Studio
// ==========================================================================

async function renderCoach() {
    let analysis = null;
    let plan = null;
    let dev = null;

    try {
        [analysis, plan, dev] = await Promise.all([
            api('advanced_analytics'),
            api('adaptive_plan'),
            api('developer_snapshot')
        ]);
    } catch (e) {
        console.error("Failed to load developer studio snapshot", e);
    }

    const c = state.coach;
    const msg = c?.summary || 'Run the multi-agent pipeline to generate structured local advice.';
    
    let traceHtml = '<div class="empty" style="padding:16px;font-size:12.5px">Run the coach to inspect the live 10-agent execution trace.</div>';
    if (c?.trace && c.trace.length > 0) {
        traceHtml = c.trace.map(x => `
            <div style="padding:10px 14px;background:var(--surface-2);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:space-between">
                <div style="display:flex;align-items:center;gap:10px">
                    <span style="font-weight:800;font-size:13.5px">${esc(x.agent.replaceAll('_', ' '))}</span>
                    <span class="badge ${x.status === 'ok' ? 'badge-success' : 'badge-warning'}" style="font-size:10px">${esc(x.status)}</span>
                </div>
                <div style="display:flex;align-items:center;gap:8px">
                    <span class="kbd" style="font-size:11px">${Math.round((x.confidence || 0) * 100)}% conf</span>
                    <span style="font-size:11.5px;color:var(--text-muted)">${esc((x.evidence || []).join(' • '))}</span>
                </div>
            </div>
        `).join('');
    }

    const content = `
        <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
                <h1 style="font-family:'Outfit',sans-serif;font-size:24px;font-weight:800">AI Copilot & Observability Studio</h1>
                <p style="font-size:13px;color:var(--text-muted)">Deep local telemetry diagnostics, adaptive curriculum planning, and multi-agent audit traces.</p>
            </div>
            <div style="display:flex;gap:8px">
                <button class="btn btn-secondary" onclick="renderCoach()">↺ Refresh Telemetry</button>
                <button class="btn btn-primary" onclick="runCoach()">✦ Execute Multi-Agent Pipeline</button>
            </div>
        </div>

        ${copilotCard()}

        ${analysis ? `
            <div class="stats-grid">
                ${statTile('Hand Balance', `${analysis.hand_balance ? analysis.hand_balance.toFixed(1) : '50.0'}% <small style="font-size:11px;color:var(--text-muted)">L/R ratio</small>`, 'QWERTY hand distribution', 'Calculated across left vs right hand key strokes')}
                ${statTile('Rhythm Variance', `${analysis.rhythm_cv ? analysis.rhythm_cv.toFixed(3) : '0.000'} <small style="font-size:11px;color:var(--text-muted)">CV score</small>`, 'Consistency index', 'Lower indicates higher metronomic rhythm')}
                ${statTile('Average Latency', `${analysis.latency_avg_ms ? Math.round(analysis.latency_avg_ms) : 0} <small style="font-size:11px;color:var(--text-muted)">ms</small>`, 'Key stroke latency', 'Mean keystroke interval')}
                ${statTile('P95 Latency', `${analysis.latency_p95_ms ? Math.round(analysis.latency_p95_ms) : 0} <small style="font-size:11px;color:var(--text-muted)">ms</small>`, '95th percentile hesitation', 'Upper bound key hesitation')}
            </div>
        ` : ''}

        ${plan ? `
            <div class="kf-card">
                <div class="kf-card-header">
                    <div>
                        <div class="kf-card-title">Adaptive Curriculum Target</div>
                        <div class="kf-card-subtitle">Procedurally calculated for your current skill level</div>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="startAdaptiveDrill()">Launch Target Drill ➔</button>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:12px;background:var(--surface-2);border-radius:var(--radius-md);border:1px solid var(--border-subtle)">
                    <div>
                        <div style="font-size:12px;color:var(--text-muted);font-weight:700">OBJECTIVE</div>
                        <div style="font-size:16px;font-weight:800;margin-top:2px">${esc(plan.objective || 'Fluency')}</div>
                    </div>
                    <div>
                        <div style="font-size:12px;color:var(--text-muted);font-weight:700">TARGET WPM & ACCURACY</div>
                        <div style="font-size:16px;font-weight:800;margin-top:2px">${plan.target_wpm || 60} WPM • ${plan.target_accuracy || 97}% Acc</div>
                    </div>
                </div>
                <p style="font-size:13px;color:var(--text-muted);margin-top:12px;line-height:1.5">${esc(plan.reason || '')}</p>
            </div>
        ` : ''}

        <div class="kf-card">
            <div class="kf-card-header">
                <div>
                    <div class="kf-card-title">10-Agent Pipeline Audit Trace</div>
                    <div class="kf-card-subtitle">Deterministic multi-agent execution results</div>
                </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px">
                ${traceHtml}
            </div>
        </div>

        ${dev ? `
            <div class="kf-card">
                <div class="kf-card-header">
                    <div>
                        <div class="kf-card-title">Local SQLite Telemetry Vault</div>
                        <div class="kf-card-subtitle">Local database tables and storage metrics</div>
                    </div>
                    <span class="badge badge-success">Engine v${esc(dev.version || '0.5.0')}</span>
                </div>
                <div style="display:flex;gap:10px;flex-wrap:wrap">
                    ${Object.entries(dev.table_counts || {}).map(([tbl, cnt]) => `
                        <div style="padding:8px 12px;background:var(--surface-2);border-radius:var(--radius-sm);border:1px solid var(--border-subtle);font-size:12px">
                            <span style="color:var(--text-muted)">${tbl}:</span> <b>${cnt} rows</b>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    `;

    app.innerHTML = layout(content, 'AI Copilot Lab', 'Multi-agent orchestration, diagnostics, and local audit traces.');
}

async function runCoach() {
    try {
        toast('Executing local multi-agent diagnostic pipeline...');
        const result = await api('ai_coach');
        if (result.status === 'ok') {
            state.coach = result;
            toast('AI Coaching advice generated.');
            if (state.route === 'coach') renderCoach();
            else if (state.route === 'dashboard') renderDashboard();
        } else {
            toast('Coaching pipeline blocked: ' + JSON.stringify(result));
        }
    } catch (e) {
        toast(e.message || String(e));
    }
}
