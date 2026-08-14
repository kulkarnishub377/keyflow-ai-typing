from __future__ import annotations

import base64
import json
from pathlib import Path
from typing import Any

from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC


class SecureBackupEngine:
    """
    Encrypts and decrypts local SQLite telemetry backups.
    Prevents unauthorized viewing of sensitive keystroke dynamics and metrics on disk.
    """

    def __init__(self, secret: str = "local_only_secret"):
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=b"keyflow-offline-salt",
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(secret.encode()))
        self.cipher = Fernet(key)

    def encrypt_backup(self, data: dict[str, Any], path: Path) -> None:
        raw_json = json.dumps(data).encode("utf-8")
        encrypted = self.cipher.encrypt(raw_json)
        path.write_bytes(encrypted)

    def decrypt_backup(self, path: Path) -> dict[str, Any]:
        encrypted = path.read_bytes()
        decrypted = self.cipher.decrypt(encrypted)
        return json.loads(decrypted.decode("utf-8"))
