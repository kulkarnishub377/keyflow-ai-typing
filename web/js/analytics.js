function renderProgress() {
    const d = state.dashboard || {};
    const recent = [...(d.recent || [])].reverse();
    
    let weakKeysHtml = '';
    const weakKeysRaw = d.weak_keys || [];
    
    const keysHtml = 'QWERTYUIOPASDFGHJKLZXCVBNM'.split('').map(k => {
        const isWeak = weakKeysRaw.some(x => String(x.expected_key).toUpperCase() === k);
        return `<span class="key ${isWeak ? 'weak' : ''}">${k}</span>`;
    }).join('');
    
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
                <span>${esc(l.title)}</span>
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
                        <p>Best saved performance by lesson</p>
                    </div>
                </div>
                ${masteryHtml}
            </section>
        </div>
        <section class="card" style="margin-top:16px">
            <div class="section-head">
                <div>
                    <h2>Weak-key heat map</h2>
                    <p>Current aggregated expected-key errors</p>
                </div>
            </div>
            <div class="keys">
                ${keysHtml}
            </div>
        </section>
        <section class="card" style="margin-top:16px">
            <div class="section-head">
                <div>
                    <h2>Session history</h2>
                    <p>All data stays local</p>
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
    app.innerHTML = layout(content, 'Analytics', 'Deep local metrics today; richer key, finger, transition, and rhythm analytics are part of the roadmap.');
}

async function runCoach() {
    try {
        state.coach = await api('ai_coach');
        render();
        toast('Local agent pipeline completed.');
    } catch (e) {
        toast(e.message || String(e));
    }
}

function renderCoach() {
    const c = state.coach;
    
    const agentChainHtml = ['Performance Analyst', 'Weakness Detector', 'Curriculum Planner', 'Coach', 'Quality Validator'].map((x, i) => `
        <div style="display:flex;gap:11px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line)">
            <div class="avatar" style="width:30px;height:30px;font-size:10px">${i + 1}</div>
            <div style="font-size:12px;font-weight:800">${x}</div>
            <span style="margin-left:auto;color:var(--success);font-size:10px">LOCAL</span>
        </div>
    `).join('');
    
    let resultHtml = '<section class="card" style="margin-top:16px"><div class="empty">Run the local coach to create your first structured analysis.</div></section>';
    
    if (c) {
        const modeStr = esc(c.plan?.mode?.replaceAll('_', ' ') || 'Practice');
        const evidenceHtml = (c.weaknesses?.weak_keys || []).map(k => `<span class="pill">Focus ${esc(k)}</span>`).join('');
        const traceHtml = (c.trace || []).map(r => `
            <tr>
                <td>${esc(r.agent.replaceAll('_', ' '))}</td>
                <td>${esc(r.status)}</td>
                <td>${Math.round(r.confidence * 100)}%</td>
                <td>${esc((r.evidence || []).join(' • '))}</td>
            </tr>
        `).join('');

        resultHtml = `
            <section class="card" style="margin-top:16px">
                <div class="section-head">
                    <div>
                        <h2>Recommendation</h2>
                        <p>Evidence-backed next step</p>
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
                            <span class="pill">Confidence ${Math.round((c.trace?.slice(-1)[0]?.confidence || 0) * 100)}%</span>
                        </div>
                    </div>
                </div>
            </section>
            <section class="card" style="margin-top:16px">
                <div class="section-head">
                    <div>
                        <h2>Agent trace</h2>
                        <p>No hidden reasoning is stored; this is the structured execution trace.</p>
                    </div>
                </div>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Agent</th>
                            <th>Status</th>
                            <th>Confidence</th>
                            <th>Evidence</th>
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
                <div class="eyebrow">Agentic learning system</div>
                <h2 style="font-size:26px;margin:8px 0">Your local typing coach</h2>
                <p class="subtitle">The current pipeline uses deterministic agents with explicit roles, rules, confidence, and validation. It is designed so a local model can be added later without replacing the typing engine.</p>
                <button class="button button-primary" style="margin-top:14px" onclick="runCoach()">${c ? 'Run analysis again' : 'Analyze my performance'}</button>
            </section>
            <section class="card">
                <div class="section-head">
                    <div>
                        <h2>Active agent chain</h2>
                        <p>Structured, auditable roles</p>
                    </div>
                </div>
                ${agentChainHtml}
            </section>
        </div>
        ${resultHtml}
    `;
    
    app.innerHTML = layout(content, 'AI Coach', 'Private-by-default agentic coaching with deterministic measurements at the center.');
}
