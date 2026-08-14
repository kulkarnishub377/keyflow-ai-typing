---
description: Guidelines for frontend and UI development in KeyFlow.
trigger: model_decision
---

# Frontend Rules

1. **Vanilla Stack**: The UI is built with HTML, CSS, and vanilla JavaScript. Do not use React, Vue, or Angular.
2. **Communication**: The UI communicates with the backend solely via the `pywebview` JS bridge.
3. **Responsiveness**: The JS typing engine must be extremely lightweight to guarantee zero input latency.
4. **No UI-bound AI**: AI generation and logic happen in the Python backend, never directly in the frontend JS.
