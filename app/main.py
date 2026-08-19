from __future__ import annotations

from pathlib import Path

import webview

from .api import API
from .database import Database
from .seed import seed

ROOT = Path(__file__).resolve().parent.parent


def main() -> None:
    db = Database()
    seed(db)
    api = API(db)
    html = (ROOT / "web" / "index.html").as_uri()
    window = webview.create_window(
        "KeyFlow AI Typing",
        url=html,
        js_api=api,
        width=1440,
        height=920,
        min_size=(1100, 720),
        resizable=True,
        background_color="#070b14",
        confirm_close=False,
    )
    api._window = window
    webview.start(debug=False)


if __name__ == "__main__":
    main()
