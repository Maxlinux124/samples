@echo off
setlocal

set "PROJECT_ROOT=%~dp0"
set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"
set "PYTHON=%PROJECT_ROOT%\.venv\Scripts\python.exe"
set "OLLAMA_EXE=%LOCALAPPDATA%\Programs\Ollama\ollama.exe"
set "OLLAMA_URL=http://127.0.0.1:11434"
set "PETER_URL=http://127.0.0.1:8000"

if not exist "%PYTHON%" (
    echo ERROR: Peter's virtual environment was not found at:
    echo %PYTHON%
    pause
    exit /b 1
)

if not exist "%OLLAMA_EXE%" (
    where ollama >nul 2>nul
    if errorlevel 1 (
        echo ERROR: Ollama was not found. Install Ollama first.
        pause
        exit /b 1
    )
    set "OLLAMA_EXE=ollama"
)

curl -s -f "%OLLAMA_URL%/api/tags" >nul 2>nul
if not errorlevel 1 goto ollama_ready

echo Starting local Ollama service...
start "Peter Ollama" /min "%OLLAMA_EXE%" serve
set "WAITED=0"
:wait_ollama
curl -s -f "%OLLAMA_URL%/api/tags" >nul 2>nul
if not errorlevel 1 goto ollama_ready
if %WAITED% GEQ 30 goto ollama_failed
set /a WAITED+=2
timeout /t 2 /nobreak >nul
goto wait_ollama

:ollama_ready
curl -s -f "%PETER_URL%/api/health" >nul 2>nul
if errorlevel 1 (
    echo Starting Peter backend...
    start "Peter Backend" /min "%PYTHON%" "%PROJECT_ROOT%\app\backend\server.py"
)

set "WAITED=0"
:wait_peter
curl -s -f "%PETER_URL%/api/health" >nul 2>nul
if not errorlevel 1 goto peter_ready
if %WAITED% GEQ 30 goto peter_failed
set /a WAITED+=2
timeout /t 2 /nobreak >nul
goto wait_peter

:peter_ready
echo Peter is running at %PETER_URL%
start "" "%PETER_URL%"
exit /b 0

:ollama_failed
echo ERROR: Ollama did not start. Check the Ollama installation.
pause
exit /b 1

:peter_failed
echo ERROR: Peter backend did not start. Check app\backend\server.log or the minimized server window.
pause
exit /b 1
