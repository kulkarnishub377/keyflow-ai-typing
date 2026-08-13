const state = {
  user: null,
  lessons: [],
  progress: [],
  dashboard: null,
  settings: { theme: 'dark', daily_goal_minutes: 15 },
  route: 'dashboard',
  selectedLesson: null,
  practice: null,
  authMode: 'login'
};

const app = document.getElementById('app');
const $ = (s) => document.querySelector(s);
const esc = (v='') => String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));

async function api(method, ...args) {
  if (!window.pywebview?.api) throw new Error('Desktop bridge is not ready.');
  return await window.pywebview.api[method](...args);
}

function toast(message) {
  const el = $('#toast'); if (!el) return;
  el.textContent = message; el.style.display='block';
  clearTimeout(window.__toast); window.__toast=setTimeout(()=>el.style.display='none',2800);
}

function applyTheme(){ document.body.classList.toggle('light', state.settings.theme === 'light'); }

function renderAuth() {
  app.innerHTML = `
  <main class="auth">
    <section class="auth-card">
      <div class="eyebrow">Offline typing intelligence</div>
      <div class="logo-large">Key<span style="color:var(--accent)">Flow</span> Local</div>
      <p class="subtitle">Learn touch typing, practice intelligently, and keep your progress on this computer.</p>
      <div class="auth-actions">
        <button class="${state.authMode==='login'?'primary':'ghost'}" onclick="setAuthMode('login')">Log in</button>
        <button class="${state.authMode==='register'?'primary':'ghost'}" onclick="setAuthMode('register')">Create local profile</button>
      </div>
      <div id="authError" class="error"></div>
      ${state.authMode==='login' ? `
        <form onsubmit="login(event)">
          <div class="field"><label>Username</label><input id="loginUser" required autocomplete="username"></div>
          <div class="field"><label>Password</label><input id="loginPass" required type="password" autocomplete="current-password"></div>
          <button class="primary" style="width:100%">Open my workspace</button>
        </form>` : `
        <form onsubmit="register(event)">
          <div class="field"><label>Display name</label><input id="regName" required></div>
          <div class="field"><label>Username</label><input id="regUser" required minlength="3"></div>
          <div class="field"><label>Password</label><input id="regPass" required minlength="6" type="password"></div>
          <button class="primary" style="width:100%">Create local profile</button>
        </form>`}
      <p class="subtitle" style="margin-top:18px;font-size:12px">Your profile is stored locally. There is no cloud login or required server.</p>
    </section>
  </main><div id="toast" class="toast"></div>`;
}

function setAuthMode(mode){ state.authMode=mode; renderAuth(); }

async function login(e){
  e.preventDefault();
  try { await api('login',$('#loginUser').value,$('#loginPass').value); await boot(); }
  catch(err){ $('#authError').textContent=err.message||String(err); }
}

async function register(e){
  e.preventDefault();
  try { await api('register',$('#regUser').value,$('#regPass').value,$('#regName').value); await boot(); }
  catch(err){ $('#authError').textContent=err.message||String(err); }
}

async function boot(){
  const data = await api('get_bootstrap');
  state.user=data.user;
  state.lessons=data.lessons||[];
  state.progress=data.progress||[];
  state.dashboard=data.dashboard||null;
  state.settings=data.settings||state.settings;
  applyTheme();
  state.route = state.user ? 'dashboard' : 'dashboard';
  render();
}

function layout(content){
  const nav = [['dashboard','Dashboard'],['learn','Learn'],['practice','Practice'],['progress','Progress'],['settings','Settings']];
  return `<div class="shell">
    <aside class="sidebar">
      <div class="brand">Key<span>Flow</span></div>
      <div class="nav">${nav.map(([id,label])=>`<button class="${state.route===id?'active':''}" onclick="go('${id}')">${label}</button>`).join('')}</div>
      <div class="side-bottom">
        <button class="ghost" onclick="toggleTheme()">${state.settings.theme==='dark'?'☼ Light mode':'◐ Dark mode'}</button>
        <button class="danger" onclick="logout()">Log out</button>
      </div>
    </aside>
    <main class="app-main"><div class="topbar"><div><div class="eyebrow">Local workspace</div><div style="font-size:14px;color:var(--muted)">${esc(state.user?.display_name||'')}</div></div><div class="user-pill">${esc(state.user?.username||'')}</div></div>${content}</main>
    <div id="toast" class="toast"></div>
  </div>`;
}

function render(){
  if(!state.user){ renderAuth(); return; }
  applyTheme();
  if(state.route==='dashboard') renderDashboard();
  if(state.route==='learn') renderLearn();
  if(state.route==='practice') renderPractice();
  if(state.route==='progress') renderProgress();
  if(state.route==='settings') renderSettings();
}

function go(route){ state.route=route; state.selectedLesson=null; render(); }

function renderDashboard(){
  const d=state.dashboard||{sessions:0,best_wpm:0,avg_wpm:0,avg_accuracy:0,total_minutes:0,today_minutes:0,recent:[],weak_keys:[]};
  const next=state.progress.find(x=>x.completed_count===0)||state.progress[0];
  const goal=Math.max(1,Number(state.settings.daily_goal_minutes||15));
  const pct=Math.min(100,d.today_minutes/goal*100);
  app.innerHTML=layout(`
    <h1>Good typing is built, not rushed.</h1>
    <p class="subtitle">Your local coach tracks the patterns behind your speed so practice can become more targeted over time.</p>
    <div class="grid stats-grid" style="margin:22px 0">
      ${stat('Best WPM',Math.round(d.best_wpm),'personal best')}
      ${stat('Average WPM',Math.round(d.avg_wpm),'across saved sessions')}
      ${stat('Accuracy',`${d.avg_accuracy.toFixed(1)}%`,'average accuracy')}
      ${stat('Practice',`${d.total_minutes}m`,'total recorded time')}
    </div>
    <div class="grid two">
      <section class="card">
        <div class="section-title"><div><h2>Today</h2><div class="subtitle">Daily training goal</div></div><strong>${d.today_minutes}/${goal} min</strong></div>
        <div class="progress" style="width:100%;height:12px"><i style="width:${pct}%"></i></div>
        <p style="margin:12px 0 0;color:var(--muted);font-size:13px">${pct>=100?'Goal complete. Great work.':`You need ${(goal-d.today_minutes).toFixed(1)} more minutes to reach today's goal.`}</p>
      </section>
      <section class="card"><div class="section-title"><div><h2>AI Coach Preview</h2><div class="subtitle">Rule-based local insight in this version</div></div></div>
        <p>${coachInsight(d)}</p><button class="primary" onclick="go('practice')">Train my weaknesses</button>
      </section>
    </div>
    <div class="grid two" style="margin-top:16px">
      <section class="card"><div class="section-title"><div><h2>Continue learning</h2><div class="subtitle">${next?esc(next.title):'All lessons complete'}</div></div>${next?`<button class="primary" onclick="startLesson(${next.id})">Start</button>`:''}</div>
        ${state.progress.slice(0,4).map(lessonRow).join('')}
      </section>
      <section class="card"><div class="section-title"><div><h2>Weak keys</h2><div class="subtitle">Most frequent expected-key mistakes</div></div></div>
        ${d.weak_keys.length?d.weak_keys.map(x=>`<div class="lesson" style="padding:10px 12px"><div><strong>${esc(x.expected_key===' ' ? 'Space' : x.expected_key.toUpperCase())}</strong></div><div style="color:var(--muted)">${x.mistakes} mistakes</div></div>`).join(''):'<div class="empty">Complete a few sessions to see weakness patterns.</div>'}
      </section>
    </div>`);
}
function stat(label,value,hint){return `<div class="card stat"><div class="label">${label}</div><div class="value">${value}</div><div class="hint">${hint}</div></div>`}
function coachInsight(d){
  if(!d.sessions) return 'Complete your first short lesson. The app will start building a local profile of your speed, accuracy and error patterns.';
  if(d.avg_accuracy<92) return `Accuracy is the first priority right now (${d.avg_accuracy.toFixed(1)}%). Slow the pace slightly, stay relaxed, and let speed come after clean repetitions.`;
  if(d.weak_keys?.length) return `Your highest-frequency weakness is the ${d.weak_keys[0].expected_key.toUpperCase()} key. The next practice session can target that key repeatedly before returning to full words.`;
  return `You're building a strong base at ${Math.round(d.avg_wpm)} WPM. Keep accuracy high while gradually increasing pace.`;
}
function lessonRow(l){
  const pct=l.completed_count?100:0;
  return `<div class="lesson"><div class="lesson-left"><div class="badge">${l.level}</div><div><div class="lesson-title">${esc(l.title)}</div><div class="lesson-desc">${esc(l.description)}</div><div class="progress"><i style="width:${pct}%"></i></div></div></div><button class="ghost" onclick="startLesson(${l.id})">${l.completed_count?'Practice':'Learn'}</button></div>`;
}

function renderLearn(){
  app.innerHTML=layout(`<h1>Learning path</h1><p class="subtitle">A structured route from home-row fundamentals to real-world typing control.</p><div class="lesson-list" style="margin-top:20px">${state.progress.map(lessonRow).join('')}</div>`);
}

function startLesson(id){ state.selectedLesson=state.progress.find(x=>x.id===id)||state.lessons.find(x=>x.id===id); state.route='practice'; renderPractice(); }
function renderPractice(){
  const l=state.selectedLesson || state.lessons[0];
  if(!l){ app.innerHTML=layout('<div class="empty">No lessons found.</div>'); return; }
  if(!state.practice || state.practice.lessonId!==l.id) state.practice={lessonId:l.id,prompt:l.content,started:null,finished:false};
  app.innerHTML=layout(`<div class="practice-shell"><div class="eyebrow">Lesson ${l.level}</div><h1>${esc(l.title)}</h1><p class="subtitle">${esc(l.description)} Focus: ${esc(l.focus_keys||'full keyboard')}</p>
    <div class="practice-stats">${pstat('WPM','wpm')} ${pstat('Accuracy','accuracy')} ${pstat('Errors','errors')} ${pstat('Time','time')}</div>
    <div id="prompt" class="prompt"></div>
    <textarea id="typingInput" autofocus spellcheck="false" autocomplete="off" autocapitalize="off" placeholder="Start typing here..."></textarea>
    <div class="kbd">${'QWERTYUIOPASDFGHJKLZXCVBNM'.split('').map(k=>`<span class="key">${k}</span>`).join('')}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:18px"><span class="subtitle">Target: accuracy first, speed second.</span><div><button class="ghost" onclick="resetPractice()">Reset</button> <button class="primary" onclick="finishPractice(true)">Finish & save</button></div></div>
  </div>`);
  setupTyping();
}
function pstat(label,id){return `<div class="practice-stat"><span style="color:var(--muted);font-size:12px">${label}</span><strong id="live-${id}">0</strong></div>`}
function setupTyping(){
  const input=$('#typingInput'), prompt=$('#prompt'), text=state.practice.prompt;
  const renderPrompt=(typed='')=>{ prompt.innerHTML=[...text].map((ch,i)=>`<span class="${i<typed.length?(typed[i]===ch?'done':'current'):i===typed.length?'current':'pending'}">${ch===' '?'·':esc(ch)}</span>`).join(''); };
  renderPrompt(''); input.addEventListener('keydown', e=>{ if(e.key==='Backspace') state.practice.backspaces=(state.practice.backspaces||0)+1; });
  input.addEventListener('input', ()=>{
    const typed=input.value; if(!state.practice.started) state.practice.started=performance.now(); renderPrompt(typed);
    let correct=0, errors=0; const counts={};
    for(let i=0;i<typed.length;i++){ if(typed[i]===text[i]) correct++; else { errors++; const expected=text[i]||''; if(expected) counts[expected]=(counts[expected]||0)+1; } }
    const elapsed=Math.max(.25,(performance.now()-state.practice.started)/1000); const minutes=elapsed/60;
    const wpm=(correct/5)/minutes; const acc=typed.length?correct/typed.length*100:100;
    $('#live-wpm').textContent=isFinite(wpm)?Math.round(wpm):0; $('#live-accuracy').textContent=acc.toFixed(1)+'%'; $('#live-errors').textContent=errors; $('#live-time').textContent=elapsed.toFixed(1)+'s';
    if(typed.length>=text.length){ finishPractice(false, {duration_seconds:elapsed,total_chars:typed.length,correct_chars:correct,incorrect_chars:errors,wpm,accuracy:acc,errors:Object.entries(counts).map(([expected,count])=>({expected,actual:'?',count}))}); }
  });
  setTimeout(()=>input.focus(),100);
}
async function finishPractice(manual=true,metrics=null){
  if(state.practice.finished) return;
  const input=$('#typingInput');
  if(!input) return;
  const text=state.practice.prompt, typed=input.value; let correct=0, incorrect=0; const counts={};
  for(let i=0;i<typed.length;i++){ if(typed[i]===text[i]) correct++; else {incorrect++; const expected=text[i]||''; if(expected) counts[expected]=(counts[expected]||0)+1;} }
  const elapsed=metrics?.duration_seconds || (state.practice.started?Math.max(.25,(performance.now()-state.practice.started)/1000):0);
  if(!elapsed && !typed.length) { toast('Type a few characters before saving.'); return; }
  const wpm=metrics?.wpm || ((correct/5)/(elapsed/60)); const accuracy=metrics?.accuracy ?? (typed.length?correct/typed.length*100:100);
  state.practice.finished=true;
  try{
    const result=await api('save_session',{lesson_id:state.practice.lessonId,duration_seconds:elapsed,total_chars:typed.length,correct_chars:correct,incorrect_chars:incorrect,backspaces:state.practice.backspaces||0,wpm,accuracy,text_prompt:text,errors:Object.entries(counts).map(([expected,count])=>({expected,actual:'?',count}))});
    state.dashboard=result.dashboard; state.progress=await api('progress');
    toast(`Saved: ${Math.round(wpm)} WPM · ${accuracy.toFixed(1)}% accuracy`);
    if(manual) setTimeout(()=>go('dashboard'),500);
  } catch(err){ state.practice.finished=false; toast(err.message||String(err)); }
}
function resetPractice(){ state.practice=null; renderPractice(); }

function renderProgress(){
  const d=state.dashboard||{recent:[]}; const recent=[...(d.recent||[])].reverse(); const max=Math.max(1,...recent.map(x=>x.wpm));
  app.innerHTML=layout(`<h1>Your progress</h1><p class="subtitle">Everything here is calculated from your local session history.</p>
    <div class="grid two" style="margin-top:20px">
      <section class="card"><div class="section-title"><div><h2>WPM trend</h2><div class="subtitle">Most recent saved sessions</div></div></div><div class="chart">${recent.map(x=>`<div class="bar" style="height:${Math.max(6,x.wpm/max*150)}px"><span>${Math.round(x.wpm)}</span></div>`).join('')||'<div class="empty">Not enough sessions yet.</div>'}</div></section>
      <section class="card"><div class="section-title"><div><h2>Learning mastery</h2><div class="subtitle">Lesson bests and completion</div></div></div>${state.progress.map(l=>`<div style="margin:12px 0"><div style="display:flex;justify-content:space-between;font-size:13px"><span>${esc(l.title)}</span><strong>${l.completed_count?Math.round(l.best_wpm)+' WPM':'Not started'}</strong></div><div class="progress" style="width:100%"><i style="width:${l.completed_count?100:0}%"></i></div></div>`).join('')}</section>
    </div>
    <section class="card" style="margin-top:16px"><div class="section-title"><div><h2>Session history</h2><div class="subtitle">Stored locally on this computer</div></div></div><table class="table"><thead><tr><th>Date</th><th>WPM</th><th>Accuracy</th><th>Duration</th></tr></thead><tbody>${recent.slice().reverse().map(x=>`<tr><td>${esc(x.created_at)}</td><td>${Math.round(x.wpm)}</td><td>${Number(x.accuracy).toFixed(1)}%</td><td>${Number(x.duration_seconds).toFixed(1)}s</td></tr>`).join('')||'<tr><td colspan="4" class="empty">No sessions yet.</td></tr>'}</tbody></table></section>`);
}

function renderSettings(){
  app.innerHTML=layout(`<h1>Settings</h1><p class="subtitle">Keep the workspace comfortable and keep your data under your control.</p>
    <section class="card" style="max-width:760px;margin-top:20px">
      <div class="field"><label>Theme</label><select id="theme" style="padding:12px;border-radius:12px;background:var(--panel-2);color:var(--text);border:1px solid var(--line)"><option value="dark" ${state.settings.theme==='dark'?'selected':''}>Dark</option><option value="light" ${state.settings.theme==='light'?'selected':''}>Light</option></select></div>
      <div class="field"><label>Daily practice goal (minutes)</label><input id="goal" type="number" min="1" max="240" value="${state.settings.daily_goal_minutes}"></div>
      <button class="primary" onclick="saveSettings()">Save settings</button>
      <hr style="border:0;border-top:1px solid var(--line);margin:28px 0">
      <h3>Local backup</h3><p class="subtitle">Export a JSON backup that stays on your device unless you choose to move it elsewhere.</p>
      <button class="ghost" onclick="backup()">Export backup</button>
    </section>`);
}
async function saveSettings(){ state.settings=await api('update_settings',{theme:$('#theme').value,daily_goal_minutes:Number($('#goal').value)}); applyTheme(); render(); toast('Settings saved.'); }
async function backup(){ try{ const pick=await api('choose_backup_path'); if(!pick.path)return; const out=await api('export_backup',pick.path); toast('Backup exported.'); }catch(err){toast(err.message||String(err));} }
async function toggleTheme(){ state.settings.theme=state.settings.theme==='dark'?'light':'dark'; state.settings=await api('update_settings',state.settings); applyTheme(); render(); }
async function logout(){ await api('logout'); state.user=null; state.dashboard=null; state.progress=[]; renderAuth(); }

window.addEventListener('pywebviewready', boot);
setTimeout(()=>{ if(window.pywebview?.api) boot(); },500);
