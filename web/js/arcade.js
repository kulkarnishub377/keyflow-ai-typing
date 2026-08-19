// ==========================================================================
// KeyFlow Cyber Matrix: Adaptive Orbital Defense Arcade Studio (60 FPS)
// ==========================================================================

let arcadeGame = null;

function renderArcade() {
    const highScore = Number(localStorage.getItem('kf_arcade_high_score') || 0);

    const content = `
        <div class="arcade-studio-layout">
            <div class="arcade-hud-bar">
                <div class="arcade-hud-left">
                    <div class="arcade-title-tag">
                        <span class="pulse-radar"></span> CYBER MATRIX // ORBITAL DEFENSE
                    </div>
                    <div class="arcade-wave-pill" id="arcadeWaveDisplay">
                        WAVE 1
                    </div>
                </div>

                <div class="arcade-hud-center">
                    <div class="arcade-stat-group">
                        <span class="arcade-stat-lbl">COMBAT SCORE</span>
                        <span class="arcade-stat-val" id="arcadeScoreDisplay">000,000</span>
                    </div>
                    <div class="arcade-stat-group">
                        <span class="arcade-stat-lbl">MULTIPLIER</span>
                        <span class="arcade-stat-val text-brand" id="arcadeMultiplierDisplay">1.0x</span>
                    </div>
                    <div class="arcade-stat-group">
                        <span class="arcade-stat-lbl">STREAK</span>
                        <span class="arcade-stat-val text-green" id="arcadeStreakDisplay">0</span>
                    </div>
                </div>

                <div class="arcade-hud-right">
                    <div class="arcade-shield-container">
                        <span class="arcade-stat-lbl">SHIELD INTEGRITY</span>
                        <div class="arcade-shield-cells" id="arcadeShieldCells">
                            <span class="shield-cell active"></span>
                            <span class="shield-cell active"></span>
                            <span class="shield-cell active"></span>
                        </div>
                    </div>
                    <div class="arcade-emp-container" id="arcadeEmpContainer" title="Charge at 10 streak — Press SPACE to blast">
                        <span class="arcade-stat-lbl">EMP BLAST</span>
                        <div class="emp-meter"><div class="emp-fill" id="arcadeEmpFill" style="width:0%"></div></div>
                    </div>
                </div>
            </div>

            <div class="arcade-canvas-wrapper" id="arcadeCanvasWrapper">
                <canvas id="arcadeCanvas"></canvas>
                
                <div class="arcade-overlay-start" id="arcadeStartOverlay">
                    <div class="arcade-modal-card">
                        <div style="font-size:44px;margin-bottom:8px">⚡</div>
                        <h1 style="font-family:'Outfit',sans-serif;font-size:28px;font-weight:900;letter-spacing:-0.03em">
                            CYBER MATRIX ORBITAL DEFENSE
                        </h1>
                        <p style="font-size:13.5px;color:var(--text-muted);margin:8px 0 20px;line-height:1.5">
                            Enemy word armadas are descending on the local neural orbital matrix. Type the highlighted characters to lock lasers and destroy threats. Procedural waves adapt to your real weakness telemetry.
                        </p>
                        <div style="display:flex;gap:12px;justify-content:center;margin-bottom:20px">
                            <span class="badge badge-brand">Weak-Key Armada</span>
                            <span class="badge badge-purple">Laser Beam Lock</span>
                            <span class="badge badge-warning">EMP Spacebar Blast</span>
                            <span class="badge badge-success">High Score: ${highScore.toLocaleString()}</span>
                        </div>
                        <button class="btn btn-primary btn-lg" onclick="startArcadeGame()">
                            ⚡ ENGAGE DEFENSE MATRIX
                        </button>
                    </div>
                </div>

                <div class="arcade-overlay-start" id="arcadeGameOverOverlay" style="display:none">
                    <div class="arcade-modal-card">
                        <div style="font-size:40px;margin-bottom:6px" id="gameOverIcon">💥</div>
                        <h2 style="font-family:'Outfit',sans-serif;font-size:26px;font-weight:900" id="gameOverTitle">
                            SHIELD BREACH DETECTED
                        </h2>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:18px 0;background:var(--surface-2);padding:14px;border-radius:var(--radius-md)">
                            <div>
                                <div style="font-size:11px;color:var(--text-muted);font-weight:800">FINAL SCORE</div>
                                <div style="font-size:22px;font-weight:900;color:var(--brand-light)" id="finalScoreVal">0</div>
                            </div>
                            <div>
                                <div style="font-size:11px;color:var(--text-muted);font-weight:800">WAVES DEFENDED</div>
                                <div style="font-size:22px;font-weight:900" id="finalWaveVal">1</div>
                            </div>
                            <div>
                                <div style="font-size:11px;color:var(--text-muted);font-weight:800">PEAK COMBAT WPM</div>
                                <div style="font-size:20px;font-weight:800;color:var(--accent-green)" id="finalWpmVal">0 WPM</div>
                            </div>
                            <div>
                                <div style="font-size:11px;color:var(--text-muted);font-weight:800">PRECISION ACCURACY</div>
                                <div style="font-size:20px;font-weight:800" id="finalAccVal">100%</div>
                            </div>
                        </div>
                        <div style="display:flex;gap:10px;justify-content:center">
                            <button class="btn btn-secondary" onclick="go('dashboard')">Return to Dashboard</button>
                            <button class="btn btn-primary" onclick="startArcadeGame()">↺ Play Again</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    app.innerHTML = layout(content, 'Arcade Matrix', 'High-adrenaline orbital defense typing combat.');
    initArcadeCanvas();
}

function initArcadeCanvas() {
    const canvas = document.getElementById('arcadeCanvas');
    const wrapper = document.getElementById('arcadeCanvasWrapper');
    if (!canvas || !wrapper) return;

    const resize = () => {
        canvas.width = wrapper.clientWidth || 980;
        canvas.height = wrapper.clientHeight || 560;
    };
    resize();
    window.addEventListener('resize', resize);
}

function startArcadeGame() {
    document.getElementById('arcadeStartOverlay').style.display = 'none';
    document.getElementById('arcadeGameOverOverlay').style.display = 'none';

    if (arcadeGame) arcadeGame.destroy();
    arcadeGame = new ArcadeEngine();
    arcadeGame.start();
}

// ==========================================================================
// Arcade Combat Engine Class
// ==========================================================================
class ArcadeEngine {
    constructor() {
        this.canvas = document.getElementById('arcadeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.running = false;
        this.wave = 1;
        this.score = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.shields = 3;
        this.empCharge = 0; // 0 to 10
        this.ships = [];
        this.particles = [];
        this.stars = [];
        this.activeTarget = null;
        this.laserBeam = null;
        this.screenShake = 0;

        // Telemetry tracking
        this.startTime = performance.now();
        this.lastKeyTime = null;
        this.totalKeystrokes = 0;
        this.correctKeystrokes = 0;
        this.errorCount = 0;
        this.errorMap = {};
        this.timingBlob = [];

        this.waveTotalShips = 6;
        this.waveSpawnedCount = 0;
        this.waveDestroyedCount = 0;
        this.lastSpawnTime = performance.now();
        this.spawnInterval = 2200;

        this.initStars();
        this.setupKeyboard();
    }

    initStars() {
        this.stars = [];
        for (let i = 0; i < 180; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 1.5 + 0.5,
                alpha: Math.random() * 0.8 + 0.2
            });
        }
    }

    getWeaknessWords() {
        const weakKeys = (state.dashboard?.weak_keys || []).map(x => x.expected_key.toLowerCase());
        const baseVocab = [
            "laser", "pulse", "matrix", "vector", "cyber", "orbit", "shield", "nexus",
            "quantum", "hyper", "warp", "plasma", "beacon", "turret", "falcon", "vortex",
            "glitch", "syntax", "system", "engine", "signal", "binary", "sensor", "energy",
            "defense", "command", "station", "station", "station", "station", "station", "station"
        ];

        // Synthesize targeted n-gram words for weak keys
        if (weakKeys.length > 0) {
            const targeted = [];
            weakKeys.forEach(k => {
                const syllables = ["tra", "zen", "kin", "vex", "pro", "syn", "arc", "ion", "pol", "tex"];
                syllables.forEach(s => targeted.push(`${k}${s}`, `${s}${k}`, `${k}o${s}`));
            });
            return [...baseVocab, ...targeted];
        }
        return baseVocab;
    }

    spawnShip() {
        const vocab = this.getWeaknessWords();
        let word = vocab[Math.floor(Math.random() * vocab.length)];
        if (this.wave > 3 && Math.random() < 0.25) {
            word = word + "_" + vocab[Math.floor(Math.random() * vocab.length)];
        }

        const isBoss = this.waveSpawnedCount === this.waveTotalShips - 1 && this.wave % 3 === 0;
        if (isBoss) word = "CYBER_OVERLORD_" + this.wave;

        const margin = 100;
        const x = Math.random() * (this.canvas.width - margin * 2) + margin;
        const speed = (28 + this.wave * 4.5) * (isBoss ? 0.6 : 1);

        this.ships.push({
            id: Math.random().toString(),
            word: word.toUpperCase(),
            typedIndex: 0,
            x: x,
            y: -20,
            speed: speed,
            isBoss: isBoss,
            hue: isBoss ? 340 : (Math.random() > 0.4 ? 240 : 180),
            size: isBoss ? 26 : 18
        });

        this.waveSpawnedCount++;
        this.lastSpawnTime = performance.now();
    }

    setupKeyboard() {
        this.keyHandler = e => {
            if (!this.running) return;

            // Spacebar for EMP blast
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.empCharge >= 10) {
                    this.triggerEmp();
                }
                return;
            }

            if (e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) return;
            const char = e.key.toUpperCase();
            const now = performance.now();
            const latency = this.lastKeyTime ? now - this.lastKeyTime : 0;
            this.lastKeyTime = now;
            this.totalKeystrokes++;

            // If we have an active target
            if (this.activeTarget) {
                const ship = this.ships.find(s => s.id === this.activeTarget);
                if (ship) {
                    const expected = ship.word[ship.typedIndex];
                    if (char === expected) {
                        this.hitCharacter(ship);
                        this.correctKeystrokes++;
                        this.timingBlob.push({ key: char, latency, timestamp: now });
                        return;
                    } else {
                        // Typo on active ship
                        this.missCharacter(expected, char);
                        return;
                    }
                } else {
                    this.activeTarget = null;
                }
            }

            // Find closest candidate starting with char
            const candidates = this.ships
                .filter(s => s.word[0] === char)
                .sort((a, b) => b.y - a.y); // nearest to base

            if (candidates.length > 0) {
                const target = candidates[0];
                this.activeTarget = target.id;
                this.hitCharacter(target);
                this.correctKeystrokes++;
                this.timingBlob.push({ key: char, latency, timestamp: now });
            } else {
                this.missCharacter('?', char);
            }
        };

        window.addEventListener('keydown', this.keyHandler);
    }

    hitCharacter(ship) {
        ship.typedIndex++;
        this.streak++;
        this.maxStreak = Math.max(this.maxStreak, this.streak);
        this.empCharge = Math.min(10, this.empCharge + 1);

        const multiplier = 1 + Math.min(4, Math.floor(this.streak / 6));
        this.score += 50 * multiplier;

        // Laser beam FX from turret to ship
        const turretX = this.canvas.width / 2;
        const turretY = this.canvas.height - 20;
        this.laserBeam = {
            fromX: turretX,
            fromY: turretY,
            toX: ship.x,
            toY: ship.y,
            alpha: 1.0,
            hue: ship.hue
        };

        playLaserSound(1 + (ship.typedIndex / ship.word.length) * 0.4);

        // Particle sparks at hit location
        this.addParticles(ship.x, ship.y, 4, ship.hue);

        // Word completed & destroyed
        if (ship.typedIndex >= ship.word.length) {
            this.destroyShip(ship);
        }

        this.updateHUD();
    }

    missCharacter(expected, actual) {
        this.streak = 0;
        this.errorCount++;
        this.errorMap[expected] = (this.errorMap[expected] || 0) + 1;
        this.activeTarget = null; // drop lock
        playShieldDamageSound();
        this.updateHUD();
    }

    destroyShip(ship) {
        this.activeTarget = null;
        this.waveDestroyedCount++;
        this.score += ship.word.length * 100 * (1 + Math.min(4, Math.floor(this.streak / 6)));

        // Big particle explosion
        this.addParticles(ship.x, ship.y, ship.isBoss ? 50 : 22, ship.hue);
        this.screenShake = ship.isBoss ? 16 : 6;
        playExplosionSound();

        if (this.streak % 5 === 0) {
            playComboChime(Math.min(5, Math.floor(this.streak / 5)));
        }

        this.ships = this.ships.filter(s => s.id !== ship.id);

        // Check wave clear
        if (this.waveDestroyedCount >= this.waveTotalShips) {
            this.advanceWave();
        }
    }

    triggerEmp() {
        this.empCharge = 0;
        this.screenShake = 20;
        playEmpSound();

        // Destroy all non-boss ships
        this.ships.forEach(ship => {
            this.addParticles(ship.x, ship.y, 16, 60);
        });
        const destroyed = this.ships.filter(s => !s.isBoss);
        this.waveDestroyedCount += destroyed.length;
        this.score += destroyed.length * 250;
        this.ships = this.ships.filter(s => s.isBoss);
        this.activeTarget = null;

        if (this.waveDestroyedCount >= this.waveTotalShips) {
            this.advanceWave();
        }
        this.updateHUD();
    }

    advanceWave() {
        this.wave++;
        this.waveSpawnedCount = 0;
        this.waveDestroyedCount = 0;
        this.waveTotalShips = Math.min(18, 5 + Math.floor(this.wave * 1.5));
        this.spawnInterval = Math.max(750, 2300 - this.wave * 120);

        // Restore 1 shield cell if depleted
        if (this.shields < 3) this.shields++;

        playWaveVictorySound();
        toast(`★ WAVE ${this.wave} INCOMING — Prepare Defense!`);
        this.updateHUD();
    }

    addParticles(x, y, count, hue) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 1.5;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 3 + 1.5,
                alpha: 1.0,
                hue: hue || 240
            });
        }
    }

    damageShield() {
        this.shields--;
        this.activeTarget = null;
        this.screenShake = 14;
        playShieldDamageSound();
        this.updateHUD();

        if (this.shields <= 0) {
            this.gameOver();
        }
    }

    updateHUD() {
        const scoreEl = document.getElementById('arcadeScoreDisplay');
        const multEl = document.getElementById('arcadeMultiplierDisplay');
        const streakEl = document.getElementById('arcadeStreakDisplay');
        const waveEl = document.getElementById('arcadeWaveDisplay');
        const empFill = document.getElementById('arcadeEmpFill');
        const shieldCells = document.getElementById('arcadeShieldCells');

        if (scoreEl) scoreEl.textContent = this.score.toLocaleString();
        if (multEl) multEl.textContent = `${(1 + Math.min(4, Math.floor(this.streak / 6))).toFixed(1)}x`;
        if (streakEl) streakEl.textContent = this.streak;
        if (waveEl) waveEl.textContent = `WAVE ${this.wave}`;
        if (empFill) empFill.style.width = `${(this.empCharge / 10) * 100}%`;

        if (shieldCells) {
            let cellsHtml = '';
            for (let i = 0; i < 3; i++) {
                cellsHtml += `<span class="shield-cell ${i < this.shields ? 'active' : 'depleted'}"></span>`;
            }
            shieldCells.innerHTML = cellsHtml;
        }
    }

    start() {
        this.running = true;
        this.startTime = performance.now();
        this.updateHUD();
        this.loop();
    }

    loop() {
        if (!this.running) return;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }

    update() {
        const now = performance.now();

        // Spawn logic
        if (this.waveSpawnedCount < this.waveTotalShips && now - this.lastSpawnTime > this.spawnInterval) {
            this.spawnShip();
        }

        // Update ships
        const baseLine = this.canvas.height - 40;
        this.ships.forEach(s => {
            s.y += s.speed * (1 / 60);
            if (s.y >= baseLine) {
                // Ship breached defense
                this.addParticles(s.x, baseLine, 20, 0);
                this.damageShield();
                s.dead = true;
            }
        });
        this.ships = this.ships.filter(s => !s.dead);

        // Update particles
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.025;
        });
        this.particles = this.particles.filter(p => p.alpha > 0);

        // Update laser
        if (this.laserBeam) {
            this.laserBeam.alpha -= 0.15;
            if (this.laserBeam.alpha <= 0) this.laserBeam = null;
        }

        // Starfield
        this.stars.forEach(st => {
            st.y += st.speed;
            if (st.y > this.canvas.height) {
                st.y = 0;
                st.x = Math.random() * this.canvas.width;
            }
        });

        // Screen shake dampening
        if (this.screenShake > 0) this.screenShake *= 0.88;
        if (this.screenShake < 0.2) this.screenShake = 0;
    }

    draw() {
        this.ctx.save();

        if (this.screenShake > 0) {
            const dx = (Math.random() - 0.5) * this.screenShake * 2;
            const dy = (Math.random() - 0.5) * this.screenShake * 2;
            this.ctx.translate(dx, dy);
        }

        // Clear canvas with space-void background
        this.ctx.fillStyle = '#060812';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Starfield
        this.stars.forEach(st => {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${st.alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(st.x, st.y, st.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Defense Grid Baseline
        const baseLine = this.canvas.height - 40;
        this.ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([8, 8]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, baseLine);
        this.ctx.lineTo(this.canvas.width, baseLine);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Player Defense Turret
        const turretX = this.canvas.width / 2;
        const turretY = this.canvas.height - 20;
        this.ctx.fillStyle = '#6366f1';
        this.ctx.beginPath();
        this.ctx.arc(turretX, turretY, 24, Math.PI, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#a855f7';
        this.ctx.beginPath();
        this.ctx.arc(turretX, turretY - 6, 12, Math.PI, Math.PI * 2);
        this.ctx.fill();

        // Laser Beam
        if (this.laserBeam) {
            this.ctx.save();
            this.ctx.strokeStyle = `hsla(${this.laserBeam.hue}, 100%, 70%, ${this.laserBeam.alpha})`;
            this.ctx.shadowColor = `hsla(${this.laserBeam.hue}, 100%, 60%, 1)`;
            this.ctx.shadowBlur = 14;
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.moveTo(this.laserBeam.fromX, this.laserBeam.fromY - 10);
            this.ctx.lineTo(this.laserBeam.toX, this.laserBeam.toY + 10);
            this.ctx.stroke();
            this.ctx.restore();
        }

        // Enemy Ships
        this.ships.forEach(ship => {
            const isTargeted = this.activeTarget === ship.id;

            // Draw Ship Body
            this.ctx.save();
            this.ctx.translate(ship.x, ship.y);

            // Capsule body
            this.ctx.fillStyle = `hsla(${ship.hue}, 80%, 20%, 0.85)`;
            this.ctx.strokeStyle = isTargeted ? '#ffffff' : `hsla(${ship.hue}, 100%, 65%, 0.9)`;
            this.ctx.lineWidth = isTargeted ? 2.5 : 1.5;
            if (isTargeted) {
                this.ctx.shadowColor = '#6366f1';
                this.ctx.shadowBlur = 12;
            }

            const textWidth = ship.word.length * 11 + 24;
            this.ctx.beginPath();
            this.ctx.roundRect(-textWidth / 2, -14, textWidth, 28, 8);
            this.ctx.fill();
            this.ctx.stroke();

            // Word text rendering
            this.ctx.font = 'bold 13px "JetBrains Mono", monospace';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            let cursorX = -textWidth / 2 + 12;
            for (let i = 0; i < ship.word.length; i++) {
                const ch = ship.word[i];
                if (i < ship.typedIndex) {
                    this.ctx.fillStyle = '#10b981'; // done green
                } else if (i === ship.typedIndex && isTargeted) {
                    this.ctx.fillStyle = '#ffffff'; // active white
                } else {
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'; // pending
                }
                this.ctx.fillText(ch, cursorX + i * 11, 0);
            }

            this.ctx.restore();
        });

        // Particles
        this.particles.forEach(p => {
            this.ctx.fillStyle = `hsla(${p.hue}, 100%, 65%, ${p.alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.ctx.restore();
    }

    async gameOver() {
        this.running = false;
        const elapsed = (performance.now() - this.startTime) / 1000;
        const wpm = (this.correctKeystrokes / 5) / (elapsed / 60);
        const accuracy = this.totalKeystrokes ? (this.correctKeystrokes / this.totalKeystrokes) * 100 : 100;

        const highScore = Math.max(this.score, Number(localStorage.getItem('kf_arcade_high_score') || 0));
        localStorage.setItem('kf_arcade_high_score', highScore);

        // Update game-over modal
        document.getElementById('finalScoreVal').textContent = this.score.toLocaleString();
        document.getElementById('finalWaveVal').textContent = `Wave ${this.wave}`;
        document.getElementById('finalWpmVal').textContent = `${Math.round(wpm || 0)} WPM`;
        document.getElementById('finalAccVal').textContent = `${accuracy.toFixed(1)}%`;
        document.getElementById('arcadeGameOverOverlay').style.display = 'flex';

        // Persist session to SQLite telemetry
        try {
            const errList = Object.entries(this.errorMap).map(([expected, count]) => ({
                expected, actual: '?', count
            }));

            await api('save_session', {
                lesson_id: null,
                duration_seconds: elapsed,
                total_chars: this.totalKeystrokes,
                correct_chars: this.correctKeystrokes,
                incorrect_chars: this.errorCount,
                backspaces: 0,
                wpm: isFinite(wpm) ? wpm : 0,
                accuracy: accuracy,
                text_prompt: `[Arcade Combat Wave ${this.wave} Score: ${this.score}]`,
                errors: errList,
                timing: this.timingBlob
            });
            toast(`Arcade Battle Saved: Score ${this.score.toLocaleString()} (${Math.round(wpm)} WPM)`);
        } catch (e) {
            console.error("Failed to save arcade telemetry", e);
        }
    }

    destroy() {
        this.running = false;
        if (this.keyHandler) {
            window.removeEventListener('keydown', this.keyHandler);
        }
    }
}
