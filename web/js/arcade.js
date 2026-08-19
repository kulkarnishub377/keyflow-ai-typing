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
                    <div class="arcade-modal-card" style="max-width:520px;padding:32px 28px">
                        <div style="font-size:44px;margin-bottom:8px">⚡</div>
                        <h1 style="font-family:'Outfit',sans-serif;font-size:28px;font-weight:900;letter-spacing:-0.03em">
                            CYBER MATRIX ORBITAL DEFENSE
                        </h1>
                        <p style="font-size:13.5px;color:var(--text-muted);margin:8px 0 16px;line-height:1.5">
                            Enemy word armadas are descending on the orbital defense matrix. Type the highlighted characters to lock lasers and destroy threats. Select your combat tier and starting wave below.
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
                                    ⚡ STARTING WAVE
                                </label>
                                <select id="arcadeWaveSelect" style="background:var(--surface-2);color:var(--text-main);border:1px solid var(--border-light);padding:9px 12px;border-radius:var(--radius-sm);width:100%;font-family:inherit;font-size:13px;outline:none;cursor:pointer">
                                    <option value="1" selected>Wave 1 (Calibration)</option>
                                    <option value="3">Wave 3 (Tactical Speed)</option>
                                    <option value="5">Wave 5 (Orbital Storm)</option>
                                    <option value="8">Wave 8 (Hyperdrive)</option>
                                    <option value="10">Wave 10 (Nightmare)</option>
                                </select>
                            </div>
                        </div>

                        <div style="display:flex;gap:10px;justify-content:center;margin-bottom:20px;flex-wrap:wrap">
                            <span class="badge badge-brand">1,000+ Word Lexicon</span>
                            <span class="badge badge-purple">Laser Beam Lock</span>
                            <span class="badge badge-warning">EMP Spacebar Blast</span>
                            <span class="badge badge-success">High Score: ${highScore.toLocaleString()}</span>
                        </div>
                        <button class="btn btn-primary btn-lg" style="width:100%;justify-content:center" onclick="startArcadeGame()">
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
    const diffEl = document.getElementById('arcadeDifficultySelect');
    const waveEl = document.getElementById('arcadeWaveSelect');
    const difficultyTier = diffEl ? diffEl.value : 'tactical';
    const startWave = waveEl ? parseInt(waveEl.value, 10) : 1;

    document.getElementById('arcadeStartOverlay').style.display = 'none';
    document.getElementById('arcadeGameOverOverlay').style.display = 'none';

    if (arcadeGame) arcadeGame.destroy();
    arcadeGame = new ArcadeEngine(difficultyTier, startWave);
    arcadeGame.start();
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
    "loss", "love", "low", "luck", "lung", "mach", "mail", "main", "make", "map", "mark", "mask", "mast", "math", "maze", "meal",
    "memo", "menu", "mesh", "meta", "mild", "milk", "mill", "mind", "mine", "mint", "mode", "mood", "moon", "move", "nano", "near",
    "neck", "nest", "net", "next", "node", "noise", "noon", "norm", "nose", "note", "null", "oath", "obey", "omit", "open", "opt",
    "ore", "pace", "pack", "page", "pair", "palm", "pane", "park", "pass", "path", "peak", "peer", "pen", "pet", "pick", "pile",
    "pin", "ping", "pipe", "plan", "plug", "plus", "poem", "pole", "pool", "port", "post", "push", "quad", "quit", "quiz", "race",
    "rack", "raft", "raid", "rail", "rain", "ramp", "rank", "raw", "ray", "read", "real", "reap", "redo", "reef", "rest", "rich",
    "ride", "ring", "riot", "risk", "road", "rock", "roll", "roof", "root", "rope", "rose", "ruby", "rule", "run", "rush", "rust",
    "safe", "sail", "salt", "sand", "save", "scan", "scope", "seal", "seed", "seek", "send", "ship", "shoe", "shop", "show", "side",
    "sign", "silk", "sink", "site", "size", "skin", "skip", "slam", "slot", "slow", "snap", "snow", "soap", "sock", "soft", "soil",
    "song", "sort", "soul", "span", "spar", "spark", "spin", "spot", "spur", "star", "step", "stop", "stub", "suit", "sync", "tab",
    "tag", "tail", "tank", "tape", "task", "team", "tech", "temp", "text", "tide", "tilt", "time", "tiny", "tip", "tool", "top",
    "tour", "town", "track", "trap", "tree", "trim", "trip", "tube", "tune", "twin", "type", "unit", "user", "valve", "vast", "vein",
    "vent", "verb", "vest", "view", "void", "volt", "vote", "wade", "wage", "wait", "walk", "wall", "wand", "warp", "wave", "weak",
    "web", "week", "well", "west", "wild", "wind", "wing", "wire", "wise", "wish", "wolf", "wood", "word", "work", "worm", "wrap",
    "xray", "yard", "yarn", "yawn", "year", "yield", "yolk", "zero", "zinc", "zone", "zoom"
];

const ARCADE_TIER_2_WORDS = [
    "action", "active", "admire", "advice", "agency", "agenda", "align", "alpha", "alpine", "anchor", "arcade", "argent", "armor",
    "array", "arrow", "aspect", "atomic", "author", "autumn", "avatar", "backup", "banner", "battle", "beacon", "binary", "bios",
    "bitwise", "blast", "blazer", "blend", "border", "bounce", "branch", "brave", "breach", "bridge", "broadcast", "broker", "bronze",
    "browse", "buffer", "bundle", "bunker", "bypass", "cache", "camera", "canvas", "carbon", "cascade", "cipher", "circuit", "cobalt",
    "codec", "column", "combat", "commit", "compile", "config", "console", "cosmic", "cursor", "custom", "cyber", "daemon", "damage",
    "danger", "deploy", "design", "device", "direct", "display", "docker", "domain", "dynamic", "eclipse", "elegant", "element", "emblem",
    "empire", "enable", "encode", "energy", "engine", "entity", "escape", "expand", "export", "fabric", "factor", "falcon", "family",
    "filter", "finish", "firefly", "firewall", "flicker", "flight", "format", "fossil", "frame", "future", "galaxy", "gamma", "gateway",
    "glance", "glitch", "global", "golden", "govern", "gravity", "hammer", "harbor", "hardhat", "header", "helix", "helmet", "hexagon",
    "horizon", "hybrid", "hyper", "impact", "import", "indexed", "infinite", "inherit", "input", "inspect", "install", "intent", "invoke",
    "iterate", "jaguar", "journey", "jupiter", "kinetic", "lambda", "laptop", "launch", "layout", "legacy", "legend", "linear", "listen",
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

// Procedural Phonotactic N-Gram Synthesizer for Infinite Adaptive Weakness Generation
function generateProceduralPseudoWord(weakKeys = [], targetLength = 6) {
    const onsets = ["pr", "tr", "st", "sp", "cr", "br", "fl", "gr", "pl", "sk", "dr", "cl", "qu", "zh", "vr", "kn"];
    const vowels = ["a", "e", "i", "o", "u", "ai", "ea", "ou", "ee", "oo", "ia", "oi"];
    const codas = ["ck", "nt", "mp", "rk", "lt", "st", "sh", "th", "x", "ct", "ld", "ng", "ph", "rn", "pt"];
    const singleConsonants = ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "r", "s", "t", "v", "w", "x", "y", "z"];

    let word = "";
    
    if (weakKeys.length > 0) {
        const primaryWeakKey = weakKeys[Math.floor(Math.random() * weakKeys.length)].toLowerCase();
        const v = vowels[Math.floor(Math.random() * vowels.length)];
        const onset = Math.random() > 0.5 ? onsets[Math.floor(Math.random() * onsets.length)] : primaryWeakKey;
        const coda = codas[Math.floor(Math.random() * codas.length)];
        word = `${onset}${v}${coda}`;
        if (word.length < targetLength) {
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
        // 'tactical' (default progressive)
        if (wave <= 2) {
            pool = ARCADE_TIER_1_WORDS;
        } else if (wave <= 5) {
            pool = Math.random() > 0.4 ? ARCADE_TIER_2_WORDS : ARCADE_TIER_1_WORDS;
        } else {
            pool = Math.random() > 0.35 ? ARCADE_TIER_2_WORDS : ARCADE_TIER_3_WORDS;
        }
    }

    // Procedural pseudo-words mixed into higher waves
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
// Arcade Combat Engine Class
// ==========================================================================
class ArcadeEngine {
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

            // Spacebar for EMP blast
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.empCharge >= 10) {
                    this.triggerEmp();
                }
                return;
            }

            // Escape or Backspace to release current target lock
            if (e.code === 'Escape' || e.code === 'Backspace') {
                if (this.activeTarget) {
                    const ship = this.ships.find(s => s.id === this.activeTarget);
                    if (ship) ship.typedIndex = 0;
                    this.activeTarget = null;
                    this.updateHUD();
                }
                return;
            }

            // Guard against OS key repeat auto-advancing/completing words
            if (e.repeat) return;
            if (e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) return;
            const char = e.key;
            const now = performance.now();
            const latency = this.lastKeyTime ? now - this.lastKeyTime : 0;
            this.lastKeyTime = now;
            this.totalKeystrokes++;

            // If we have an active locked target
            if (this.activeTarget) {
                const ship = this.ships.find(s => s.id === this.activeTarget);
                if (ship) {
                    const expected = ship.word[ship.typedIndex];
                    // Case-tolerant matching so player is never stuck
                    if (char === expected || char.toLowerCase() === expected.toLowerCase()) {
                        this.hitCharacter(ship);
                        this.correctKeystrokes++;
                        this.timingBlob.push({ key: char, latency, timestamp: now });
                        return;
                    } else {
                        // Missed on active target: record error and flash red, BUT KEEP TARGET LOCKED
                        this.missCharacter(expected, char, ship);
                        return;
                    }
                } else {
                    this.activeTarget = null;
                }
            }

            // Find closest candidate starting with char that has NOT been started yet
            const candidates = this.ships
                .filter(s => s.typedIndex === 0 && (s.word[0] === char || s.word[0].toLowerCase() === char.toLowerCase()))
                .sort((a, b) => b.y - a.y); // nearest to base

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

    missCharacter(expected, actual, ship = null) {
        this.streak = 0;
        this.errorCount++;
        this.errorMap[expected] = (this.errorMap[expected] || 0) + 1;
        
        if (ship) {
            ship.errorFlash = 1.0; // Flash red on missed character
        }
        
        playKeySound('beep');
        this.updateHUD();
    }

    destroyShip(ship) {
        this.activeTarget = null;
        this.waveDestroyedCount++;
        this.score += ship.word.length * 120 * (1 + Math.min(4, Math.floor(this.streak / 6)));

        // Big particle explosion
        this.addParticles(ship.x, ship.y, ship.isBoss ? 50 : 22, ship.hue);
        this.screenShake = ship.isBoss ? 16 : 6;
        playExplosionSound();

        if (this.streak % 5 === 0) {
            playComboChime(Math.min(5, Math.floor(this.streak / 5)));
        }

        // Restore 1 shield cell on 20-word streak
        if (this.streak > 0 && this.streak % 20 === 0 && this.shields < 3) {
            this.shields++;
            toast('🛡️ Shield Cell Restored!');
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

        // Restore 1 shield cell on wave victory
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

        // Continuous smooth spawning: spawn if timer expired OR if screen is empty
        const maxConcurrent = Math.min(8, 3 + Math.floor(this.wave * 0.5));
        const interval = Math.max(900, 2000 - this.wave * 100);
        if (this.waveSpawnedCount < this.waveTotalShips && (now - this.lastSpawnTime > interval || this.ships.length < 2)) {
            if (this.ships.length < maxConcurrent) {
                this.spawnShip();
            }
        }

        // Update ships
        const baseLine = this.canvas.height - 40;
        this.ships.forEach(s => {
            s.y += s.speed * (1 / 60);
            if (s.y >= baseLine) {
                // Ship breached defense
                this.addParticles(s.x, baseLine, 20, 0);
                if (this.activeTarget === s.id) {
                    this.activeTarget = null;
                }
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

            // Word text rendering
            this.ctx.font = 'bold 13.5px "JetBrains Mono", monospace';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            let cursorX = -textWidth / 2 + 12 + charWidth / 2;
            for (let i = 0; i < ship.word.length; i++) {
                const ch = ship.word[i];
                const isCapital = ch >= 'A' && ch <= 'Z';
                if (i < ship.typedIndex) {
                    this.ctx.fillStyle = '#10b981'; // done green
                } else if (i === ship.typedIndex && isTargeted) {
                    this.ctx.fillStyle = isCapital ? '#fbbf24' : '#ffffff'; // gold highlight if Shift capital!
                } else {
                    this.ctx.fillStyle = isCapital ? 'rgba(251, 191, 36, 0.75)' : 'rgba(255, 255, 255, 0.6)'; // gold tint for upcoming capitals
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
