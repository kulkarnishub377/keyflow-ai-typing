---
description: Performance requirements for the PyWebview and typing engine.
trigger: model_decision
---

# Performance Rules

1. **Sub-Millisecond Input**: The `keydown` and `keyup` listeners must execute in <1ms.
2. **DOM Batching**: Never trigger multiple DOM reflows per keystroke. Use `requestAnimationFrame`.
3. **Async IPC**: All Python functions invoked by PyWebview must be asynchronous or return immediately to prevent hanging the JS thread.
4. **SQLite WAL**: Ensure `PRAGMA journal_mode = WAL;` is set to allow concurrent reads and writes without locking the DB during high-speed typing sessions.
