# Starts backend and frontend each in a new PowerShell window and leaves them open.
# Each will write logs to their respective folder's *.log file.

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$backendScript = Join-Path $root 'backend\start-dev.ps1'
$frontendScript = Join-Path $root 'frontend\start-dev.ps1'

Write-Host "Opening backend and frontend in separate PowerShell windows..."

Start-Process -FilePath 'powershell' -ArgumentList '-NoExit','-ExecutionPolicy','Bypass','-File', $backendScript
Start-Process -FilePath 'powershell' -ArgumentList '-NoExit','-ExecutionPolicy','Bypass','-File', $frontendScript

Write-Host 'Done. Check backend\backend-dev.log and frontend\frontend-dev.log for saved output.'
