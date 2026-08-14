# 06 - Release Gate Workflow

**Trigger**: When preparing to tag a new version or merge a major feature branch to `main`.

## Steps

1. **Invoke the Gatekeeper**: Call upon the `keyflow-release-gate` agent.
2. **Execute Validation Suite**:
   - Run all Pytest suites locally.
   - Run `mypy --strict` and `black`.
3. **Verify Compliance**:
   - Ensure `04-adaptive-learning.md` accuracy rules are intact.
   - Ensure `00-core.md` local-first boundaries are unbreached.
4. **Draft Release Notes**: Extract the merged features and map them to `AI_ROADMAP.md` stages.
5. **Sign-Off**: If the `keyflow-release-gate` returns `AUTHORIZED`, proceed with the Git tag and merge.
