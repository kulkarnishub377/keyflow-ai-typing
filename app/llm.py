from __future__ import annotations

import json
import urllib.error
import urllib.request
from typing import Any


class ModelRegistry:
    """Registry of tested and supported local models."""
    DEFAULT_MODEL = "llama3.2"
    SUPPORTED_MODELS = ["llama3.2", "phi3", "mistral", "qwen2"]


class LocalModelProvider:
    """
    Communicates with a local Ollama instance running on localhost.
    Enforces strict timeouts and zero-dependency HTTP requests to ensure
    the application fails closed back to the deterministic pipeline if AI is offline.
    """

    def __init__(self, host: str = "http://localhost:11434"):
        self.host = host
        self.model = ModelRegistry.DEFAULT_MODEL
        self.timeout = 5.0  # Fail fast to avoid UI hangs

    def generate(self, prompt: str, system: str = "") -> str | None:
        """
        Generates text using the local LLM. 
        Returns None if the engine is offline or times out.
        """
        payload = {
            "model": self.model,
            "prompt": prompt,
            "system": system,
            "stream": False,
            "options": {
                "temperature": 0.4,
                "top_p": 0.9,
            }
        }
        
        req = urllib.request.Request(
            f"{self.host}/api/generate",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode("utf-8"))
                    return data.get("response", "").strip()
                return None
        except (urllib.error.URLError, TimeoutError, ConnectionRefusedError):
            # The local inference engine is offline or timed out.
            # We explicitly swallow the error to trigger the deterministic fallback.
            return None
