from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import webview

from .advanced_engine import AdvancedTypingEngine
from .agents import MultiAgentOrchestrator
from .database import Database


class API:
    def __init__(self, db: Database):
        self.db = db
        self.user: dict[str, Any] | None = None
        self._window = None
        self.orchestrator = MultiAgentOrchestrator()
        self.advanced = AdvancedTypingEngine(db)

    def _require_user(self) -> int:
        if not self.user:
            raise ValueError("Please log in first.")
        return int(self.user["id"])

    def register(self, username: str, password: str, display_name: str = "") -> dict[str, Any]:
        self.user = self.db.register(username, password, display_name)
        return self.user

    def login(self, username: str, password: str) -> dict[str, Any]:
        self.user = self.db.login(username, password)
        return self.user

    def logout(self) -> bool:
        self.user = None
        return True

    def me(self) -> dict[str, Any] | None:
        return self.user

    def get_bootstrap(self) -> dict[str, Any]:
        if not self.user:
            return {"user": None, "lessons": self.db.lessons()}
        uid = self.user["id"]
        return {
            "user": self.user,
            "lessons": self.db.lessons(uid),
            "progress": self.db.progress(uid),
            "dashboard": self.db.dashboard(uid),
            "settings": self.db.settings(uid),
            "streak_stats": self.db.get_streak_and_stats(uid),
        }

    def save_session(self, payload: dict[str, Any]) -> dict[str, Any]:
        uid = self._require_user()
        result = self.db.save_session(uid, payload)
        return {
            **result,
            "dashboard": self.db.dashboard(uid),
            "streak_stats": self.db.get_streak_and_stats(uid),
        }

    def dashboard(self) -> dict[str, Any]:
        return self.db.dashboard(self._require_user())

    def get_streak_and_stats(self) -> dict[str, Any]:
        return self.db.get_streak_and_stats(self._require_user())

    def get_key_heatmap(self) -> dict[str, Any]:
        """Returns per-key accuracy and latency heatmap metrics for visual rendering."""
        return self.advanced.get_heatmap_data(self._require_user())

    def generate_adaptive_drill(self) -> dict[str, Any]:
        """Procedurally synthesizes a targeted drill targeting current weaknesses."""
        return self.advanced.generate_adaptive_drill(self._require_user())

    def create_custom_lesson(
        self, title: str, content: str, focus_keys: str = "", duration_minutes: int = 5
    ) -> dict[str, Any]:
        uid = self._require_user()
        return self.db.create_custom_lesson(uid, title, content, focus_keys, duration_minutes)

    def delete_custom_lesson(self, lesson_id: int) -> bool:
        uid = self._require_user()
        return self.db.delete_custom_lesson(uid, int(lesson_id))

    def ai_coach(self) -> dict[str, Any]:
        """Run the local deterministic + optional local LLM coaching pipeline."""
        return self.advanced.run_and_record_coach(self._require_user(), self.orchestrator)

    def advanced_analytics(self) -> dict[str, Any]:
        uid = self._require_user()
        analysis = self.advanced.analyze(uid)
        self.advanced.persist_analysis(uid, analysis)
        return analysis

    def adaptive_plan(self) -> dict[str, Any]:
        return self.advanced.adaptive_plan(self._require_user())

    def developer_snapshot(self) -> dict[str, Any]:
        return self.advanced.developer_snapshot(self._require_user())

    def agent_history(self, limit: int = 20) -> list[dict[str, Any]]:
        uid = self._require_user()
        limit = max(1, min(100, int(limit)))
        with self.db.connect() as con:
            rows = con.execute(
                "SELECT id,run_type,status,duration_ms,confidence,summary,created_at FROM agent_runs WHERE user_id=? ORDER BY id DESC LIMIT ?",
                (uid, limit),
            ).fetchall()
        return [dict(r) for r in rows]

    def progress(self) -> list[dict[str, Any]]:
        return self.db.progress(self._require_user())

    def settings(self) -> dict[str, Any]:
        return self.db.settings(self._require_user())

    def update_settings(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self.db.update_settings(self._require_user(), payload)

    def export_backup(self, path: str) -> dict[str, Any]:
        data = self.db.backup(self._require_user())
        out = Path(path).expanduser()
        from .backup import SecureBackupEngine

        engine = SecureBackupEngine()
        engine.encrypt_backup(data, out)
        return {"path": str(out)}

    def choose_backup_path(self) -> dict[str, Any]:
        if not webview.windows:
            return {"path": None}
        result = webview.windows[0].create_file_dialog(
            webview.SAVE_DIALOG,
            directory=str(Path.home()),
            save_filename="keyflow-backup.json",
            file_types=("JSON files (*.json)", "All files (*.*)"),
        )
        if not result:
            return {"path": None}
        return {"path": result[0]}
