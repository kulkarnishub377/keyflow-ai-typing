# KeyFlow Production Architecture Specification

> **Version:** 3.0.0 (Production Release)  
> **Author & Lead Architect:** Shubham Kulkarni  
> **Status:** Completed & Verified

---

## 1. Executive System Overview

KeyFlow is an ultra-high performance, local-first adaptive touch-typing trainer and cyber velocity arcade engine. Engineered to operate with **zero cloud dependencies** and **sub-millisecond keystroke latency**, KeyFlow decouples telemetry collection from pedagogical interpretation using a **10-agent deterministic AI pipeline**.

---

## 2. Runtime Boundaries & Dual-Mode Topology

KeyFlow operates under an isomorphic presentation bridge that seamlessly transitions between desktop runtime and static web environments:

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│                            PRESENTATION LAYER (WEB)                              │
│  HTML5 Semantic UI • CSS3 Obsidian Glassmorphism • Vanilla JS (ES6+)             │
│  60 FPS HTML5 Canvas Arcade Engine • Web Audio API DSP Oscillator Synthesizer    │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
      [Desktop Environment]                         [Web Demo / GitHub Pages]
      window.pywebview.api                          In-Browser WebDemoEngine
                   │                                           │
┌──────────────────▼──────────────────┐             ┌──────────▼──────────┐
│        PYTHON APPLICATION CORE      │             │  Local Web Storage  │
│  - Python 3.11 Runtime              │             │  - localStorage     │
│  - API Dispatcher & Data Vault      │             │  - Client State     │
│  - SQLite3 (WAL Mode, Conn Pool)    │             └─────────────────────┘
│  - AES-256 Fernet Encryption        │
│  - 10-Agent Multi-Agent Pipeline    │
└─────────────────────────────────────┘
```

---

## 3. The 10-Agent Deterministic AI Pipeline

KeyFlow's agent layer turns raw keystroke telemetry into safe, explainable, and local learning interventions without non-deterministic prompt hallucinations or cloud latency:

```text
Raw Keystroke Telemetry (Sub-Millisecond Timings & Digraph Matrices)
                             │
                             ▼
┌───────────────────────────────────────────────────────────────────────┐
│ 1. Performance Analyst                                                │
│    Calculates true WPM, burst velocity, raw WPM & consistency std dev │
└────────────────────────────┬──────────────────────────────────────────┘
                             ▼
┌───────────────────────────────────────────────────────────────────────┐
│ 2. Weakness Detector                                                  │
│    Ranks error frequencies & identifies slow digraphs (th, qu, tr)    │
└────────────────────────────┬──────────────────────────────────────────┘
                             ▼
┌───────────────────────────────────────────────────────────────────────┐
│ 3. Curriculum Planner                                                 │
│    Evaluates prerequisite mastery gates & selects next skill objective│
└────────────────────────────┬──────────────────────────────────────────┘
                             ▼
┌───────────────────────────────────────────────────────────────────────┐
│ 4. Exercise Generator                                                 │
│    Synthesizes phonetically plausible pseudo-words via N-Gram models  │
└────────────────────────────┬──────────────────────────────────────────┘
                             ▼
┌───────────────────────────────────────────────────────────────────────┐
│ 5. Difficulty Controller                                              │
│    Enforces mathematical hysteresis gates (<90% regress, ≥97% advance)│
└────────────────────────────┬──────────────────────────────────────────┘
                             ▼
┌───────────────────────────────────────────────────────────────────────┐
│ 6. Quality Validator                                                  │
│    Validates schemas, range constraints & rejects impossible telemetry│
└────────────────────────────┬──────────────────────────────────────────┘
                             ▼
┌───────────────────────────────────────────────────────────────────────┐
│ 7. Coach Agent                                                        │
│    Formulates concise, plain-language guidance with zero shame bias   │
└────────────────────────────┬──────────────────────────────────────────┘
                             ▼
┌───────────────────────────────────────────────────────────────────────┐
│ 8. Session Reviewer                                                   │
│    Compares completed session against 7-day & 30-day baseline drift   │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 4. Key Subsystem Specifications

### 4.1 Zero-Latency $O(1)$ Typing Render Engine
- **Pre-tokenized DOM**: Text prompts are pre-rendered into static character `<span>` elements once upon passage load.
- **Granular Mutation**: Keystrokes mutate only the active span's CSS class (`.done`, `.bad`, `.current`) in $O(1)$ constant time.
- **Sub-Pixel Caret**: Smooth transform translation (`translate3d`) avoids browser layout reflows and garbage collection pauses at 100+ WPM.

### 4.2 Web Audio DSP Synthesis Engine
- **Zero Asset Overhead**: No external MP3/WAV files are bundled.
- **Transient Audio Synthesis**: Generates mechanical switch clicks (triangle oscillator sweep $140\text{ Hz} \to 30\text{ Hz}$ over $35\text{ ms}$), 800 Hz vintage typewriter bell dings on `Enter`, and rhythmic metronome pulses directly in memory.

### 4.3 60 FPS HTML5 Canvas Arcade Engine & Ghost Racing
- **Orbital Defense Space Combat**: Real-time particle physics and projectile collision detection. Queries SQLite telemetry to highlight enemies carrying the user's slowest digraphs with **Neon Red Auras** for subconscious reflex training.
- **Velocity Ghost Racing**: Dual-lane track comparing live player progress against an AI Target Ghost in real time with **🔥 Nitro Boost** visualizer.

### 4.4 Cryptographic Data Vault & Persistence
- **SQLite WAL Mode**: Write-Ahead Logging for high-concurrency and non-blocking sub-millisecond writes.
- **Foreign Key Resiliency**: Seamlessly accommodates standard curriculum lessons (`lesson_id`) and adaptive micro-drills (`lesson_id: NULL`).
- **AES-256 Fernet Encryption**: Local database backups are symmetrically encrypted at rest.

---

## 5. Build, Packaging & CI/CD Pipeline

| Pipeline | Automation Tool | Output Artifact |
|---|---|---|
| **Master Build Engine** | `build_app.py` | Standalone `dist/KeyFlow.exe` (~18 MB) + Desktop Shortcut |
| **Multi-Res Icon Engine** | Pillow | `web/favicon.ico` (16px, 24px, 32px, 48px, 64px, 128px, 256px) |
| **CI/CD Desktop Release** | GitHub Actions (`release.yml`) | Automated `.exe` binary upload on tag push (`v*`) |
| **CI/CD Web Demo** | GitHub Actions (`deploy_pages.yml`) | Live web demo deployed to GitHub Pages on `main` push |
