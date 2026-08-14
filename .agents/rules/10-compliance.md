---
description: Code formatting, PR structure, and roadmap compliance.
trigger: always_on
---

# Compliance Rules

1. **Roadmap Traceability**: Every significant change must be explicitly tied to a stage in `AI_ROADMAP.md`. No ad-hoc features.
2. **Python Formatting**: Adhere to `black` formatting and strict type hinting (`mypy --strict`).
3. **Documentation**: Any new heuristic in `app/agents.py` must be documented with the mathematical logic driving its threshold.
4. **Agent File Structure**: Agent definition modifications must be reflected in their corresponding `AGENT.md` persona files to keep the system self-aware.
