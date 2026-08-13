# KeyFlow Agent System

## Purpose

KeyFlow's agent layer exists to turn measured typing behavior into safe, explainable, local learning decisions. It is not a chatbot glued onto a typing test.

The agent system is divided into evidence collection, diagnosis, planning, generation, validation, coaching, and review. Agents communicate through structured state rather than hidden prompt history.

## Non-negotiable rules

1. **Metrics are authoritative.** WPM, accuracy, character counts, timings, and error counts come from deterministic application code.
2. **Agents cannot rewrite raw telemetry.** Raw typing events and saved session metrics are immutable after validation.
3. **No cloud dependency in the core loop.** The application must still teach, practice, measure, and persist locally with networking disabled.
4. **Least privilege.** Each agent receives only the data and tools needed for its role.
5. **Structured outputs only.** Agent outputs must validate against a schema before another agent consumes them.
6. **Evidence before advice.** A recommendation must cite the measurements or rule that caused it.
7. **No silent escalation.** An agent cannot switch from deterministic logic to a generative model without an explicit model capability being enabled.
8. **Validation is mandatory.** Generated lessons, drills, coaching copy, and difficulty changes pass validation before presentation or persistence.
9. **Safe difficulty changes.** Speed targets may increase only when accuracy/consistency gates permit it.
10. **User control.** The user can disable AI coaching without losing the core typing experience.
11. **Local privacy.** Coaching context should contain only the minimum local learner information needed for the task.
12. **Fail closed.** If required evidence is missing or malformed, recommend more measurement instead of inventing conclusions.

## Agent roster

### 1. Performance Analyst

**Mission:** Build a structured view of current performance from deterministic metrics.

Inputs:
- session aggregates
- recent trend
- current goal

Outputs:
- learner state
- speed/accuracy summary
- confidence
- evidence references

Must not:
- generate user-facing diagnosis without evidence
- invent keystrokes or timing values

### 2. Weakness Detector

**Mission:** Identify repeatable weaknesses at key, finger, transition, word, symbol, or rhythm level.

Inputs:
- key-error aggregates
- per-key timing data when available
- recent sessions

Outputs:
- ranked weaknesses
- severity
- repetition count
- confidence

Must distinguish:
- real recurring weakness
- low-sample observation
- random one-off error

### 3. Curriculum Planner

**Mission:** Select the next learning objective.

Inputs:
- performance state
- weaknesses
- skill mastery
- learner goal

Outputs:
- target skill
- exercise mode
- estimated duration
- prerequisite checks

Priority order:
1. broken prerequisites
2. persistent accuracy problems
3. technique/transition weaknesses
4. fluency
5. speed optimization

### 4. Exercise Generator

**Mission:** Generate constrained practice content that targets exactly one or a small set of validated objectives.

Inputs:
- target skill
- vocabulary/content constraints
- learner level
- length

Outputs:
- exercise text
- target patterns
- difficulty metadata

Validation requirements:
- target characters appear at intended frequency
- text is typeable
- no accidental unsupported punctuation
- length is within requested bounds
- difficulty is not above the learner gate

### 5. Difficulty Controller

**Mission:** Adjust task difficulty using explicit thresholds.

Example gates:
- accuracy < 90%: reduce difficulty
- accuracy 90–96%: stabilize and repeat
- accuracy >= 97% with improving consistency: small increase
- repeated errors across 3+ sessions: hold difficulty and remediate

This agent cannot increase difficulty only because WPM increased.

### 6. Coach

**Mission:** Translate validated performance and plan data into concise, actionable guidance.

Rules:
- one main priority per session
- explain why in plain language
- avoid shame, ranking language, or fabricated certainty
- prefer actionable practice over generic motivation

### 7. Session Reviewer

**Mission:** Compare a completed session with the learner's recent baseline.

Outputs:
- improvement/regression
- notable change
- next action

### 8. Quality Validator

**Mission:** Reject malformed or unsafe agent output.

Checks:
- schema
- numeric ranges
- text length
- target alignment
- contradiction with deterministic metrics
- impossible claims

### 9. Privacy Guard

**Mission:** Minimize context before optional model inference.

Removes unnecessary:
- account metadata
- unrelated session text
- file paths
- private notes

Keeps only task-relevant learning data.

### 10. Orchestrator

**Mission:** Execute agents in a controlled order, carry validated state forward, stop on blocked validation, and emit an auditable trace.

The orchestrator is the only component allowed to decide which agent runs next.

## Standard pipeline

```text
Session data
   ↓
Performance Analyst
   ↓
Weakness Detector
   ↓
Curriculum Planner
   ↓
Exercise Generator / Difficulty Controller
   ↓
Quality Validator
   ↓
Coach
   ↓
Session Reviewer
```

The local deterministic implementation currently includes Performance Analyst, Weakness Detector, Curriculum Planner, Coach, and Validator. The remaining roles are defined as extension points for the next implementation layer.

## Tool policy

Agents should use narrow tools such as:

- `read_dashboard`
- `read_recent_sessions`
- `read_key_stats`
- `read_skill_state`
- `recommend_exercise`
- `validate_exercise`
- `save_recommendation`

Agents must not receive unrestricted filesystem or database write access.

## Auditability

Each orchestration run should be representable as:

- run id
- agent name
- input references
- output schema/version
- confidence
- evidence references
- validation status
- duration

This makes debugging and model evaluation possible without storing hidden reasoning.
