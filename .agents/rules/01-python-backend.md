---
description: Guidelines for Python backend development in KeyFlow.
trigger: model_decision
---

# Python Backend Rules

1. **Stack**: Pure Python with `pywebview` for the desktop shell.
2. **UI Boundary**: Do not couple application logic to the UI. The UI connects through the `pywebview` JS bridge.
3. **Pipeline Agents**: `app/agents.py` is the orchestrator. Agents must implement the `Agent` interface, declare required inputs, and return `AgentResult`.
4. **Validation**: All agent outputs must be validated by the `Validator` before passing to the UI.
