@echo off
set scriptdir=%~dp0
start "validation-backend-launcher" cmd /c "%scriptdir%backend\start-dev.cmd"
start "validation-frontend-launcher" cmd /c "%scriptdir%frontend\start-dev.cmd"
echo Started backend and frontend in separate windows.
echo Logs: backend\backend-dev.log, frontend\frontend-dev.log
