@echo off
cd /d "%~dp0\backend"
echo Starting Smart Resume Builder Backend...
echo Server will run at http://127.0.0.1:8000
echo Keep this window open!
if exist "venv\Scripts\activate" (
    call venv\Scripts\activate
)
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
pause
