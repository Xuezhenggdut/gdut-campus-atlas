$ErrorActionPreference = 'Stop'
$projectDir = Split-Path -Parent $PSScriptRoot
$statePath = Join-Path $projectDir '.runtime\server.json'
if (-not (Test-Path -LiteralPath $statePath)) { Write-Host 'Campus map is not running.'; exit 0 }
$state = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
if ($state.url -notmatch '^http://127\.0\.0\.1:\d+$') { throw 'Invalid local server address.' }
try {
  $health = Invoke-RestMethod -Uri "$($state.url)/__atlas/health" -TimeoutSec 3
  if ($health.app -ne 'gdut-campus-atlas') { throw 'This port belongs to another application.' }
  Invoke-RestMethod -Method Post -Uri "$($state.url)/__atlas/stop" -Headers @{ 'x-atlas-token' = $state.token } -TimeoutSec 3
  Write-Host 'Campus map stopped. You can close the browser tab.'
} catch { Write-Host $_; exit 1 }
