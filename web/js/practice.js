// ==========================================================================
// KeyFlow Practice Studio Engine
// ==========================================================================

let paceInterval = null;

function renderPractice() {
    const l = state.selectedLesson || state.progress[0] || state.lessons[0];
    if (!l) {
        app.innerHTML = layout('<div class="empty">No lesson content available.</div>', 'Practice');
        return;
    }

    const rawContent = l.content || (state.lessons.find(x => x.id === l.id)?.content) || "The quick brown fox jumps over the lazy dog.";
    const paragraphs = rawContent.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

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

    let passageTabsHtml = '';
    if (totalParas > 1) {
        const tabs = state.practice.paragraphs.map((_, idx) => `
            <button class="passage-tab-btn ${currentParaIdx === idx ? 'active' : ''}" onclick="selectParagraph(${idx})">
                Passage ${idx + 1}
            </button>
        `).join('');

        passageTabsHtml = `
            <div class="passage-tabs-row">
                <span style="font-size:11.5px;color:var(--text-muted);font-weight:700;margin-right:4px">Sections:</span>
                <button class="passage-tab-btn ${currentParaIdx === 'all' ? 'active' : ''}" onclick="selectParagraph('all')">
                    Full Text (${totalParas})
                </button>
                ${tabs}
                <button class="passage-tab-btn" onclick="shuffleParagraph()" title="Switch passage">
                    🎲 Shuffle
                </button>
            </div>
        `;
    }

    const row0 = '1234567890-='.split('').map(k => `<div class="keycap" data-key="${k}">${k}</div>`).join('');
    const row1 = 'QWERTYUIOP'.split('').map(k => `<div class="keycap" data-key="${k.toLowerCase()}">${k}</div>`).join('');
    const row2 = 'ASDFGHJKL;\''.split('').map(k => `<div class="keycap" data-key="${k.toLowerCase()}">${k}</div>`).join('');
    const row3 = 'ZXCVBNM,./'.split('').map(k => `<div class="keycap" data-key="${k.toLowerCase()}">${k}</div>`).join('');

    const bpm = Number(state.settings?.metronome_bpm || 0);
    const soundMode = state.settings?.sound_enabled || 'off';
    const isCustom = Boolean(l.is_custom);
    const isMaster = Boolean(l.strict_mode);
    const isBlind = Boolean(l.blind_mode);
    const targetWpm = Number(l.target_wpm) || 0;

    const content = `
        <div class="practice-studio">
            <div class="studio-header">
                <div class="studio-title-block">
                    <h1>${esc(l.title)}</h1>
                    <div class="mode-badges-row">
                        <span class="badge ${isCustom ? 'badge-purple' : 'badge-brand'}">
                            ${isCustom ? '★ Custom Drill' : `Level ${l.level || 'Adaptive'}`} • ${esc(l.focus_keys || 'Core Technique')}
                        </span>
                        ${isMaster ? '<span class="badge badge-danger">🔒 MASTER MODE (0 Typos Allowed)</span>' : ''}
                        ${isBlind ? '<span class="badge badge-purple">👁️ BLIND MODE (Tactile Focus)</span>' : ''}
                        ${bpm > 0 ? `<span class="badge badge-brand"><span id="metronomePulse" class="metronome-pulse"></span> ${bpm} BPM Pace</span>` : ''}
                        ${soundMode !== 'off' ? `<span class="badge">🔊 Audio: ${soundMode}</span>` : ''}
                        ${Boolean(state.settings?.block_backspace) ? '<span class="badge badge-warning">🔒 Strict Backspace</span>' : ''}
                    </div>
                </div>
                <div style="display:flex;gap:8px">
                    <button class="btn btn-secondary btn-sm" onclick="resetPractice()" title="Restart practice (Tab + Enter)">
                        ↺ Restart
                    </button>
                    ${isCustom ? `<button class="btn btn-ghost btn-sm" style="color:var(--accent-rose)" onclick="deleteCustomLesson(${l.id})">Delete</button>` : ''}
                </div>
            </div>

            <div class="live-telemetry-hud">
                <div class="live-hud-stat">
                    <span class="live-hud-label">Speed</span>
                    <span class="live-hud-value" id="live-wpm">0 <small style="font-size:12px;font-weight:600;color:var(--text-muted)">WPM</small></span>
                </div>
                <div class="live-hud-stat">
                    <span class="live-hud-label">Accuracy</span>
                    <span class="live-hud-value acc-green" id="live-accuracy">100%</span>
                </div>
                <div class="live-hud-stat">
                    <span class="live-hud-label">Errors</span>
                    <span class="live-hud-value" id="live-errors" style="color:var(--text-muted)">0</span>
                </div>
                <div class="live-hud-stat">
                    <span class="live-hud-label">Elapsed</span>
                    <span class="live-hud-value" id="live-time">0.0s</span>
                </div>
            </div>

            ${passageTabsHtml}

            <div class="typing-canvas-wrapper" id="canvasWrapper" onclick="focusTypingInput()">
                <div id="prompt" class="prompt ${isBlind ? 'blind-mode' : ''}"></div>
                <textarea id="typingInput" spellcheck="false" autocomplete="off" autocapitalize="off" style="position:absolute;opacity:0;pointer-events:none;left:-9999px"></textarea>
            </div>

            <div class="keyboard-section">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                    <span style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em">
                        Mechanical Keyboard Guide
                    </span>
                    <span style="font-size:11px;color:var(--text-muted)">Tab + Enter to instant restart</span>
                </div>
                <div class="keyboard-rows-container">
                    <div class="keyboard-row">${row0}</div>
                    <div class="keyboard-row">${row1}</div>
                    <div class="keyboard-row">${row2}</div>
                    <div class="keyboard-row">${row3}</div>
                    <div class="keyboard-row">
                        <div class="keycap wide" data-key="shift">SHIFT</div>
                        <div class="keycap space" data-key="space">SPACEBAR</div>
                        <div class="keycap wide" data-key="enter">ENTER</div>
                    </div>
                </div>
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center">
                <span style="font-size:12px;color:var(--text-muted)">Press any key to engage typing mode. Zero cloud latency.</span>
                <button class="btn btn-primary" onclick="finishPractice(true)">Complete & Save Session</button>
            </div>
        </div>
    `;

    app.innerHTML = layout(content, 'Practice Studio', 'High-density typing canvas with sub-millisecond local telemetry.');
    setupTyping();
}

function selectParagraph(idx) {
    if (!state.practice) return;
    stopMetronome();
    if (paceInterval) clearInterval(paceInterval);
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
    const wrapper = document.getElementById('canvasWrapper');
    if (input) {
        input.focus();
        if (wrapper) wrapper.classList.add('focused');
    }
}

function setupTyping() {
    const input = document.getElementById('typingInput');
    const prompt = document.getElementById('prompt');
    const wrapper = document.getElementById('canvasWrapper');
    if (!input || !prompt || !state.practice) return;

    const text = state.practice.prompt || "The quick brown fox jumps over the lazy dog.";
    const isMaster = Boolean(state.selectedLesson?.strict_mode);
    const targetWpm = Number(state.selectedLesson?.target_wpm) || 0;

    const paint = typed => {
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

                if (wIdx < words.length - 1) {
                    const i = charIndex;
                    const status = i < typed.length ? (typed[i] === ' ' ? 'done' : 'bad') : i === typed.length ? 'current' : 'pending';
                    html += `<span class="${status}">·</span>`;
                    charIndex++;
                }
                html += '</span>';
            });

            if (pIdx < paragraphs.length - 1) {
                const i = charIndex;
                const status = i < typed.length ? (typed[i] === '\n' ? 'done' : 'bad') : i === typed.length ? 'current' : 'pending';
                html += `<span class="${status} paragraph-break"></span>`;
                charIndex++;
            }
        });

        if (targetWpm > 0) {
            html += `<div id="paceCaret" class="pace-caret"></div>`;
        }

        prompt.innerHTML = html;

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
        if (wrapper) wrapper.classList.add('focused');
    };

    input.onblur = () => {
        if (wrapper) wrapper.classList.remove('focused');
    };

    input.onkeydown = e => {
        let keySelector = e.key.toLowerCase();
        if (e.code === 'Space') keySelector = 'space';
        if (e.code === 'Enter') keySelector = 'enter';
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keySelector = 'shift';

        const keycap = document.querySelector(`.keycap[data-key="${keySelector}"]`);
        if (keycap) {
            keycap.classList.add('active');
            setTimeout(() => keycap.classList.remove('active'), 120);
        }

        if (e.key === 'Backspace') {
            if (Boolean(state.settings?.block_backspace) || isMaster) {
                e.preventDefault();
                playKeySound('beep');
                toast('🔒 Backspace is blocked in Strict / Master Mode!');
                return;
            }
            state.practice.backspaces++;
        }

        if ((e.key.length === 1 || e.key === 'Enter') && !e.ctrlKey && !e.altKey && !e.metaKey) {
            const now = performance.now();
            playKeySound('click');
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

            if (targetWpm > 0) {
                const charsPerSec = (targetWpm * 5) / 60;
                paceInterval = setInterval(() => {
                    if (state.practice.finished) {
                        clearInterval(paceInterval);
                        return;
                    }
                    const elapsed = (performance.now() - state.practice.started) / 1000;
                    const expectedIdx = Math.floor(elapsed * charsPerSec);
                    const caret = document.getElementById('paceCaret');
                    const spans = prompt.querySelectorAll('span:not(.word)');
                    if (caret && expectedIdx < spans.length) {
                        const targetSpan = spans[expectedIdx];
                        if (targetSpan) {
                            caret.style.left = targetSpan.offsetLeft + 'px';
                            caret.style.top = targetSpan.offsetTop + 'px';
                        }
                    }
                }, 80);
            }
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

                if (isMaster) {
                    if (paceInterval) clearInterval(paceInterval);
                    finishPractice(false, {
                        duration_seconds: (performance.now() - state.practice.started) / 1000,
                        total_chars: typed.length,
                        correct_chars: correct,
                        incorrect_chars: errors,
                        wpm: 0,
                        accuracy: (correct / typed.length) * 100,
                        errors: Object.entries(counts).map(([expected, count]) => ({ expected, actual: '?', count }))
                    });
                    toast("🔒 MASTER MODE FAILED: Immediate penalty triggered on typo!", "error");
                    return;
                }
            }
        }

        const elapsed = Math.max(0.25, (performance.now() - state.practice.started) / 1000);
        const wpm = (correct / 5) / (elapsed / 60);
        const acc = typed.length ? (correct / typed.length) * 100 : 100;

        const wpmEl = document.getElementById('live-wpm');
        const accEl = document.getElementById('live-accuracy');
        const errEl = document.getElementById('live-errors');
        const timeEl = document.getElementById('live-time');

        if (wpmEl) wpmEl.innerHTML = `${isFinite(wpm) ? Math.round(wpm) : 0} <small style="font-size:12px;font-weight:600;color:var(--text-muted)">WPM</small>`;
        if (accEl) {
            accEl.textContent = acc.toFixed(1) + '%';
            accEl.className = 'live-hud-value ' + (acc >= 97 ? 'acc-green' : acc >= 90 ? 'acc-yellow' : 'acc-red');
        }
        if (errEl) {
            errEl.textContent = errors;
            errEl.style.color = errors > 0 ? 'var(--accent-rose)' : 'var(--text-muted)';
        }
        if (timeEl) timeEl.textContent = elapsed.toFixed(1) + 's';

        if (typed.length >= text.length) {
            if (paceInterval) clearInterval(paceInterval);
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

    window.onkeydown = e => {
        if (state.route === 'practice' && document.activeElement !== input) {
            // Tab + Enter to restart
            if (e.key === 'Tab') {
                // let default behavior or catch
            }
            if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1) {
                input.focus();
            }
        }
    };

    setTimeout(() => focusTypingInput(), 80);
}

async function finishPractice(manual = true, metrics = null) {
    if (!state.practice || state.practice.finished) return;
    stopMetronome();
    if (paceInterval) clearInterval(paceInterval);
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

    const wpm = metrics?.wpm ?? ((correct / 5) / (elapsed / 60));
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
        toast(`Session Saved: ${Math.round(wpm)} WPM • ${accuracy.toFixed(1)}% Accuracy`);
        if (manual) setTimeout(() => go('dashboard'), 400);
    } catch (e) {
        state.practice.finished = false;
        toast(e.message || String(e));
    }
}

function resetPractice() {
    stopMetronome();
    if (paceInterval) clearInterval(paceInterval);
    if (state.practice) {
        state.practice.started = null;
        state.practice.finished = false;
        state.practice.timing = [];
        state.practice.backspaces = 0;
    }
    renderPractice();
}
