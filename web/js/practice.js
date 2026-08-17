function renderPractice() {
    const l = state.selectedLesson || state.progress[0] || state.lessons[0];
    if (!l) {
        app.innerHTML = layout('<div class="empty">No lesson content is available.</div>', 'Practice');
        return;
    }
    
    if (!state.practice || state.practice.lessonId !== l.id) {
        state.practice = { lessonId: l.id, prompt: l.content, started: null, finished: false, backspaces: 0 };
    }
    
    const row1 = 'QWERTYUIOP'.split('').map(k => `<span class="keycap" data-key="${k.toLowerCase()}">${k}</span>`).join('');
    const row2 = 'ASDFGHJKL'.split('').map(k => `<span class="keycap" data-key="${k.toLowerCase()}">${k}</span>`).join('');
    const row3 = 'ZXCVBNM'.split('').map(k => `<span class="keycap" data-key="${k.toLowerCase()}">${k}</span>`).join('');

    const content = `
        <div class="practice">
            <div class="practice-header">
                <div class="practice-title">
                    <div class="eyebrow">Lesson ${l.level} • ${esc(l.focus_keys || 'typing')}</div>
                    <h1>${esc(l.title)}</h1>
                    <div class="subtitle">${esc(l.description)}</div>
                </div>
                <div>
                    <button class="button button-ghost button-small" onclick="resetPractice()">Reset</button>
                </div>
            </div>
            
            <div class="practice-metrics">
                <div class="practice-metric"><span>WPM</span><strong id="live-wpm">0</strong></div>
                <div class="practice-metric"><span>Accuracy</span><strong id="live-accuracy">100%</strong></div>
                <div class="practice-metric"><span>Errors</span><strong id="live-errors">0</strong></div>
                <div class="practice-metric"><span>Time</span><strong id="live-time">0.0s</strong></div>
            </div>
            
            <div id="prompt" class="prompt"></div>
            <textarea id="typingInput" spellcheck="false" autocomplete="off" autocapitalize="off" placeholder="Start typing the passage here..."></textarea>
            
            <section class="card keyboard-card">
                <div class="section-head">
                    <div>
                        <h2>Keyboard map</h2>
                        <p>Visual reference for the current exercise</p>
                    </div>
                </div>
                <div class="keyboard-row">${row1}</div>
                <div class="keyboard-row">${row2}</div>
                <div class="keyboard-row">${row3}</div>
                <div class="keyboard-row">
                    <span class="keycap wide" data-key="shift">SHIFT</span>
                    <span class="keycap space" data-key="space">SPACE</span>
                    <span class="keycap wide" data-key="enter">ENTER</span>
                </div>
            </section>
            
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px">
                <span class="subtitle">Accuracy first. Speed follows clean repetitions.</span>
                <button class="button button-primary" onclick="finishPractice(true)">Finish & save</button>
            </div>
        </div>
    `;
    
    app.innerHTML = layout(content, 'Practice', 'Focused typing practice with immediate local performance feedback.');
    setupTyping();
}

function setupTyping() {
    const input = document.getElementById('typingInput');
    const prompt = document.getElementById('prompt');
    const text = state.practice.prompt;
    
    const paint = typed => {
        prompt.innerHTML = [...text].map((ch, i) => {
            const status = i < typed.length ? (typed[i] === ch ? 'done' : 'bad') : i === typed.length ? 'current' : 'pending';
            return `<span class="${status}">${ch === ' ' ? '·' : esc(ch)}</span>`;
        }).join('');
    };
    
    paint('');
    state.practice.timing = [];
    let lastKeyTime = null;
    
    input.onkeydown = e => {
        let keySelector = e.key.toLowerCase();
        if (e.code === 'Space') keySelector = 'space';
        if (e.code === 'Enter') keySelector = 'enter';
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keySelector = 'shift';
        
        const keycap = document.querySelector(`.keycap[data-key="${keySelector}"]`);
        if (keycap) {
            keycap.classList.add('active');
            setTimeout(() => keycap.classList.remove('active'), 150);
        }
        
        if (e.key === 'Backspace') state.practice.backspaces++;
        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            const now = performance.now();
            state.practice.timing.push({
                key: e.key,
                latency: lastKeyTime ? now - lastKeyTime : 0,
                timestamp: now
            });
            lastKeyTime = now;
        }
    };
    
    input.oninput = () => {
        const typed = input.value;
        if (!state.practice.started) state.practice.started = performance.now();
        
        paint(typed);
        let correct = 0, errors = 0;
        const counts = {};
        
        for (let i = 0; i < typed.length; i++) {
            if (typed[i] === text[i]) {
                correct++;
            } else {
                errors++;
                const expected = text[i] || '';
                if (expected) counts[expected] = (counts[expected] || 0) + 1;
            }
        }
        
        const elapsed = Math.max(0.25, (performance.now() - state.practice.started) / 1000);
        const wpm = (correct / 5) / (elapsed / 60);
        const acc = typed.length ? (correct / typed.length) * 100 : 100;
        
        document.getElementById('live-wpm').textContent = isFinite(wpm) ? Math.round(wpm) : 0;
        document.getElementById('live-accuracy').textContent = acc.toFixed(1) + '%';
        document.getElementById('live-errors').textContent = errors;
        document.getElementById('live-time').textContent = elapsed.toFixed(1) + 's';
        
        if (typed.length >= text.length) {
            finishPractice(false, {
                duration_seconds: elapsed,
                total_chars: typed.length,
                correct_chars: correct,
                incorrect_chars: errors,
                wpm,
                accuracy: acc,
                errors: Object.entries(counts).map(([expected, count]) => ({ expected, actual: '?', count }))
            });
        }
    };
    
    setTimeout(() => input.focus(), 80);
}

async function finishPractice(manual = true, metrics = null) {
    if (state.practice.finished) return;
    const input = document.getElementById('typingInput');
    if (!input) return;
    
    const text = state.practice.prompt;
    const typed = input.value;
    let correct = 0, incorrect = 0;
    const counts = {};
    
    for (let i = 0; i < typed.length; i++) {
        if (typed[i] === text[i]) correct++;
        else {
            incorrect++;
            const expected = text[i] || '';
            if (expected) counts[expected] = (counts[expected] || 0) + 1;
        }
    }
    
    const elapsed = metrics?.duration_seconds || (state.practice.started ? Math.max(0.25, (performance.now() - state.practice.started) / 1000) : 0);
    if (!elapsed && !typed.length) {
        toast('Type a few characters before saving.');
        return;
    }
    
    const wpm = metrics?.wpm || ((correct / 5) / (elapsed / 60));
    const accuracy = metrics?.accuracy ?? (typed.length ? (correct / typed.length) * 100 : 100);
    
    state.practice.finished = true;
    try {
        const result = await api('save_session', {
            lesson_id: state.practice.lessonId,
            duration_seconds: elapsed,
            total_chars: typed.length,
            correct_chars: correct,
            incorrect_chars: incorrect,
            backspaces: state.practice.backspaces,
            wpm,
            accuracy,
            text_prompt: text,
            errors: Object.entries(counts).map(([expected, count]) => ({ expected, actual: '?', count })),
            timing: state.practice.timing || []
        });
        
        state.dashboard = result.dashboard;
        state.progress = await api('progress');
        toast(`Saved ${Math.round(wpm)} WPM • ${accuracy.toFixed(1)}% accuracy`);
        if (manual) setTimeout(() => go('dashboard'), 450);
    } catch (e) {
        state.practice.finished = false;
        toast(e.message || String(e));
    }
}

function resetPractice() {
    state.practice = null;
    renderPractice();
}
