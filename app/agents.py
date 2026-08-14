from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable

from .llm import LocalModelProvider


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
        rhythm_variance = 0.0
        if telemetry:
            latencies = [x["latency"] for x in telemetry if x.get("latency", 0) > 0]
            if latencies:
                avg_latency = sum(latencies) / len(latencies)
                rhythm_variance = sum((x - avg_latency) ** 2 for x in latencies) / len(latencies)
        if sessions == 0:
            state = "new_learner"
        elif acc < 92:
            state = "accuracy_first"
        elif rhythm_variance > 25000:
            state = "erratic_rhythm"
        elif avg_latency > 300:
            state = "mechanical_latency"
        elif avg_wpm < 40:
            state = "fluency_building"
        else:
            state = "speed_and_consistency"
        return AgentResult(self.name, "ok", 0.96, {"state": state, "sessions": sessions, "avg_wpm": avg_wpm, "avg_accuracy": acc, "avg_latency": avg_latency, "rhythm_variance": rhythm_variance}, [
            f"sessions={sessions}", f"avg_latency={avg_latency:.1f}ms", f"variance={rhythm_variance:.0f}"
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


class DifficultyController(Agent):
    name = "difficulty_controller"
    required_inputs = ("performance", "plan")

    def run(self, context: dict[str, Any]) -> AgentResult:
        p = context["performance"]
        acc = p.get("avg_accuracy", 0)
        sessions = p.get("sessions", 0)
        if acc < 90:
            action = "reduce_speed_gate"
            target = 96
        elif 90 <= acc <= 96:
            action = "maintain_and_stabilize"
            target = 97
        elif acc >= 97 and sessions > 3:
            action = "increase_speed_gate"
            target = 96
        else:
            action = "baseline"
            target = 95
        context["plan"]["target_accuracy"] = target
        context["plan"]["difficulty_action"] = action
        return AgentResult(self.name, "ok", 0.95, {"action": action, "target_acc": target}, [
            f"acc={acc:.1f}%", f"action={action}"
        ])


class Coach(Agent):
    name = "coach"
    required_inputs = ("performance", "weaknesses", "plan")

    def run(self, context: dict[str, Any]) -> AgentResult:
        p = context["performance"]
        w = context["weaknesses"]
        plan = context["plan"]
        if p.get("state") == "erratic_rhythm":
            message = "Your typing rhythm is highly erratic. Stop rushing easy words. Focus on a steady, metronomic pace to build true fluency."
        elif p.get("state") == "mechanical_latency" and w.get("slow_digraphs"):
            message = f"Your fingers are hesitating on certain transitions. Focus on rolling smoothly through {', '.join(w['slow_digraphs'])}."
        elif p["state"] == "new_learner":
            message = "Start with clean home-row habits. Keep the hands relaxed and let accuracy lead speed."
        elif p["state"] == "accuracy_first":
            message = "Your next gain should come from cleaner repetitions. Slow down until mistakes become rare, then build speed again."
        elif w.get("weak_keys"):
            message = f"Focus your next session on {', '.join(w['weak_keys'][:3])}. Short targeted drills will give you better gains than another random test."
        else:
            message = "Your fundamentals are holding. Use timed sessions to raise pace while protecting accuracy and rhythm."
        
        diff = context["plan"].get("difficulty_action", "baseline")
        if diff == "reduce_speed_gate":
            message += " Difficulty adjusted: Lowering speed targets to prioritize precision."
        elif diff == "increase_speed_gate":
            message += " Difficulty adjusted: Raising target limits. Push your speed slightly."

        message += f" Recommended mode: {plan['mode'].replace('_', ' ')} for about {plan['minutes']} minutes."
        return AgentResult(self.name, "ok", 0.87, {"message": message}, [p["state"], plan["mode"]])


class PrivacyGuard(Agent):
    name = "privacy_guard"
    required_inputs = ("performance", "weaknesses", "plan", "coach")

    def run(self, context: dict[str, Any]) -> AgentResult:
        p = context["performance"]
        w = context["weaknesses"]
        plan = context["plan"]
        coach = context["coach"]
        
        safe_context = {
            "state": p.get("state"),
            "wpm": p.get("avg_wpm"),
            "accuracy": p.get("avg_accuracy"),
            "weak_keys": w.get("weak_keys", []),
            "slow_digraphs": w.get("slow_digraphs", []),
            "plan_mode": plan.get("mode"),
            "plan_minutes": plan.get("minutes"),
            "deterministic_advice": coach.get("message")
        }
        return AgentResult(self.name, "ok", 1.0, {"safe_context": safe_context}, ["PII stripped"])


class LLMCoach(Agent):
    name = "llm_coach"
    required_inputs = ("privacy_guard",)

    def run(self, context: dict[str, Any]) -> AgentResult:
        safe_ctx = context["privacy_guard"]["safe_context"]
        
        system_prompt = (
            "You are an expert typing coach. You receive a learner's metrics and a deterministic piece of advice. "
            "Rewrite the advice into a concise, encouraging, and highly actionable 2-sentence coaching tip. "
            "Do NOT invent new metrics or ignore the deterministic advice. Just make it sound natural and expert. "
            "Respond ONLY with the coaching text."
        )
        prompt = f"Learner state: {safe_ctx['state']}\nMetrics: {safe_ctx['wpm']} WPM, {safe_ctx['accuracy']}% Acc\nDeterministic Advice: {safe_ctx['deterministic_advice']}\n\nProvide the 2-sentence coach message:"
        
        llm = LocalModelProvider()
        response = llm.generate(prompt, system=system_prompt)
        
        if response:
            return AgentResult(self.name, "ok", 0.85, {"message": response, "is_llm": True}, ["local llm generation"])
        else:
            return AgentResult(self.name, "skipped", 1.0, {"message": safe_ctx["deterministic_advice"], "is_llm": False}, ["llm offline, fallback deterministic"])


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
        self.agents: list[Agent] = [
            PerformanceAnalyst(), 
            WeaknessDetector(), 
            CurriculumPlanner(), 
            DifficultyController(), 
            Coach(), 
            PrivacyGuard(),
            LLMCoach(),
            Validator()
        ]

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
            elif agent.name == "difficulty_controller":
                context["difficulty"] = result.output
            elif agent.name == "coach":
                context["coach"] = result.output
            elif agent.name == "privacy_guard":
                context["privacy_guard"] = result.output
            elif agent.name == "llm_coach":
                context["llm_coach"] = result.output
                if result.status == "ok":
                    context["coach"]["message"] = result.output["message"]
                    context["coach"]["is_llm"] = True
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
