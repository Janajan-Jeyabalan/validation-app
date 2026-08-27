param(
  [switch]$Install
)

Set-Location -Path $PSScriptRoot

if ($Install) {
  Write-Host "Installing frontend dependencies..."
  npm install
}

Write-Host "Starting frontend (logs -> $PSScriptRoot\frontend-dev.log)"
npm run dev 2>&1 | Tee-Object -FilePath "$PSScriptRoot\frontend-dev.log"
