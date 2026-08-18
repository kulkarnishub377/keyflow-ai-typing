import tempfile
import unittest
from pathlib import Path

from app.database import Database
from app.advanced_engine import AdvancedTypingEngine


class AdvancedEngineTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.db = Database(Path(self.tmp.name) / "keyflow-test.sqlite")
        self.db._init_schema()
        self.user = self.db.register("tester", "password123", "Tester")

    def tearDown(self):
        self.tmp.cleanup()

    def test_adaptive_engine_no_sessions_is_safe(self):
        engine = AdvancedTypingEngine(self.db)
        analysis = engine.analyze(self.user["id"])
        self.assertEqual(analysis["sample_size"], 0)
        plan = engine.adaptive_plan(self.user["id"])
        self.assertIn(plan["objective"], {"controlled_speed", "consistency" , "precision_recovery", "transition_fluency"})

    def test_telemetry_derives_key_and_transition_stats(self):
        engine = AdvancedTypingEngine(self.db)
        self.db.save_session(
            self.user["id"],
            {
                "lesson_id": 1,
                "duration_seconds": 12,
                "total_chars": 6,
                "correct_chars": 6,
                "incorrect_chars": 0,
                "backspaces": 0,
                "wpm": 6,
                "accuracy": 100,
                "text_prompt": "abcdef",
                "errors": [],
                "timing": [
                    {"key": "a", "latency": 100},
                    {"key": "b", "latency": 120},
                    {"key": "c", "latency": 500},
                    {"key": "d", "latency": 140},
                    {"key": "e", "latency": 150},
                ],
            },
        )
        analysis = engine.analyze(self.user["id"])
        self.assertGreaterEqual(analysis["sample_size"], 5)
        self.assertTrue(any(x["key"] == "c" for x in analysis["key_insights"]))
        self.assertTrue(any(x["transition"] == "b->c" for x in analysis["slow_transitions"]))


if __name__ == "__main__":
    unittest.main()
