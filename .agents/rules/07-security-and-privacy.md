---
description: Zero-trust architecture guidelines for telemetry and privacy.
trigger: model_decision
---

# Security & Privacy Rules

1. **Zero-Trust Telemetry**: Assume the PyWebview JS frontend is a hostile environment. Validate all payloads in the Python API layer.
2. **Data Minimization**: Never record passwords, file paths, or system environment variables in the SQLite session logs.
3. **Network Boundary**: The application must fully function offline. Core practice loops must never ping an external server.
4. **Injection Prevention**: All SQLite interactions must use parameterized statements (`?`).
