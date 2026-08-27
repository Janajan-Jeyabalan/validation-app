param(
  [switch]$Recreate
)

Set-Location -Path $PSScriptRoot

if (-Not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Error "Docker not found. Install Docker Desktop or Docker Engine to use this script."
  exit 1
}

if ($Recreate) {
  docker-compose down -v
}

Write-Host "Starting MySQL via docker-compose (logs -> docker-compose logs -f)..."

docker-compose --env-file .env.docker up -d

Write-Host "MySQL container started. To view logs run:`n docker-compose --env-file .env.docker logs -f`"
