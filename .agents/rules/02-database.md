---
description: Guidelines for database design and telemetry storage in KeyFlow.
trigger: model_decision
---

# Database Rules

1. **SQLite**: The application strictly uses local SQLite. Do not suggest PostgreSQL or cloud databases.
2. **Append-Only Telemetry**: Session data and error records should be append-only.
3. **Data Granularity**: Prefer derived statistics (WPM, accuracy, weak keys) over storing unnecessary raw content forever.
4. **Privacy**: Never expose database paths in user-facing coaching.
