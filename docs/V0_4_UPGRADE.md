# KeyFlow v0.4 Advanced Learning Engine

This upgrade is designed to be applied **on top of the current GitHub `main` branch**. It does not replace the existing `.agents` framework, UI modules, SQLite schema, or local Ollama adapter.

## New capabilities

### Deep local analytics
- Per-key average and P95 latency
- Key accuracy derived from session evidence
- Finger and hand attribution
- Slow transition detection
- Rhythm coefficient of variation
- Left/right hand balance
- Persisted derived statistics

### Closed-loop adaptive learning
The engine now has an explicit decision loop:

```text
Telemetry
  -> Analysis
  -> Weakness ranking
  -> Learning objective
  -> Drill type
  -> Target WPM / accuracy
  -> Next session
```

### Agent observability
Every local AI coach run is recorded with:

- run type
- status
- duration
- confidence floor
- summary
- full agent trace

### Developer Lab
The UI gets a lightweight Developer Lab that exposes:

- local database size
- database table counts
- latest agent runs
- key-level signals
- slow transitions
- adaptive recommendation
- target WPM / accuracy
- deep local coach execution

## Integration

Copy the files from this package over the matching paths in the current repository:

- `app/api.py`
- `app/advanced_engine.py`
- `web/index.html`
- `web/js/advanced.js`
- `tests/test_advanced_engine.py`
- `.gitignore`

No external service is required.

## Run tests

```bash
python -m unittest discover -s tests -p "test_*.py" -v
```

## Important

This package intentionally does not overwrite your current `.agents/` directory or other current work. The existing repository remains the source of truth.
