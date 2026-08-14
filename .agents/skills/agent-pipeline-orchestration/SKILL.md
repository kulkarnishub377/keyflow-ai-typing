---
name: agent-pipeline-orchestration
description: >-
  Use this skill when extending the deterministic multi-agent pipeline in app/agents.py, adding new agents, or modifying schemas.
---

# Agent Pipeline Orchestration Runbook

## 1. Adding a New Agent Role
- Define the new class extending `Agent`.
- Declare `required_inputs`.
- Implement `def run(self, context: dict) -> AgentResult`.
- Append the instantiated agent to the `MultiAgentOrchestrator` list.

## 2. Schema Validation
- All outputs MUST be validated.
- If an agent generates an exercise, verify it meets the constraints of the `CurriculumPlanner`.
- Ensure `confidence` scores are populated with meaningful heuristics, not arbitrary numbers.

## 3. Dealing with Blocked States
- If an agent returns `status != "ok"`, the pipeline must halt and return the trace.
- The UI should handle blocked states by rendering a default practice session or warning.
