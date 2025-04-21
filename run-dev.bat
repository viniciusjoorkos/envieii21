@echo off
echo Starting development server...
cd /d "%~dp0"

REM Check if node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo npm is not installed or not in PATH
    pause
    exit /b 1
)

echo Node.js version:
node --version

echo npm version:
npm --version

echo Installing dependencies...
call npm install

echo Starting Vite development server...
call npx vite --host

pause 