# 07 - Post-Incident Forensics Workflow

**Trigger**: When a user reports a bug, an agent blocked the pipeline unexpectedly, or PyWebview crashed.

## Steps

1. **Extract the Trace**: Locate the `MultiAgentOrchestrator` trace output from the user's local logs.
2. **Identify the Failure Point**: Which agent returned `status != "ok"` or threw an exception?
3. **Replay the Payload**: Isolate the raw `dashboard` JSON payload that caused the failure. Replay it through a headless Python test to reproduce the crash.
4. **Root Cause Analysis**: Invoke the `keyflow-qa-engineer` and `keyflow-python-engineer` to determine why the deterministic heuristics failed. Was it a division by zero? A missing dictionary key?
5. **Patch and Test**: Write the fix and add the exact failing payload as a permanent regression test in `pytest`.
