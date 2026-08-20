@echo off
title KeyFlow Desktop Setup & Build Pipeline
cd /d "%~dp0"

echo =======================================================================
echo   KeyFlow AI Typing - Automated Desktop Builder
echo =======================================================================
echo.

if exist ".venv\Scripts\python.exe" (
    ".venv\Scripts\python.exe" build_app.py
) else (
    python build_app.py
)

echo.
pause
