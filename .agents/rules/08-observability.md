---
description: Guidelines for logging, tracing, and debugging the agent pipeline.
trigger: model_decision
---

# Observability Rules

1. **Structured Tracing**: The `MultiAgentOrchestrator` must output an auditable `trace` array containing every agent's state, confidence, and status.
2. **No Hidden Reasoning**: Do not rely on "black box" LLM generation. If an AI is used, its inputs and raw outputs must be logged.
3. **UI Transparency**: If an agent blocks the pipeline (e.g., confidence too low), the UI must show the exact reason to the user, not a generic "Error".
4. **Silent Analytics**: Do not use third-party analytics trackers (like Google Analytics or Mixpanel) in the UI code.
