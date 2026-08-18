(function () {
  const STYLE = `
    .kf-advanced-nav {
      margin-top: 6px;
      color: var(--muted) !important;
      border: 1px solid rgba(99,102,241,.22) !important;
      background: rgba(99,102,241,.06) !important;
    }
    .kf-advanced-nav:hover {
      color: var(--text) !important;
      background: rgba(99,102,241,.14) !important;
      transform: translateX(4px);
    }
    .kf-modal-backdrop {
      position: fixed; inset: 0; z-index: 999;
      background: rgba(2, 6, 23, .72);
      backdrop-filter: blur(12px);
      display: grid; place-items: center; padding: 24px;
    }
    .kf-modal {
      width: min(1100px, 96vw); max-height: 88vh; overflow: auto;
      background: var(--surface-2); color: var(--text);
      border: 1px solid var(--line-strong); border-radius: 24px;
      box-shadow: 0 30px 80px rgba(0,0,0,.45);
      padding: 24px;
    }
    .kf-modal-head { display:flex; justify-content:space-between; gap:18px; align-items:flex-start; margin-bottom:18px; }
    .kf-modal-head h2 { margin:0 0 6px; font-size:26px; letter-spacing:-.03em; }
    .kf-muted { color:var(--muted); }
    .kf-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; margin:16px 0; }
    .kf-mini { padding:15px; border:1px solid var(--line); background:var(--surface); border-radius:16px; }
    .kf-mini b { display:block; font-size:20px; margin-top:4px; }
    .kf-section { margin-top:20px; }
    .kf-section h3 { margin:0 0 10px; font-size:16px; }
    .kf-table { width:100%; border-collapse:collapse; font-size:13px; }
    .kf-table th,.kf-table td { text-align:left; padding:10px 8px; border-bottom:1px solid var(--line); }
    .kf-pill { display:inline-flex; align-items:center; border-radius:999px; padding:5px 9px; font-size:11px; font-weight:700; background:rgba(99,102,241,.12); border:1px solid rgba(99,102,241,.22); }
    .kf-close { border:1px solid var(--line); background:transparent; color:var(--text); border-radius:10px; padding:9px 12px; cursor:pointer; }
    .kf-actions { display:flex; gap:10px; flex-wrap:wrap; margin-top:16px; }
    .kf-error { padding:14px; border:1px solid rgba(244,63,94,.28); background:rgba(244,63,94,.08); border-radius:14px; color:var(--text); }
    @media (max-width: 850px) { .kf-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
    @media (max-width: 560px) { .kf-grid { grid-template-columns:1fr; } .kf-modal-backdrop{padding:10px;} .kf-modal{padding:16px;} }
  `;
  function installStyle() {
    if (document.getElementById('keyflow-advanced-style')) return;
    const s = document.createElement('style');
    s.id = 'keyflow-advanced-style';
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  function addNav() {
    const nav = document.querySelector('.nav');
    if (!nav || nav.querySelector('.kf-advanced-nav')) return;
    const button = document.createElement('button');
    button.className = 'kf-advanced-nav';
    button.type = 'button';
    button.innerHTML = '<span class="nav-icon">◆</span><span>Developer Lab</span>';
    button.onclick = window.openDeveloperLab;
    nav.appendChild(button);
  }

  function escHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function modal(content) {
    const existing = document.querySelector('.kf-modal-backdrop');
    if (existing) existing.remove();
    const node = document.createElement('div');
    node.className = 'kf-modal-backdrop';
    node.innerHTML = `<section class="kf-modal" role="dialog" aria-modal="true">
      <div class="kf-modal-head">
        <div><h2>Developer Lab</h2><div class="kf-muted">Deep local diagnostics, adaptive planning, and agent observability.</div></div>
        <button class="kf-close" onclick="this.closest('.kf-modal-backdrop').remove()">Close</button>
      </div>${content}
    </section>`;
    node.addEventListener('click', e => { if (e.target === node) node.remove(); });
    document.body.appendChild(node);
  }

  function metric(label, value, note='') {
    return `<div class="kf-mini"><div class="kf-muted">${escHtml(label)}</div><b>${escHtml(value)}</b><small class="kf-muted">${escHtml(note)}</small></div>`;
  }

  async function openDeveloperLab() {
    installStyle();
    modal('<div class="kf-muted">Running deep local analysis…</div>');
    try {
      const [analysis, plan, dev] = await Promise.all([
        api('advanced_analytics'),
        api('adaptive_plan'),
        api('developer_snapshot')
      ]);
      const keys = (analysis.key_insights || []).slice(0, 8);
      const transitions = (analysis.slow_transitions || []).slice(0, 8);
      const history = (dev.agent_runs || []).slice(0, 8);

      const html = `
        <div class="kf-grid">
          ${metric('Samples', analysis.sample_size, 'latest session telemetry')}
          ${metric('Avg latency', `${analysis.latency_avg_ms} ms`, `P95 ${analysis.latency_p95_ms} ms`)}
          ${metric('Hand balance', `${analysis.hand_balance}%`, 'higher is more balanced')}
          ${metric('Rhythm CV', analysis.rhythm_cv, 'lower is steadier')}
        </div>

        <div class="kf-section">
          <h3>Adaptive recommendation</h3>
          <div class="kf-mini">
            <div><span class="kf-pill">${escHtml(plan.objective)}</span> <span class="kf-pill">${escHtml(plan.drill_type)}</span></div>
            <p><strong>Focus:</strong> ${escHtml((plan.focus || []).join(', ') || 'none')}</p>
            <p><strong>Target:</strong> ${escHtml(plan.target_wpm)} WPM / ${escHtml(plan.target_accuracy)}% accuracy / ${escHtml(plan.duration_minutes)} min</p>
            <p class="kf-muted">${escHtml(plan.reason)}</p>
          </div>
        </div>

        <div class="kf-section">
          <h3>Weakest key signals</h3>
          ${keys.length ? `<table class="kf-table"><thead><tr><th>Key</th><th>Accuracy</th><th>Avg latency</th><th>P95</th><th>Finger</th></tr></thead><tbody>
            ${keys.map(x => `<tr><td><strong>${escHtml(x.key.toUpperCase())}</strong></td><td>${escHtml(x.accuracy)}%</td><td>${escHtml(x.avg_latency_ms)} ms</td><td>${escHtml(x.p95_latency_ms)} ms</td><td>${escHtml(x.finger)}</td></tr>`).join('')}
          </tbody></table>` : '<div class="kf-muted">Not enough telemetry yet.</div>'}
        </div>

        <div class="kf-section">
          <h3>Slow transitions</h3>
          ${transitions.length ? `<table class="kf-table"><thead><tr><th>Transition</th><th>Attempts</th><th>Average</th><th>P95</th></tr></thead><tbody>
            ${transitions.map(x => `<tr><td><strong>${escHtml(x.transition)}</strong></td><td>${escHtml(x.attempts)}</td><td>${escHtml(x.avg_latency_ms)} ms</td><td>${escHtml(x.p95_latency_ms)} ms</td></tr>`).join('')}
          </tbody></table>` : '<div class="kf-muted">Not enough transition history yet.</div>'}
        </div>

        <div class="kf-section">
          <h3>Agent execution history</h3>
          ${history.length ? `<table class="kf-table"><thead><tr><th>Run</th><th>Status</th><th>Duration</th><th>Confidence</th><th>Created</th></tr></thead><tbody>
            ${history.map(x => `<tr><td>${escHtml(x.run_type)}</td><td>${escHtml(x.status)}</td><td>${escHtml(x.duration_ms)} ms</td><td>${Math.round(Number(x.confidence || 0)*100)}%</td><td>${escHtml(x.created_at)}</td></tr>`).join('')}
          </tbody></table>` : '<div class="kf-muted">No agent runs recorded yet.</div>'}
        </div>

        <div class="kf-actions">
          <button class="button button-primary" onclick="window.runDeepCoachFromLab()">Run deep coach</button>
          <button class="button button-ghost" onclick="window.openPerformanceSnapshot()">Refresh analytics</button>
        </div>
      `;
      modal(html);
    } catch (e) {
      modal(`<div class="kf-error">${escHtml(e?.message || e)}</div>`);
    }
  }

  async function runDeepCoachFromLab() {
    try {
      const result = await api('ai_coach');
      toast(`Coach complete • ${Math.round((result.confidence_floor || 0)*100)}% confidence`);
      openDeveloperLab();
    } catch (e) {
      toast(e?.message || String(e));
    }
  }

  async function openPerformanceSnapshot() {
    openDeveloperLab();
  }

  window.openDeveloperLab = openDeveloperLab;
  window.runDeepCoachFromLab = runDeepCoachFromLab;
  window.openPerformanceSnapshot = openPerformanceSnapshot;

  installStyle();
  const observer = new MutationObserver(addNav);
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(addNav, 250);
})();
