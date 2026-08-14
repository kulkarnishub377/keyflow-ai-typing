---
name: cto-architecture
description: >-
  Use this skill when you need to perform high-level architectural gap analysis, evaluate new AI models, or design the system boundary.
---

# CTO Architecture Runbook

## 1. Gap Analysis
When asked to evaluate the current architecture:
- Review `ARCHITECTURE.md` and `AI_ROADMAP.md`.
- Ensure the current implementation is strictly deterministic (Stage 0/1).
- Identify any bleeding of business logic into the UI layer.

## 2. Introducing Local Models
When moving to Stage 3 (Local Models):
- Draft a Provider abstraction.
- Enforce strict JSON output schemas.
- Ensure the pywebview backend never calls an external LLM API without explicit local-privacy filtering.

## 3. Privacy Audits
- Check that `sqlite` database paths and local filesystem details are never exposed to the AI model prompt directly without sanitization.
