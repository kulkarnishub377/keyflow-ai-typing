import unittest
from app.agents import MultiAgentOrchestrator

class TestAgents(unittest.TestCase):
    def setUp(self):
        self.orchestrator = MultiAgentOrchestrator()

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
            "latest_telemetry": telemetry
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

    def test_privacy_guard_and_llm_fallback(self):
        # Without Ollama running, the LLMCoach should fallback to deterministic
        dashboard = {
            "sessions": 5,
            "avg_wpm": 60,
            "avg_accuracy": 95,
        }
        result = self.orchestrator.run(dashboard)
        self.assertEqual(result["status"], "ok")
        
        # Verify the PrivacyGuard ran
        trace = result["trace"]
        privacy_result = next((r for r in trace if r["agent"] == "privacy_guard"), None)
        self.assertIsNotNone(privacy_result)
        self.assertIn("safe_context", privacy_result["output"])
        
        # Verify the LLMCoach ran and fell back
        llm_result = next((r for r in trace if r["agent"] == "llm_coach"), None)
        self.assertIsNotNone(llm_result)
        self.assertFalse(llm_result["output"]["is_llm"])

if __name__ == "__main__":
    unittest.main()
