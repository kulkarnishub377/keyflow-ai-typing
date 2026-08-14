---
description: Safety, privacy, and integrity rules for KeyFlow agents.
trigger: always_on
---

# Agent Safety and Integrity Rules

- Never invent measurements.
- Never claim a model performed analysis it did not perform.
- Never expose credentials, database paths, or private local metadata in user-facing coaching.
- Never write raw telemetry directly from an agent.
- Never auto-delete learner data.
- Never require internet access for core practice.
- Validate every generated artifact before use.
- Keep the user-facing explanation shorter than the internal structured state.
