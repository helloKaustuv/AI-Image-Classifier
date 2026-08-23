@echo off
echo ============================================
echo   AI Image Detector - Setup ^& Launch
echo ============================================
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH.
    echo Please install Python 3.10+ from https://python.org
    pause
    exit /b 1
)

:: Install dependencies
echo [1/2] Checking and installing dependencies...
echo.
pip install -r requirements.txt -q

if errorlevel 1 (
    echo.
    echo ERROR: Failed to install dependencies.
    echo Try running: pip install -r requirements.txt
    pause
    exit /b 1
)

echo.
echo [2/2] Starting the AI Image Detector server...
echo       The browser will open automatically.
echo.

:: Open browser after a short delay
start "" "http://localhost:5000"

:: Start the Flask app as module
python -m backend.app

pause
