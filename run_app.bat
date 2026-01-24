@echo off
cd /d "%~dp0"
echo Starting Smart Resume Builder...

echo.
echo Cleaning up old processes...
taskkill /F /IM python.exe /T > nul 2>&1
echo.
echo [1/2] Checking Python Backend...
if not exist "backend\venv" (
    echo Creating Python virtual environment...
    python -m venv backend\venv
)
call backend\venv\Scripts\activate
pip install -r backend\requirements.txt
python -m spacy download en_core_web_sm > nul 2>&1
python -m nltk.downloader stopwords punkt > nul 2>&1

start "Backend Server" /d "%~dp0" cmd /k "call backend\venv\Scripts\activate && cd backend && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo.
echo [2/2] Starting Frontend...
start "Frontend" /d "%~dp0" cmd /k "npm run dev"

echo.
echo ===================================================
echo   App should open at: http://localhost:5173
echo   backend running on: http://localhost:8000
echo ===================================================
pause
