const state = {
    user: null,
    lessons: [],
    progress: [],
    dashboard: null,
    settings: { theme: 'dark', daily_goal_minutes: 15 },
    route: 'dashboard',
    selectedLesson: null,
    practice: null,
    coach: null,
    authMode: 'login'
};

const app = document.getElementById('app');

const esc = v => String(v ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[c]));

async function api(method, ...args) {
    if (!window.pywebview?.api) throw Error('Desktop bridge is not ready.');
    return await window.pywebview.api[method](...args);
}

function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.style.display = 'block';
    clearTimeout(window.__toast);
    window.__toast = setTimeout(() => el.style.display = 'none', 2600);
}
