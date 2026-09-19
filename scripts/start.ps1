$ErrorActionPreference = 'Stop'
$projectDir = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectDir
$statePath = Join-Path $projectDir '.runtime\server.json'
if (Test-Path -LiteralPath $statePath) {
  try {
    $state = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
    $health = Invoke-RestMethod -Uri "$($state.url)/__atlas/health" -TimeoutSec 2
    if ($health.app -eq 'gdut-campus-atlas') { Start-Process $state.url; exit 0 }
  } catch {}
}
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Node.js 22.12+ is required. See README.md.' }
if (-not (Test-Path 'dist\index.html')) {
  if (-not (Test-Path 'node_modules')) { npm.cmd ci; if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed.' } }
  npm.cmd run build
  if ($LASTEXITCODE -ne 0) { throw 'Build failed.' }
}
$nodePath = (Get-Command node).Source
Start-Process -FilePath $nodePath -ArgumentList @('scripts/server.mjs', '--open') -WorkingDirectory $projectDir -WindowStyle Hidden
Write-Host 'Campus map started. Use STOP-CAMPUS.cmd to stop the local server.'
