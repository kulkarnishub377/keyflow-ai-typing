# KeyFlow Architecture

## Current stack

- **UI:** HTML, CSS, vanilla JavaScript
- **Desktop shell:** pywebview
- **Application layer:** Python
- **Persistence:** SQLite
- **Authentication:** local password hashing with `hashlib.scrypt`
- **Agent foundation:** deterministic Python orchestration in `app/agents.py`

## Runtime boundaries

```text
Desktop window
   │
   ├── HTML/CSS/JS presentation
   │       │
   │       └── pywebview JS bridge
   │                    │
   └────────────────────▼────────────────────┐
                                             │
                                      Python API layer
                                             │
                       ┌─────────────────────┼──────────────────┐
                       │                     │                  │
                    SQLite              Agent layer        Local files
                       │                     │                  │
                  user state          rules + skills      backups/assets
```

## Core principles

### Deterministic core

Typing measurements are application logic, not generated content. AI/agents may interpret measured data but cannot redefine the source metrics.

### Local-first

No remote API is required for login, lessons, practice, analytics, or persistence.

### Explicit contracts

The agent package uses role-specific inputs and structured outputs. This prevents a single generic prompt from becoming an untestable source of truth.

### Replaceable intelligence

The deterministic agent pipeline can later feed one or more local model adapters. A model provider is not coupled to the UI.

## Data flow for a practice session

```text
Keyboard events
  ↓
JS typing engine
  ↓
Live UI metrics
  ↓
Validated session payload
  ↓
Python API
  ↓
SQLite session + error records
  ↓
Dashboard aggregates
  ↓
Agent pipeline
  ↓
Recommendation / next exercise
```

## Future advanced telemetry

The schema can be expanded with append-only event records for:

- key-down timestamp
- key-up timestamp when available
- expected key
- actual key
- finger
- hand
- word index
- character index
- correction/backspace event
- transition timing
- exercise target tag

The application should prefer derived statistics over storing unnecessary raw content forever.

## Future local model boundary

A local model adapter should sit behind a small interface such as:

```text
LocalModelProvider.generate(task, structured_context)
```

The adapter receives privacy-filtered structured context and returns structured output that is validated before use.

## Observability

Future production builds should record:

- agent run ID
- agent name
- start/end time
- schema version
- success/blocked status
- validation result
- model identifier when applicable

Never store private hidden reasoning as the observability mechanism.
