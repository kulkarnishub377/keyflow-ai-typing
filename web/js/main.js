function render() {
    applyTheme();
    if (!state.user) {
        renderAuth();
        return;
    }
    if (state.route === 'dashboard') renderDashboard();
    else if (state.route === 'learn') renderLearn();
    else if (state.route === 'practice') renderPractice();
    else if (state.route === 'progress') renderProgress();
    else if (state.route === 'coach') renderCoach();
    else renderSettings();
}

function go(route) {
    state.route = route;
    render();
}

// Global window map for HTML event handlers
window.go = go;
window.setAuthMode = setAuthMode;
window.submitAuth = submitAuth;
window.startLesson = startLesson;
window.finishPractice = finishPractice;
window.resetPractice = resetPractice;
window.runCoach = runCoach;
window.saveSettings = saveSettings;
window.backup = backup;
window.toggleTheme = toggleTheme;
window.logout = logout;

// Initialization
window.addEventListener('pywebviewready', boot);
setTimeout(() => { if (window.pywebview?.api) boot(); }, 500);
