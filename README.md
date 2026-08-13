# KeyFlow AI Typing

> Advanced local-first typing trainer and adaptive-learning desktop foundation built with HTML/CSS/JavaScript, Python, pywebview, and SQLite.

KeyFlow is designed to become a serious keyboard-learning workstation: structured beginner education, focused practice, deep performance analytics, adaptive learning, and optional local AI coaching — without requiring a cloud backend for the core experience.

## What this version contains

### Product

- Modern desktop UI rebuilt around a focused learning workspace
- Local user registration/login
- Beginner learning path
- Interactive typing practice
- WPM / accuracy / error tracking
- Progress analytics and weak-key visualization
- Daily practice goal
- Dark/light themes
- Local JSON backup
- Python-based local AI coach pipeline

### Agentic foundation

- `AGENTS.md` with role definitions and non-negotiable rules
- 10 agent roles documented as independent skills
- Learning and safety rules
- Versioned JSON schemas for structured outputs
- Deterministic multi-agent orchestration in `app/agents.py`
- Explicit validation and auditable execution trace
- Privacy/least-privilege design for future local model adapters

## Current architecture

```text
HTML + CSS + JavaScript
        │
        ▼
     pywebview
        │
        ▼
      Python
   ┌────┴────────┐
   │             │
 SQLite      Agent layer
               │
         rules + skills
               │
      optional local AI later
```

The repository is intentionally **not** described as Tauri/Rust. The current desktop stack is Python + pywebview + SQLite.

## Why local-first?

Typing is an interaction-heavy workload. Core practice should remain responsive and usable without an internet connection. Keeping learner data local also makes the privacy boundary easy to understand.

The current core has no required cloud backend, cloud database, or remote AI service.

## Multi-agent design

The agent system is intentionally deeper than a single prompt. It separates measurement from reasoning and reasoning from generated coaching.

```text
Session telemetry
      ↓
Performance Analyst
      ↓
Weakness Detector
      ↓
Curriculum Planner
      ↓
Difficulty Controller / Exercise Generator
      ↓
Quality Validator
      ↓
Coach
      ↓
Session Reviewer
```

### Roles

1. Performance Analyst
2. Weakness Detector
3. Curriculum Planner
4. Exercise Generator
5. Difficulty Controller
6. Coach
7. Session Reviewer
8. Quality Validator
9. Privacy Guard
10. Orchestrator

Read `AGENTS.md` for detailed rules, permissions, evidence requirements, failure behavior, and evaluation principles.

## UI / UX direction

The rebuilt UI is intentionally centered on:

- clear hierarchy
- fewer competing actions
- fast practice entry
- glanceable performance metrics
- visible local/privacy status
- consistent controls
- dark/light theme support
- accessible responsive behavior
- a dedicated AI Coach workspace

The favicon and desktop-window icon use a Python-inspired blue/yellow KeyFlow mark so the application identity is consistent across the window and HTML shell.

## Advanced roadmap

### Typing intelligence

- [ ] Per-key latency
- [ ] Finger mapping
- [ ] Left/right-hand balance
- [ ] Digraph/trigraph latency
- [ ] Rhythm/consistency model
- [ ] Backspace/correction model
- [ ] Numeric and punctuation analytics

### Adaptive learning

- [ ] Skill graph and prerequisites
- [ ] Mastery state machine
- [ ] Sample-size-aware weakness detection
- [ ] Personalized lesson sequencing
- [ ] Constrained exercise generation
- [ ] Dynamic difficulty controller

### Local AI

- [ ] Local model provider abstraction
- [ ] Model capability registry
- [ ] Privacy-filtered model context
- [ ] Optional local LLM coach
- [ ] Agent evaluation benchmark
- [ ] Model fallback and validation

### Production desktop

- [ ] Signed installers
- [ ] Encrypted backups
- [ ] Installer/update strategy
- [ ] Accessibility audit
- [ ] Full integration test suite
- [ ] Performance profiling

Online social features, tournaments, and public competition remain out of scope for this local-first phase.

## Run locally

Requirements:

- Python 3.11+
- Windows is the current primary target

```bash
python -m venv .venv
```

PowerShell:

```powershell
.venv\\Scripts\\Activate.ps1
```

Install:

```bash
pip install -r requirements.txt
```

Run:

```bash
python run.py
```

## Test

```bash
python -m unittest discover -s tests -v
python -m compileall -q app run.py
```

## Repository guide

```text
AGENTS.md                Agent roles, rules, safety boundaries
ARCHITECTURE.md          Runtime and data boundaries
AI_ROADMAP.md            Advanced local AI roadmap
CONTRIBUTING.md          Development workflow
SECURITY.md              Security and privacy policy
agents/                  Skills, rules, schemas
app/                     Python application/backend
web/                     HTML/CSS/JavaScript UI
.github/                 CI and issue/PR templates
```

## License

No open-source license has been selected yet. Until a license is added, normal copyright restrictions apply.
