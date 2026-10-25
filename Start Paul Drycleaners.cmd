@echo off
setlocal enabledelayedexpansion
title Starting Paul Drycleaners...
cd /d "%~dp0"

:: ----------------------------------------------------
:: 1. Locate Node.js executable
:: ----------------------------------------------------
set "NODE_EXE="

where node >nul 2>nul
if !errorlevel! equ 0 (
    for /f "delims=" %%I in ('where node 2^>nul') do (
        if not defined NODE_EXE set "NODE_EXE=%%I"
    )
)

if not defined NODE_EXE (
    if exist "%ProgramFiles%\nodejs\node.exe" (
        set "NODE_EXE=%ProgramFiles%\nodejs\node.exe"
    ) else if exist "%ProgramW6432%\nodejs\node.exe" (
        set "NODE_EXE=%ProgramW6432%\nodejs\node.exe"
    ) else if exist "%ProgramFiles(x86)%\nodejs\node.exe" (
        set "NODE_EXE=%ProgramFiles(x86)%\nodejs\node.exe"
    ) else if exist "%LOCALAPPDATA%\Programs\node\node.exe" (
        set "NODE_EXE=%LOCALAPPDATA%\Programs\node\node.exe"
    ) else if exist "%APPDATA%\nvm\current\node.exe" (
        set "NODE_EXE=%APPDATA%\nvm\current\node.exe"
    ) else if exist "%USERPROFILE%\AppData\Local\Programs\node\node.exe" (
        set "NODE_EXE=%USERPROFILE%\AppData\Local\Programs\node\node.exe"
    )
)

if not defined NODE_EXE (
    echo ====================================================================
    echo   [ERROR] Node.js is not found on your system!
    echo ====================================================================
    echo.
    echo   Paul Drycleaners requires Node.js to run.
    echo   Please install Node.js from: https://nodejs.org/
    echo.
    echo   Once installed, double-click this file again.
    echo ====================================================================
    echo.
    pause
    exit /b 1
)

:: ----------------------------------------------------
:: 2. Build the current application files
:: ----------------------------------------------------
echo Building current application files...
call npm run build
if errorlevel 1 (
    echo.
    echo ====================================================================
    echo   [ERROR] The application build failed. The server was not started.
    echo ====================================================================
    echo.
    pause
    exit /b 1
)

:: ----------------------------------------------------
:: 3. Check if server is already running on port 4173
:: ----------------------------------------------------
set "SERVER_RUNNING=0"
"%SystemRoot%\System32\netstat.exe" -ano | "%SystemRoot%\System32\findstr.exe" /C:":4173 " | "%SystemRoot%\System32\findstr.exe" /I "LISTENING" >nul 2>nul
if !errorlevel! equ 0 (
    set "SERVER_RUNNING=1"
)

if "!SERVER_RUNNING!"=="0" (
    echo Starting Paul Drycleaners server...
    "%SystemRoot%\System32\wscript.exe" //nologo "%~dp0run-hidden.vbs" "%NODE_EXE%" "server.mjs" "%~dp0"
    "%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -Command "Start-Sleep -Seconds 2"
    if !errorlevel! neq 0 (
        echo [ERROR] The local server could not be started.
        pause
        exit /b 1
    )
)

:: ----------------------------------------------------
:: 4. Locate browser (Edge or system default)
:: ----------------------------------------------------
set "BROWSER_EXE="

if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    set "BROWSER_EXE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
) else if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    set "BROWSER_EXE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
) else if exist "%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe" (
    set "BROWSER_EXE=%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe"
)

if defined BROWSER_EXE (
    start "" "%BROWSER_EXE%" "http://127.0.0.1:4173"
) else (
    start "" "http://127.0.0.1:4173"
)

exit /b 0
