---
name: code-review-and-refactoring
description: Runbook for conducting rigorous code reviews, identifying tech debt, and maintaining Python/JS purity.
---

# Code Review & Refactoring Runbook

## 1. Javascript Bloat Check
- Scan `.js` files for unnecessary regex parsing, heavy array manipulations inside `keyup`/`keydown` events, or DOM thrashing. 
- Refactor heavy operations using `requestAnimationFrame`.

## 2. Python Complexity
- Check cyclomatic complexity in `app/agents.py`. If a heuristic has more than 4 nested `if/else` statements, mandate a refactoring into a lookup table or a simplified math function.

## 3. Dead Code
- Periodically scan `app/agents.py` and `SQLite` schemas for orphaned logic (e.g., fields stored in the database but never used by the UI or agents).
