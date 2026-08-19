// ==========================================================================
// KeyFlow Arcade Matrix: Multi-Game Cyber Typing Simulator Suite (60 FPS)
// ==========================================================================

let activeArcadeGame = null;
let currentArcadeMode = 'hub'; // 'hub' | 'defense' | 'velocity' | 'cascade'

function renderArcade() {
    if (activeArcadeGame) {
        activeArcadeGame.destroy();
        activeArcadeGame = null;
    }

    const highScoreDefense = Number(localStorage.getItem('kf_arcade_high_score') || 0);
    const highScoreVelocity = Number(localStorage.getItem('kf_velocity_high_score') || 0);
    const highScoreCascade = Number(localStorage.getItem('kf_cascade_high_score') || 0);

    const content = `
        <div class="arcade-hub-container">
            <!-- Hero Header -->
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;background:var(--surface-1);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);padding:28px 32px;box-shadow:var(--shadow-sm)">
                <div>
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
                        <span class="badge badge-brand">⚡ KEYFLOW ARCADE MATRIX</span>
                        <span class="badge badge-purple">60 FPS Hardware Canvas</span>
                        <span class="badge badge-success">Offline Telemetry Core</span>
                    </div>
                    <h1 style="font-family:'Outfit',sans-serif;font-size:32px;font-weight:900;letter-spacing:-0.03em;margin:0 0 8px;color:var(--text-main)">
                        Cybernetic Typing Battleground
                    </h1>
                    <p style="font-size:14px;color:var(--text-muted);margin:0;max-width:640px;line-height:1.5">
                        High-adrenaline typing simulations driven by your real keystroke telemetry and weakness analytics. Select a combat simulation mode below.
                    </p>
                </div>
                <div style="display:flex;gap:14px;align-items:center">
                    <div style="background:var(--surface-2);border:1px solid var(--border-subtle);padding:12px 18px;border-radius:var(--radius-md);text-align:right">
                        <div style="font-size:10.5px;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em">TOTAL COMBAT SCORE</div>
                        <div style="font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:900;color:var(--brand-light)">
                            ${(highScoreDefense + highScoreVelocity + highScoreCascade).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Game Mode Cards Grid -->
            <div class="arcade-mode-grid">
                <!-- Mode 1: Orbital Defense -->
                <div class="arcade-mode-card">
                    <div>
                        <div class="arcade-mode-header">
                            <div class="arcade-mode-icon-box" style="color:#6366f1;box-shadow:0 0 20px rgba(99,102,241,0.25)">⚡</div>
                            <div>
                                <div class="arcade-mode-title">Orbital Defense</div>
                                <div class="arcade-mode-subtitle">Space Combat Defender</div>
                            </div>
                        </div>
                        <p class="arcade-mode-desc">
                            Enemy word armadas descend toward the neural orbital matrix. Lock turret lasers, trigger Spacebar EMP shockwaves, and defend base shields across advancing combat waves.
                        </p>
                        <div class="arcade-mode-stats">
                            <div class="arcade-mode-stat-item">
                                <span class="arcade-mode-stat-lbl">HIGH SCORE</span>
                                <span class="arcade-mode-stat-val">${highScoreDefense.toLocaleString()}</span>
                            </div>
                            <div class="arcade-mode-stat-item">
                                <span class="arcade-mode-stat-lbl">COMBAT STYLE</span>
                                <span class="arcade-mode-stat-val" style="color:var(--accent-purple)">Wave Defense</span>
                            </div>
                        </div>
                        <div class="arcade-mode-tags">
                            <span class="badge badge-brand">Laser Raycast</span>
                            <span class="badge badge-warning">EMP Blast</span>
                            <span class="badge badge-purple">Weak-Key Armada</span>
                        </div>
                    </div>
                    <button class="btn btn-primary" style="width:100%;justify-content:center" onclick="launchArcadeMode('defense')">
                        ⚡ Launch Orbital Defense
                    </button>
                </div>

                <!-- Mode 2: Cyber Velocity Racer -->
                <div class="arcade-mode-card">
                    <div>
                        <div class="arcade-mode-header">
                            <div class="arcade-mode-icon-box" style="color:#06b6d4;box-shadow:0 0 20px rgba(6,182,212,0.25)">🏎️</div>
                            <div>
                                <div class="arcade-mode-title">Cyber Velocity</div>
                                <div class="arcade-mode-subtitle">Neon Warp Time-Attack Racer</div>
                            </div>
                        </div>
                        <p class="arcade-mode-desc">
                            Speed along a 3D perspective neon highway at hyper-velocity! Type gate words to turbo-drift between lanes, shatter barriers, earn bonus seconds, and max out your speedometer.
                        </p>
                        <div class="arcade-mode-stats">
                            <div class="arcade-mode-stat-item">
                                <span class="arcade-mode-stat-lbl">HIGH SCORE</span>
                                <span class="arcade-mode-stat-val">${highScoreVelocity.toLocaleString()}</span>
                            </div>
                            <div class="arcade-mode-stat-item">
                                <span class="arcade-mode-stat-lbl">SPEED SCALE</span>
                                <span class="arcade-mode-stat-val" style="color:var(--accent-cyan)">0–300+ MPH</span>
                            </div>
                        </div>
                        <div class="arcade-mode-tags">
                            <span class="badge badge-brand">3D Warp Tunnel</span>
                            <span class="badge badge-success">Nitro Boost</span>
                            <span class="badge badge-purple">Time Attack</span>
                        </div>
                    </div>
                    <button class="btn btn-primary" style="width:100%;justify-content:center;background:linear-gradient(135deg,#06b6d4,#3b82f6)" onclick="launchArcadeMode('velocity')">
                        🏎️ Launch Cyber Velocity
                    </button>
                </div>

                <!-- Mode 3: Cascade Reactor -->
                <div class="arcade-mode-card">
                    <div>
                        <div class="arcade-mode-header">
                            <div class="arcade-mode-icon-box" style="color:#10b981;box-shadow:0 0 20px rgba(16,185,129,0.25)">🧱</div>
                            <div>
                                <div class="arcade-mode-title">Cascade Reactor</div>
                                <div class="arcade-mode-subtitle">Multi-Column Block Breaker</div>
                            </div>
                        </div>
                        <p class="arcade-mode-desc">
                            Falling data cores and power cells descend across multi-column grids. Type words to shatter falling blocks, trigger combo chain-reactions, and prevent critical reactor meltdown!
                        </p>
                        <div class="arcade-mode-stats">
                            <div class="arcade-mode-stat-item">
                                <span class="arcade-mode-stat-lbl">HIGH SCORE</span>
                                <span class="arcade-mode-stat-val">${highScoreCascade.toLocaleString()}</span>
                            </div>
                            <div class="arcade-mode-stat-item">
                                <span class="arcade-mode-stat-lbl">CASCADE STYLE</span>
                                <span class="arcade-mode-stat-val" style="color:var(--accent-green)">Multi-Column Grid</span>
                            </div>
                        </div>
                        <div class="arcade-mode-tags">
                            <span class="badge badge-brand">Column Shatter</span>
                            <span class="badge badge-success">Chain Multipliers</span>
                            <span class="badge badge-warning">Meltdown Meter</span>
                        </div>
                    </div>
                    <button class="btn btn-primary" style="width:100%;justify-content:center;background:linear-gradient(135deg,#10b981,#059669)" onclick="launchArcadeMode('cascade')">
                        🧱 Launch Cascade Reactor
                    </button>
                </div>
            </div>
        </div>
    `;

    app.innerHTML = layout(content, 'Arcade Matrix', 'High-adrenaline cyber typing combat simulations.');
}

function launchArcadeMode(mode) {
    currentArcadeMode = mode;

    let modeTitle = 'ORBITAL DEFENSE';
    let modeIcon = '⚡';
    if (mode === 'velocity') {
        modeTitle = 'CYBER VELOCITY // WARP RACER';
        modeIcon = '🏎️';
    } else if (mode === 'cascade') {
        modeTitle = 'CASCADE REACTOR // BLOCK BREAKER';
        modeIcon = '🧱';
    }

    const content = `
        <div class="arcade-studio-layout">
            <div class="arcade-hud-bar">
                <div class="arcade-hud-left">
                    <button class="btn btn-secondary btn-sm" onclick="renderArcade()" style="margin-right:12px;padding:6px 12px">
                        ↺ Exit to Hub
                    </button>
                    <div class="arcade-title-tag">
                        <span class="pulse-radar"></span> ${modeIcon} ${modeTitle}
                    </div>
                    <div class="arcade-wave-pill" id="arcadeWaveDisplay">
                        ${mode === 'velocity' ? 'SECTOR 1' : (mode === 'cascade' ? 'LEVEL 1' : 'WAVE 1')}
                    </div>
                </div>

                <div class="arcade-hud-center">
                    <div class="arcade-stat-group">
                        <span class="arcade-stat-lbl">SCORE</span>
                        <span class="arcade-stat-val" id="arcadeScoreDisplay">000,000</span>
                    </div>
                    <div class="arcade-stat-group">
                        <span class="arcade-stat-lbl">${mode === 'velocity' ? 'SPEED' : 'MULTIPLIER'}</span>
                        <span class="arcade-stat-val text-brand" id="arcadeMultiplierDisplay">${mode === 'velocity' ? '80 MPH' : '1.0x'}</span>
                    </div>
                    <div class="arcade-stat-group">
                        <span class="arcade-stat-lbl">STREAK</span>
                        <span class="arcade-stat-val text-green" id="arcadeStreakDisplay">0</span>
                    </div>
                </div>

                <div class="arcade-hud-right">
                    <div class="arcade-shield-container">
                        <span class="arcade-stat-lbl">${mode === 'velocity' ? 'TIME REMAINING' : (mode === 'cascade' ? 'REACTOR INTEGRITY' : 'SHIELD INTEGRITY')}</span>
                        <div class="arcade-shield-cells" id="arcadeShieldCells">
                            <span class="shield-cell active"></span>
                            <span class="shield-cell active"></span>
                            <span class="shield-cell active"></span>
                        </div>
                    </div>
                    <div class="arcade-emp-container" id="arcadeEmpContainer" title="${mode === 'velocity' ? 'Turbo Nitro Boost' : 'Super EMP Blast'}">
                        <span class="arcade-stat-lbl">${mode === 'velocity' ? 'NITRO BOOST' : 'SUPER BLAST'}</span>
                        <div class="emp-meter"><div class="emp-fill" id="arcadeEmpFill" style="width:0%"></div></div>
                    </div>
                </div>
            </div>

            <div class="arcade-canvas-wrapper" id="arcadeCanvasWrapper">
                <canvas id="arcadeCanvas"></canvas>
                
                <div class="arcade-overlay-start" id="arcadeStartOverlay">
                    <div class="arcade-modal-card" style="max-width:520px;padding:32px 28px">
                        <div style="font-size:44px;margin-bottom:8px">${modeIcon}</div>
                        <h1 style="font-family:'Outfit',sans-serif;font-size:26px;font-weight:900;letter-spacing:-0.03em">
                            ${modeTitle}
                        </h1>
                        <p style="font-size:13.5px;color:var(--text-muted);margin:8px 0 16px;line-height:1.5">
                            ${mode === 'velocity' ? 'Type the words on approaching lane gates to turbo-drift, smash barriers, and keep your clock alive.' : (mode === 'cascade' ? 'Type falling blocks to shatter data cores and trigger row chain reactions.' : 'Type descending alien words to lock turret lasers and blast threats.')}
                        </p>

                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:16px 0 20px;text-align:left">
                            <div>
                                <label style="font-size:11.5px;font-weight:800;color:var(--text-muted);display:block;margin-bottom:6px;letter-spacing:0.04em">
                                    🎯 DIFFICULTY TIER
                                </label>
                                <select id="arcadeDifficultySelect" style="background:var(--surface-2);color:var(--text-main);border:1px solid var(--border-light);padding:9px 12px;border-radius:var(--radius-sm);width:100%;font-family:inherit;font-size:13px;outline:none;cursor:pointer">
                                    <option value="cadet">🟢 Cadet (3–4 chars)</option>
                                    <option value="tactical" selected>🔵 Tactical (5–7 chars)</option>
                                    <option value="commander">🟣 Commander (8–14 chars)</option>
                                    <option value="procedural">♾️ Neural Matrix (Procedural Weak-Keys)</option>
                                </select>
                            </div>
                            <div>
                                <label style="font-size:11.5px;font-weight:800;color:var(--text-muted);display:block;margin-bottom:6px;letter-spacing:0.04em">
                                    ⚡ STARTING STAGE
                                </label>
                                <select id="arcadeWaveSelect" style="background:var(--surface-2);color:var(--text-main);border:1px solid var(--border-light);padding:9px 12px;border-radius:var(--radius-sm);width:100%;font-family:inherit;font-size:13px;outline:none;cursor:pointer">
                                    <option value="1" selected>Stage 1 (Calibration)</option>
                                    <option value="3">Stage 3 (Tactical Speed)</option>
                                    <option value="5">Stage 5 (Hyper-Drive)</option>
                                    <option value="8">Stage 8 (Overdrive)</option>
                                </select>
                            </div>
                        </div>

                        <div style="display:flex;gap:10px;justify-content:center;margin-bottom:20px;flex-wrap:wrap">
                            <span class="badge badge-brand">1,000+ Word Lexicon</span>
                            <span class="badge badge-purple">Adaptive Weak-Keys</span>
                            <span class="badge badge-success">Telemetry Saved</span>
                        </div>
                        <button class="btn btn-primary btn-lg" style="width:100%;justify-content:center" onclick="startCurrentArcadeGame()">
                            ${modeIcon} START SIMULATION
                        </button>
                    </div>
                </div>

                <div class="arcade-overlay-start" id="arcadeGameOverOverlay" style="display:none">
                    <div class="arcade-modal-card">
                        <div style="font-size:40px;margin-bottom:6px" id="gameOverIcon">💥</div>
                        <h2 style="font-family:'Outfit',sans-serif;font-size:26px;font-weight:900" id="gameOverTitle">
                            SIMULATION CONCLUDED
                        </h2>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:18px 0;background:var(--surface-2);padding:14px;border-radius:var(--radius-md)">
                            <div>
                                <div style="font-size:11px;color:var(--text-muted);font-weight:800">FINAL SCORE</div>
                                <div style="font-size:22px;font-weight:900;color:var(--brand-light)" id="finalScoreVal">0</div>
                            </div>
                            <div>
                                <div style="font-size:11px;color:var(--text-muted);font-weight:800">STAGES CLEARED</div>
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
                            <button class="btn btn-secondary" onclick="renderArcade()">Arcade Hub</button>
                            <button class="btn btn-primary" onclick="startCurrentArcadeGame()">↺ Play Again</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    app.innerHTML = layout(content, 'Arcade Matrix', 'High-adrenaline cyber typing combat simulations.');
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

function startCurrentArcadeGame() {
    const diffEl = document.getElementById('arcadeDifficultySelect');
    const waveEl = document.getElementById('arcadeWaveSelect');
    const difficultyTier = diffEl ? diffEl.value : 'tactical';
    const startWave = waveEl ? parseInt(waveEl.value, 10) : 1;

    document.getElementById('arcadeStartOverlay').style.display = 'none';
    document.getElementById('arcadeGameOverOverlay').style.display = 'none';

    if (activeArcadeGame) activeArcadeGame.destroy();

    if (currentArcadeMode === 'velocity') {
        activeArcadeGame = new VelocityRacerEngine(difficultyTier, startWave);
    } else if (currentArcadeMode === 'cascade') {
        activeArcadeGame = new CascadeReactorEngine(difficultyTier, startWave);
    } else {
        activeArcadeGame = new OrbitalDefenseEngine(difficultyTier, startWave);
    }

    activeArcadeGame.start();
}

// ==========================================================================
// Massive 1,000+ Word Combat Dictionary & Infinite Procedural Synthesizer
// ==========================================================================
const ARCADE_TIER_1_WORDS = [
    "ace", "act", "aim", "air", "amp", "arc", "arm", "ash", "ask", "bad", "bag", "bar", "bay", "bed", "bet", "bin",
    "bit", "bow", "box", "bug", "bus", "buy", "byte", "cab", "cap", "car", "cat", "code", "core", "cpu", "cut", "dam",
    "dark", "data", "dawn", "day", "disk", "doc", "dog", "dot", "drop", "duck", "duo", "dust", "ear", "echo", "edge", "edit",
    "egg", "end", "era", "exit", "eye", "fan", "far", "fast", "fax", "fee", "file", "fill", "find", "fire", "fit", "flag",
    "flow", "fly", "fog", "fork", "form", "fox", "fuel", "fun", "fuse", "gain", "game", "gap", "gas", "gate", "gear", "gem",
    "get", "git", "glow", "glue", "goal", "gold", "grid", "grip", "gun", "guru", "hack", "halo", "hand", "hard", "hash", "have",
    "hawk", "head", "heat", "help", "hero", "hex", "hide", "hill", "hint", "hit", "hold", "hook", "host", "hour", "hub", "icon",
    "idea", "idle", "inch", "info", "ink", "ion", "iron", "item", "jam", "jar", "jaw", "jazz", "jet", "job", "join", "joke",
    "jump", "jury", "keep", "key", "kick", "kilo", "king", "kit", "kite", "knob", "knot", "lab", "lamp", "lane", "laser", "law",
    "lead", "leaf", "leak", "lean", "leap", "left", "lens", "life", "lift", "line", "link", "lion", "list", "load", "lock", "loop",
    "lore", "lost", "luck", "mail", "main", "mark", "mask", "mass", "mast", "mate", "maze", "meal", "mean", "mega", "melt", "mesh",
    "mild", "mile", "milk", "mill", "mind", "mine", "mint", "mode", "moon", "more", "most", "move", "mute", "name", "nano", "navy",
    "near", "neat", "neck", "neon", "nest", "news", "next", "node", "norm", "nose", "note", "nova", "null", "oath", "obey", "once",
    "open", "oval", "over", "pack", "page", "pain", "pair", "palm", "pane", "park", "part", "pass", "past", "path", "peak", "peel",
    "peer", "pick", "pile", "pine", "ping", "pink", "pipe", "plan", "play", "plot", "plug", "plus", "poem", "poet", "pole", "poll",
    "polo", "pond", "pool", "port", "pose", "post", "pour", "pray", "prod", "prop", "pure", "push", "quad", "quay", "quiz", "race",
    "rack", "raft", "rage", "raid", "rail", "rain", "ramp", "rank", "rare", "rate", "rave", "rays", "read", "real", "reap", "rear",
    "rely", "rent", "rest", "rice", "rich", "ride", "rift", "ring", "riot", "rise", "risk", "road", "roam", "roar", "rock", "role",
    "roof", "room", "root", "rope", "rose", "ruby", "ruin", "rule", "rush", "rust", "safe", "sage", "sail", "salt", "same", "sand",
    "save", "scan", "seal", "seam", "seed", "seek", "seem", "seen", "self", "send", "sent", "shed", "ship", "shoe", "shop", "shot",
    "show", "shut", "sick", "side", "sign", "silk", "sine", "sing", "sink", "site", "size", "skew", "skin", "skip", "skit", "slab",
    "slam", "slap", "slot", "slow", "slug", "snap", "snow", "soak", "soap", "soar", "sock", "soil", "solar", "sole", "solo", "song",
    "soon", "sort", "soul", "soup", "sour", "span", "spar", "spec", "spin", "spit", "spot", "spun", "spur", "star", "stay", "stem",
    "step", "stir", "stop", "stub", "stun", "such", "suit", "surf", "swap", "swim", "sync", "tack", "tact", "tail", "take", "tale",
    "talk", "tall", "tank", "tape", "task", "team", "tech", "tell", "term", "test", "text", "then", "thin", "tide", "tile", "time",
    "tiny", "toll", "tone", "tool", "tour", "town", "trap", "tree", "trek", "trim", "trio", "trip", "true", "tube", "tuna", "tune",
    "twin", "type", "unit", "upon", "urge", "used", "user", "vane", "vary", "vast", "veil", "vein", "vent", "verb", "very", "vest",
    "view", "vine", "visa", "volt", "vote", "wage", "wait", "wake", "walk", "wall", "wand", "want", "ward", "warm", "warn", "warp",
    "wary", "wash", "wasp", "wave", "wear", "weed", "week", "well", "west", "wide", "wild", "will", "wind", "wine", "wing", "wink",
    "wipe", "wire", "wise", "wish", "wolf", "wood", "wool", "word", "work", "worm", "wrap", "yard", "yarn", "year", "yoga", "zeal",
    "zero", "zinc", "zone", "zoom"
];

const ARCADE_TIER_2_WORDS = [
    "action", "active", "actual", "adapter", "address", "advanced", "aerial", "agency", "agenda", "agent", "aircraft", "airflow",
    "alarm", "align", "almanac", "alpha", "ambient", "anchor", "android", "antenna", "apollo", "apparatus", "archive", "armor",
    "array", "arrow", "artifact", "artisan", "aspect", "astral", "atom", "atomic", "audio", "aura", "avatar", "avenger",
    "avionics", "axis", "azure", "backbone", "badge", "balance", "ballast", "bandwidth", "banner", "baron", "barrier", "baseline",
    "battery", "beacon", "beam", "bionic", "bitrate", "blade", "blast", "blaze", "block", "blueprint", "board", "booster",
    "border", "botnet", "boundary", "bracket", "branch", "bridge", "browser", "buffer", "build", "bulletin", "bundle", "burn",
    "bypass", "byte", "cabin", "cable", "cache", "cadet", "caliber", "camera", "cancel", "canvas", "capsule", "captain",
    "capture", "carbon", "carrier", "cascade", "castle", "catalyst", "catcher", "cathode", "cellular", "center", "central", "centroid",
    "channel", "charge", "chariot", "chart", "chassis", "checksum", "chrono", "circuit", "cipher", "clamp", "classic", "cleaner",
    "client", "climax", "clock", "cluster", "coastal", "coaxial", "cobalt", "codec", "coder", "coherent", "collapse", "collector",
    "colony", "column", "combat", "command", "commence", "compact", "compass", "compiler", "complex", "component", "compute", "concave",
    "condense", "conduit", "connect", "console", "constant", "control", "convert", "convex", "cooler", "copper", "corner", "corridor",
    "cosmic", "cosmos", "counter", "coupler", "cradle", "craft", "crater", "crawler", "creator", "creek", "crescent", "critical",
    "crossbar", "crypto", "crystal", "cubic", "current", "cursor", "custom", "cyber", "cycle", "cyclone", "cylinder", "dagger",
    "dashboard", "database", "datagram", "dataset", "daylight", "deadlock", "debugger", "decibel", "decode", "decoder", "defense", "deflect",
    "delta", "density", "deploy", "derivative", "desktop", "destroyer", "detail", "detector", "device", "diagonal", "diagram", "dialog",
    "diameter", "diffuse", "digital", "dimension", "diode", "direct", "disable", "discrete", "dispatch", "display", "distance", "district",
    "diverge", "divider", "docking", "doctrine", "domain", "dominant", "doorway", "doppler", "double", "draft", "dragon", "drastic",
    "drift", "driver", "drone", "dual", "duct", "duration", "dynamo", "dynamic", "eagle", "earth", "eclipse", "economy",
    "elastic", "elect", "electric", "electron", "element", "elevate", "elevator", "elite", "embed", "emission", "emitter", "empire",
    "enable", "encoder", "encrypt", "engine", "entropy", "envelope", "epic", "episode", "epoch", "equation", "equator", "escape",
    "ethernet", "examine", "exceed", "execute", "exhaust", "expand", "explorer", "exponent", "express", "external", "extreme", "facility",
    "factor", "factory", "failover", "falcon", "feather", "feature", "feedback", "fender", "ferrite", "fiber", "field", "filament",
    "filter", "firewall", "firmware", "flame", "flash", "flight", "floating", "flowchart", "fluent", "flux", "focus", "folder",
    "footage", "force", "format", "formula", "fortress", "forward", "fraction", "fragment", "frame", "freedom", "friction", "frontier",
    "furnace", "fusion", "galaxy", "galvanic", "gamma", "gantry", "gateway", "gauge", "gearbox", "generator", "genesis", "generic",
    "geodesic", "geology", "glacier", "glider", "global", "glory", "governor", "gradient", "graph", "gravity", "gridlock", "ground",
    "guardian", "guidance", "gyroscope", "habitat", "handler", "harbor", "hardware", "harmony", "hazard", "heading", "headlight", "heavy",
    "height", "helium", "helmet", "heroic", "hexagon", "highway", "holster", "horizon", "hostile", "hover", "hubcap", "hunter",
    "hybrid", "hydraulic", "hydrogen", "hyper", "ignite", "impact", "impulse", "indexer", "infinite", "injector", "inlet", "inner",
    "input", "insignia", "inspector", "instance", "intake", "integer", "integral", "interface", "internal", "interval", "intruder", "inverter",
    "isotope", "iteration", "jackpot", "javelin", "journal", "journey", "junction", "jupiter", "keyboard", "kinetic", "knight", "ladder",
    "landing", "lantern", "laptop", "lasers", "latitude", "lattice", "launcher", "layered", "leader", "legacy", "legend", "length",
    "loader", "locate", "logic", "loopback", "lumber", "machine", "magnet", "mantle", "mapper", "markup", "matrix", "memory", "mentor",
    "meteor", "method", "metric", "mirror", "mobile", "module", "monitor", "mosaic", "motion", "mount", "mutual", "mystic", "native",
    "nebula", "needle", "network", "neutral", "nexus", "nimble", "nomad", "normal", "nucleus", "numeric", "object", "offline", "offset",
    "online", "opaque", "operate", "optical", "option", "oracle", "orbit", "origin", "output", "overlay", "package", "packet", "paddle",
    "palace", "parallel", "parser", "passing", "passive", "pattern", "payload", "peak", "phantom", "phoenix", "photon", "physical", "pipeline",
    "pirate", "pixel", "planar", "plasma", "plugin", "portal", "precise", "prism", "process", "profile", "program", "prompt", "proton",
    "proxy", "pulsar", "quantum", "quartz", "radar", "radiant", "radius", "random", "ranger", "raster", "reactor", "reboot", "render",
    "replay", "reset", "resize", "resolve", "restart", "restore", "resume", "rhythm", "ribbon", "robust", "rocket", "rogue", "roller",
    "rotate", "router", "runner", "runway", "safari", "sample", "satellite", "scale", "scanner", "schema", "script", "sector", "secure",
    "segment", "sensor", "server", "shadow", "shield", "shimmer", "shuttle", "signal", "silver", "simple", "socket", "source", "spatial",
    "spectra", "sphere", "spiral", "splash", "sprint", "static", "stealth", "stream", "strike", "string", "strobe", "studio", "subnet",
    "switch", "symbol", "syntax", "system", "tablet", "tactical", "tangent", "target", "template", "terminal", "texture", "thermal", "thread",
    "thunder", "timeline", "toggle", "tracer", "tracker", "transit", "trigger", "tundra", "tunnel", "turbine", "turret", "ultimate", "unified",
    "uplink", "utility", "vacuum", "valley", "vector", "velocity", "vendor", "vertex", "vessel", "victor", "virtual", "visual", "volume",
    "vortex", "voyage", "warrant", "warrior", "weapon", "weave", "webkit", "weight", "widget", "window", "wizard", "wrapper", "zenith", "zodiac"
];

const ARCADE_TIER_3_WORDS = [
    "accelerator", "accumulator", "adaptability", "adjustment", "algorithm", "allocated", "alphabetical", "amplitude", "analytical",
    "animation", "anonymous", "antecedent", "architecture", "arithmetic", "articulation", "artificial", "assemblage", "asymmetrical",
    "asynchronous", "atmospheric", "authentication", "authoritative", "automated", "bandwidth", "battery", "benchmark", "biochemical",
    "biometrics", "breakpoint", "calculated", "calibration", "camouflage", "capability", "capacity", "checkpoint", "chronology",
    "civilization", "clarification", "clientstate", "coefficient", "combination", "communication", "compatibility", "computation",
    "concentric", "configuration", "connection", "consecutive", "constellation", "constructor", "coordination", "cryptography",
    "cybersecurity", "dataflow", "decentralized", "decomposition", "deceleration", "decryption", "dependency", "deprecation",
    "destination", "destruction", "deterministic", "development", "differential", "digitization", "dimensional", "disassembler",
    "distributed", "earthenware", "electromechanical", "encapsulation", "encountered", "engineering", "enterprise", "equilibrium",
    "executable", "exponential", "extinction", "extrapolation", "fabrication", "factorization", "filesystem", "fluctuation",
    "fundamental", "geolocation", "gravitation", "hexadecimal", "hierarchical", "hologram", "hyperdrive", "hyperthreading",
    "hypervisor", "identification", "illuminated", "illustrated", "imagination", "immediately", "immutability", "implementer",
    "implications", "incremental", "initialization", "infrastructure", "installations", "instructions", "instrumental", "intelligence",
    "interchangeable", "interactive", "intermediate", "interpolation", "intersection", "introspection", "investigations", "isomorphism",
    "javascript", "juxtaposed", "jurisdiction", "keyboarding", "lightweight", "linearization", "localstorage", "logarithmic",
    "maintenance", "mathematical", "matrixmultiplication", "maximization", "microcontroller", "microprocessor", "microscopic",
    "minimization", "modularization", "multispectral", "navigation", "neighborhood", "neutralization", "nonblocking", "notification",
    "observational", "omnidirectional", "optimization", "orchestration", "organization", "oscilloscope", "outstanding",
    "parallelization", "parameterization", "performance", "synchronization", "telecommunication", "telemetry", "thermodynamics",
    "throughput", "trajectories", "transformation", "transmission", "transparency", "trigonometry", "troubleshooting", "ubiquity",
    "ultraviolet", "understanding", "uninterrupted", "universal", "virtualization", "vulnerability", "wavelength"
];

function generateProceduralPseudoWord(weakKeys = [], targetLength = 6) {
    const vowels = ["a", "e", "i", "o", "u", "y"];
    const onsets = ["bl", "br", "ch", "cl", "cr", "dr", "fl", "fr", "gl", "gr", "pl", "pr", "sc", "sh", "sk", "sl", "sm", "sn", "sp", "st", "str", "sw", "th", "tr", "qu", "ph", "kn", "wr"];
    const codas = ["ck", "ct", "ft", "ld", "lf", "lk", "lm", "lp", "lt", "mp", "nd", "ng", "nk", "nt", "pt", "rk", "rn", "rt", "sk", "sp", "st", "sh", "th", "x", "zz", "ff", "ss", "ll"];
    const singleConsonants = ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "w", "x", "z"];

    let word = "";
    if (weakKeys && weakKeys.length > 0) {
        const seedKey = weakKeys[Math.floor(Math.random() * weakKeys.length)].toLowerCase();
        if (vowels.includes(seedKey)) {
            const o = onsets[Math.floor(Math.random() * onsets.length)];
            const c = codas[Math.floor(Math.random() * codas.length)];
            word = `${o}${seedKey}${c}`;
        } else {
            const v = vowels[Math.floor(Math.random() * vowels.length)];
            const c = codas[Math.floor(Math.random() * codas.length)];
            word = `${seedKey}${v}${c}`;
        }
        while (word.length < targetLength) {
            const v2 = vowels[Math.floor(Math.random() * vowels.length)];
            const c2 = singleConsonants[Math.floor(Math.random() * singleConsonants.length)];
            word += `${c2}${v2}`;
        }
    } else {
        while (word.length < targetLength) {
            const o = Math.random() > 0.4 ? onsets[Math.floor(Math.random() * onsets.length)] : singleConsonants[Math.floor(Math.random() * singleConsonants.length)];
            const v = vowels[Math.floor(Math.random() * vowels.length)];
            const c = Math.random() > 0.5 ? codas[Math.floor(Math.random() * codas.length)] : "";
            word += `${o}${v}${c}`;
        }
    }
    return word.slice(0, Math.max(4, targetLength));
}

function selectArcadeWord(wave, isBoss, activeInitialLetters, weakKeys = [], difficultyTier = 'tactical') {
    let pool = [];

    if (isBoss) {
        pool = ARCADE_TIER_3_WORDS;
    } else if (difficultyTier === 'cadet') {
        pool = ARCADE_TIER_1_WORDS;
    } else if (difficultyTier === 'commander') {
        pool = ARCADE_TIER_3_WORDS;
    } else if (difficultyTier === 'procedural') {
        const length = Math.min(10, 4 + Math.floor(wave * 0.7));
        const pseudo = generateProceduralPseudoWord(weakKeys, length);
        if (!activeInitialLetters.has(pseudo[0].toLowerCase())) {
            return pseudo;
        }
        pool = ARCADE_TIER_2_WORDS;
    } else {
        if (wave <= 2) {
            pool = ARCADE_TIER_1_WORDS;
        } else if (wave <= 5) {
            pool = Math.random() > 0.4 ? ARCADE_TIER_2_WORDS : ARCADE_TIER_1_WORDS;
        } else {
            pool = Math.random() > 0.35 ? ARCADE_TIER_2_WORDS : ARCADE_TIER_3_WORDS;
        }
    }

    if (!isBoss && wave >= 3 && Math.random() < 0.4) {
        const length = Math.min(10, 4 + Math.floor(wave * 0.75));
        const pseudo = generateProceduralPseudoWord(weakKeys, length);
        if (!activeInitialLetters.has(pseudo[0].toLowerCase())) {
            return pseudo;
        }
    }

    const available = pool.filter(w => !activeInitialLetters.has(w[0].toLowerCase()));
    if (available.length > 0) {
        return available[Math.floor(Math.random() * available.length)];
    }

    return pool[Math.floor(Math.random() * pool.length)];
}

function formatWordForWave(word, wave, isBoss) {
    if (isBoss) {
        return "FLAGSHIP_" + word.toUpperCase();
    }
    if (wave <= 2) {
        return word.toLowerCase();
    }
    if (wave <= 5) {
        if (Math.random() < 0.5) {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        return word.toLowerCase();
    }
    if (Math.random() < 0.55) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }
    return word;
}

// ==========================================================================
// Game Engine 1: Orbital Defense (Space-Combat Matrix)
// ==========================================================================
class OrbitalDefenseEngine {
    constructor(difficultyTier = 'tactical', startWave = 1) {
        this.canvas = document.getElementById('arcadeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.running = false;
        this.difficultyTier = difficultyTier;
        this.wave = startWave || 1;
        this.score = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.shields = 3;
        this.empCharge = 0;
        this.ships = [];
        this.particles = [];
        this.stars = [];
        this.activeTarget = null;
        this.laserBeam = null;
        this.screenShake = 0;

        this.startTime = performance.now();
        this.lastKeyTime = null;
        this.totalKeystrokes = 0;
        this.correctKeystrokes = 0;
        this.errorCount = 0;
        this.errorMap = {};
        this.timingBlob = [];

        this.waveTotalShips = 14 + (this.wave - 1) * 4;
        this.waveSpawnedCount = 0;
        this.waveDestroyedCount = 0;
        this.lastSpawnTime = performance.now();
        this.spawnInterval = Math.max(800, 2000 - this.wave * 100);

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

    spawnShip() {
        const weakKeys = (state.dashboard?.weak_keys || []).map(x => x.expected_key.toLowerCase());
        const activeInitialLetters = new Set(this.ships.map(s => s.word[0].toLowerCase()));
        const isBoss = this.waveSpawnedCount === this.waveTotalShips - 1 && this.wave % 3 === 0;

        let rawWord = selectArcadeWord(this.wave, isBoss, activeInitialLetters, weakKeys, this.difficultyTier);
        let word = formatWordForWave(rawWord, this.wave, isBoss);

        const margin = 110;
        const x = Math.random() * (this.canvas.width - margin * 2) + margin;
        const speed = (22 + this.wave * 2.8) * (isBoss ? 0.55 : 1);

        this.ships.push({
            id: Math.random().toString(),
            word: word,
            typedIndex: 0,
            x: x,
            y: -24,
            speed: speed,
            isBoss: isBoss,
            hue: isBoss ? 340 : (Math.random() > 0.5 ? 240 : (Math.random() > 0.5 ? 180 : 280)),
            size: isBoss ? 28 : 18,
            errorFlash: 0
        });

        this.waveSpawnedCount++;
        this.lastSpawnTime = performance.now();
    }

    setupKeyboard() {
        this.keyHandler = e => {
            if (!this.running) return;

            if (e.code === 'Space') {
                e.preventDefault();
                if (this.empCharge >= 10) {
                    this.triggerEmp();
                }
                return;
            }

            if (e.code === 'Escape' || e.code === 'Backspace') {
                if (this.activeTarget) {
                    const ship = this.ships.find(s => s.id === this.activeTarget);
                    if (ship) ship.typedIndex = 0;
                    this.activeTarget = null;
                    this.updateHUD();
                }
                return;
            }

            if (e.repeat) return;
            if (e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) return;
            const char = e.key;
            const now = performance.now();
            const latency = this.lastKeyTime ? now - this.lastKeyTime : 0;
            this.lastKeyTime = now;
            this.totalKeystrokes++;

            if (this.activeTarget) {
                const ship = this.ships.find(s => s.id === this.activeTarget);
                if (ship) {
                    const expected = ship.word[ship.typedIndex];
                    if (char === expected || char.toLowerCase() === expected.toLowerCase()) {
                        this.hitCharacter(ship);
                        this.correctKeystrokes++;
                        this.timingBlob.push({ key: char, latency, timestamp: now });
                        return;
                    } else {
                        this.missCharacter(expected, char, ship);
                        return;
                    }
                } else {
                    this.activeTarget = null;
                }
            }

            const candidates = this.ships
                .filter(s => s.typedIndex === 0 && (s.word[0] === char || s.word[0].toLowerCase() === char.toLowerCase()))
                .sort((a, b) => b.y - a.y);

            if (candidates.length > 0) {
                const target = candidates[0];
                this.activeTarget = target.id;
                this.hitCharacter(target);
                this.correctKeystrokes++;
                this.timingBlob.push({ key: char, latency, timestamp: now });
            } else {
                this.missCharacter('?', char, null);
            }
        };

        window.addEventListener('keydown', this.keyHandler);
    }

    hitCharacter(ship) {
        ship.typedIndex++;
        ship.errorFlash = 0;
        this.streak++;
        this.maxStreak = Math.max(this.maxStreak, this.streak);
        this.empCharge = Math.min(10, this.empCharge + 1);

        const multiplier = 1 + Math.min(4, Math.floor(this.streak / 6));
        this.score += 75 * multiplier;

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
        this.addParticles(ship.x, ship.y, 4, ship.hue);

        if (ship.typedIndex >= ship.word.length) {
            this.destroyShip(ship);
        }

        this.updateHUD();
    }

    missCharacter(expected, actual, ship = null) {
        this.streak = 0;
        this.errorCount++;
        this.errorMap[expected] = (this.errorMap[expected] || 0) + 1;
        if (ship) ship.errorFlash = 1.0;
        playKeySound('beep');
        this.updateHUD();
    }

    destroyShip(ship) {
        this.activeTarget = null;
        this.waveDestroyedCount++;
        this.score += ship.word.length * 120 * (1 + Math.min(4, Math.floor(this.streak / 6)));

        this.addParticles(ship.x, ship.y, ship.isBoss ? 50 : 22, ship.hue);
        this.screenShake = ship.isBoss ? 16 : 6;
        playExplosionSound();

        if (this.streak % 5 === 0) {
            playComboChime(Math.min(5, Math.floor(this.streak / 5)));
        }

        if (this.streak > 0 && this.streak % 20 === 0 && this.shields < 3) {
            this.shields++;
            toast('🛡️ Shield Cell Restored!');
        }

        this.ships = this.ships.filter(s => s.id !== ship.id);

        if (this.waveDestroyedCount >= this.waveTotalShips) {
            this.advanceWave();
        }
    }

    triggerEmp() {
        this.empCharge = 0;
        this.screenShake = 20;
        playEmpSound();

        this.ships.forEach(ship => {
            this.addParticles(ship.x, ship.y, 16, 60);
        });
        const destroyed = this.ships.filter(s => !s.isBoss);
        this.waveDestroyedCount += destroyed.length;
        this.score += destroyed.length * 300;
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
        this.waveTotalShips = 14 + (this.wave - 1) * 4;
        this.spawnInterval = Math.max(800, 2000 - this.wave * 100);

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
        const maxConcurrent = Math.min(8, 3 + Math.floor(this.wave * 0.5));
        const interval = Math.max(900, 2000 - this.wave * 100);
        if (this.waveSpawnedCount < this.waveTotalShips && (now - this.lastSpawnTime > interval || this.ships.length < 2)) {
            if (this.ships.length < maxConcurrent) {
                this.spawnShip();
            }
        }

        const baseLine = this.canvas.height - 40;
        this.ships.forEach(s => {
            s.y += s.speed * (1 / 60);
            if (s.y >= baseLine) {
                this.addParticles(s.x, baseLine, 20, 0);
                if (this.activeTarget === s.id) {
                    this.activeTarget = null;
                }
                this.damageShield();
                s.dead = true;
            }
        });
        this.ships = this.ships.filter(s => !s.dead);

        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.025;
        });
        this.particles = this.particles.filter(p => p.alpha > 0);

        if (this.laserBeam) {
            this.laserBeam.alpha -= 0.15;
            if (this.laserBeam.alpha <= 0) this.laserBeam = null;
        }

        this.stars.forEach(st => {
            st.y += st.speed;
            if (st.y > this.canvas.height) {
                st.y = 0;
                st.x = Math.random() * this.canvas.width;
            }
        });

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

        this.ctx.fillStyle = '#060812';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Starfield
        this.stars.forEach(st => {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${st.alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(st.x, st.y, st.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Defense Baseline Radar
        const baseLine = this.canvas.height - 40;
        this.ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([8, 8]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, baseLine);
        this.ctx.lineTo(this.canvas.width, baseLine);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Defense Turret
        const turretX = this.canvas.width / 2;
        const turretY = this.canvas.height - 15;
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

            this.ctx.save();
            this.ctx.translate(ship.x, ship.y);

            if (ship.errorFlash > 0) {
                ship.errorFlash -= 0.04;
                this.ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
                this.ctx.strokeStyle = '#f43f5e';
                this.ctx.lineWidth = 3;
                this.ctx.shadowColor = '#f43f5e';
                this.ctx.shadowBlur = 18;
            } else {
                this.ctx.fillStyle = `hsla(${ship.hue}, 80%, 20%, 0.85)`;
                this.ctx.strokeStyle = isTargeted ? '#ffffff' : `hsla(${ship.hue}, 100%, 65%, 0.9)`;
                this.ctx.lineWidth = isTargeted ? 2.5 : 1.5;
                if (isTargeted) {
                    this.ctx.shadowColor = '#6366f1';
                    this.ctx.shadowBlur = 12;
                }
            }

            const charWidth = 12;
            const textWidth = Math.max(68, ship.word.length * charWidth + 24);
            this.ctx.beginPath();
            this.ctx.roundRect(-textWidth / 2, -15, textWidth, 30, 8);
            this.ctx.fill();
            this.ctx.stroke();

            this.ctx.font = 'bold 13.5px "JetBrains Mono", monospace';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            let cursorX = -textWidth / 2 + 12 + charWidth / 2;
            for (let i = 0; i < ship.word.length; i++) {
                const ch = ship.word[i];
                const isCapital = ch >= 'A' && ch <= 'Z';
                if (i < ship.typedIndex) {
                    this.ctx.fillStyle = '#10b981';
                } else if (i === ship.typedIndex && isTargeted) {
                    this.ctx.fillStyle = isCapital ? '#fbbf24' : '#ffffff';
                } else {
                    this.ctx.fillStyle = isCapital ? 'rgba(251, 191, 36, 0.75)' : 'rgba(255, 255, 255, 0.6)';
                }
                this.ctx.fillText(ch, cursorX + i * charWidth, 0);
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

        document.getElementById('finalScoreVal').textContent = this.score.toLocaleString();
        document.getElementById('finalWaveVal').textContent = `Wave ${this.wave}`;
        document.getElementById('finalWpmVal').textContent = `${Math.round(wpm || 0)} WPM`;
        document.getElementById('finalAccVal').textContent = `${accuracy.toFixed(1)}%`;
        document.getElementById('arcadeGameOverOverlay').style.display = 'flex';

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
                text_prompt: `[Arcade: Orbital Defense Wave ${this.wave} Score: ${this.score}]`,
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

// ==========================================================================
// Game Engine 2: Cyber Velocity (Neon Warp Time-Attack Racer)
// ==========================================================================
class VelocityRacerEngine {
    constructor(difficultyTier = 'tactical', startWave = 1) {
        this.canvas = document.getElementById('arcadeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.running = false;
        this.difficultyTier = difficultyTier;
        this.sector = startWave || 1;
        this.score = 0;
        this.streak = 0;
        this.speedMph = 80;
        this.nitroCharge = 0;
        this.timeLeft = 45; // Time attack countdown
        this.activeLane = 1; // 0: Left, 1: Center, 2: Right
        this.racerX = this.canvas.width / 2;
        this.targetRacerX = this.canvas.width / 2;
        this.gates = [];
        this.particles = [];
        this.warpStars = [];
        this.activeTarget = null;
        this.screenShake = 0;

        this.startTime = performance.now();
        this.lastKeyTime = null;
        this.totalKeystrokes = 0;
        this.correctKeystrokes = 0;
        this.errorCount = 0;
        this.errorMap = {};
        this.timingBlob = [];
        this.lastSpawnTime = performance.now();

        this.initWarpStars();
        this.setupKeyboard();
    }

    initWarpStars() {
        this.warpStars = [];
        for (let i = 0; i < 200; i++) {
            this.warpStars.push({
                x: (Math.random() - 0.5) * this.canvas.width * 2,
                y: (Math.random() - 0.5) * this.canvas.height * 2,
                z: Math.random() * 1000 + 1,
                speed: 12
            });
        }
    }

    getLaneX(laneIndex) {
        const center = this.canvas.width / 2;
        const spacing = Math.min(260, this.canvas.width * 0.28);
        return center + (laneIndex - 1) * spacing;
    }

    spawnGate() {
        const weakKeys = (state.dashboard?.weak_keys || []).map(x => x.expected_key.toLowerCase());
        const activeInitialLetters = new Set(this.gates.map(g => g.word[0].toLowerCase()));
        
        // Pick an unoccupied lane
        const occupiedLanes = new Set(this.gates.filter(g => g.z > 600).map(g => g.lane));
        const freeLanes = [0, 1, 2].filter(l => !occupiedLanes.has(l));
        const lane = freeLanes.length > 0 ? freeLanes[Math.floor(Math.random() * freeLanes.length)] : Math.floor(Math.random() * 3);

        let rawWord = selectArcadeWord(this.sector, false, activeInitialLetters, weakKeys, this.difficultyTier);
        let word = formatWordForWave(rawWord, this.sector, false);

        this.gates.push({
            id: Math.random().toString(),
            word: word,
            typedIndex: 0,
            lane: lane,
            z: 1000,
            hue: lane === 0 ? 190 : (lane === 1 ? 280 : 330),
            errorFlash: 0
        });

        this.lastSpawnTime = performance.now();
    }

    setupKeyboard() {
        this.keyHandler = e => {
            if (!this.running) return;

            if (e.code === 'Space') {
                e.preventDefault();
                if (this.nitroCharge >= 10) {
                    this.triggerNitro();
                }
                return;
            }

            if (e.code === 'Escape' || e.code === 'Backspace') {
                if (this.activeTarget) {
                    const gate = this.gates.find(g => g.id === this.activeTarget);
                    if (gate) gate.typedIndex = 0;
                    this.activeTarget = null;
                    this.updateHUD();
                }
                return;
            }

            if (e.repeat) return;
            if (e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) return;
            const char = e.key;
            const now = performance.now();
            const latency = this.lastKeyTime ? now - this.lastKeyTime : 0;
            this.lastKeyTime = now;
            this.totalKeystrokes++;

            if (this.activeTarget) {
                const gate = this.gates.find(g => g.id === this.activeTarget);
                if (gate) {
                    const expected = gate.word[gate.typedIndex];
                    if (char === expected || char.toLowerCase() === expected.toLowerCase()) {
                        this.hitCharacter(gate);
                        this.correctKeystrokes++;
                        this.timingBlob.push({ key: char, latency, timestamp: now });
                        return;
                    } else {
                        this.missCharacter(expected, char, gate);
                        return;
                    }
                } else {
                    this.activeTarget = null;
                }
            }

            // Find closest candidate gate in any lane that has not been started
            const candidates = this.gates
                .filter(g => g.typedIndex === 0 && (g.word[0] === char || g.word[0].toLowerCase() === char.toLowerCase()))
                .sort((a, b) => a.z - b.z); // nearest gate

            if (candidates.length > 0) {
                const target = candidates[0];
                this.activeTarget = target.id;
                this.activeLane = target.lane;
                this.hitCharacter(target);
                this.correctKeystrokes++;
                this.timingBlob.push({ key: char, latency, timestamp: now });
            } else {
                this.missCharacter('?', char, null);
            }
        };

        window.addEventListener('keydown', this.keyHandler);
    }

    hitCharacter(gate) {
        gate.typedIndex++;
        gate.errorFlash = 0;
        this.streak++;
        this.nitroCharge = Math.min(10, this.nitroCharge + 1);
        this.speedMph = Math.min(320, this.speedMph + 4);

        const multiplier = 1 + Math.min(4, Math.floor(this.streak / 6));
        this.score += 90 * multiplier;

        playLaserSound(1.2 + (gate.typedIndex / gate.word.length) * 0.4);

        if (gate.typedIndex >= gate.word.length) {
            this.shatterGate(gate);
        }

        this.updateHUD();
    }

    missCharacter(expected, actual, gate = null) {
        this.streak = 0;
        this.errorCount++;
        this.errorMap[expected] = (this.errorMap[expected] || 0) + 1;
        this.speedMph = Math.max(60, this.speedMph - 15);
        if (gate) gate.errorFlash = 1.0;
        playKeySound('beep');
        this.updateHUD();
    }

    shatterGate(gate) {
        this.activeTarget = null;
        this.score += gate.word.length * 150 * (1 + Math.min(4, Math.floor(this.streak / 6)));
        this.timeLeft = Math.min(60, this.timeLeft + 6); // Add bonus time!

        playNitroBoostSound();
        this.screenShake = 10;
        this.addParticles(this.getLaneX(gate.lane), this.canvas.height - 120, 30, gate.hue);

        this.gates = this.gates.filter(g => g.id !== gate.id);
        toast(`⚡ NITRO DRIFT GATE SHATTERED! +6s Bonus`);
    }

    triggerNitro() {
        this.nitroCharge = 0;
        this.screenShake = 18;
        this.speedMph = Math.min(360, this.speedMph + 80);
        this.timeLeft = Math.min(60, this.timeLeft + 12);
        playEmpSound();

        // Shatter all current gates
        this.gates.forEach(g => {
            this.addParticles(this.getLaneX(g.lane), this.canvas.height - 140, 20, 50);
        });
        this.score += this.gates.length * 400;
        this.gates = [];
        this.activeTarget = null;
        this.updateHUD();
    }

    addParticles(x, y, count, hue) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 3.5 + 1.5,
                alpha: 1.0,
                hue: hue || 190
            });
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
        if (multEl) multEl.textContent = `${Math.round(this.speedMph)} MPH`;
        if (streakEl) streakEl.textContent = this.streak;
        if (waveEl) waveEl.textContent = `SECTOR ${this.sector}`;
        if (empFill) empFill.style.width = `${(this.nitroCharge / 10) * 100}%`;

        if (shieldCells) {
            shieldCells.innerHTML = `<span style="font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:900;color:${this.timeLeft <= 10 ? '#f43f5e' : '#06b6d4'}">${Math.ceil(this.timeLeft)}s</span>`;
        }
    }

    start() {
        this.running = true;
        this.startTime = performance.now();
        this.updateHUD();
        this.timerInterval = setInterval(() => {
            if (!this.running) return;
            this.timeLeft -= 1;
            this.updateHUD();
            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.gameOver();
            }
        }, 1000);
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
        const spawnInterval = Math.max(900, 2200 - this.sector * 120);

        if (now - this.lastSpawnTime > spawnInterval && this.gates.length < 4) {
            this.spawnGate();
        }

        // Smooth racer steering interpolation
        this.targetRacerX = this.getLaneX(this.activeLane);
        this.racerX += (this.targetRacerX - this.racerX) * 0.18;

        // Advance gates forward in 3D perspective
        const gateSpeed = 6 + (this.speedMph / 40);
        this.gates.forEach(g => {
            g.z -= gateSpeed;
            if (g.z <= 40) {
                // Gate passed without shatter (obstacle scrape)
                this.speedMph = Math.max(50, this.speedMph - 25);
                this.screenShake = 12;
                playShieldDamageSound();
                if (this.activeTarget === g.id) {
                    this.activeTarget = null;
                }
                g.dead = true;
            }
        });
        this.gates = this.gates.filter(g => !g.dead);

        // Warp stars
        this.warpStars.forEach(s => {
            s.z -= gateSpeed * 1.5;
            if (s.z <= 0) {
                s.z = 1000;
                s.x = (Math.random() - 0.5) * this.canvas.width * 2;
                s.y = (Math.random() - 0.5) * this.canvas.height * 2;
            }
        });

        // Particles
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.025;
        });
        this.particles = this.particles.filter(p => p.alpha > 0);

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

        // Canvas Background
        this.ctx.fillStyle = '#050711';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const centerX = this.canvas.width / 2;
        const horizonY = this.canvas.height * 0.35;

        // 3D Warp Stars
        this.warpStars.forEach(s => {
            const k = 250 / s.z;
            const px = s.x * k + centerX;
            const py = s.y * k + horizonY;
            const size = Math.max(0.5, (1 - s.z / 1000) * 3);

            if (px >= 0 && px <= this.canvas.width && py >= 0 && py <= this.canvas.height) {
                this.ctx.fillStyle = `rgba(6, 182, 212, ${(1 - s.z / 1000) * 0.8})`;
                this.ctx.beginPath();
                this.ctx.arc(px, py, size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });

        // 3D Perspective Neon Highway
        const roadBottomWidth = this.canvas.width * 0.85;
        const roadTopWidth = 60;

        this.ctx.fillStyle = 'rgba(10, 15, 30, 0.9)';
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - roadTopWidth / 2, horizonY);
        this.ctx.lineTo(centerX + roadTopWidth / 2, horizonY);
        this.ctx.lineTo(centerX + roadBottomWidth / 2, this.canvas.height);
        this.ctx.lineTo(centerX - roadBottomWidth / 2, this.canvas.height);
        this.ctx.closePath();
        this.ctx.fill();

        // Neon Lane Dividers
        this.ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        this.ctx.lineWidth = 2;
        [-1, 0, 1].forEach(lane => {
            const bottomX = this.getLaneX(lane + 1);
            this.ctx.beginPath();
            this.ctx.moveTo(centerX + lane * 15, horizonY);
            this.ctx.lineTo(bottomX, this.canvas.height);
            this.ctx.stroke();
        });

        // Render Approaching Neon Energy Gates
        this.gates.forEach(gate => {
            const isTargeted = this.activeTarget === gate.id;
            const k = 250 / gate.z;
            const gateLaneX = (this.getLaneX(gate.lane) - centerX) * (1 - gate.z / 1000) + centerX;
            const gateY = horizonY + (this.canvas.height - horizonY) * (1 - gate.z / 1000);
            const scale = Math.max(0.35, 1 - gate.z / 1000);

            this.ctx.save();
            this.ctx.translate(gateLaneX, gateY);
            this.ctx.scale(scale, scale);

            if (gate.errorFlash > 0) {
                gate.errorFlash -= 0.04;
                this.ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
                this.ctx.strokeStyle = '#f43f5e';
                this.ctx.lineWidth = 3;
            } else {
                this.ctx.fillStyle = `hsla(${gate.hue}, 80%, 20%, 0.85)`;
                this.ctx.strokeStyle = isTargeted ? '#ffffff' : `hsla(${gate.hue}, 100%, 65%, 0.9)`;
                this.ctx.lineWidth = isTargeted ? 3 : 1.5;
            }

            const charWidth = 13;
            const textWidth = Math.max(74, gate.word.length * charWidth + 28);
            this.ctx.beginPath();
            this.ctx.roundRect(-textWidth / 2, -18, textWidth, 36, 10);
            this.ctx.fill();
            this.ctx.stroke();

            this.ctx.font = 'bold 15px "JetBrains Mono", monospace';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            let cursorX = -textWidth / 2 + 14 + charWidth / 2;
            for (let i = 0; i < gate.word.length; i++) {
                const ch = gate.word[i];
                if (i < gate.typedIndex) {
                    this.ctx.fillStyle = '#10b981';
                } else if (i === gate.typedIndex && isTargeted) {
                    this.ctx.fillStyle = '#ffffff';
                } else {
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                }
                this.ctx.fillText(ch, cursorX + i * charWidth, 0);
            }

            this.ctx.restore();
        });

        // Player Cyber Racer Ship
        const racerY = this.canvas.height - 45;
        this.ctx.save();
        this.ctx.translate(this.racerX, racerY);

        // Neon Thruster Exhaust
        this.ctx.fillStyle = `rgba(6, 182, 212, ${0.6 + Math.random() * 0.4})`;
        this.ctx.beginPath();
        this.ctx.arc(0, 14, 8 + Math.random() * 4, 0, Math.PI * 2);
        this.ctx.fill();

        // Ship Body
        this.ctx.fillStyle = '#0ea5e9';
        this.ctx.beginPath();
        this.ctx.moveTo(0, -22);
        this.ctx.lineTo(20, 12);
        this.ctx.lineTo(0, 4);
        this.ctx.lineTo(-20, 12);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.restore();

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
        clearInterval(this.timerInterval);
        const elapsed = (performance.now() - this.startTime) / 1000;
        const wpm = (this.correctKeystrokes / 5) / (elapsed / 60);
        const accuracy = this.totalKeystrokes ? (this.correctKeystrokes / this.totalKeystrokes) * 100 : 100;

        const highScore = Math.max(this.score, Number(localStorage.getItem('kf_velocity_high_score') || 0));
        localStorage.setItem('kf_velocity_high_score', highScore);

        document.getElementById('finalScoreVal').textContent = this.score.toLocaleString();
        document.getElementById('finalWaveVal').textContent = `Sector ${this.sector}`;
        document.getElementById('finalWpmVal').textContent = `${Math.round(wpm || 0)} WPM`;
        document.getElementById('finalAccVal').textContent = `${accuracy.toFixed(1)}%`;
        document.getElementById('arcadeGameOverOverlay').style.display = 'flex';

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
                text_prompt: `[Arcade: Cyber Velocity Racer Score: ${this.score}]`,
                errors: errList,
                timing: this.timingBlob
            });
            toast(`Cyber Velocity Saved: Score ${this.score.toLocaleString()} (${Math.round(wpm)} WPM)`);
        } catch (e) {
            console.error("Failed to save velocity telemetry", e);
        }
    }

    destroy() {
        this.running = false;
        clearInterval(this.timerInterval);
        if (this.keyHandler) {
            window.removeEventListener('keydown', this.keyHandler);
        }
    }
}

// ==========================================================================
// Game Engine 3: Cascade Reactor (Multi-Column Block Breaker)
// ==========================================================================
class CascadeReactorEngine {
    constructor(difficultyTier = 'tactical', startWave = 1) {
        this.canvas = document.getElementById('arcadeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.running = false;
        this.difficultyTier = difficultyTier;
        this.level = startWave || 1;
        this.score = 0;
        this.streak = 0;
        this.reactorIntegrity = 100;
        this.blastMeter = 0;
        this.blocks = [];
        this.particles = [];
        this.activeTarget = null;
        this.screenShake = 0;

        this.startTime = performance.now();
        this.lastKeyTime = null;
        this.totalKeystrokes = 0;
        this.correctKeystrokes = 0;
        this.errorCount = 0;
        this.errorMap = {};
        this.timingBlob = [];
        this.lastSpawnTime = performance.now();

        this.columnsCount = 4;
        this.setupKeyboard();
    }

    getColumnX(colIndex) {
        const colWidth = this.canvas.width / this.columnsCount;
        return colWidth * colIndex + colWidth / 2;
    }

    spawnBlock() {
        const weakKeys = (state.dashboard?.weak_keys || []).map(x => x.expected_key.toLowerCase());
        const activeInitialLetters = new Set(this.blocks.map(b => b.word[0].toLowerCase()));
        const col = Math.floor(Math.random() * this.columnsCount);

        let rawWord = selectArcadeWord(this.level, false, activeInitialLetters, weakKeys, this.difficultyTier);
        let word = formatWordForWave(rawWord, this.level, false);

        this.blocks.push({
            id: Math.random().toString(),
            word: word,
            typedIndex: 0,
            column: col,
            y: -30,
            speed: 18 + this.level * 2.2,
            hue: col * 75 + 180,
            errorFlash: 0
        });

        this.lastSpawnTime = performance.now();
    }

    setupKeyboard() {
        this.keyHandler = e => {
            if (!this.running) return;

            if (e.code === 'Space') {
                e.preventDefault();
                if (this.blastMeter >= 10) {
                    this.triggerSuperBlast();
                }
                return;
            }

            if (e.code === 'Escape' || e.code === 'Backspace') {
                if (this.activeTarget) {
                    const block = this.blocks.find(b => b.id === this.activeTarget);
                    if (block) block.typedIndex = 0;
                    this.activeTarget = null;
                    this.updateHUD();
                }
                return;
            }

            if (e.repeat) return;
            if (e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) return;
            const char = e.key;
            const now = performance.now();
            const latency = this.lastKeyTime ? now - this.lastKeyTime : 0;
            this.lastKeyTime = now;
            this.totalKeystrokes++;

            if (this.activeTarget) {
                const block = this.blocks.find(b => b.id === this.activeTarget);
                if (block) {
                    const expected = block.word[block.typedIndex];
                    if (char === expected || char.toLowerCase() === expected.toLowerCase()) {
                        this.hitCharacter(block);
                        this.correctKeystrokes++;
                        this.timingBlob.push({ key: char, latency, timestamp: now });
                        return;
                    } else {
                        this.missCharacter(expected, char, block);
                        return;
                    }
                } else {
                    this.activeTarget = null;
                }
            }

            const candidates = this.blocks
                .filter(b => b.typedIndex === 0 && (b.word[0] === char || b.word[0].toLowerCase() === char.toLowerCase()))
                .sort((a, b) => b.y - a.y);

            if (candidates.length > 0) {
                const target = candidates[0];
                this.activeTarget = target.id;
                this.hitCharacter(target);
                this.correctKeystrokes++;
                this.timingBlob.push({ key: char, latency, timestamp: now });
            } else {
                this.missCharacter('?', char, null);
            }
        };

        window.addEventListener('keydown', this.keyHandler);
    }

    hitCharacter(block) {
        block.typedIndex++;
        block.errorFlash = 0;
        this.streak++;
        this.blastMeter = Math.min(10, this.blastMeter + 1);

        const multiplier = 1 + Math.min(4, Math.floor(this.streak / 6));
        this.score += 80 * multiplier;

        playLaserSound(1.3 + (block.typedIndex / block.word.length) * 0.4);

        if (block.typedIndex >= block.word.length) {
            this.shatterBlock(block);
        }

        this.updateHUD();
    }

    missCharacter(expected, actual, block = null) {
        this.streak = 0;
        this.errorCount++;
        this.errorMap[expected] = (this.errorMap[expected] || 0) + 1;
        if (block) block.errorFlash = 1.0;
        playKeySound('beep');
        this.updateHUD();
    }

    shatterBlock(block) {
        this.activeTarget = null;
        this.score += block.word.length * 140 * (1 + Math.min(4, Math.floor(this.streak / 6)));
        this.reactorIntegrity = Math.min(100, this.reactorIntegrity + 4);

        playCrystalShatterSound();
        this.addParticles(this.getColumnX(block.column), block.y, 25, block.hue);

        this.blocks = this.blocks.filter(b => b.id !== block.id);
    }

    triggerSuperBlast() {
        this.blastMeter = 0;
        this.screenShake = 16;
        playEmpSound();

        this.blocks.forEach(b => {
            this.addParticles(this.getColumnX(b.column), b.y, 18, 140);
        });
        this.score += this.blocks.length * 350;
        this.blocks = [];
        this.activeTarget = null;
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
                hue: hue || 160
            });
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
        if (waveEl) waveEl.textContent = `LEVEL ${this.level}`;
        if (empFill) empFill.style.width = `${(this.blastMeter / 10) * 100}%`;

        if (shieldCells) {
            shieldCells.innerHTML = `<span style="font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:900;color:${this.reactorIntegrity <= 30 ? '#f43f5e' : '#10b981'}">${Math.round(this.reactorIntegrity)}%</span>`;
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
        const spawnInterval = Math.max(900, 2100 - this.level * 110);

        if (now - this.lastSpawnTime > spawnInterval && this.blocks.length < 6) {
            this.spawnBlock();
        }

        const baseLine = this.canvas.height - 30;
        this.blocks.forEach(b => {
            b.y += b.speed * (1 / 60);
            if (b.y >= baseLine) {
                this.reactorIntegrity -= 15;
                this.screenShake = 12;
                playShieldDamageSound();
                this.addParticles(this.getColumnX(b.column), baseLine, 18, 0);
                if (this.activeTarget === b.id) {
                    this.activeTarget = null;
                }
                b.dead = true;

                if (this.reactorIntegrity <= 0) {
                    this.gameOver();
                }
            }
        });
        this.blocks = this.blocks.filter(b => !b.dead);

        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.025;
        });
        this.particles = this.particles.filter(p => p.alpha > 0);

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

        this.ctx.fillStyle = '#060a14';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Column grid dividers
        const colWidth = this.canvas.width / this.columnsCount;
        this.ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
        this.ctx.lineWidth = 1.5;
        for (let i = 1; i < this.columnsCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * colWidth, 0);
            this.ctx.lineTo(i * colWidth, this.canvas.height);
            this.ctx.stroke();
        }

        // Falling Cascade Blocks
        this.blocks.forEach(block => {
            const isTargeted = this.activeTarget === block.id;
            const bx = this.getColumnX(block.column);

            this.ctx.save();
            this.ctx.translate(bx, block.y);

            if (block.errorFlash > 0) {
                block.errorFlash -= 0.04;
                this.ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
                this.ctx.strokeStyle = '#f43f5e';
                this.ctx.lineWidth = 3;
            } else {
                this.ctx.fillStyle = `hsla(${block.hue}, 80%, 18%, 0.9)`;
                this.ctx.strokeStyle = isTargeted ? '#ffffff' : `hsla(${block.hue}, 100%, 65%, 0.9)`;
                this.ctx.lineWidth = isTargeted ? 2.5 : 1.5;
            }

            const charWidth = 12;
            const textWidth = Math.max(68, block.word.length * charWidth + 24);
            this.ctx.beginPath();
            this.ctx.roundRect(-textWidth / 2, -16, textWidth, 32, 8);
            this.ctx.fill();
            this.ctx.stroke();

            this.ctx.font = 'bold 13.5px "JetBrains Mono", monospace';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            let cursorX = -textWidth / 2 + 12 + charWidth / 2;
            for (let i = 0; i < block.word.length; i++) {
                const ch = block.word[i];
                if (i < block.typedIndex) {
                    this.ctx.fillStyle = '#10b981';
                } else if (i === block.typedIndex && isTargeted) {
                    this.ctx.fillStyle = '#ffffff';
                } else {
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                }
                this.ctx.fillText(ch, cursorX + i * charWidth, 0);
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

        const highScore = Math.max(this.score, Number(localStorage.getItem('kf_cascade_high_score') || 0));
        localStorage.setItem('kf_cascade_high_score', highScore);

        document.getElementById('finalScoreVal').textContent = this.score.toLocaleString();
        document.getElementById('finalWaveVal').textContent = `Level ${this.level}`;
        document.getElementById('finalWpmVal').textContent = `${Math.round(wpm || 0)} WPM`;
        document.getElementById('finalAccVal').textContent = `${accuracy.toFixed(1)}%`;
        document.getElementById('arcadeGameOverOverlay').style.display = 'flex';

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
                text_prompt: `[Arcade: Cascade Reactor Score: ${this.score}]`,
                errors: errList,
                timing: this.timingBlob
            });
            toast(`Cascade Reactor Saved: Score ${this.score.toLocaleString()} (${Math.round(wpm)} WPM)`);
        } catch (e) {
            console.error("Failed to save cascade telemetry", e);
        }
    }

    destroy() {
        this.running = false;
        if (this.keyHandler) {
            window.removeEventListener('keydown', this.keyHandler);
        }
    }
}
