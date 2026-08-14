import tempfile
import unittest
from pathlib import Path

from app.auth import hash_password, verify_password
from app.database import Database
from app.seed import seed


class CoreTests(unittest.TestCase):
    def test_password_roundtrip(self):
        encoded = hash_password('example-pass')
        self.assertTrue(verify_password('example-pass', encoded))
        self.assertFalse(verify_password('wrong-pass', encoded))

    def test_registration_and_session(self):
        with tempfile.TemporaryDirectory() as d:
            db = Database(Path(d) / 'test.db')
            seed(db)
            user = db.register('tester', 'example-pass', 'Test User')
            self.assertEqual(db.login('tester', 'example-pass')['id'], user['id'])
            lessons = db.progress(user['id'])
            self.assertGreaterEqual(len(lessons), 5)
            db.save_session(user['id'], {
                'lesson_id': lessons[0]['id'], 'duration_seconds': 60, 'total_chars': 300,
                'correct_chars': 294, 'incorrect_chars': 6, 'backspaces': 2, 'wpm': 58.8,
                'accuracy': 98, 'text_prompt': 'asdf',
                'errors': [{'expected': 'r', 'actual': 't', 'count': 2}],
            })
            dash = db.dashboard(user['id'])
            self.assertEqual(dash['sessions'], 1)
            self.assertGreater(dash['best_wpm'], 0)
            self.assertEqual(dash['weak_keys'][0]['expected_key'], 'r')

    def test_agent_digraph_heuristics(self):
        from app.agents import MultiAgentOrchestrator
        telemetry = [
            {"key": "t", "latency": 100, "timestamp": 1000},
            {"key": "h", "latency": 450, "timestamp": 1450}, # Slow
            {"key": "e", "latency": 100, "timestamp": 1550},
            {"key": "t", "latency": 100, "timestamp": 1650},
            {"key": "h", "latency": 450, "timestamp": 2100}, # Slow
            {"key": "e", "latency": 100, "timestamp": 2200},
            {"key": "t", "latency": 100, "timestamp": 2300},
            {"key": "h", "latency": 450, "timestamp": 2750}, # Slow
            {"key": "e", "latency": 100, "timestamp": 2850},
        ]
        dashboard = {
            "sessions": 5,
            "avg_wpm": 60.0,
            "avg_accuracy": 98.0,
            "latest_telemetry": telemetry
        }
        orch = MultiAgentOrchestrator()
        result = orch.run(dashboard)
        self.assertEqual(result["status"], "ok")
        self.assertEqual(result["performance"]["state"], "mechanical_latency")
        self.assertIn("t->h", result["weaknesses"]["slow_digraphs"])
        self.assertIn("t->h", result["coach"]["message"])


if __name__ == '__main__':
    unittest.main()
