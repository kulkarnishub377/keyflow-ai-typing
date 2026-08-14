---
name: security-zero-trust
description: Runbook for threat modeling, preventing injection, and sanitizing payloads between PyWebview and the local filesystem.
---

# Security Zero-Trust Runbook

## 1. PyWebview Injection Defense
- The UI must never pass raw SQL fragments to Python. 
- Python functions exposed via `api` must explicitly type-cast and validate bounds (e.g., `int(session_time)`).
- Handle `ValueError` exceptions immediately; do not let them bubble up to the SQLite layer.

## 2. Privacy Sandbox
- The eventual Local LLM adapter MUST run behind a privacy firewall. 
- Implement a `PrivacyGuard` function that traverses the `context` dictionary and `del` any keys matching `*_path`, `username`, or `*_id` before serialization to the LLM prompt.
