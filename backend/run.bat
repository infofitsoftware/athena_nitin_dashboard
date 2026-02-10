@echo off
REM Run script for development on Windows
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
