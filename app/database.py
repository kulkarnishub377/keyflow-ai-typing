from __future__ import annotations

import json
import sqlite3
from datetime import date, datetime
from pathlib import Path
from typing import Any

from .auth import hash_password, verify_password
from .paths import db_path


class Database:
    def __init__(self, path: Path | None = None):
        self.path = path or db_path()
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._init_schema()

    def connect(self) -> sqlite3.Connection:
        con = sqlite3.connect(self.path)
        con.row_factory = sqlite3.Row
        con.execute("PRAGMA foreign_keys = ON")
        con.execute("PRAGMA journal_mode = WAL")
        return con

    def _init_schema(self) -> None:
        with self.connect() as con:
            con.executescript(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT NOT NULL UNIQUE,
                    password_hash TEXT NOT NULL,
                    display_name TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS settings (
                    user_id INTEGER PRIMARY KEY,
                    theme TEXT NOT NULL DEFAULT 'dark',
                    daily_goal_minutes INTEGER NOT NULL DEFAULT 15,
                    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS lessons (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    level INTEGER NOT NULL,
                    description TEXT NOT NULL,
                    content TEXT NOT NULL,
                    focus_keys TEXT NOT NULL,
                    duration_minutes INTEGER NOT NULL DEFAULT 5,
                    sort_order INTEGER NOT NULL
                );

                CREATE TABLE IF NOT EXISTS lesson_progress (
                    user_id INTEGER NOT NULL,
                    lesson_id INTEGER NOT NULL,
                    best_wpm REAL NOT NULL DEFAULT 0,
                    best_accuracy REAL NOT NULL DEFAULT 0,
                    completed_count INTEGER NOT NULL DEFAULT 0,
                    last_completed_at TEXT,
                    PRIMARY KEY(user_id, lesson_id),
                    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY(lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    lesson_id INTEGER,
                    duration_seconds REAL NOT NULL,
                    total_chars INTEGER NOT NULL,
                    correct_chars INTEGER NOT NULL,
                    incorrect_chars INTEGER NOT NULL,
                    backspaces INTEGER NOT NULL,
                    wpm REAL NOT NULL,
                    accuracy REAL NOT NULL,
                    text_prompt TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY(lesson_id) REFERENCES lessons(id) ON DELETE SET NULL
                );

                CREATE TABLE IF NOT EXISTS key_errors (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    session_id INTEGER NOT NULL,
                    expected_key TEXT NOT NULL,
                    actual_key TEXT NOT NULL,
                    count INTEGER NOT NULL,
                    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE
                );

                CREATE INDEX IF NOT EXISTS idx_sessions_user_created ON sessions(user_id, created_at DESC);
                CREATE INDEX IF NOT EXISTS idx_key_errors_user ON key_errors(user_id);
                """
            )

    def register(self, username: str, password: str, display_name: str) -> dict[str, Any]:
        username = username.strip().lower()
        display_name = display_name.strip() or username
        if len(username) < 3 or len(password) < 6:
            raise ValueError("Username must be at least 3 characters and password at least 6 characters.")
        with self.connect() as con:
            try:
                cur = con.execute(
                    "INSERT INTO users(username,password_hash,display_name,created_at) VALUES(?,?,?,?)",
                    (username, hash_password(password), display_name, datetime.now().isoformat(timespec="seconds")),
                )
            except sqlite3.IntegrityError:
                raise ValueError("That username is already used on this computer.")
            user_id = cur.lastrowid
            con.execute("INSERT INTO settings(user_id) VALUES(?)", (user_id,))
            return {"id": user_id, "username": username, "display_name": display_name}

    def login(self, username: str, password: str) -> dict[str, Any]:
        with self.connect() as con:
            row = con.execute("SELECT id,username,password_hash,display_name FROM users WHERE username=?", (username.strip().lower(),)).fetchone()
        if not row or not verify_password(password, row["password_hash"]):
            raise ValueError("Invalid username or password.")
        return {"id": row["id"], "username": row["username"], "display_name": row["display_name"]}

    def lessons(self) -> list[dict[str, Any]]:
        with self.connect() as con:
            rows = con.execute("SELECT * FROM lessons ORDER BY sort_order").fetchall()
        return [dict(r) for r in rows]

    def progress(self, user_id: int) -> list[dict[str, Any]]:
        with self.connect() as con:
            rows = con.execute(
                """
                SELECT l.id, l.title, l.level, l.description, l.focus_keys, l.duration_minutes,
                       COALESCE(p.best_wpm,0) best_wpm,
                       COALESCE(p.best_accuracy,0) best_accuracy,
                       COALESCE(p.completed_count,0) completed_count
                FROM lessons l LEFT JOIN lesson_progress p
                  ON p.lesson_id=l.id AND p.user_id=?
                ORDER BY l.sort_order
                """,
                (user_id,),
            ).fetchall()
        return [dict(r) for r in rows]

    def save_session(self, user_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        now = datetime.now().isoformat(timespec="seconds")
        with self.connect() as con:
            cur = con.execute(
                """
                INSERT INTO sessions(user_id,lesson_id,duration_seconds,total_chars,correct_chars,incorrect_chars,backspaces,wpm,accuracy,text_prompt,created_at)
                VALUES(?,?,?,?,?,?,?,?,?,?,?)
                """,
                (
                    user_id,
                    payload.get("lesson_id"),
                    float(payload["duration_seconds"]),
                    int(payload["total_chars"]),
                    int(payload["correct_chars"]),
                    int(payload["incorrect_chars"]),
                    int(payload.get("backspaces", 0)),
                    float(payload["wpm"]),
                    float(payload["accuracy"]),
                    payload["text_prompt"],
                    now,
                ),
            )
            session_id = cur.lastrowid
            for err in payload.get("errors", []):
                con.execute(
                    "INSERT INTO key_errors(user_id,session_id,expected_key,actual_key,count) VALUES(?,?,?,?,?)",
                    (user_id, session_id, err["expected"], err["actual"], int(err.get("count", 1))),
                )

            lesson_id = payload.get("lesson_id")
            if lesson_id:
                old = con.execute("SELECT * FROM lesson_progress WHERE user_id=? AND lesson_id=?", (user_id, lesson_id)).fetchone()
                if old:
                    con.execute(
                        """UPDATE lesson_progress SET best_wpm=?, best_accuracy=?, completed_count=?, last_completed_at=?
                           WHERE user_id=? AND lesson_id=?""",
                        (
                            max(float(old["best_wpm"]), float(payload["wpm"])),
                            max(float(old["best_accuracy"]), float(payload["accuracy"])),
                            int(old["completed_count"]) + 1,
                            now,
                            user_id,
                            lesson_id,
                        ),
                    )
                else:
                    con.execute(
                        "INSERT INTO lesson_progress(user_id,lesson_id,best_wpm,best_accuracy,completed_count,last_completed_at) VALUES(?,?,?,?,?,?)",
                        (user_id, lesson_id, payload["wpm"], payload["accuracy"], 1, now),
                    )
        return {"id": session_id, "saved_at": now}

    def dashboard(self, user_id: int) -> dict[str, Any]:
        with self.connect() as con:
            summary = con.execute(
                """
                SELECT COUNT(*) sessions,
                       COALESCE(MAX(wpm),0) best_wpm,
                       COALESCE(AVG(wpm),0) avg_wpm,
                       COALESCE(AVG(accuracy),0) avg_accuracy,
                       COALESCE(SUM(duration_seconds),0) total_seconds
                FROM sessions WHERE user_id=?
                """,
                (user_id,),
            ).fetchone()
            recent = con.execute(
                "SELECT id,wpm,accuracy,duration_seconds,created_at FROM sessions WHERE user_id=? ORDER BY created_at DESC LIMIT 8",
                (user_id,),
            ).fetchall()
            weak = con.execute(
                """
                SELECT expected_key, SUM(count) mistakes
                FROM key_errors WHERE user_id=?
                GROUP BY expected_key ORDER BY mistakes DESC LIMIT 8
                """,
                (user_id,),
            ).fetchall()
            today = con.execute(
                "SELECT COALESCE(SUM(duration_seconds),0) seconds FROM sessions WHERE user_id=? AND date(created_at)=?",
                (user_id, date.today().isoformat()),
            ).fetchone()["seconds"]
        data = dict(summary)
        data["total_minutes"] = round(data.pop("total_seconds") / 60, 1)
        data["today_minutes"] = round(today / 60, 1)
        data["recent"] = [dict(r) for r in recent]
        data["weak_keys"] = [dict(r) for r in weak]
        return data

    def settings(self, user_id: int) -> dict[str, Any]:
        with self.connect() as con:
            row = con.execute("SELECT theme,daily_goal_minutes FROM settings WHERE user_id=?", (user_id,)).fetchone()
        return dict(row) if row else {"theme": "dark", "daily_goal_minutes": 15}

    def update_settings(self, user_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        theme = payload.get("theme", "dark")
        goal = max(1, min(240, int(payload.get("daily_goal_minutes", 15))))
        with self.connect() as con:
            con.execute("INSERT INTO settings(user_id,theme,daily_goal_minutes) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET theme=excluded.theme,daily_goal_minutes=excluded.daily_goal_minutes", (user_id, theme, goal))
        return {"theme": theme, "daily_goal_minutes": goal}

    def backup(self, user_id: int) -> dict[str, Any]:
        with self.connect() as con:
            user = dict(con.execute("SELECT id,username,display_name,created_at FROM users WHERE id=?", (user_id,)).fetchone())
            settings = self.settings(user_id)
            sessions = [dict(r) for r in con.execute("SELECT * FROM sessions WHERE user_id=? ORDER BY id", (user_id,)).fetchall()]
            progress = [dict(r) for r in con.execute("SELECT * FROM lesson_progress WHERE user_id=? ORDER BY lesson_id", (user_id,)).fetchall()]
            errors = [dict(r) for r in con.execute("SELECT expected_key,actual_key,count FROM key_errors WHERE user_id=? ORDER BY id", (user_id,)).fetchall()]
        return {"version": 1, "user": user, "settings": settings, "sessions": sessions, "progress": progress, "errors": errors}
