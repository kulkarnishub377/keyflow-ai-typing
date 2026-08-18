import tempfile
import unittest
from pathlib import Path

from app.auth import hash_password, verify_password
from app.database import Database
from app.seed import seed


class CoreTests(unittest.TestCase):
    def test_password_roundtrip(self):
        encoded = hash_password("example-pass")
        self.assertTrue(verify_password("example-pass", encoded))
        self.assertFalse(verify_password("wrong-pass", encoded))

    def test_registration_and_32_lessons_seed(self):
        with tempfile.TemporaryDirectory() as d:
            db = Database(Path(d) / "test.db")
            seed(db)
            user = db.register("tester", "example-pass", "Test User")
            self.assertEqual(db.login("tester", "example-pass")["id"], user["id"])
            lessons = db.progress(user["id"])
            self.assertGreaterEqual(len(lessons), 30)
            self.assertTrue(bool(lessons[0].get("content")))

    def test_custom_lesson_crud(self):
        with tempfile.TemporaryDirectory() as d:
            db = Database(Path(d) / "test.db")
            seed(db)
            user = db.register("coder", "example-pass", "Code Learner")
            created = db.create_custom_lesson(user["id"], "My Code Drill", "const x = 10;", "x=10", 5)
            self.assertIn("id", created)
            self.assertEqual(created["is_custom"], 1)

            progress = db.progress(user["id"])
            self.assertTrue(any(l["id"] == created["id"] for l in progress))

            # Delete custom lesson
            db.delete_custom_lesson(user["id"], created["id"])
            progress_after = db.progress(user["id"])
            self.assertFalse(any(l["id"] == created["id"] for l in progress_after))

    def test_streak_and_settings_persistence(self):
        with tempfile.TemporaryDirectory() as d:
            db = Database(Path(d) / "test.db")
            seed(db)
            user = db.register("daily_user", "example-pass", "Daily User")

            # Update settings with audio feedback & metronome
            settings = db.update_settings(
                user["id"],
                {"theme": "light", "daily_goal_minutes": 20, "sound_enabled": "click", "metronome_bpm": 80},
            )
            self.assertEqual(settings["sound_enabled"], "click")
            self.assertEqual(settings["metronome_bpm"], 80)

            # Save session to trigger streak
            db.save_session(
                user["id"],
                {
                    "lesson_id": 1,
                    "duration_seconds": 60,
                    "total_chars": 300,
                    "correct_chars": 294,
                    "incorrect_chars": 6,
                    "backspaces": 2,
                    "wpm": 58.8,
                    "accuracy": 98,
                    "text_prompt": "asdf",
                    "errors": [{"expected": "r", "actual": "t", "count": 2}],
                },
            )

            stats = db.get_streak_and_stats(user["id"])
            self.assertEqual(stats["streak_days"], 1)
            self.assertEqual(stats["total_sessions"], 1)
            self.assertTrue(any(b["id"] == "first_flight" for b in stats["badges"]))
            self.assertTrue(any(b["id"] == "speed_50" for b in stats["badges"]))

    def test_agent_digraph_heuristics(self):
        from app.agents import MultiAgentOrchestrator

        telemetry = [
            {"key": "t", "latency": 100, "timestamp": 1000},
            {"key": "h", "latency": 450, "timestamp": 1450},  # Slow
            {"key": "e", "latency": 100, "timestamp": 1550},
            {"key": "t", "latency": 100, "timestamp": 1650},
            {"key": "h", "latency": 450, "timestamp": 2100},  # Slow
            {"key": "e", "latency": 100, "timestamp": 2200},
            {"key": "t", "latency": 100, "timestamp": 2300},
            {"key": "h", "latency": 450, "timestamp": 2750},  # Slow
            {"key": "e", "latency": 100, "timestamp": 2850},
        ]
        dashboard = {
            "sessions": 5,
            "avg_wpm": 60.0,
            "avg_accuracy": 98.0,
            "latest_telemetry": telemetry,
        }
        orch = MultiAgentOrchestrator()
        result = orch.run(dashboard)
        self.assertEqual(result["status"], "ok")
        self.assertEqual(result["performance"]["state"], "mechanical_latency")
        self.assertIn("t->h", result["weaknesses"]["slow_digraphs"])
        self.assertIn("t->h", result["coach"]["message"])


if __name__ == "__main__":
    unittest.main()
