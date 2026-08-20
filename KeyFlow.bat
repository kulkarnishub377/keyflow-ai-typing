@echo off
title KeyFlow AI Typing Studio
cd /d "%~dp0"

if exist ".venv\Scripts\pythonw.exe" (
    start "" ".venv\Scripts\pythonw.exe" run.py
    exit /b
)

if exist ".venv\Scripts\python.exe" (
    start "" ".venv\Scripts\python.exe" run.py
    exit /b
)

where pythonw >nul 2>&1
if %ERRORLEVEL% equ 0 (
    start "" pythonw run.py
    exit /b
)

python run.py
