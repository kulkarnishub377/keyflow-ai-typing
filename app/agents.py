from __future__ import annotations

import random
from dataclasses import dataclass
from typing import Any

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
        
        adv = d.get("advanced_analysis", {})
        avg_latency = float(adv.get("latency_avg_ms", 0.0))
        rhythm_cv = float(adv.get("rhythm_cv", 0.0))
        hand_balance = float(adv.get("hand_balance", 100.0))

        if sessions == 0:
            state = "new_learner"
        elif acc < 92:
            state = "accuracy_first"
        elif rhythm_cv > 0.55:
            state = "erratic_rhythm"
        elif avg_latency > 300:
            state = "mechanical_latency"
        elif hand_balance < 80.0:
            state = "imbalanced_hands"
        elif avg_wpm < 40:
            state = "fluency_building"
        else:
            state = "speed_and_consistency"
            
        return AgentResult(
            self.name,
            "ok",
            0.96,
            {
                "state": state,
                "sessions": sessions,
                "avg_wpm": avg_wpm,
                "avg_accuracy": acc,
                "avg_latency": avg_latency,
                "rhythm_cv": rhythm_cv,
                "hand_balance": hand_balance,
            },
            [f"sessions={sessions}", f"avg_latency={avg_latency:.1f}ms", f"rhythm_cv={rhythm_cv:.2f}", f"hand_balance={hand_balance:.1f}%"],
        )


class WeaknessDetector(Agent):
    name = "weakness_detector"
    required_inputs = ("dashboard",)

    def run(self, context: dict[str, Any]) -> AgentResult:
        d = context["dashboard"]
        adv = d.get("advanced_analysis", {})
        
        weak_keys_data = adv.get("key_insights", [])
        keys = [str(x["key"]).upper() for x in weak_keys_data if x.get("accuracy", 100) < 95][:3]
        
        slow_trans_data = adv.get("slow_transitions", [])
        slow_digraphs = [str(x["transition"]) for x in slow_trans_data][:3]

        if slow_digraphs:
            recommendation = f"Target transition latency, specifically on: {', '.join(slow_digraphs)}."
            confidence = 0.93
            evidence = "digraph latency analysis"
        elif keys:
            recommendation = f"Target {', '.join(keys)} with short, repeated drills."
            confidence = 0.91
            evidence = "key error aggregation"
        else:
            recommendation = "Collect more sessions before making key-level conclusions."
            confidence = 0.74
            evidence = "insufficient key-error history"
            
        return AgentResult(
            self.name,
            "ok",
            confidence,
            {"weak_keys": keys, "slow_digraphs": slow_digraphs, "recommendation": recommendation},
            [evidence],
        )


class CurriculumPlanner(Agent):
    name = "curriculum_planner"
    required_inputs = ("performance", "weaknesses")

    def run(self, context: dict[str, Any]) -> AgentResult:
        perf = context["performance"]
        weak = context["weaknesses"]
        dashboard = context["dashboard"]
        mastered_skills = dashboard.get("mastered_skills", [])
        
        state = perf["state"]
        keys = weak.get("weak_keys", [])
        unmastered_keys = [k for k in keys if f"key_{k.lower()}" not in mastered_skills]
        
        if state == "accuracy_first":
            mode = "precision_drill"
            minutes = 5
        elif state == "new_learner":
            mode = "foundation_lesson"
            minutes = 6
        elif unmastered_keys:
            mode = "weak_key_drill"
            minutes = 7
        else:
            mode = "timed_fluency"
            minutes = 10
            
        strict_mode = False
        blind_mode = False
        if perf.get("avg_accuracy", 0) >= 98.0 and int(dashboard.get("sessions", 0)) >= 5:
            if int(dashboard.get("sessions", 0)) % 3 == 0:
                strict_mode = True
            elif int(dashboard.get("sessions", 0)) % 4 == 0:
                blind_mode = True

        return AgentResult(
            self.name,
            "ok",
            0.89,
            {
                "mode": mode, 
                "minutes": minutes, 
                "focus_keys": unmastered_keys[:3],
                "strict_mode": strict_mode,
                "blind_mode": blind_mode
            },
            [f"learner_state={state}", f"focus_keys={','.join(unmastered_keys[:3]) or 'none'}"],
        )


class ExerciseGenerator(Agent):
    name = "exercise_generator"
    required_inputs = ("plan", "weaknesses", "dashboard")

    def run(self, context: dict[str, Any]) -> AgentResult:
        plan = context["plan"]
        weak = context["weaknesses"]
        dashboard = context["dashboard"]
        mode = plan.get("mode", "timed_fluency")
        focus_keys = plan.get("focus_keys", [])
        slow_digraphs = weak.get("slow_digraphs", [])

        sessions_count = int(dashboard.get("sessions", 0))
        random.seed(42 + sessions_count)

        drill_words = []
        vowels = ["a", "e", "i", "o", "u"]
        consonants = ["b", "c", "d", "f", "g", "h", "k", "l", "m", "n", "p", "r", "s", "t", "w", "y"]
        suffixes = ["ing", "ed", "er", "ly", "tion"]
        prefixes = ["un", "re", "in", "dis", "pro"]

        if focus_keys:
            for k in focus_keys:
                kl = k.lower()
                for _ in range(4):
                    w = random.choice(prefixes) if random.random() > 0.5 else ""
                    w += random.choice(consonants) if kl in vowels else random.choice(vowels)
                    w += kl
                    w += kl if random.random() > 0.8 else ""
                    w += random.choice(vowels) if kl in consonants else random.choice(consonants)
                    w += random.choice(suffixes) if random.random() > 0.5 else ""
                    drill_words.append(w)
        elif slow_digraphs:
            for d in slow_digraphs:
                parts = d.split("->")
                if len(parts) == 2:
                    p = parts[0] + parts[1]
                    for _ in range(4):
                        w = random.choice(prefixes) if random.random() > 0.7 else ""
                        w += p
                        w += random.choice(suffixes) if random.random() > 0.7 else ""
                        drill_words.append(w)
        else:
            drill_words = ["the", "quick", "brown", "fox", "jumps", "over", "lazy", "dog", "focus", "rhythm"]

        random.shuffle(drill_words)
        selected = (drill_words * 3)[:12]
        generated_text = " ".join(selected)

        return AgentResult(
            self.name,
            "ok",
            0.94,
            {
                "exercise_text": generated_text,
                "target_keys": focus_keys,
                "word_count": len(selected),
                "mode": mode,
            },
            [f"generated_words={len(selected)}", f"target_keys={','.join(focus_keys) or 'general'}"],
        )


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
        return AgentResult(
            self.name,
            "ok",
            0.95,
            {"action": action, "target_acc": target},
            [f"acc={acc:.1f}%", f"action={action}"],
        )


class SessionReviewer(Agent):
    name = "session_reviewer"
    required_inputs = ("dashboard", "performance")

    def run(self, context: dict[str, Any]) -> AgentResult:
        d = context["dashboard"]
        recent = d.get("recent", [])
        if len(recent) < 2:
            trend = "insufficient_history"
            wpm_delta = 0.0
            acc_delta = 0.0
            confidence = 0.70
            notable = "Complete more sessions to establish a historical baseline."
        else:
            latest = recent[0]
            prior = recent[1]
            wpm_delta = round(float(latest.get("wpm", 0)) - float(prior.get("wpm", 0)), 1)
            acc_delta = round(float(latest.get("accuracy", 0)) - float(prior.get("accuracy", 0)), 1)
            if acc_delta >= 1.0 and wpm_delta >= 1.0:
                trend = "accelerating_growth"
                notable = f"Positive momentum: +{wpm_delta} WPM, +{acc_delta}% accuracy."
            elif acc_delta < -2.0:
                trend = "accuracy_regression"
                notable = f"Accuracy dropped by {abs(acc_delta)}%. Slow down to maintain precision."
            elif wpm_delta >= 2.0:
                trend = "speed_increase"
                notable = f"Speed gained +{wpm_delta} WPM."
            else:
                trend = "stable_consistency"
                notable = "Performance is stable across recent sessions."
            confidence = 0.91

        return AgentResult(
            self.name,
            "ok",
            confidence,
            {
                "trend": trend,
                "wpm_delta": wpm_delta,
                "acc_delta": acc_delta,
                "notable_change": notable,
            },
            [f"trend={trend}", f"delta_wpm={wpm_delta}", f"delta_acc={acc_delta}"],
        )


class Coach(Agent):
    name = "coach"
    required_inputs = ("performance", "weaknesses", "plan")

    def run(self, context: dict[str, Any]) -> AgentResult:
        p = context["performance"]
        w = context["weaknesses"]
        plan = context["plan"]
        if p.get("state") == "erratic_rhythm":
            message = (
                "Your typing rhythm is highly erratic. Stop rushing easy words. "
                "Focus on a steady, metronomic pace to build true fluency."
            )
        elif p.get("state") == "imbalanced_hands":
            message = (
                f"Your hand balance is off ({p.get('hand_balance', 0):.1f}%). "
                "Ensure both hands are resting correctly on the home row."
            )
        elif p.get("state") == "mechanical_latency" and w.get("slow_digraphs"):
            message = (
                f"Your fingers are hesitating on certain transitions. "
                f"Focus on rolling smoothly through {', '.join(w['slow_digraphs'])}."
            )
        elif p["state"] == "new_learner":
            message = "Start with clean home-row habits. Keep the hands relaxed and let accuracy lead speed."
        elif p["state"] == "accuracy_first":
            message = (
                "Your next gain should come from cleaner repetitions. "
                "Slow down until mistakes become rare, then build speed again."
            )
        elif w.get("weak_keys"):
            message = (
                f"Focus your next session on {', '.join(w['weak_keys'][:3])}. "
                "Short targeted drills will give you better gains than another random test."
            )
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
        from .security import PrivacyGuard as PIIFilter

        p = context["performance"]
        w = context["weaknesses"]
        plan = context["plan"]
        coach = context["coach"]

        raw_context = {
            "state": p.get("state"),
            "wpm": p.get("avg_wpm"),
            "accuracy": p.get("avg_accuracy"),
            "weak_keys": w.get("weak_keys", []),
            "slow_digraphs": w.get("slow_digraphs", []),
            "plan_mode": plan.get("mode"),
            "plan_minutes": plan.get("minutes"),
            "deterministic_advice": coach.get("message"),
        }
        safe_context = PIIFilter.scrub_context(raw_context)
        return AgentResult(self.name, "ok", 1.0, {"safe_context": safe_context}, ["Zero-trust PII stripped"])


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
        prompt = (
            f"Learner state: {safe_ctx['state']}\n"
            f"Metrics: {safe_ctx['wpm']} WPM, {safe_ctx['accuracy']}% Acc\n"
            f"Deterministic Advice: {safe_ctx['deterministic_advice']}\n\n"
            "Provide the 2-sentence coach message:"
        )

        llm = LocalModelProvider()
        response = llm.generate(prompt, system=system_prompt)

        if response:
            return AgentResult(self.name, "ok", 0.85, {"message": response, "is_llm": True}, ["local llm generation"])
        else:
            return AgentResult(
                self.name,
                "skipped",
                1.0,
                {"message": safe_ctx["deterministic_advice"], "is_llm": False},
                ["llm offline, fallback deterministic"],
            )


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
        return AgentResult(
            self.name,
            "ok" if ok else "blocked",
            0.99 if ok else 0.15,
            {"valid": ok, "problems": problems},
            ["plan bounds", "message bounds"],
        )


class MultiAgentOrchestrator:
    """
    Deterministic local multi-agent pipeline following Stage 4 production orchestration.
    Maintains 10 explicit roles with strict contracts, structured traces, and fail-closed safety.
    """

    def __init__(self) -> None:
        self.agents: list[Agent] = [
            PerformanceAnalyst(),
            WeaknessDetector(),
            CurriculumPlanner(),
            ExerciseGenerator(),
            DifficultyController(),
            SessionReviewer(),
            Coach(),
            PrivacyGuard(),
            LLMCoach(),
            Validator(),
        ]

    def run(self, dashboard: dict[str, Any]) -> dict[str, Any]:
        context: dict[str, Any] = {"dashboard": dashboard}
        results: list[AgentResult] = []
        for agent in self.agents:
            result = agent.run(context)
            results.append(result)
            if result.status != "ok" and result.status != "skipped":
                return {"status": "blocked", "results": [r.__dict__ for r in results]}
            if agent.name == "performance_analyst":
                context["performance"] = result.output
            elif agent.name == "weakness_detector":
                context["weaknesses"] = result.output
            elif agent.name == "curriculum_planner":
                context["plan"] = result.output
            elif agent.name == "exercise_generator":
                context["exercise"] = result.output
            elif agent.name == "difficulty_controller":
                context["difficulty"] = result.output
            elif agent.name == "session_reviewer":
                context["session_review"] = result.output
            elif agent.name == "coach":
                context["coach"] = result.output
            elif agent.name == "privacy_guard":
                context["privacy_guard"] = result.output
            elif agent.name == "llm_coach":
                context["llm_coach"] = result.output
                if result.status == "ok" and result.output.get("is_llm"):
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
            "exercise": context.get("exercise", {}),
            "session_review": context.get("session_review", {}),
            "validation": context["validation"],
            "trace": [r.__dict__ for r in results],
        }
