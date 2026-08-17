from __future__ import annotations

from .database import Database

LESSONS = [
    # Level 1: Home Row Mastery
    ("Home Row: Anchors", 1, "Learn the anchor keys F and J.", "ffff jjjj ff jj fj jf", "fj", 3, 1),
    ("Home Row: Index Fingers", 1, "Expand to G and H while returning to anchors.", "fg hj gf jh fghg jhkj", "fghj", 4, 2),
    ("Home Row: Left Hand", 1, "Build left hand control.", "asdf fdsa sad dad fasad", "asdfg", 5, 3),
    ("Home Row: Right Hand", 1, "Build right hand control.", "jkl; ;lkj all fall hall", "hjkl;", 5, 4),
    ("Home Row: Full Integration", 1, "Combine both hands smoothly without looking down.", "a glass falls half a flash a dash a gash", "asdfghjkl;", 6, 5),
    
    # Level 2: Top Row Reach
    ("Top Row: Left Reaches", 2, "Reach for Q, W, E, R, T.", "water tree free draw read tear", "qwert", 5, 6),
    ("Top Row: Right Reaches", 2, "Reach for Y, U, I, O, P.", "you pop out pot top your up rip", "yuiop", 5, 7),
    ("Top Row: Integration", 2, "Mix top and home rows gracefully.", "the quick weight thought right height flight", "qwertyuiopasdfghjkl;", 6, 8),
    
    # Level 3: Bottom Row Descent
    ("Bottom Row: Left Drops", 3, "Drop to Z, X, C, V, B.", "cab bad vac cab back brave", "zxcvb", 5, 9),
    ("Bottom Row: Right Drops", 3, "Drop to N, M, ,, ., /.", "man name main plan zoom pan.", "nm,./", 5, 10),
    ("Bottom Row: Integration", 3, "Mix all three rows.", "can mix box zoom cave brave maximum", "zxcvbnm", 6, 11),
    
    # Level 4: Rhythm & Digraphs
    ("Common Digraphs: th, he", 4, "Practice the most common two-letter pairs.", "the them they then there these their", "th,he", 6, 12),
    ("Common Digraphs: in, er", 4, "Master fast rolls on common pairs.", "in into inner her here error finger", "in,er", 6, 13),
    ("Rhythm: Short Words", 4, "Type short words evenly without bursting.", "it is a to he do in we an or by as at be", "", 5, 14),
    
    # Level 5: Punctuation & Numbers
    ("Shift & Capitalization", 5, "Use the opposite shift key.", "Apple Banana Cherry Date Egg Fig", "Shift", 5, 15),
    ("Essential Punctuation", 5, "Commas, periods, quotes, and question marks.", "Wait, what? Yes, I said 'Hello'. Oh, really?", ",.?'", 6, 16),
    ("Numbers Row", 5, "Reach up to the number row.", "1 2 3 4 5 6 7 8 9 0 2024 1999 42", "1234567890", 6, 17),
    
    # Level 6: Advanced Mastery & Coding
    ("Code Syntax: Brackets", 6, "Programming basics: brackets and braces.", "function() { return [1, 2]; }", "()[]{}", 7, 18),
    ("Code Syntax: Operators", 6, "Programming basics: logic operators.", "if (a === b && c !== d) x += 1;", "=+-*&|!", 7, 19),
    ("Full Alphabet Pangrams", 6, "Type every letter of the alphabet in rhythm.", "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.", "abcdefghijklmnopqrstuvwxyz", 10, 20),
]

def seed(db: Database) -> None:
    with db.connect() as con:
        existing_titles = {r[0] for r in con.execute("SELECT title FROM lessons").fetchall()}
        new_lessons = [l for l in LESSONS if l[0] not in existing_titles]
        
        if new_lessons:
            con.executemany(
                "INSERT INTO lessons(title,level,description,content,focus_keys,duration_minutes,sort_order) VALUES(?,?,?,?,?,?,?)",
                new_lessons,
            )
