@echo off
cd /d %~dp0
if "%1"=="-Install" (
  echo Installing backend dependencies...
  npm install
)
echo Starting backend in new window, logs -> %~dp0backend-dev.log
start "validation-backend" powershell -NoExit -ExecutionPolicy Bypass -Command "Set-Location '%~dp0'; npm run dev 2>&1 | Tee-Object -FilePath '%~dp0backend-dev.log'"
