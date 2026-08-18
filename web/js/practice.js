function renderPractice() {
    const l = state.selectedLesson || state.progress[0] || state.lessons[0];
    if (!l) {
        app.innerHTML = layout('<div class="empty">No lesson content is available.</div>', 'Practice');
        return;
    }

    // Ensure prompt content is resolved safely from any fallback
    const rawContent = l.content || (state.lessons.find(x => x.id === l.id)?.content) || "The quick brown fox jumps over the lazy dog.";
    const paragraphs = rawContent.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

    // Initialize practice state if switching lessons
    if (!state.practice || state.practice.lessonId !== l.id) {
        state.practice = {
            lessonId: l.id,
            paragraphs: paragraphs.length > 0 ? paragraphs : [rawContent],
            paragraphIndex: 0,
            prompt: paragraphs[0] || rawContent,
            started: null,
            finished: false,
            backspaces: 0,
            timing: []
        };
    }

    const currentPrompt = state.practice.prompt || rawContent;
    const currentParaIdx = state.practice.paragraphIndex;
    const totalParas = state.practice.paragraphs.length;

    // Build paragraph selector tabs if multiple paragraphs exist
    let passageTabsHtml = '';
    if (totalParas > 1) {
        const tabs = state.practice.paragraphs.map((_, idx) => `
            <button class="passage-tab ${currentParaIdx === idx ? 'active' : ''}" onclick="selectParagraph(${idx})">
                ¶ Passage ${idx + 1}
            </button>
        `).join('');

        passageTabsHtml = `
            <div class="passage-tabs">
                <span style="font-size:12px;color:var(--muted);font-weight:700;margin-right:4px">Passages:</span>
                <button class="passage-tab ${currentParaIdx === 'all' ? 'active' : ''}" onclick="selectParagraph('all')">
                    ¶ Full Text (${totalParas} parts)
                </button>
                ${tabs}
                <button class="passage-tab" onclick="shuffleParagraph()">
                    🎲 Shuffle
                </button>
            </div>
        `;
    }

    const row0 = '1234567890-='.split('').map(k => `<span class="keycap" data-key="${k}">${k}</span>`).join('');
    const row1 = 'QWERTYUIOP'.split('').map(k => `<span class="keycap" data-key="${k.toLowerCase()}">${k}</span>`).join('');
    const row2 = 'ASDFGHJKL;\''.split('').map(k => `<span class="keycap" data-key="${k.toLowerCase()}">${k}</span>`).join('');
    const row3 = 'ZXCVBNM,./'.split('').map(k => `<span class="keycap" data-key="${k.toLowerCase()}">${k}</span>`).join('');

    const bpm = Number(state.settings?.metronome_bpm || 0);
    const soundMode = state.settings?.sound_enabled || 'off';
    const isCustom = Boolean(l.is_custom);

    const content = `
        <div class="practice">
            <div class="practice-header">
                <div class="practice-title">
                    <div class="eyebrow" style="display:flex;align-items:center;gap:8px">
                        <span>${isCustom ? 'Custom Practice' : `Level ${l.level}`} • ${esc(l.focus_keys || 'typing')}</span>
                        ${isCustom ? '<span class="custom-badge">CUSTOM</span>' : ''}
                        ${bpm > 0 ? `<span class="audio-status-pill"><span id="metronomePulse" class="metronome-pulse">●</span> ${bpm} BPM</span>` : ''}
                        ${soundMode !== 'off' ? `<span class="audio-status-pill">🔊 ${soundMode}</span>` : ''}
                    </div>
                    <h1>${esc(l.title)}</h1>
                    <div class="subtitle">${esc(l.description || 'Focus on clean finger movements and smooth rhythm.')}</div>
                </div>
                <div style="display:flex;gap:8px">
                    <button class="button button-ghost button-small" onclick="resetPractice()">Reset</button>
                    ${isCustom ? `<button class="button button-ghost button-small" style="color:var(--danger)" onclick="deleteCustomLesson(${l.id})">Delete</button>` : ''}
                </div>
            </div>

            <div class="practice-metrics">
                <div class="practice-metric"><span>WPM</span><strong id="live-wpm">0</strong></div>
                <div class="practice-metric"><span>Accuracy</span><strong id="live-accuracy">100%</strong></div>
                <div class="practice-metric"><span>Errors</span><strong id="live-errors">0</strong></div>
                <div class="practice-metric"><span>Time</span><strong id="live-time">0.0s</strong></div>
            </div>

            ${passageTabsHtml}

            <div class="focus-banner" id="focusBanner" onclick="document.getElementById('typingInput')?.focus()">
                ⌨️ Click here or press any key to start typing
            </div>

            <div id="prompt" class="prompt" onclick="focusTypingInput()" style="cursor:text"></div>
            <textarea id="typingInput" spellcheck="false" autocomplete="off" autocapitalize="off"></textarea>

            <section class="card keyboard-card">
                <div class="section-head">
                    <div>
                        <h2>Visual Keyboard Guide</h2>
                        <p>Dynamic keycap highlights with Shift indicator</p>
                    </div>
                </div>
                <div class="keyboard-row">${row0}</div>
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

function selectParagraph(idx) {
    if (!state.practice) return;
    stopMetronome();
    state.practice.paragraphIndex = idx;
    if (idx === 'all') {
        state.practice.prompt = state.practice.paragraphs.join('\n\n');
    } else {
        state.practice.prompt = state.practice.paragraphs[idx] || state.practice.paragraphs[0];
    }
    state.practice.started = null;
    state.practice.finished = false;
    state.practice.timing = [];
    state.practice.backspaces = 0;
    renderPractice();
}

function shuffleParagraph() {
    if (!state.practice || !state.practice.paragraphs) return;
    const paras = state.practice.paragraphs;
    const nextIdx = (typeof state.practice.paragraphIndex === 'number' ? (state.practice.paragraphIndex + 1) : 0) % paras.length;
    selectParagraph(nextIdx);
}

function focusTypingInput() {
    const input = document.getElementById('typingInput');
    const prompt = document.getElementById('prompt');
    const banner = document.getElementById('focusBanner');
    if (input) {
        input.focus();
        if (prompt) prompt.classList.add('focused');
        if (banner) banner.style.display = 'none';
    }
}

function setupTyping() {
    const input = document.getElementById('typingInput');
    const prompt = document.getElementById('prompt');
    const banner = document.getElementById('focusBanner');
    if (!input || !prompt || !state.practice) return;

    const text = state.practice.prompt || "The quick brown fox jumps over the lazy dog.";

    const paint = typed => {
        // Build word-level wrapped markup for clean visual structure
        let charIndex = 0;
        const paragraphs = text.split('\n');
        let html = '';

        paragraphs.forEach((pText, pIdx) => {
            const words = pText.split(' ');
            words.forEach((w, wIdx) => {
                html += '<span class="word">';
                for (let c = 0; c < w.length; c++) {
                    const ch = w[c];
                    const i = charIndex;
                    const status = i < typed.length ? (typed[i] === ch ? 'done' : 'bad') : i === typed.length ? 'current' : 'pending';
                    html += `<span class="${status}">${esc(ch)}</span>`;
                    charIndex++;
                }

                // If space follows the word within the same paragraph
                if (wIdx < words.length - 1) {
                    const i = charIndex;
                    const status = i < typed.length ? (typed[i] === ' ' ? 'done' : 'bad') : i === typed.length ? 'current' : 'pending';
                    html += `<span class="${status}">·</span>`;
                    charIndex++;
                }
                html += '</span>';
            });

            // If newline follows paragraph
            if (pIdx < paragraphs.length - 1) {
                const i = charIndex;
                const status = i < typed.length ? (typed[i] === '\n' ? 'done' : 'bad') : i === typed.length ? 'current' : 'pending';
                html += `<span class="${status} paragraph-break"></span>`;
                charIndex++;
            }
        });

        prompt.innerHTML = html;

        // Auto-scroll prompt if content is tall
        const activeChar = prompt.querySelector('.current');
        if (activeChar) {
            activeChar.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }

        // Highlight virtual keyboard key
        document.querySelectorAll('.keycap.next').forEach(el => el.classList.remove('next'));

        const nextChar = text[typed.length];
        if (nextChar) {
            const isUpper = /[A-Z]/.test(nextChar);
            const isShiftSymbol = '~_+{}|:"<>?!@#$%^&*()'.includes(nextChar);

            if (isUpper || isShiftSymbol) {
                const shiftKey = document.querySelector(`.keycap[data-key="shift"]`);
                if (shiftKey) shiftKey.classList.add('next');
            }

            const shiftMap = {
                '~':'`', '_':'-', '+':'=', '{':'[', '}':']', '|':'\\\\', ':':';', '"':"'", '<':',', '>':'.', '?':'/',
                '!':'1', '@':'2', '#':'3', '$':'4', '%':'5', '^':'6', '&':'7', '*':'8', '(':'9', ')':'0'
            };
            const mappedKey = shiftMap[nextChar] || nextChar.toLowerCase();

            let keySelector = mappedKey;
            if (nextChar === ' ') keySelector = 'space';
            else if (nextChar === '\n') keySelector = 'enter';

            const keycap = document.querySelector(`.keycap[data-key="${keySelector}"]`);
            if (keycap) keycap.classList.add('next');
        }
    };

    paint('');
    state.practice.timing = [];
    let lastKeyTime = null;

    input.onfocus = () => {
        if (prompt) prompt.classList.add('focused');
        if (banner) banner.style.display = 'none';
    };

    input.onblur = () => {
        if (prompt) prompt.classList.remove('focused');
        if (banner && !state.practice.started) banner.style.display = 'block';
    };

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

        // Web Audio Feedback
        if (e.key.length === 1 || e.code === 'Space' || e.code === 'Enter' || e.key === 'Backspace') {
            playKeySound('click');
        }

        if (e.key === 'Backspace') state.practice.backspaces++;
        if ((e.key.length === 1 || e.key === 'Enter') && !e.ctrlKey && !e.altKey && !e.metaKey) {
            const now = performance.now();
            state.practice.timing.push({
                key: e.key === 'Enter' ? '\n' : e.key,
                latency: lastKeyTime ? now - lastKeyTime : 0,
                timestamp: now
            });
            lastKeyTime = now;
        }
    };

    input.oninput = () => {
        const typed = input.value;
        if (!state.practice.started) {
            state.practice.started = performance.now();
            const bpm = Number(state.settings?.metronome_bpm || 0);
            if (bpm > 0) startMetronome(bpm);
        }

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

        const wpmEl = document.getElementById('live-wpm');
        const accEl = document.getElementById('live-accuracy');
        const errEl = document.getElementById('live-errors');
        const timeEl = document.getElementById('live-time');

        if (wpmEl) wpmEl.textContent = isFinite(wpm) ? Math.round(wpm) : 0;
        if (accEl) accEl.textContent = acc.toFixed(1) + '%';
        if (errEl) errEl.textContent = errors;
        if (timeEl) timeEl.textContent = elapsed.toFixed(1) + 's';

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

    // Global keydown fallback so pressing any letter automatically focuses and types
    window.onkeydown = e => {
        if (state.route === 'practice' && document.activeElement !== input) {
            if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1) {
                input.focus();
            }
        }
    };

    setTimeout(() => focusTypingInput(), 100);
}

async function finishPractice(manual = true, metrics = null) {
    if (!state.practice || state.practice.finished) return;
    stopMetronome();
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
        state.streak_stats = result.streak_stats;
        state.progress = await api('progress');
        toast(`Saved ${Math.round(wpm)} WPM • ${accuracy.toFixed(1)}% accuracy`);
        if (manual) setTimeout(() => go('dashboard'), 450);
    } catch (e) {
        state.practice.finished = false;
        toast(e.message || String(e));
    }
}

function resetPractice() {
    stopMetronome();
    if (state.practice) {
        state.practice.started = null;
        state.practice.finished = false;
        state.practice.timing = [];
        state.practice.backspaces = 0;
    }
    renderPractice();
}
