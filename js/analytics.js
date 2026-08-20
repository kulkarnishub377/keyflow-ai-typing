// ==========================================================================
// KeyFlow Analytics & QWERTY Diagnostic Studio
// ==========================================================================

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
            <div class="hm-key ${statusClass}" onclick="inspectHeatmapKey('${k}')" title="${label}: ${item.mistakes} errors, ${item.avg_latency_ms}ms">
                <b>${label}</b>
                <small>${accText}</small>
            </div>
        `;
    };

    const row0 = '1234567890-='.split('').map(renderKey).join('');
    const row1 = 'QWERTYUIOP'.split('').map(renderKey).join('');
    const row2 = 'ASDFGHJKL;\''.split('').map(renderKey).join('');
    const row3 = 'ZXCVBNM,./'.split('').map(renderKey).join('');

    let detailHtml = '';
    if (selectedHeatmapChar && hm[selectedHeatmapChar.toLowerCase()]) {
        const item = hm[selectedHeatmapChar.toLowerCase()];
        detailHtml = `
            <div class="key-detail-drawer">
                <div>
                    <h3 style="font-size:16px;font-weight:800;letter-spacing:-0.01em">
                        Key Diagnostics: '${selectedHeatmapChar.toUpperCase()}'
                    </h3>
                    <div style="font-size:12.5px;color:var(--text-muted);margin-top:3px">
                        Accuracy: <b class="${item.accuracy >= 95 ? 'text-green' : 'text-rose'}">${item.accuracy}%</b> • 
                        Latency: <b>${item.avg_latency_ms} ms</b> (P95: ${item.p95_latency_ms || item.avg_latency_ms} ms) • 
                        Finger: <b>${item.finger || 'Standard'}</b> • 
                        Total Attempts: <b>${item.attempts}</b> (${item.mistakes} typos)
                    </div>
                </div>
                <button class="btn btn-primary btn-sm" onclick="startAdaptiveDrill()">Train '${selectedHeatmapChar.toUpperCase()}' Now</button>
            </div>
        `;
    }

    let recentRows = '<tr><td colspan="4" class="empty" style="padding:24px">No verified sessions recorded yet.</td></tr>';
    if (recent.length > 0) {
        recentRows = recent.slice().reverse().map(x => `
            <tr>
                <td style="font-size:12.5px;color:var(--text-muted)">${esc(x.created_at)}</td>
                <td style="font-family:'JetBrains Mono',monospace;font-weight:700">${Math.round(x.wpm)} <small style="color:var(--text-muted)">WPM</small></td>
                <td style="font-family:'JetBrains Mono',monospace" class="${x.accuracy >= 97 ? 'text-green' : x.accuracy >= 90 ? 'text-amber' : 'text-rose'}">${Number(x.accuracy).toFixed(1)}%</td>
                <td style="font-family:'JetBrains Mono',monospace;color:var(--text-muted)">${Number(x.duration_seconds).toFixed(1)}s</td>
            </tr>
        `).join('');
    }

    const masteryHtml = state.progress.map(l => `
        <div style="margin-bottom:14px">
            <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600;margin-bottom:5px">
                <span>${esc(l.title)} ${l.is_custom ? '<span class="badge badge-purple" style="font-size:9px">CUSTOM</span>' : ''}</span>
                <span class="badge ${l.completed_count ? 'badge-success' : ''}" style="font-size:11px">
                    ${l.completed_count ? Math.round(l.best_wpm) + ' WPM' : 'Incomplete'}
                </span>
            </div>
            <div style="height:6px;border-radius:999px;background:var(--surface-2);overflow:hidden">
                <div style="height:100%;width:${l.completed_count ? 100 : 0}%;background:var(--accent-green);border-radius:999px"></div>
            </div>
        </div>
    `).join('');

    const content = `
        <div style="display:grid;grid-template-columns:1.1fr 0.9fr;gap:16px">
            <div class="kf-card">
                <div class="kf-card-header">
                    <div>
                        <div class="kf-card-title">WPM Trajectory & Velocity</div>
                        <div class="kf-card-subtitle">Session history progression</div>
                    </div>
                </div>
                ${recentChart(d.recent || [])}
            </div>

            <div class="kf-card">
                <div class="kf-card-header">
                    <div>
                        <div class="kf-card-title">Curriculum Mastery</div>
                        <div class="kf-card-subtitle">Validated skills across lessons</div>
                    </div>
                </div>
                <div style="max-height:220px;overflow-y:auto;padding-right:4px">
                    ${masteryHtml}
                </div>
            </div>
        </div>

        <div class="heatmap-card">
            <div class="kf-card-header">
                <div>
                    <div class="kf-card-title">Interactive QWERTY Telemetry Heatmap</div>
                    <div class="kf-card-subtitle">Live per-key accuracy, latency, and mistake frequency</div>
                </div>
                <button class="btn btn-primary btn-sm" onclick="startAdaptiveDrill()">Launch Adaptive Drill</button>
            </div>

            <div class="heatmap-grid">
                <div class="heatmap-row">${row0}</div>
                <div class="heatmap-row">${row1}</div>
                <div class="heatmap-row">${row2}</div>
                <div class="heatmap-row">${row3}</div>
                <div class="heatmap-row">
                    <div class="hm-key hm-space-key good" onclick="inspectHeatmapKey(' ')">
                        <b>SPACEBAR</b>
                    </div>
                </div>
            </div>

            <div class="heatmap-legend-row">
                <div><span class="legend-dot" style="background:var(--accent-green)"></span> Excellent (&gt;96% acc, &lt;250ms)</div>
                <div><span class="legend-dot" style="background:var(--brand)"></span> Stable / Good</div>
                <div><span class="legend-dot" style="background:var(--accent-amber)"></span> Latency Warning</div>
                <div><span class="legend-dot" style="background:var(--accent-rose)"></span> Critical Weakness</div>
                <div><span class="legend-dot" style="background:var(--surface-3)"></span> Untested</div>
            </div>

            ${detailHtml}
        </div>

        <div class="kf-card">
            <div class="kf-card-header">
                <div>
                    <div class="kf-card-title">Session Telemetry Log</div>
                    <div class="kf-card-subtitle">Private local telemetry history</div>
                </div>
            </div>
            <table class="kf-table">
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>WPM Velocity</th>
                        <th>Accuracy</th>
                        <th>Duration</th>
                    </tr>
                </thead>
                <tbody>
                    ${recentRows}
                </tbody>
            </table>
        </div>
    `;

    app.innerHTML = layout(content, 'Analytics', 'Deep local telemetry diagnostics with visual QWERTY heatmaps.');
}

function inspectHeatmapKey(k) {
    selectedHeatmapChar = k;
    renderProgress();
}

async function startAdaptiveDrill() {
    try {
        const drill = await api('generate_adaptive_drill');
        state.selectedLesson = {
            ...drill,
            id: -1,
            is_custom: true,
            level: 'Adaptive'
        };
        toast(`Generated drill targeting ${drill.focus_keys || 'smooth transitions'}`);
        go('practice');
    } catch (e) {
        toast(e.message || String(e));
    }
}
