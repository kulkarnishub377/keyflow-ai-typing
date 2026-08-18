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
window.openCustomLessonModal = openCustomLessonModal;
window.submitCustomLesson = submitCustomLesson;
window.deleteCustomLesson = deleteCustomLesson;
window.inspectHeatmapKey = inspectHeatmapKey;
window.startAdaptiveDrill = startAdaptiveDrill;
window.testAudioFeedback = testAudioFeedback;
window.selectParagraph = selectParagraph;
window.shuffleParagraph = shuffleParagraph;
window.focusTypingInput = focusTypingInput;

// Initialization
window.addEventListener('pywebviewready', boot);
setTimeout(() => { if (window.pywebview?.api) boot(); }, 500);

async function boot() {
    if (window._booted) return;
    window._booted = true;
    try {
        const b = await api('get_bootstrap');
        state.user = b.user;
        state.lessons = b.lessons || [];
        if (b.user) {
            state.progress = b.progress || [];
            state.dashboard = b.dashboard;
            state.settings = b.settings || state.settings;
            state.streak_stats = b.streak_stats || null;
        }
        applyTheme();
        render();
    } catch(e) {
        console.error(e);
        if (typeof renderError === 'function') renderError(e.message || String(e));
    }
}
