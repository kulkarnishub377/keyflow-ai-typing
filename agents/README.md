# Agent Package

This directory defines KeyFlow's local multi-agent learning architecture.

## Layout

```text
agents/
├── skills/       # agent role definitions and task contracts
├── rules/        # non-negotiable behavioral and learning rules
├── schemas/      # structured input/output contracts
└── README.md
```

The code implementation currently lives in `app/agents.py`. These files are the durable design contract for expanding the system without collapsing everything into one large prompt.

## Design philosophy

A production agent system needs more than prompts. It needs:

- role separation
- constrained inputs
- explicit outputs
- validation
- observability
- evaluation
- failure handling
- privacy boundaries
- deterministic fallbacks

The current project uses a deterministic local pipeline as its foundation. A future local LLM adapter can sit behind these contracts without changing the typing engine.
