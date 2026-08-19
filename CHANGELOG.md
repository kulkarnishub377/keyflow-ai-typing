# Changelog

All notable changes to the **KeyFlow** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.0.0] - 2026-08-19 — Major UI/UX Redesign & Extraordinary Features Studio

### 🌟 Headline Features
- **Obsidian Glass Design System & Advanced Typography**: Complete architectural UI/UX redesign featuring a 4-tier surface elevation system, sub-pixel borders, glass blurs (`backdrop-filter: blur(20px)`), and a precision typography pairing with `Outfit`, `Plus Jakarta Sans`, `Inter`, `JetBrains Mono`, and `Fira Code`.
- **Procedural Pseudo-Word Adaptive Engine**: High-performance n-gram synthesizer in `ExerciseGenerator` and `AdvancedTypingEngine` creating targeted, phonetically plausible drill words for specific transition bottlenecks.
- **Strict Mastery & Blind Modes**:
  - *Master Mode*: Zero-typo tolerance mode enforcing instant penalty barrier on errors for learners plateauing with high accuracy (≥98%).
  - *Blind Mode*: Progressive blur and tactile focus hiding typed characters to train muscle memory.
- **Visual Rhythm Metronome (Pace Caret)**: Ghost Pace Caret tracing across the typing prompt at exact target WPM to help learners internalize speed rhythms.
- **Global Command Palette (`Ctrl+K` / `Cmd+K`)**: Keyboard-first spotlight modal for fuzzy navigation across lessons, drills, telemetry views, and workspace preferences.
- **Obsidian Glass Exit Modal**: Replaced default OS native message box with a sleek in-app glass confirmation modal and clean desktop window destruction.

### ⚡ Performance & Engine Improvements
- **Sub-Millisecond Keystroke Latency**: Optimized vanilla JS event loop executing keystroke handling in `<0.5ms` with zero dropped frames even at 150+ WPM.
- **Foreign Key Resiliency**: Fixed SQLite foreign key constraint checks in `save_session` to seamlessly support adaptive micro-drills and custom practice sets (`lesson_id: -1 / NULL`).
- **Web Audio Sound Synthesis**: Built-in zero-dependency Web Audio synthesizer providing realistic mechanical switch clicks, soft studio tones, and rhythmic metronome pulses.
- **10-Agent Pipeline Audit Trace**: Complete observability lab showing individual agent outputs, confidence scores, evidence tags, and SQLite table telemetry metrics.

---

## [2.0.0] - 2026-08-18 — Deep Intelligence & Mastery Integration

### Added
- Multi-agent orchestration pipeline integrating `advanced_engine` analysis directly into context.
- Persistent `skill_mastery` state machine tracking key-level mastery signals.
- QWERTY heatmaps with per-key latency, accuracy, and mistake distribution.
- AES-Fernet encrypted local profile and telemetry data export.

---

## [1.0.0] - 2026-08-15 — Initial Local-First Core

### Added
- Local SQLite WAL telemetry storage with password hashing.
- PyWebview desktop wrapper with offline-first architecture.
- 20-lesson structured curriculum and baseline typing engine.
