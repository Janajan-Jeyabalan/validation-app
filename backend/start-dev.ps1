param(
  [switch]$Install
)

Set-Location -Path $PSScriptRoot

if ($Install) {
  Write-Host "Installing backend dependencies..."
  npm install
}

Write-Host "Starting backend (logs -> $PSScriptRoot\backend-dev.log)"
npm run dev 2>&1 | Tee-Object -FilePath "$PSScriptRoot\backend-dev.log"
