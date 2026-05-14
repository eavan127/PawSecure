@echo off
echo ================================
echo Starting YOLO Backend Server...
echo ================================
echo.

REM Activate virtual environment if it exists
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
)

REM Start the server
python yolo_server.py

pause
