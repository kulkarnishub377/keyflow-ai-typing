import tempfile
import unittest
from pathlib import Path

from app.advanced_engine import AdvancedTypingEngine
from app.database import Database


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
        self.assertIn(
            plan["objective"],
            {"controlled_speed", "consistency", "precision_recovery", "transition_fluency"},
        )

    def test_p95_math_calculation(self):
        engine = AdvancedTypingEngine(self.db)
        values = [100.0, 150.0, 200.0, 300.0, 500.0]
        p95 = engine._p95(values)
        self.assertEqual(p95, 500.0)
        self.assertEqual(engine._p95([]), 0.0)

    def test_heatmap_data_generation(self):
        engine = AdvancedTypingEngine(self.db)
        self.db.save_session(
            self.user["id"],
            {
                "lesson_id": 1,
                "duration_seconds": 10,
                "total_chars": 5,
                "correct_chars": 5,
                "incorrect_chars": 0,
                "backspaces": 0,
                "wpm": 60,
                "accuracy": 100,
                "text_prompt": "hello",
                "errors": [],
                "timing": [
                    {"key": "h", "latency": 150},
                    {"key": "e", "latency": 140},
                    {"key": "l", "latency": 130},
                    {"key": "l", "latency": 120},
                    {"key": "o", "latency": 110},
                ],
            },
        )
        hm = engine.get_heatmap_data(self.user["id"])
        self.assertIn("heatmap", hm)
        self.assertIn("h", hm["heatmap"])
        self.assertEqual(hm["heatmap"]["h"]["status"], "excellent")

    def test_procedural_adaptive_drill_synthesis(self):
        engine = AdvancedTypingEngine(self.db)
        drill = engine.generate_adaptive_drill(self.user["id"])
        self.assertIn("title", drill)
        self.assertIn("content", drill)
        self.assertGreater(len(drill["content"]), 5)

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
