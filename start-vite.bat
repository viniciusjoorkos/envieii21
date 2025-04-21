@echo off
echo Starting Vite development server...

REM Change to the project directory
cd /d "%~dp0"

REM Start Vite using CMD
cmd /c "npm run dev"

pause 