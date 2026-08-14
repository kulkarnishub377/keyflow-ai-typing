# 01 - CTO Gap Analysis Workflow

**Trigger**: When the user asks for a codebase review or roadmap check.

## Steps

1. **Read Roadmap**: Review `AI_ROADMAP.md` to identify the current active Stage.
2. **Scan Codebase**: Review `ARCHITECTURE.md` and `app/agents.py` to see the reality of the implementation.
3. **Identify Gaps**: Compare the code to the roadmap. Is there missing telemetry (e.g., per-key latency)? Are there missing agents from Stage 4?
4. **Present Findings**: Create an artifact listing the gaps and propose the next immediate technical step without violating `00-core.md` (no cloud AI, no heavy frameworks).
5. **Request Approval**: Ask the user if they want to proceed with the next step.
