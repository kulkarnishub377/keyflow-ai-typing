import pytest
from app.agents import MultiAgentOrchestrator

@pytest.fixture
def orchestrator():
    return MultiAgentOrchestrator()

def test_scenario_erratic_rhythm(orchestrator):
    dashboard = {
        "sessions": 10,
        "avg_wpm": 60,
        "avg_accuracy": 98,
        "weak_keys": [],
        "advanced_analysis": {
            "rhythm_cv": 0.65,
            "latency_avg_ms": 150,
            "hand_balance": 98.0,
            "key_insights": [],
            "slow_transitions": []
        },
        "latest_telemetry": [],
        "mastered_skills": []
    }
    
    result = orchestrator.run(dashboard)
    assert result["status"] == "ok"
    assert result["performance"]["state"] == "erratic_rhythm"
    assert result["plan"]["mode"] == "timed_fluency"
    assert "rhythm" in result["summary"].lower() or "steady" in result["summary"].lower()
    
def test_scenario_pinky_weakness(orchestrator):
    dashboard = {
        "sessions": 10,
        "avg_wpm": 60,
        "avg_accuracy": 98,
        "weak_keys": [],
        "advanced_analysis": {
            "rhythm_cv": 0.2,
            "latency_avg_ms": 150,
            "hand_balance": 98.0,
            "key_insights": [
                {"key": "q", "accuracy": 85.0},
                {"key": "a", "accuracy": 90.0},
            ],
            "slow_transitions": []
        },
        "latest_telemetry": [],
        "mastered_skills": []
    }
    
    result = orchestrator.run(dashboard)
    assert result["status"] == "ok"
    assert result["weaknesses"]["weak_keys"] == ["Q", "A"]
    assert result["plan"]["mode"] == "weak_key_drill"
    assert "Q" in result["plan"]["focus_keys"]

def test_scenario_imbalanced_hands(orchestrator):
    dashboard = {
        "sessions": 10,
        "avg_wpm": 60,
        "avg_accuracy": 98,
        "weak_keys": [],
        "advanced_analysis": {
            "rhythm_cv": 0.2,
            "latency_avg_ms": 150,
            "hand_balance": 65.0,
            "key_insights": [],
            "slow_transitions": []
        },
        "latest_telemetry": [],
        "mastered_skills": []
    }
    result = orchestrator.run(dashboard)
    assert result["performance"]["state"] == "imbalanced_hands"
    assert "balance" in result["summary"].lower()

def test_mastered_skill_skips_drill(orchestrator):
    dashboard = {
        "sessions": 10,
        "avg_wpm": 60,
        "avg_accuracy": 98,
        "weak_keys": [{"expected_key": "q"}],
        "advanced_analysis": {
            "rhythm_cv": 0.2,
            "latency_avg_ms": 150,
            "hand_balance": 98.0,
            "key_insights": [{"key": "q", "accuracy": 85.0}],
            "slow_transitions": []
        },
        "latest_telemetry": [],
        "mastered_skills": ["key_q"]
    }
    result = orchestrator.run(dashboard)
    assert result["plan"]["mode"] == "timed_fluency"
