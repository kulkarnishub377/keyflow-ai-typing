---
description: Core architectural principles for the KeyFlow project.
trigger: always_on
---

# Core Principles

1. **Deterministic Core**: Typing measurements are application logic, not generated content. AI/agents may interpret measured data but cannot redefine source metrics.
2. **Local-First**: No remote API is required for login, lessons, practice, analytics, or persistence. Everything runs locally.
3. **Explicit Contracts**: The agent package uses role-specific inputs and structured outputs. Prevent a single generic prompt from becoming an untestable source of truth.
4. **Replaceable Intelligence**: The deterministic agent pipeline feeds one or more local model adapters. A model provider is not coupled to the UI.
