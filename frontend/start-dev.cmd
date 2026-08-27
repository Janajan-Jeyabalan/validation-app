@echo off
cd /d %~dp0
if "%1"=="-Install" (
  echo Installing frontend dependencies...
  npm install
)
echo Starting frontend in new window, logs -> %~dp0frontend-dev.log
start "validation-frontend" powershell -NoExit -ExecutionPolicy Bypass -Command "Set-Location '%~dp0'; npm run dev 2>&1 | Tee-Object -FilePath '%~dp0frontend-dev.log'"
