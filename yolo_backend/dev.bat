@echo off
echo ================================
echo PawGuard AI - YOLO Backend
echo Development Environment
echo ================================
echo.

REM Check if virtual environment exists
if not exist venv (
    echo [INFO] Virtual environment not found. Creating it now...
    echo.
    python -m venv venv
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create virtual environment
        echo [ERROR] Make sure Python 3.12 is installed and in your PATH
        pause
        exit /b 1
    )
    echo [SUCCESS] Virtual environment created!
    echo.
)

REM Activate virtual environment
echo [INFO] Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip and setuptools to fix pkg_resources error
echo [INFO] Upgrading pip and setuptools...
python -m pip install --upgrade pip setuptools wheel

REM Install/update dependencies
echo [INFO] Installing/updating dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo.
    echo [WARNING] Some dependencies failed to install
    echo [INFO] You can still try to run the server
    echo.
)

echo.
echo ================================
echo Environment Ready!
echo ================================
echo.
echo Starting YOLO server...
echo.
python yolo_server.py
