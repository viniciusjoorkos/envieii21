@echo off
echo Starting development server...

REM Set the path to Node.js
set NODE_PATH="C:\Program Files\nodejs\node.exe"
set NPM_PATH="C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js"

REM Check if Node.js exists
if not exist %NODE_PATH% (
    echo Node.js not found at %NODE_PATH%
    pause
    exit /b 1
)

REM Change to the project directory
cd /d "%~dp0"

REM Install dependencies
echo Installing dependencies...
%NODE_PATH% %NPM_PATH% install

REM Start the development server
echo Starting Vite development server...
%NODE_PATH% %NPM_PATH% run dev

pause 