# Release Notes: KeyFlow v3.0.0

## 🚀 KeyFlow v3.0.0 — Production UI/UX Redesign & Extraordinary Features Studio

We are thrilled to announce the official release of **KeyFlow v3.0.0**, a monumental milestone transforming KeyFlow into a world-class, production-grade desktop typing studio with high-density spatial layout, advanced typography, and sub-millisecond local telemetry.

---

### ✨ What's New in v3.0.0

#### 1. 🎨 Obsidian Glass Design System & Advanced Typography
- **4-Tier Elevation System**: Deep obsidian dark palette (`#070913`, `#0a0f1d`, `#10182e`, `#16213e`) paired with fine sub-pixel borders (`rgba(255,255,255,0.06)` to `0.14`) and backdrop glass blurs (`backdrop-filter: blur(20px)`).
- **Precision Typography**: Display headings in **Outfit**, UI copy and telemetry in **Plus Jakarta Sans** and **Inter**, and prompt text in **JetBrains Mono** and **Fira Code**.
- **Micro-Interactions**: Mechanical keycap press bounces, metronome pulse animations, active key glows, and sub-pixel caret pulsing.

#### 2. ⚡ Distraction-Free Practice Studio
- **Live Telemetry HUD**: Prominent real-time Speed (WPM) with burst indicator, dynamic Accuracy health glow (Emerald `>97%`, Amber `90-96%`, Rose `<90%`), Error counter, and Elapsed time.
- **Smooth Gliding Cursor & Ghost Pace Caret**: Sub-pixel animated caret with real-time target pace pacing across the text.
- **Sleek Mechanical Keyboard Guide**: Custom low-profile keycaps with tactile press bounce and glowing next-key indicator.
- **Master & Blind Modes**: Instant failure penalty on typo in Master Mode; progressive blur and tactile focus in Blind Mode.

#### 3. 🧠 Procedural Pseudo-Word Adaptive Engine
- **N-Gram Synthesizer**: Replaced static word patterns with dynamically synthesized, phonetically plausible drill words targeting specific transition bottlenecks (`slow_transitions`) and weak keys.

#### 4. ⌨️ Global Command Palette (`Ctrl+K` / `Cmd+K`)
- **Keyboard-First Spotlight**: Quick fuzzy jump to any lesson, mode, theme toggle, or drill without leaving the keyboard.

#### 5. 🛡️ In-App Obsidian Glass Exit Modal & Native Cleanup
- Replaced the clunky Windows OS message box with a custom glass in-app confirmation modal and clean desktop window destruction.

#### 6. 🔧 SQLite Foreign Key Resiliency & Web Audio Engine
- Fixed foreign key constraints in `save_session` to seamlessly support adaptive micro-drills and custom practice sets (`lesson_id: NULL`).
- Built-in zero-dependency Web Audio synthesizer providing synthesized mechanical switch clicks, soft studio tones, and rhythmic metronome pulses.

---

### 📦 Git Release Commands

```bash
git add .
git commit -m "chore(release): v3.0.0 - production UI/UX redesign & extraordinary features studio"
git tag -a v3.0.0 -m "KeyFlow v3.0.0 - Production UI/UX Redesign & Extraordinary Features Studio"
git push origin main --tags
```
