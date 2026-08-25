param(
  [switch]$SkipTests,
  [switch]$NoServe
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
$env:npm_config_cache = Join-Path $projectRoot ".npm-cache"

function Refresh-ProcessPath {
  $machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
  $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
  $env:Path = "$machinePath;$userPath"
}

function Test-SupportedNode {
  if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    return $false
  }

  $parts = (& node -p "process.versions.node").Trim().Split(".")
  $major = [int]$parts[0]
  $minor = [int]$parts[1]

  return ($major -eq 20 -and $minor -ge 19) -or $major -ge 22
}

if (-not (Test-SupportedNode)) {
  $winget = Get-Command winget -ErrorAction SilentlyContinue

  if (-not $winget) {
    throw "Node.js 20.19+ or 22.12+ is required. Install Node.js 22 LTS from https://nodejs.org/ and run this file again."
  }

  Write-Host "[0/3] Installing Node.js 22 LTS..." -ForegroundColor Cyan
  & winget install --id OpenJS.NodeJS.LTS -e --source winget --force --accept-package-agreements --accept-source-agreements
  if ($LASTEXITCODE -ne 0) {
    throw "Node.js installation failed with exit code $LASTEXITCODE."
  }

  Refresh-ProcessPath
  if (-not (Test-SupportedNode)) {
    throw "Node.js was installed, but this terminal cannot find it yet. Close this window and double-click start-resume.cmd again."
  }
}

$nodeVersion = & node -p "process.versions.node"
Write-Host "Node.js $nodeVersion is ready." -ForegroundColor Green

Write-Host "[1/3] Installing project dependencies..." -ForegroundColor Cyan
& npm.cmd install
if ($LASTEXITCODE -ne 0) {
  throw "npm install failed with exit code $LASTEXITCODE."
}

if ($SkipTests) {
  Write-Host "[2/3] Building the production bundle..." -ForegroundColor Cyan
  & npm.cmd run build
} else {
  Write-Host "[2/3] Running checks and production build..." -ForegroundColor Cyan
  & npm.cmd test
}
if ($LASTEXITCODE -ne 0) {
  throw "Project verification failed with exit code $LASTEXITCODE."
}

if ($NoServe) {
  Write-Host "Setup completed. Production files are in dist/." -ForegroundColor Green
  exit 0
}

$url = "http://127.0.0.1:4173/"
Write-Host "[3/3] Starting the local production preview at $url" -ForegroundColor Cyan
Write-Host "Keep this window open. Press Ctrl+C to stop the service." -ForegroundColor DarkGray

$browserJob = Start-Job -ScriptBlock {
  param($targetUrl)
  Start-Sleep -Seconds 2
  Start-Process $targetUrl
} -ArgumentList $url

try {
  & npm.cmd run preview -- --host 0.0.0.0 --port 4173
} finally {
  Remove-Job -Job $browserJob -Force -ErrorAction SilentlyContinue
}
