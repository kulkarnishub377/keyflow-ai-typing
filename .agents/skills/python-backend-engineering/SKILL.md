---
name: python-backend-engineering
description: >-
  Use this skill when writing or refactoring the core Python application, pywebview bridging, or backend utilities.
---

# Python Backend Engineering Runbook

## 1. PyWebview Integration
- Ensure all Python functions exposed to JavaScript are non-blocking.
- Use structured JSON objects for IPC (Inter-Process Communication).
- Catch all exceptions in the Python bridge and return formatted error JSONs to JS.

## 2. Code Quality
- Use Python 3 type hints strictly.
- Keep dependencies minimal (as per `requirements.txt`).
- Avoid global state; encapsulate logic within classes like `MultiAgentOrchestrator`.

## 3. Testing
- When writing tests, mock the pywebview window to run tests headlessly.
- Validate that the typing metrics (WPM, accuracy) are calculated with extreme precision.
