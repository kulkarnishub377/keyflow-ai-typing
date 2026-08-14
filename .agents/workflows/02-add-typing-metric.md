# 02 - Add Typing Metric Workflow

**Trigger**: When adding a new typing measurement (like per-key latency or digraph timing).

## Steps

1. **Frontend Update**: Modify the JS typing engine to capture the raw timestamp for the event.
2. **Payload Modification**: Update the JSON payload sent via `pywebview` to include the new metric.
3. **Database Schema**: Use the `sqlite-telemetry-modeling` skill to update the SQLite schema if necessary.
4. **Dashboard Aggregation**: Update the Python API to calculate the average/median of the new metric and add it to the `dashboard` context dictionary.
5. **Agent Adaptation**: Update the `PerformanceAnalyst` or `WeaknessDetector` in `app/agents.py` to consume the new metric and adjust their `confidence` or `state` heuristics accordingly.
6. **Validation**: Test end-to-end to ensure the metric flows from JS to the Orchestrator without dropping frames.
