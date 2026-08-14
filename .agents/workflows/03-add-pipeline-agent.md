# 03 - Add Pipeline Agent Workflow

**Trigger**: When the user requests a new agent role (e.g., SessionReviewer or DifficultyController) to be added to the Python pipeline.

## Steps

1. **Define the Contract**: Decide exactly what inputs the agent needs from the `context` dictionary, and what it will output.
2. **Create the Class**: Inherit from `Agent` in `app/agents.py`. Set `name` and `required_inputs`.
3. **Implement Logic**: Write deterministic heuristics in `run()`. Ensure it returns a valid `AgentResult`.
4. **Register**: Add the new agent class to the `self.agents` list inside `MultiAgentOrchestrator.__init__()`.
5. **Update State Machine**: Ensure the Orchestrator safely passes the agent's output into the `context` for downstream agents.
6. **Update Validator**: Modify the `Validator` agent to check the new agent's output bounds.
