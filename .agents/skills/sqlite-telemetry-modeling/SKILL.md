---
name: sqlite-telemetry-modeling
description: >-
  Use this skill when designing tables or queries for storing typing telemetry, session aggregates, or user progress in SQLite.
---

# SQLite Telemetry Modeling Runbook

## 1. Schema Design
- Use `PRAGMA foreign_keys = ON;` and `PRAGMA journal_mode = WAL;` for performance.
- Store high-level sessions in a `sessions` table (WPM, accuracy, timestamp).
- Store specific errors in an `errors` table linked to the session, keeping `expected_key` and `actual_key`.

## 2. Telemetry Expansion (Stage 1)
- When adding per-key latency, do not store every single successful keypress if it bloats the database. Store aggregate latencies per key per session, or only store the slowest transitions.
- If raw events are required for ML training later, store them as batched JSON blobs in a single row per session to avoid row explosion.

## 3. Querying
- Always use parameterized queries.
- Build view-like queries for the `PerformanceAnalyst` to easily fetch moving averages.
