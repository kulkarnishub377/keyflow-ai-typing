---
name: cicd-quality-gates
description: Runbook for enforcing CI/CD quality gates, test coverage thresholds, and pipeline deployment blocks.
---

# CI/CD Quality Gates Runbook

## 1. Local Pipeline Validation
Before any merge, the system must pass local validations. 
- Trigger `pytest` covering all functions in `app/agents.py`.
- Enforce that test coverage for the deterministic `MultiAgentOrchestrator` never drops below 95%.

## 2. Agent Output Validation
- Automatically test that the `Validator` agent correctly flags out-of-bounds `plan['minutes']` (e.g., negative numbers or >30).
- Reject any commits that disable `Validator` checks.

## 3. Formatting
- Enforce `black` and `mypy` locally. A failure in strict typing is an immediate block.
