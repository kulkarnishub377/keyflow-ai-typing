# KeyFlow Local — Offline Typing Coach

A local-first desktop typing-learning application built with:

- Python
- pywebview
- HTML/CSS/JavaScript
- SQLite

No cloud server is required. User accounts, lessons, session history, analytics and settings are stored locally on the computer.

## Features in this foundation

- Local user registration/login
- Local password hashing using Python's scrypt
- Beginner learning path with lessons
- Interactive typing practice
- WPM / accuracy / error tracking
- Session history stored in SQLite
- Dashboard with progress and recent sessions
- Weak-key analysis
- Daily practice goal
- Dark/light theme toggle
- JSON profile backup and restore
- Clean separation between frontend and Python API

## Run on Windows

1. Install Python 3.11+.
2. Open a terminal in this folder.
3. Create a virtual environment:

   `python -m venv .venv`

4. Activate it:

   PowerShell:
   `.venv\\Scripts\\Activate.ps1`

   CMD:
   `.venv\\Scripts\\activate.bat`

5. Install dependencies:

   `pip install -r requirements.txt`

6. Start the app:

   `python run.py`

## Data location

The app creates its SQLite database under the current user's application data directory. This can be changed in `app/paths.py`.

## Architecture

`web/` contains the UI.

`app/api.py` contains the Python bridge exposed to JavaScript.

`app/database.py` manages SQLite.

`app/auth.py` handles local password hashing.

`app/seed.py` creates the initial course/lesson content.

`app/main.py` launches the desktop window.

The typing engine runs in JavaScript for immediate keystroke/UI feedback. Completed sessions are sent to Python and stored locally. This can later be upgraded so Python performs deeper analytics or local AI inference.

## Important product direction

This is intentionally a strong foundation, not a fake promise that every advanced feature is finished. The next layers should add the full adaptive learning engine, richer keyboard/finger/digraph statistics, local AI models, code-typing tracks, backup encryption, packaging/installers and optional model downloads.
