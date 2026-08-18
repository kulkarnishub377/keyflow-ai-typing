import unittest
from app.agents import MultiAgentOrchestrator, ExerciseGenerator, SessionReviewer, Validator


class TestAgents(unittest.TestCase):
    def setUp(self):
        self.orchestrator = MultiAgentOrchestrator()

    def test_full_10_agent_pipeline_execution(self):
        dashboard = {
            "sessions": 5,
            "avg_wpm": 65,
            "avg_accuracy": 98,
            "recent": [
                {"wpm": 65, "accuracy": 98, "duration_seconds": 60},
                {"wpm": 60, "accuracy": 96, "duration_seconds": 60},
            ],
            "weak_keys": [{"expected_key": "r", "mistakes": 3}],
            "latest_telemetry": [
                {"key": "a", "latency": 150},
                {"key": "b", "latency": 160},
            ],
        }
        result = self.orchestrator.run(dashboard)
        self.assertEqual(result["status"], "ok")
        self.assertEqual(len(result["trace"]), 10)
        self.assertIn("exercise", result)
        self.assertIn("session_review", result)
        self.assertIn("validation", result)

    def test_exercise_generator(self):
        gen = ExerciseGenerator()
        context = {
            "plan": {"mode": "weak_key_drill", "focus_keys": ["E", "R"], "minutes": 5},
            "weaknesses": {"slow_digraphs": []},
        }
        res = gen.run(context)
        self.assertEqual(res.status, "ok")
        self.assertIn("exercise_text", res.output)
        self.assertIn("target_keys", res.output)

    def test_session_reviewer(self):
        reviewer = SessionReviewer()
        context = {
            "dashboard": {
                "recent": [
                    {"wpm": 70, "accuracy": 99},
                    {"wpm": 62, "accuracy": 96},
                ]
            },
            "performance": {"state": "speed_and_consistency"},
        }
        res = reviewer.run(context)
        self.assertEqual(res.status, "ok")
        self.assertEqual(res.output["trend"], "accelerating_growth")
        self.assertEqual(res.output["wpm_delta"], 8.0)

    def test_rhythm_variance_detection(self):
        telemetry = [
            {"key": "a", "latency": 50},
            {"key": "b", "latency": 600},
            {"key": "c", "latency": 45},
            {"key": "d", "latency": 700},
        ]
        dashboard = {
            "sessions": 5,
            "avg_wpm": 65,
            "avg_accuracy": 98,
            "latest_telemetry": telemetry,
        }
        result = self.orchestrator.run(dashboard)
        self.assertEqual(result["status"], "ok")
        self.assertEqual(result["performance"]["state"], "erratic_rhythm")

    def test_difficulty_controller_increase(self):
        dashboard = {
            "sessions": 5,
            "avg_wpm": 60,
            "avg_accuracy": 98,
        }
        result = self.orchestrator.run(dashboard)
        self.assertEqual(result["plan"]["difficulty_action"], "increase_speed_gate")

    def test_difficulty_controller_reduce(self):
        dashboard = {
            "sessions": 5,
            "avg_wpm": 60,
            "avg_accuracy": 85,
        }
        result = self.orchestrator.run(dashboard)
        self.assertEqual(result["plan"]["difficulty_action"], "reduce_speed_gate")

    def test_validator_rejection(self):
        validator = Validator()
        # Invalid oversized coaching message
        context = {
            "plan": {"minutes": 10},
            "coach": {"message": "A" * 600},
        }
        res = validator.run(context)
        self.assertEqual(res.status, "blocked")
        self.assertFalse(res.output["valid"])


if __name__ == "__main__":
    unittest.main()
