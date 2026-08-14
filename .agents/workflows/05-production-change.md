# 05 - Production Change Workflow

**Trigger**: When modifying core logic in `app/agents.py` or the SQLite schema that affects production users.

## Steps

1. **Impact Radius Analysis**: Ask the `keyflow-architecture-reviewer` to analyze the blast radius. Will this change break backwards compatibility for existing SQLite telemetry?
2. **Schema Migration**: If SQLite is modified, write a deterministic migration script. Do NOT drop existing telemetry rows.
3. **Graceful Fallback Implementation**: Implement a `try/except` block around the new logic so the user can still practice typing even if the new feature fails.
4. **Unit Test Coverage**: Write `pytest` assertions proving the new feature handles `0` values, missing keys, and massive WPM inputs safely.
5. **Security Audit**: Request a review from `keyflow-security-reviewer` to verify no injection vulnerabilities were introduced.
