---
name: observability-sre
description: Runbook for implementing telemetry, logging, and performance profiling without relying on external cloud trackers.
---

# Observability SRE Runbook

## 1. Agent Trace Auditing
- When debugging "Why did the agent recommend X?", do not guess. 
- Intercept the `trace` output from `MultiAgentOrchestrator.run()`.
- Replay the `dashboard` dictionary payload through the agents sequentially to reproduce the state mutation.

## 2. Performance Profiling
- To debug UI lag, inject `performance.now()` timestamps in the JS bridge before passing payloads to PyWebview, and log the delta when the Promise resolves.
- Target latency: JS -> Python -> Agent Pipeline -> JS must resolve in < 16ms (1 frame at 60fps) if synchronous, otherwise use an async loading state.
