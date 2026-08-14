from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable


@dataclass(frozen=True)
class AgentResult:
    agent: str
    status: str
    confidence: float
    output: dict[str, Any]
    evidence: list[str]


class Agent:
    name = "base"
    required_inputs: tuple[str, ...] = ()

    def run(self, context: dict[str, Any]) -> AgentResult:
        raise NotImplementedError


class PerformanceAnalyst(Agent):
    name = "performance_analyst"
    required_inputs = ("dashboard",)

    def run(self, context: dict[str, Any]) -> AgentResult:
        d = context["dashboard"]
        sessions = int(d.get("sessions", 0))
        avg_wpm = float(d.get("avg_wpm", 0))
        acc = float(d.get("avg_accuracy", 0))
        telemetry = d.get("latest_telemetry", [])
        avg_latency = 0.0
        if telemetry:
            latencies = [x["latency"] for x in telemetry if x.get("latency", 0) > 0]
            if latencies:
                avg_latency = sum(latencies) / len(latencies)
        if sessions == 0:
            state = "new_learner"
        elif acc < 92:
            state = "accuracy_first"
        elif avg_latency > 300:
            state = "mechanical_latency"
        elif avg_wpm < 40:
            state = "fluency_building"
        else:
            state = "speed_and_consistency"
        return AgentResult(self.name, "ok", 0.96, {"state": state, "sessions": sessions, "avg_wpm": avg_wpm, "avg_accuracy": acc, "avg_latency": avg_latency}, [
            f"sessions={sessions}", f"avg_latency={avg_latency:.1f}ms", f"avg_accuracy={acc:.1f}%"
        ])


class WeaknessDetector(Agent):
    name = "weakness_detector"
    required_inputs = ("dashboard",)

    def run(self, context: dict[str, Any]) -> AgentResult:
        d = context["dashboard"]
        weak = d.get("weak_keys", [])
        keys = [str(x.get("expected_key", "")).upper() for x in weak[:5] if x.get("expected_key")]
        telemetry = d.get("latest_telemetry", [])
        slow_digraphs: list[str] = []
        if telemetry:
            for i in range(1, len(telemetry)):
                if 400 < telemetry[i]["latency"] < 2000:
                    slow_digraphs.append(telemetry[i-1]["key"] + "->" + telemetry[i]["key"])
            from collections import Counter
            counts = Counter(slow_digraphs)
            slow_digraphs = [k for k, v in counts.most_common(3) if v > 2]
        if slow_digraphs:
            recommendation = f"Target transition latency, specifically on: {', '.join(slow_digraphs)}."
            confidence = 0.93
            evidence = "digraph latency analysis"
        elif keys:
            recommendation = f"Target {', '.join(keys[:3])} with short, repeated drills."
            confidence = 0.91
            evidence = "key error aggregation"
        else:
            recommendation = "Collect more sessions before making key-level conclusions."
            confidence = 0.74
            evidence = "insufficient key-error history"
        return AgentResult(self.name, "ok", confidence, {"weak_keys": keys, "slow_digraphs": slow_digraphs, "recommendation": recommendation}, [
            evidence
        ])


class CurriculumPlanner(Agent):
    name = "curriculum_planner"
    required_inputs = ("performance", "weaknesses")

    def run(self, context: dict[str, Any]) -> AgentResult:
        perf = context["performance"]
        weak = context["weaknesses"]
        state = perf["state"]
        keys = weak.get("weak_keys", [])
        if state == "accuracy_first":
            mode = "precision_drill"
            minutes = 5
        elif state == "new_learner":
            mode = "foundation_lesson"
            minutes = 6
        elif keys:
            mode = "weak_key_drill"
            minutes = 7
        else:
            mode = "timed_fluency"
            minutes = 10
        return AgentResult(self.name, "ok", 0.89, {"mode": mode, "minutes": minutes, "focus_keys": keys[:3]}, [
            f"learner_state={state}", f"focus_keys={','.join(keys[:3]) or 'none'}"
        ])


class Coach(Agent):
    name = "coach"
    required_inputs = ("performance", "weaknesses", "plan")

    def run(self, context: dict[str, Any]) -> AgentResult:
        p = context["performance"]
        w = context["weaknesses"]
        plan = context["plan"]
        if p.get("state") == "mechanical_latency" and w.get("slow_digraphs"):
            message = f"Your fingers are hesitating on certain transitions. Focus on rolling smoothly through {', '.join(w['slow_digraphs'])}."
        elif p["state"] == "new_learner":
            message = "Start with clean home-row habits. Keep the hands relaxed and let accuracy lead speed."
        elif p["state"] == "accuracy_first":
            message = "Your next gain should come from cleaner repetitions. Slow down until mistakes become rare, then build speed again."
        elif w.get("weak_keys"):
            message = f"Focus your next session on {', '.join(w['weak_keys'][:3])}. Short targeted drills will give you better gains than another random test."
        else:
            message = "Your fundamentals are holding. Use timed sessions to raise pace while protecting accuracy and rhythm."
        message += f" Recommended mode: {plan['mode'].replace('_', ' ')} for about {plan['minutes']} minutes."
        return AgentResult(self.name, "ok", 0.87, {"message": message}, [p["state"], plan["mode"]])


class Validator(Agent):
    name = "validator"
    required_inputs = ("plan", "coach")

    def run(self, context: dict[str, Any]) -> AgentResult:
        plan = context["plan"]
        coach = context["coach"]["message"]
        problems: list[str] = []
        if not (1 <= int(plan["minutes"]) <= 30):
            problems.append("invalid session length")
        if len(coach) > 500:
            problems.append("coach message too long")
        ok = not problems
        return AgentResult(self.name, "ok" if ok else "blocked", 0.99 if ok else 0.15, {"valid": ok, "problems": problems}, ["plan bounds", "message bounds"])


class MultiAgentOrchestrator:
    """Deterministic local agent pipeline. Optional LLM adapters can consume its structured context later."""

    def __init__(self) -> None:
        self.agents: list[Agent] = [PerformanceAnalyst(), WeaknessDetector(), CurriculumPlanner(), Coach(), Validator()]

    def run(self, dashboard: dict[str, Any]) -> dict[str, Any]:
        context: dict[str, Any] = {"dashboard": dashboard}
        results: list[AgentResult] = []
        for agent in self.agents:
            result = agent.run(context)
            results.append(result)
            if result.status != "ok":
                return {"status": "blocked", "results": [r.__dict__ for r in results]}
            if agent.name == "performance_analyst":
                context["performance"] = result.output
            elif agent.name == "weakness_detector":
                context["weaknesses"] = result.output
            elif agent.name == "curriculum_planner":
                context["plan"] = result.output
            elif agent.name == "coach":
                context["coach"] = result.output
            elif agent.name == "validator":
                context["validation"] = result.output
        return {
            "status": "ok",
            "summary": context["coach"]["message"],
            "plan": context["plan"],
            "performance": context["performance"],
            "weaknesses": context["weaknesses"],
            "validation": context["validation"],
            "trace": [r.__dict__ for r in results],
        }
