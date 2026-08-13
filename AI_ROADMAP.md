# KeyFlow AI Roadmap

## Stage 0 — deterministic foundation (current)

Implemented:

- performance analysis agent
- weakness detection agent
- curriculum planning agent
- coaching agent
- quality validation agent
- explicit skills/rules/contracts
- auditable structured trace

## Stage 1 — deeper typing intelligence

Build a richer event model for:

- per-key latency
- digraph/trigraph latency
- finger-level mistakes
- hand balance
- backspace behavior
- pause and rhythm analysis
- punctuation and numeric weaknesses
- task-specific skill tags

## Stage 2 — adaptive learning engine

Add:

- skill graph and prerequisites
- mastery state machine
- confidence and sample-size thresholds
- personalized lesson sequencing
- constrained exercise generation
- difficulty controller
- evaluation of improvement after each recommendation

## Stage 3 — local model adapter

Introduce a provider abstraction for optional local inference. Candidate runtime choices can be evaluated against the user's hardware instead of hard-coding a specific model.

Requirements:

- offline operation
- configurable model
- model capability registry
- privacy filtering
- schema validation
- deterministic fallback
- clear UI state when AI is unavailable

## Stage 4 — multi-agent production orchestration

Expand to:

1. Performance Analyst
2. Weakness Detector
3. Curriculum Planner
4. Exercise Generator
5. Difficulty Controller
6. Coach
7. Session Reviewer
8. Quality Validator
9. Privacy Guard
10. Orchestrator

Each role should have:

- versioned skill contract
- input schema
- output schema
- tool permissions
- evaluation set
- failure policy
- performance budget

## Stage 5 — agent evaluation

Create a local benchmark suite with scenarios covering:

- low accuracy / high speed
- high accuracy / low speed
- repeated single-key errors
- transition-specific weaknesses
- insufficient data
- conflicting signals
- recent regression
- improvement after targeted drills

The system should measure recommendation correctness, invalid generation rate, calibration, and learner improvement rather than merely model fluency.
