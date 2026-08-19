// ==========================================================================
// KeyFlow Main App Lifecycle & Global Router
// ==========================================================================

function render() {
    applyTheme();
    if (!state.user) {
        renderAuth();
        return;
    }
    if (state.route === 'dashboard') renderDashboard();
    else if (state.route === 'practice') renderPractice();
    else if (state.route === 'arcade') renderArcade();
    else if (state.route === 'learn') renderLearn();
    else if (state.route === 'progress') renderProgress();
    else if (state.route === 'coach') renderCoach();
    else renderSettings();
}

function go(route) {
    if (typeof activeArcadeGame !== 'undefined' && activeArcadeGame) {
        activeArcadeGame.destroy();
        activeArcadeGame = null;
    }
    state.route = route;
    render();
}

// Global window mappings for HTML event handlers
window.go = go;
window.setAuthMode = typeof setAuthMode === 'function' ? setAuthMode : () => {};
window.submitAuth = typeof submitAuth === 'function' ? submitAuth : () => {};
window.startLesson = typeof startLesson === 'function' ? startLesson : () => {};
window.finishPractice = typeof finishPractice === 'function' ? finishPractice : () => {};
window.resetPractice = typeof resetPractice === 'function' ? resetPractice : () => {};
window.renderArcade = typeof renderArcade === 'function' ? renderArcade : () => {};
window.launchArcadeMode = typeof launchArcadeMode === 'function' ? launchArcadeMode : () => {};
window.startCurrentArcadeGame = typeof startCurrentArcadeGame === 'function' ? startCurrentArcadeGame : () => {};
window.restartFromGameOver = typeof restartFromGameOver === 'function' ? restartFromGameOver : () => {};
window.adjustActiveGameStage = typeof adjustActiveGameStage === 'function' ? adjustActiveGameStage : () => {};
window.runCoach = typeof runCoach === 'function' ? runCoach : () => {};
window.saveSettings = typeof saveSettings === 'function' ? saveSettings : () => {};
window.backup = typeof backup === 'function' ? backup : () => {};
window.toggleTheme = typeof toggleTheme === 'function' ? toggleTheme : () => {};
window.logout = typeof logout === 'function' ? logout : () => {};
window.showCustomLessonModal = typeof showCustomLessonModal === 'function' ? showCustomLessonModal : () => {};
window.closeCustomLessonModal = typeof closeCustomLessonModal === 'function' ? closeCustomLessonModal : () => {};
window.submitCustomLessonForm = typeof submitCustomLessonForm === 'function' ? submitCustomLessonForm : () => {};
window.createCustomLesson = typeof createCustomLesson === 'function' ? createCustomLesson : () => {};
window.deleteCustomLesson = typeof deleteCustomLesson === 'function' ? deleteCustomLesson : () => {};
window.inspectHeatmapKey = typeof inspectHeatmapKey === 'function' ? inspectHeatmapKey : () => {};
window.startAdaptiveDrill = typeof startAdaptiveDrill === 'function' ? startAdaptiveDrill : () => {};
window.testAudioFeedback = typeof testAudioFeedback === 'function' ? testAudioFeedback : () => {};
window.selectParagraph = typeof selectParagraph === 'function' ? selectParagraph : () => {};
window.shuffleParagraph = typeof shuffleParagraph === 'function' ? shuffleParagraph : () => {};
window.focusTypingInput = typeof focusTypingInput === 'function' ? focusTypingInput : () => {};
window.openCommandPalette = typeof openCommandPalette === 'function' ? openCommandPalette : () => {};
window.closeCommandPalette = typeof closeCommandPalette === 'function' ? closeCommandPalette : () => {};
window.openExitModal = typeof openExitModal === 'function' ? openExitModal : () => {};
window.closeExitModal = typeof closeExitModal === 'function' ? closeExitModal : () => {};
window.handleCommandSearch = typeof handleCommandSearch === 'function' ? handleCommandSearch : () => {};
window.executeCommand = typeof executeCommand === 'function' ? executeCommand : () => {};

function testAudioFeedback() {
    playKeySound('click');
    setTimeout(() => playKeySound('beep'), 180);
    toast('Playing mechanical click and soft tone audio.');
}

// Bulletproof Multi-Stage Desktop Lifecycle Boot
let bootAttempts = 0;

async function boot() {
    if (window._booted) return;
    try {
        const b = await api('get_bootstrap');
        window._booted = true;
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
        console.error("Boot error:", e);
        if (typeof renderError === 'function') {
            renderError(e.message || String(e));
        } else {
            renderAuth();
        }
    }
}

function pollBoot() {
    if (window._booted) return;
    if (window.pywebview?.api) {
        boot();
    } else if (bootAttempts < 30) {
        bootAttempts++;
        setTimeout(pollBoot, 60);
    } else {
        // Fallback to auth screen if bridge is delayed
        applyTheme();
        if (!state.user) renderAuth();
    }
}

window.addEventListener('pywebviewready', () => {
    boot();
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', pollBoot);
} else {
    pollBoot();
}
