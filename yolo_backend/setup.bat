@echo off
echo ================================
echo PawGuard AI - YOLO Backend Setup
echo ================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

echo Step 1/3: Creating virtual environment...
python -m venv venv
if %errorlevel% neq 0 (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)

echo Step 2/3: Activating virtual environment...
call venv\Scripts\activate.bat

echo Step 3/3: Installing dependencies...
pip install -r requirements.txt

echo.
echo ================================
echo Setup Complete!
echo ================================
echo.
echo To start the server, run:
echo   start_server.bat
echo.
pause
