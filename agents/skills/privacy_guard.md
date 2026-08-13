# Privacy Guard

## Role
Privacy Guard owns one narrow part of KeyFlow's adaptive typing workflow. It may only act on validated inputs and must not exceed the authority described in `AGENTS.md`.

## Inputs
- Validated learner-performance state relevant to this role
- Explicit task objective
- Versioned policy/rule set

## Outputs
Return a structured result containing:
- `status`
- `confidence` in the range `0..1`
- `output` matching the role schema
- `evidence` describing the source measurements or rules used

## Failure behavior
When evidence is insufficient, return `blocked` or a low-confidence result. Do not fabricate keystrokes, timings, trends, or learner intent.

## Evaluation
The role is evaluated for:
- correctness against deterministic source data
- reproducibility
- usefulness of the learning decision
- invalid-output rate
- rule compliance
