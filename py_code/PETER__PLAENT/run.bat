@echo off
REM Peter Planet Launcher for Windows
REM This script starts the backend server and opens the frontend in a browser.

setlocal

REM Set the project root to the directory containing this batch file
set "PROJECT_ROOT=%~dp0"
REM Remove trailing backslash
set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"

echo.
echo ============================================================
echo   Peter Planet - Neural Assistant
echo   Starting backend server...
echo ============================================================
echo.

REM Activate the virtual environment
call "%PROJECT_ROOT%\.venv\Scripts\activate.bat"
if errorlevel 1 (
    echo ERROR: Failed to activate virtual environment.
    echo Make sure the virtual environment exists in .venv
    pause
    exit /b 1
)

REM Change to the backend directory
cd /d "%PROJECT_ROOT%\app\backend"
echo Starting server on http://127.0.0.1:8000
echo.

REM Start the server in the background, redirecting output to a log file
start /b python server.py > server.log 2>&1
if errorlevel 1 (
    echo ERROR: Failed to start the server.
    deactivate
    pause
    exit /b 1
)
echo Server started. Waiting for it to become healthy...

REM Wait for the server to respond to health check
set "MAX_WAIT=30"
set "WAITED=0"
:healthcheck
REM Use curl to check health
curl -s -f http://127.0.0.1:8000/api/health > nul
if errorlevel 1 (
    set /a WAITED+=2
    if %WAITED% ge %MAX_WAIT% (
        echo ERROR: Server did not become healthy within %MAX_WAIT% seconds.
        echo Check server.log for details.
        deactivate
        pause
        exit /b 1
    )
    echo Waiting for server... (%WAITED% seconds)
    timeout /t 2 > nul
    goto healthcheck
)

echo Server is healthy!
echo.

REM Open the frontend in the default browser
start "" "http://127.0.0.1:8000"
echo Frontend opened in your browser.
echo.
echo The server is running in the background.
echo To stop the server, close this window or press Ctrl+C in the server window.
echo.
echo Press Enter to stop the server and exit this launcher.
pause

REM Stop the server by killing the python process (note: this might kill other python processes)
REM We'll try to kill the specific process by tracking it, but for simplicity we'll just kill any python server.py
REM This is not ideal but acceptable for a launcher.
taskkill /f /im python.exe > nul 2>&1
deactivate
echo Server stopped.
endlocal