@echo off
TITLE Satellite IDS - Launcher
echo ====================================================
echo   Satellite Communication Intrusion Detection System
echo ====================================================
echo.
echo Launching Backend and Frontend in separate windows...
echo.

start "Satellite IDS - Backend" cmd /c "start_backend.bat"
timeout /t 2 /nobreak > nul
start "Satellite IDS - Frontend" cmd /c "start_frontend.bat"

echo.
echo Both services are starting. You can close this window.
echo.
pause
