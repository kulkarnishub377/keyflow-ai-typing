<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="web/assets/keyflow_logo_dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="web/assets/keyflow_logo_light.svg">
    <img alt="KeyFlow AI Typing Studio" src="web/assets/keyflow_logo_light.svg" width="340" />
  </picture>
  <br/><br/>
  <p><strong>Advanced, Offline-First, Local AI Typing Engine & Arcade Cyber Combat Studio</strong></p>

  <!-- Badges -->
  <p>
    <img alt="Release Version" src="https://img.shields.io/badge/version-v3.0.0-blueviolet.svg?style=for-the-badge" />
    <img alt="Python Version" src="https://img.shields.io/badge/python-3.11+-blue.svg?style=for-the-badge&logo=python&logoColor=white" />
    <img alt="Platform" src="https://img.shields.io/badge/platform-windows%20%7C%20macOS%20%7C%20linux-lightgrey.svg?style=for-the-badge&logo=windows" />
    <img alt="Zero Cloud Dependency" src="https://img.shields.io/badge/architecture-offline--first-success.svg?style=for-the-badge" />
    <img alt="Performance" src="https://img.shields.io/badge/latency-%3C0.5ms-emerald.svg?style=for-the-badge" />
  </p>
</div>

<br/>

## 📖 Table of Contents
- [About KeyFlow](#-about-keyflow)
- [Key Features & Innovations](#-key-features--innovations)
- [Cyber Matrix Arcade Defense](#-cyber-matrix-arcade-defense)
- [Deterministic Multi-Agent Pipeline](#-deterministic-multi-agent-pipeline)
- [Design System & Typography](#-design-system--typography)
- [Project Sprints & Roadmap](#-project-sprints--roadmap)
- [Installation & Running](#-installation--running)
- [Building Standalone Desktop App](#-building-standalone-desktop-app)
- [Privacy & Security Zero-Trust](#-privacy--security-zero-trust)
- [Contributing](#-contributing)

---

## ⚡ About KeyFlow

Most typing platforms measure Speed (WPM) and Accuracy as generic averages across an entire test. **KeyFlow is fundamentally different.** 

KeyFlow captures keystroke dynamics at the **microsecond level**, recording precise `t -> h` transition delays, right/left-hand load imbalances, and rhythm variances (Rhythm CV score). Powered by a deterministic local multi-agent pipeline and the **Obsidian Glass** design system, KeyFlow acts as your private, hyper-analytical typing mentor and gamified combat arena.

**Core Philosophy: Zero Cloud Dependency.**  
Everything—from telemetry recording to procedural n-gram drill synthesis, audio DSP emulation, and local AI coaching—runs 100% offline on your machine.

---

## ✨ Key Features & Innovations

- 🎯 **Micro-Telemetry Engine:** Sub-millisecond (`performance.now()`) latency tracking for every keystroke and digraph transition.
- 🎨 **Obsidian Glass Design System:** 4-tier elevation surface palette (`#070913`, `#0a0f1d`, `#10182e`, `#16213e`) with backdrop blurs (`backdrop-filter: blur(20px)`), sub-pixel borders, and custom mechanical keycap press animations.
- 🔤 **Precision Typography Suite:** Display headings in **Outfit**, telemetry and UI copy in **Plus Jakarta Sans** and **Inter**, prompt text in **JetBrains Mono** and **Fira Code**.
- 🚀 **Procedural Pseudo-Word Adaptive Engine:** Dynamic phonetic n-gram synthesizer generating targeted practice words tailored to your slowest digraph transitions (`slow_transitions`) and error keys.
- 🛡️ **Master & Blind Practice Modes:**
  - *Master Mode:* Zero-typo tolerance mode enforcing instant barrier penalties for advanced typists plateauing at high accuracy (≥98%).
  - *Blind Mode:* Progressive character blur and tactile focus for muscle memory training.
- 🏃 **Visual Rhythm Metronome & Pace Caret:** Sub-pixel ghost caret tracing across the prompt at exact target WPM to help learners internalize consistent cadence.
- ⌨️ **Global Command Palette (`Ctrl+K` / `Cmd+K`):** Keyboard-first spotlight navigation across lessons, arcade combat, analytics, and workspace preferences.
- 🔊 **Zero-Asset DSP Web Audio Synthesizer:** Real-time synthesized mechanical switch clicks, soft studio tones, laser blasts, sub-bass explosions, and rhythmic metronome pulses.
- 🔒 **Encrypted Local Vault:** Full SQLite data dumps encrypted with AES-256 (`cryptography.fernet`) to secure your keystroke dynamics at rest.

---

## ⚡ Cyber Matrix Arcade Defense

KeyFlow v3.0 introduces an adrenaline-fueled **60 FPS HTML5 Canvas Space-Combat Arcade Game** that turns typing training into orbital defense:

- **AI Weakness-Targeted Armada:** Enemy ships carry words synthesized from your actual error keys and slowest transitions.
- **Massive 1,000+ Word Multi-Tier Dictionary:** Categorized into Fast Interceptors (3–4 chars), Tactical Cruisers (5–7 chars), and Boss Flagships (8–14 chars).
- **Infinite Procedural Phonotactic Synthesizer:** Generates endless pronounceable pseudo-words embedded with your specific weak digraphs (`quox`, `zenithic`, `plorph`, `travexa`, `synkora`).
- **Progressive Shift & Capitalization Dynamics:** Lower waves feature lowercase baseline words; intermediate waves (Wave 3+) introduce TitleCase to train Shift-key mechanics; advanced waves feature CamelCase and multi-capital terms with golden visual highlights.
- **Combat Multipliers & EMP Shockwaves:** Build streaks up to $5\times$ multiplier and detonate Spacebar EMP blasts when charged.
- **Authoritative Telemetry:** Every arcade keystroke is logged directly into SQLite, contributing to your daily practice minutes, streaks, and AI coaching analysis.

---

## 🤖 Deterministic Multi-Agent Pipeline

KeyFlow's local decision engine uses a strict sequence of specialized, deterministic agents communicating via structured JSON state:

```text
Session Telemetry
       ↓
Performance Analyst   → Calculates WPM, precision accuracy, and rhythm variance
       ↓
Weakness Detector     → Isolates persistent slow transitions and error key clusters
       ↓
Curriculum Planner    → Prioritizes accuracy gates before speed escalation
       ↓
Exercise Generator    → Synthesizes procedural n-gram drill passages
       ↓
Difficulty Controller → Applies mathematical accuracy gates (<90%, 90-96%, >=97%)
       ↓
Quality Validator     → Rejects malformed outputs or rule contradictions
       ↓
Coach                 → Formulates actionable, single-priority advice
       ↓
Privacy Guard         → Sanitizes local PII before optional local LLM synthesis
```

---

## 🎨 Design System & Typography

KeyFlow utilizes a custom **Obsidian Glass** design system engineered exclusively with pure Vanilla CSS:

- **4-Tier Elevation Matrix**: Surfaces structured across `#070913` (canvas void), `#0a0f1d` (sidebar base), `#10182e` (cards), and `#16213e` (elevated modals and HUDs).
- **Sub-Pixel Borders & Glassmorphism**: Fine, high-contrast borders (`rgba(255,255,255,0.06)` to `0.14`) layered over hardware-accelerated backdrop glass blurs (`backdrop-filter: blur(20px)`).
- **Curated Font Pairing**:
  - **Outfit**: Brand marks, page titles, and primary stat callouts.
  - **Plus Jakarta Sans / Inter**: High-legibility UI micro-copy, badges, and navigation labels.
  - **JetBrains Mono / Fira Code**: Code passages, keystroke streams, and live terminal telemetry.

---

## 🚀 Project Sprints & Roadmap

- [x] **Sprint 1: Micro-Telemetry & SQLite WAL Core** — High-resolution keystroke latency tracking, transition digraph matrix, and local encrypted persistence.
- [x] **Sprint 2: Structured Curriculum & Mastery Gating** — 20-lesson progressive path, accuracy-gated difficulty controller, and QWERTY heatmap analytics.
- [x] **Sprint 3: Multi-Agent Pipeline & Local Observability** — 10-agent deterministic orchestrator, local Ollama abstraction, and AES-Fernet backup engine.
- [x] **Sprint 4: Obsidian Glass & Advanced Typography** — 4-tier surface elevation, Google Font suite (`Outfit`, `Plus Jakarta Sans`, `Inter`, `JetBrains Mono`), Command Palette (`Ctrl+K`), and in-app glass modals.
- [x] **Sprint 5: Cyber Matrix Arcade Studio & Procedural Engine** — 60 FPS Canvas space combat, 1,000+ word dictionary, infinite procedural pseudo-word synthesizer, and Web Audio DSP sound generator.

---

## 🛠️ Installation & Running

### Requirements
- Python 3.11+
- Windows 10/11, macOS, or Linux
- [Ollama](https://ollama.com/) *(Optional: Only required if using local Generative LLM coaching)*

### Run from Source

1. **Clone the repository**
   ```bash
   git clone https://github.com/kulkarnishub377/keyflow-ai-typing.git
   cd keyflow-local
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv .venv
   # Windows (PowerShell):
   .venv\Scripts\Activate.ps1
   # macOS/Linux:
   source .venv/bin/activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Launch the Application**
   ```bash
   python run.py
   ```

---

## 📦 Building Standalone Desktop App

To compile KeyFlow into a standalone Windows `.exe` executable with embedded custom icons:

```bash
pip install pyinstaller
pyinstaller build.spec --clean -y
```

The compiled binary will be located inside the `dist/` directory as `KeyFlow.exe`.

---

## 🧪 Testing

Execute the automated test suite covering deterministic agent contracts, telemetry aggregations, difficulty gates, and encryption:

```bash
python -m unittest discover tests/
```

---

## 🛡️ Privacy & Security Zero-Trust

- **100% Offline by Design:** KeyFlow makes zero outgoing network requests. Telemetry never leaves your local machine.
- **Zero Cloud Trackers:** No telemetry analytics SDKs, Google Analytics, or remote tracking scripts.
- **Sanitization Checkpoints:** The `PrivacyGuard` agent strictly removes local usernames, file paths, and metadata before sending context to optional local LLM adapters.
- **AES-256 Encrypted Backups:** Keystroke dynamics and profiles are protected at rest via AES-256 Fernet symmetric encryption.

---

<div align="center">
  <p><strong>KeyFlow AI Typing</strong> — Built with mathematical precision and local-first architecture.</p>
</div>
