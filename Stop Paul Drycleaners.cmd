@echo off
setlocal
title Stopping Paul Drycleaners...
echo Stopping Paul Drycleaners (port 4173)...

"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -Command "$server = Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue; if ($server) { $server.OwningProcess | Sort-Object -Unique | ForEach-Object { Stop-Process -Id $_ -Force }; exit 0 }; exit 2"

if errorlevel 2 (
    echo No Paul Drycleaners server is currently running.
    "%SystemRoot%\System32\timeout.exe" /t 2 >nul
    exit /b 0
)

if errorlevel 1 (
    echo Could not stop the server. Please close any app using port 4173 and try again.
    pause
    exit /b 1
)

echo.
echo Paul Drycleaners has been stopped.
"%SystemRoot%\System32\timeout.exe" /t 2 >nul
