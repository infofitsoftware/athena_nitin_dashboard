@echo off
REM Run script for development on Windows
REM Make sure virtual environment is activated before running this script
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
