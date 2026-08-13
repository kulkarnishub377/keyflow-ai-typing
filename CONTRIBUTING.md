# Contributing to KeyFlow AI Typing

## Development philosophy

KeyFlow is intentionally local-first and deterministic at its core. Contributions should improve the learning engine without making cloud services mandatory.

## Before coding

- Read `AGENTS.md` for agent boundaries and rules.
- Read `ARCHITECTURE.md` before changing module boundaries.
- Keep implemented behavior separate from roadmap claims.

## Code expectations

- Prefer small, testable functions.
- Validate all external/user-provided inputs.
- Keep UI logic separate from persistence logic.
- Keep deterministic metrics separate from generated advice.
- Add tests for new calculations and agent rules.

## Pull requests

Explain:

- what changed
- why it changed
- the affected architecture boundary
- tests run
- any roadmap or migration implications

Do not commit:

- real user databases
- credentials
- local backups
- model files
- build artifacts
- IDE metadata
