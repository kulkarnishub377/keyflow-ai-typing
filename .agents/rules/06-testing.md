---
description: Strict testing guidelines for the KeyFlow pipeline.
trigger: model_decision
---

# Testing Rules

1. **Test Pyramid**: The majority of tests must be fast Python unit tests evaluating the deterministic heuristics in `app/agents.py`.
2. **Headless Execution**: Do not require PyWebview to be active to run the test suite. All Python components must be testable in isolation.
3. **Negative Paths**: Every `Validator` and `Orchestrator` block condition must have an explicit test case proving it fails gracefully.
4. **JS Testing**: UI event listeners must have minimal DOM dependencies so they can be tested via JSDOM or Playwright without complex mocking.
