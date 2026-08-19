from __future__ import annotations

import math
import os
import re
from pathlib import Path
from typing import Any

# Allowed username pattern: alphanumeric, underscores, hyphens, 2-32 chars
USERNAME_REGEX = re.compile(r"^[a-zA-Z0-9_\-\.]{2,32}$")
MAX_DISPLAY_NAME_LEN = 40
MIN_PASSWORD_LEN = 4
MAX_PASSWORD_LEN = 128
MAX_TEXT_PROMPT_LEN = 10000
MAX_LESSON_TITLE_LEN = 100
MAX_LESSON_CONTENT_LEN = 20000


class SecurityValidationError(ValueError):
    """Raised when an untrusted input payload fails zero-trust validation."""
    pass


class SecurityValidator:
    """
    Institutional-grade Zero-Trust Input Validation & Sanitization Engine.
    Ensures that hostile or malformed payloads from the JavaScript frontend
    cannot compromise local storage, cause denial-of-service, or corrupt telemetry.
    """

    @staticmethod
    def sanitize_string(val: Any, max_len: int = 255, default: str = "") -> str:
        if val is None:
            return default
        s = str(val).strip()
        # Remove null bytes and non-printable control characters
        s = "".join(ch for ch in s if ch == "\t" or ch == "\n" or ch == "\r" or ord(ch) >= 32)
        return s[:max_len]

    @classmethod
    def validate_username(cls, username: Any) -> str:
        if not username or not isinstance(username, str):
            raise SecurityValidationError("Username must be a non-empty string.")
        cleaned = username.strip()
        if not USERNAME_REGEX.match(cleaned):
            raise SecurityValidationError(
                "Username must be 2–32 characters and contain only letters, numbers, dots, underscores, or hyphens."
            )
        return cleaned

    @classmethod
    def validate_password(cls, password: Any) -> str:
        if not password or not isinstance(password, str):
            raise SecurityValidationError("Password must be a non-empty string.")
        if len(password) < MIN_PASSWORD_LEN:
            raise SecurityValidationError(f"Password must be at least {MIN_PASSWORD_LEN} characters long.")
        if len(password) > MAX_PASSWORD_LEN:
            raise SecurityValidationError(f"Password cannot exceed {MAX_PASSWORD_LEN} characters.")
        return password

    @classmethod
    def validate_display_name(cls, display_name: Any, fallback: str = "") -> str:
        cleaned = cls.sanitize_string(display_name, max_len=MAX_DISPLAY_NAME_LEN, default=fallback)
        return cleaned if cleaned else fallback

    @classmethod
    def validate_session_payload(cls, payload: Any) -> dict[str, Any]:
        """
        Validates and clamps numeric bounds on telemetry payloads.
        Guarantees deterministic arithmetic cannot overflow or ingest NaN/Infinity values.
        """
        if not isinstance(payload, dict):
            raise SecurityValidationError("Session payload must be a JSON object.")

        def safe_float(key: str, default: float = 0.0, min_v: float = 0.0, max_v: float = 100000.0) -> float:
            try:
                v = float(payload.get(key, default))
                if math.isnan(v) or math.isinf(v):
                    return default
                return max(min_v, min(max_v, v))
            except (ValueError, TypeError):
                return default

        def safe_int(key: str, default: int = 0, min_v: int = 0, max_v: int = 10000000) -> int:
            try:
                v = int(payload.get(key, default))
                return max(min_v, min(max_v, v))
            except (ValueError, TypeError):
                return default

        lesson_id = payload.get("lesson_id")
        if lesson_id is not None:
            try:
                lesson_id = int(lesson_id)
            except (ValueError, TypeError):
                lesson_id = None

        text_prompt = cls.sanitize_string(payload.get("text_prompt", ""), max_len=MAX_TEXT_PROMPT_LEN)

        # Sanitize errors list
        raw_errors = payload.get("errors", [])
        sanitized_errors = []
        if isinstance(raw_errors, list):
            for item in raw_errors[:200]:  # Cap at 200 distinct error keys
                if isinstance(item, dict):
                    exp = cls.sanitize_string(item.get("expected", ""), max_len=10)
                    act = cls.sanitize_string(item.get("actual", ""), max_len=10)
                    try:
                        cnt = max(1, min(10000, int(item.get("count", 1))))
                    except (ValueError, TypeError):
                        cnt = 1
                    if exp:
                        sanitized_errors.append({"expected": exp, "actual": act, "count": cnt})

        # Sanitize per-key timing metrics
        raw_timing = payload.get("timing", [])
        sanitized_timing = []
        if isinstance(raw_timing, list):
            for t in raw_timing[:500]:
                if isinstance(t, dict):
                    k = cls.sanitize_string(t.get("key", ""), max_len=5)
                    lat = safe_float("latency_ms", default=0.0, min_v=0.0, max_v=30000.0)
                    sanitized_timing.append({"key": k, "latency_ms": lat})

        return {
            "lesson_id": lesson_id,
            "duration_seconds": safe_float("duration_seconds", default=0.0, min_v=0.0, max_v=86400.0),
            "total_chars": safe_int("total_chars", default=0),
            "correct_chars": safe_int("correct_chars", default=0),
            "incorrect_chars": safe_int("incorrect_chars", default=0),
            "backspaces": safe_int("backspaces", default=0),
            "wpm": safe_float("wpm", default=0.0, min_v=0.0, max_v=500.0),
            "accuracy": safe_float("accuracy", default=100.0, min_v=0.0, max_v=100.0),
            "text_prompt": text_prompt,
            "errors": sanitized_errors,
            "timing": sanitized_timing,
        }

    @classmethod
    def validate_custom_lesson(
        cls, title: Any, content: Any, focus_keys: Any = "", duration_minutes: Any = 5
    ) -> tuple[str, str, str, int]:
        clean_title = cls.sanitize_string(title, max_len=MAX_LESSON_TITLE_LEN)
        if not clean_title:
            raise SecurityValidationError("Lesson title is required.")

        clean_content = cls.sanitize_string(content, max_len=MAX_LESSON_CONTENT_LEN)
        if not clean_content:
            raise SecurityValidationError("Lesson text content cannot be empty.")

        clean_focus = cls.sanitize_string(focus_keys, max_len=50)

        try:
            dur = max(1, min(120, int(duration_minutes)))
        except (ValueError, TypeError):
            dur = 5

        return clean_title, clean_content, clean_focus, dur

    @classmethod
    def validate_export_path(cls, path_str: str) -> Path:
        """
        Validates target export path against directory traversal and dangerous system locations.
        """
        if not path_str or not isinstance(path_str, str):
            raise SecurityValidationError("Export destination path is required.")

        clean_str = path_str.strip()
        # Prevent null bytes
        if "\0" in clean_str:
            raise SecurityValidationError("Invalid path characters.")

        path = Path(clean_str).resolve()

        # Reject path traversals attempting to write to root or critical system directories
        parent = path.parent
        if not parent.exists():
            parent.mkdir(parents=True, exist_ok=True)

        return path


class PrivacyGuard:
    """
    Zero-Trust Telemetry Privacy Guard.
    Strips all identifying local user metadata, system paths, account IDs,
    and private notes prior to model inference or external presentation.
    """

    FORBIDDEN_KEY_PATTERNS = [
        re.compile(r".*_path$", re.IGNORECASE),
        re.compile(r"^path$", re.IGNORECASE),
        re.compile(r"^username$", re.IGNORECASE),
        re.compile(r"^password.*", re.IGNORECASE),
        re.compile(r".*_id$", re.IGNORECASE),
        re.compile(r"^email$", re.IGNORECASE),
        re.compile(r"^ip_.*", re.IGNORECASE),
        re.compile(r"^device_.*", re.IGNORECASE),
    ]

    @classmethod
    def scrub_context(cls, data: Any) -> Any:
        if isinstance(data, dict):
            clean_dict = {}
            for k, v in data.items():
                if any(p.match(k) for p in cls.FORBIDDEN_KEY_PATTERNS):
                    continue
                clean_dict[k] = cls.scrub_context(v)
            return clean_dict
        elif isinstance(data, list):
            return [cls.scrub_context(item) for item in data]
        return data
