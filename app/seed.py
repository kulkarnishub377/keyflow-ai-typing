from __future__ import annotations

from .database import Database

LESSONS = [
    ("Home Row Foundations", 1, "Learn the anchor keys F and J, then build reliable home-row movement.", "asdf jkl; asdf jkl; fj fj aj sj dk la;", "asdfjkl;", 5, 1),
    ("Left Hand Control", 1, "Build confidence with the left hand while keeping the right hand anchored.", "sad fad dad fall salad flask ask as", "asdfg", 5, 2),
    ("Right Hand Control", 1, "Practice precise right-hand reaches and return to the home row.", "lad ask all fall; jake; hall; flask;", "hjkl;", 5, 3),
    ("Top Row Basics", 2, "Introduce qwerty and uiop without sacrificing finger placement.", "we were quiet type write quite tree power your", "qwertyuiop", 6, 4),
    ("Bottom Row Basics", 2, "Build speed and accuracy with zxcvbnm and neighboring patterns.", "can mix box zoom cave brave basic maximum", "zxcvbnm", 6, 5),
    ("Capitalization & Punctuation", 3, "Practice Shift, commas, periods, apostrophes and clean sentence flow.", "Typing well takes practice. Keep your hands relaxed, and stay accurate.", "ABCDEFGHIJKLMNOPQRSTUVWXYZ,.!?'-", 7, 6),
    ("Speed & Rhythm", 3, "Turn correct technique into consistent speed across natural words and phrases.", "The quick brown fox jumps over the lazy dog. Practice slowly, then let speed follow accuracy.", "", 7, 7),
]


def seed(db: Database) -> None:
    with db.connect() as con:
        count = con.execute("SELECT COUNT(*) FROM lessons").fetchone()[0]
        if count:
            return
        con.executemany(
            "INSERT INTO lessons(title,level,description,content,focus_keys,duration_minutes,sort_order) VALUES(?,?,?,?,?,?,?)",
            LESSONS,
        )
