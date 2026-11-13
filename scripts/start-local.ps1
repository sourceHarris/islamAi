$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$logDirectory = Join-Path $projectRoot 'exports\runtime'
New-Item -ItemType Directory -Force -Path $logDirectory | Out-Null
function Test-Listening([int]$Port) {
  return [bool](Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
}
if (-not (Test-Listening 8000)) {
  $pythonPath = Join-Path $projectRoot 'venv\Scripts\python.exe'
  if (-not (Test-Path -LiteralPath $pythonPath)) { throw 'Python environment missing: venv\Scripts\python.exe' }
  Start-Process -FilePath $pythonPath -ArgumentList '-m','uvicorn','main:app','--host','127.0.0.1','--port','8000' -WorkingDirectory (Join-Path $projectRoot 'backend') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logDirectory 'backend.log') -RedirectStandardError (Join-Path $logDirectory 'backend-error.log') | Out-Null
  Write-Output 'Backend starting. Initial AI indexing can take several minutes.'
} else { Write-Output 'Backend already listening on port 8000.' }
if (-not (Test-Listening 8081)) {
  $nodePath = (Get-Command node.exe).Source
  $expoCli = Join-Path $projectRoot 'node_modules\expo\bin\cli'
  Start-Process -FilePath $nodePath -ArgumentList ('"' + $expoCli + '"'),'start','--web','--localhost','--port','8081','--clear' -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logDirectory 'expo.log') -RedirectStandardError (Join-Path $logDirectory 'expo-error.log') | Out-Null
  Write-Output 'App preview starting.'
} else { Write-Output 'App already listening on port 8081.' }
Write-Output 'App: http://localhost:8081'
Write-Output 'Backend health: http://127.0.0.1:8000/'
Write-Output ('Logs: ' + $logDirectory)
