from __future__ import annotations

import json
import sqlite3
import statistics
import time
from collections import Counter, defaultdict
from dataclasses import asdict, dataclass
from datetime import datetime
from typing import Any

from .database import Database


FINGER_MAP = {
    **{k: "left_pinky" for k in "`1qaz"},
    **{k: "left_ring" for k in "2wsx"},
    **{k: "left_middle" for k in "3edc"},
    **{k: "left_index" for k in "45rtfgvb"},
    **{k: "right_index" for k in "67yuhjnm"},
    **{k: "right_middle" for k in "8ik,"},
    **{k: "right_ring" for k in "9ol."},
    **{k: "right_pinky" for k in "0p;/-=[]'"},
}
HAND_MAP = {finger: ("left" if finger.startswith("left") else "right") for finger in set(FINGER_MAP.values())}


@dataclass(frozen=True)
class KeyInsight:
    key: str
    attempts: int
    errors: int
    accuracy: float
    avg_latency_ms: float
    p95_latency_ms: float
    finger: str
    hand: str


class AdvancedTypingEngine:
    """Local derived analytics and adaptive-learning engine layered on existing KeyFlow data."""

    def __init__(self, db: Database):
        self.db = db
        self._ensure_schema()

    def _ensure_schema(self) -> None:
        with self.db.connect() as con:
            con.executescript(
                """
                CREATE TABLE IF NOT EXISTS advanced_key_stats (
                    user_id INTEGER NOT NULL,
                    key TEXT NOT NULL,
                    attempts INTEGER NOT NULL DEFAULT 0,
                    errors INTEGER NOT NULL DEFAULT 0,
                    accuracy REAL NOT NULL DEFAULT 0,
                    avg_latency_ms REAL NOT NULL DEFAULT 0,
                    p95_latency_ms REAL NOT NULL DEFAULT 0,
                    finger TEXT NOT NULL DEFAULT '',
                    hand TEXT NOT NULL DEFAULT '',
                    updated_at TEXT NOT NULL,
                    PRIMARY KEY(user_id, key),
                    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS advanced_transition_stats (
                    user_id INTEGER NOT NULL,
                    transition TEXT NOT NULL,
                    attempts INTEGER NOT NULL DEFAULT 0,
                    avg_latency_ms REAL NOT NULL DEFAULT 0,
                    p95_latency_ms REAL NOT NULL DEFAULT 0,
                    updated_at TEXT NOT NULL,
                    PRIMARY KEY(user_id, transition),
                    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS skill_mastery (
                    user_id INTEGER NOT NULL,
                    skill_id TEXT NOT NULL,
                    mastery REAL NOT NULL DEFAULT 0,
                    confidence REAL NOT NULL DEFAULT 0,
                    attempts INTEGER NOT NULL DEFAULT 0,
                    last_signal TEXT,
                    updated_at TEXT NOT NULL,
                    PRIMARY KEY(user_id, skill_id),
                    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS agent_runs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    run_type TEXT NOT NULL,
                    status TEXT NOT NULL,
                    duration_ms REAL NOT NULL,
                    confidence REAL NOT NULL DEFAULT 0,
                    summary TEXT NOT NULL,
                    trace_json TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
                );

                CREATE INDEX IF NOT EXISTS idx_agent_runs_user_created
                    ON agent_runs(user_id, created_at DESC);
                """
            )

    @staticmethod
    def _p95(values: list[float]) -> float:
        if not values:
            return 0.0
        values = sorted(values)
        idx = max(0, min(len(values) - 1, math.ceil(0.95 * len(values)) - 1))
        return float(values[idx])

    @staticmethod
    def _safe_float(value: Any, default: float = 0.0) -> float:
        try:
            return float(value)
        except (TypeError, ValueError):
            return default

    def _latest_telemetry(self, user_id: int) -> list[dict[str, Any]]:
        with self.db.connect() as con:
            row = con.execute(
                "SELECT telemetry_blob FROM sessions WHERE user_id=? ORDER BY id DESC LIMIT 1",
                (user_id,),
            ).fetchone()
        if not row or not row["telemetry_blob"]:
            return []
        try:
            data = json.loads(row["telemetry_blob"])
            return data if isinstance(data, list) else []
        except (TypeError, json.JSONDecodeError):
            return []

    def analyze(self, user_id: int) -> dict[str, Any]:
        telemetry = self._latest_telemetry(user_id)
        key_latencies: defaultdict[str, list[float]] = defaultdict(list)
        transition_latencies: defaultdict[str, list[float]] = defaultdict(list)

        prev_key = None
        for event in telemetry:
            key = str(event.get("key", "")).lower()
            latency = self._safe_float(event.get("latency"), 0)
            if not key or len(key) != 1:
                continue
            if latency > 0:
                key_latencies[key].append(latency)
            if prev_key:
                transition_latencies[f"{prev_key}->{key}"].append(latency)
            prev_key = key

        dashboard = self.db.dashboard(user_id)
        error_map = {str(x["expected_key"]).lower(): int(x["mistakes"]) for x in dashboard.get("weak_keys", [])}

        insights: list[KeyInsight] = []
        for key, latencies in key_latencies.items():
            attempts = len(latencies)
            errors = error_map.get(key, 0)
            accuracy = max(0.0, min(100.0, 100.0 * (1 - errors / max(1, attempts + errors))))
            finger = FINGER_MAP.get(key, "unknown")
            hand = HAND_MAP.get(finger, "unknown")
            insights.append(
                KeyInsight(
                    key=key,
                    attempts=attempts,
                    errors=errors,
                    accuracy=round(accuracy, 2),
                    avg_latency_ms=round(statistics.fmean(latencies), 2),
                    p95_latency_ms=round(self._p95(latencies), 2),
                    finger=finger,
                    hand=hand,
                )
            )

        insights.sort(key=lambda x: (x.accuracy, -x.avg_latency_ms))
        slow = sorted(
            (
                {
                    "transition": t,
                    "attempts": len(v),
                    "avg_latency_ms": round(statistics.fmean(v), 2),
                    "p95_latency_ms": round(self._p95(v), 2),
                }
                for t, v in transition_latencies.items()
                if len(v) >= 2
            ),
            key=lambda x: x["avg_latency_ms"],
            reverse=True,
        )[:10]

        left_attempts = sum(i.attempts for i in insights if i.hand == "left")
        right_attempts = sum(i.attempts for i in insights if i.hand == "right")
        total_attempts = max(1, left_attempts + right_attempts)
        hand_balance = round(100 * min(left_attempts, right_attempts) / total_attempts * 2, 2)

        all_latencies = [x for values in key_latencies.values() for x in values if x > 0]
        rhythm_cv = 0.0
        if len(all_latencies) >= 2 and statistics.fmean(all_latencies) > 0:
            rhythm_cv = statistics.pstdev(all_latencies) / statistics.fmean(all_latencies)

        return {
            "generated_at": datetime.now().isoformat(timespec="seconds"),
            "sample_size": len(telemetry),
            "dashboard": dashboard,
            "key_insights": [asdict(x) for x in insights[:20]],
            "slow_transitions": slow,
            "hand_balance": hand_balance,
            "rhythm_cv": round(rhythm_cv, 4),
            "latency_avg_ms": round(statistics.fmean(all_latencies), 2) if all_latencies else 0,
            "latency_p95_ms": round(self._p95(all_latencies), 2) if all_latencies else 0,
        }

    def persist_analysis(self, user_id: int, analysis: dict[str, Any]) -> None:
        now = datetime.now().isoformat(timespec="seconds")
        with self.db.connect() as con:
            for item in analysis["key_insights"]:
                con.execute(
                    """
                    INSERT INTO advanced_key_stats
                    (user_id,key,attempts,errors,accuracy,avg_latency_ms,p95_latency_ms,finger,hand,updated_at)
                    VALUES(?,?,?,?,?,?,?,?,?,?)
                    ON CONFLICT(user_id,key) DO UPDATE SET
                      attempts=excluded.attempts,
                      errors=excluded.errors,
                      accuracy=excluded.accuracy,
                      avg_latency_ms=excluded.avg_latency_ms,
                      p95_latency_ms=excluded.p95_latency_ms,
                      finger=excluded.finger,
                      hand=excluded.hand,
                      updated_at=excluded.updated_at
                    """,
                    (
                        user_id,
                        item["key"],
                        item["attempts"],
                        item["errors"],
                        item["accuracy"],
                        item["avg_latency_ms"],
                        item["p95_latency_ms"],
                        item["finger"],
                        item["hand"],
                        now,
                    ),
                )
            for item in analysis["slow_transitions"]:
                con.execute(
                    """
                    INSERT INTO advanced_transition_stats
                    (user_id,transition,attempts,avg_latency_ms,p95_latency_ms,updated_at)
                    VALUES(?,?,?,?,?,?)
                    ON CONFLICT(user_id,transition) DO UPDATE SET
                      attempts=excluded.attempts,
                      avg_latency_ms=excluded.avg_latency_ms,
                      p95_latency_ms=excluded.p95_latency_ms,
                      updated_at=excluded.updated_at
                    """,
                    (
                        user_id,
                        item["transition"],
                        item["attempts"],
                        item["avg_latency_ms"],
                        item["p95_latency_ms"],
                        now,
                    ),
                )

    def adaptive_plan(self, user_id: int) -> dict[str, Any]:
        analysis = self.analyze(user_id)
        self.persist_analysis(user_id, analysis)

        weak_keys = [x for x in analysis["key_insights"] if x["accuracy"] < 96][:4]
        slow_transitions = analysis["slow_transitions"][:3]
        dashboard = analysis["dashboard"]

        if weak_keys:
            focus = [x["key"].upper() for x in weak_keys]
            objective = "precision_recovery"
            drill_type = "micro_drill"
        elif slow_transitions:
            focus = [x["transition"] for x in slow_transitions]
            objective = "transition_fluency"
            drill_type = "transition_drill"
        elif analysis["rhythm_cv"] > 0.55:
            focus = ["rhythm"]
            objective = "consistency"
            drill_type = "paced_sentence"
        else:
            focus = ["speed"]
            objective = "controlled_speed"
            drill_type = "timed_passage"

        current_wpm = self._safe_float(dashboard.get("avg_wpm"))
        target_wpm = round(max(20, min(120, current_wpm + (2 if objective != "precision_recovery" else 0))), 1)
        if dashboard.get("avg_accuracy", 0) < 92:
            target_wpm = round(max(20, current_wpm - 4), 1)

        return {
            "objective": objective,
            "drill_type": drill_type,
            "focus": focus,
            "target_wpm": target_wpm,
            "target_accuracy": 97.0 if objective != "precision_recovery" else 98.0,
            "duration_minutes": 5 if objective in {"precision_recovery", "transition_fluency"} else 8,
            "reason": self._plan_reason(objective, weak_keys, slow_transitions, analysis),
        }

    @staticmethod
    def _plan_reason(objective: str, weak: list[dict[str, Any]], slow: list[dict[str, Any]], analysis: dict[str, Any]) -> str:
        if weak:
            return f"Accuracy weakness detected on: {', '.join(x['key'].upper() for x in weak)}."
        if slow:
            return f"Slow transitions detected: {', '.join(x['transition'] for x in slow)}."
        if objective == "consistency":
            return "Timing variation is the strongest current limitation; stabilize rhythm before pushing speed."
        return "Core metrics are stable enough for controlled speed progression."

    def run_and_record_coach(self, user_id: int, orchestrator: Any) -> dict[str, Any]:
        started = time.perf_counter()
        dashboard = self.db.dashboard(user_id)
        telemetry = self._latest_telemetry(user_id)
        dashboard["latest_telemetry"] = telemetry
        result = orchestrator.run(dashboard)
        duration_ms = round((time.perf_counter() - started) * 1000, 2)
        trace = result.get("trace", [])
        confidence = min((float(x.get("confidence", 0)) for x in trace), default=0.0)
        now = datetime.now().isoformat(timespec="seconds")
        with self.db.connect() as con:
            con.execute(
                """
                INSERT INTO agent_runs(user_id,run_type,status,duration_ms,confidence,summary,trace_json,created_at)
                VALUES(?,?,?,?,?,?,?,?)
                """,
                (
                    user_id,
                    "ai_coach",
                    result.get("status", "unknown"),
                    duration_ms,
                    confidence,
                    result.get("summary", ""),
                    json.dumps(trace),
                    now,
                ),
            )
        result["runtime_ms"] = duration_ms
        result["confidence_floor"] = round(confidence, 3)
        return result

    def developer_snapshot(self, user_id: int) -> dict[str, Any]:
        with self.db.connect() as con:
            tables = con.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
            ).fetchall()
            counts: dict[str, int] = {}
            for row in tables:
                name = row["name"]
                counts[name] = int(con.execute(f'SELECT COUNT(*) AS c FROM "{name}"').fetchone()["c"])
            agent_runs = [
                dict(r)
                for r in con.execute(
                    "SELECT id,run_type,status,duration_ms,confidence,created_at FROM agent_runs WHERE user_id=? ORDER BY id DESC LIMIT 12",
                    (user_id,),
                ).fetchall()
            ]
        db_size = 0
        try:
            db_size = self.db.path.stat().st_size
        except OSError:
            pass
        return {
            "database_path": str(self.db.path),
            "database_size_bytes": db_size,
            "table_counts": counts,
            "agent_runs": agent_runs,
            "version": "0.4.0",
        }
