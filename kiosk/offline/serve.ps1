# Build Your Future - offline static file server.
# Serves the ./dist folder next to this script over http://localhost, so
# Chrome loads it like a normal website with zero internet connection.
# Uses "localhost" (not a wildcard host) so it does NOT require running as
# Administrator on Windows.

$scriptDir = $PSScriptRoot
if (-not $scriptDir) { $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path }

$root = Join-Path $scriptDir "dist"
$logPath = Join-Path $scriptDir "serve-log.txt"
$portPath = Join-Path $scriptDir "port.txt"
# Unlike port.txt (rewritten every run, just reports the current primary
# port), this file is never deleted - it remembers which port Chrome should
# be pointed at, so repeat launches keep visiting the same address instead
# of drifting.
$preferredPortPath = Join-Path $scriptDir "preferred-port.txt"

function Write-Log($msg) {
  "$(Get-Date -Format 'HH:mm:ss')  $msg" | Out-File -FilePath $logPath -Append -Encoding utf8
}

"--- server starting $(Get-Date) ---" | Out-File -FilePath $logPath -Encoding utf8
Remove-Item -Path $portPath -ErrorAction SilentlyContinue
Write-Log "Script dir: $scriptDir"
Write-Log "Dist root:  $root"

if (-not (Test-Path $root -PathType Container)) {
  Write-Log "FATAL: dist folder not found at $root"
  Write-Log "Make sure the 'dist' folder sits directly next to serve.ps1 and start-kiosk-offline.bat."
  exit 1
}

$indexPath = Join-Path $root "index.html"
if (-not (Test-Path $indexPath -PathType Leaf)) {
  Write-Log "FATAL: index.html not found inside $root"
  exit 1
}

# Bind EVERY candidate port at once on a single listener, instead of just
# one with the rest as fallbacks. This matters for two reasons: (1) some
# machines have a stuck HTTP.sys reservation on a given port unrelated to
# any running process, so binding the others in parallel keeps the app
# usable regardless; (2) the app's cross-port leaderboard-merge feature
# only works if a sibling port is actually reachable to answer it - with
# only one port ever live at a time, the merge could never find anything,
# which is why recorded sessions kept appearing to vanish after a port
# change even though nothing was deleted. Whichever port worked last time
# is tried first/preferred as the one Chrome actually visits.
$defaultPorts = 8787, 8788, 8789, 8790, 8791, 8850, 9090, 9191

# Kill any other already-running copy of this script before trying to bind.
# Normally start-kiosk-offline.bat does port cleanup, but if this script is
# ever launched directly (e.g. running serve.ps1 by hand from an
# Administrator PowerShell window instead of through the .bat), that
# cleanup never runs - and a leftover serve.ps1 process from an earlier run
# (or from one of the other test/game folder copies on this machine, since
# they all share this same candidate port list) can end up holding EVERY
# candidate port at once. That shows up as "conflicts with an existing
# registration" on all 8 ports in a row.
#
# NOTE: netstat/Get-NetTCPConnection reports these HttpListener-based ports
# as owned by PID 4 ("System"), not the real powershell.exe process -
# that's just how HttpListener's underlying HTTP.sys kernel driver works.
# PID 4 can't be (and must never be) killed, so instead we find the actual
# powershell.exe/pwsh.exe process by matching its command line against
# "serve.ps1" and kill that.
Write-Log "Clearing any other running serve.ps1 instances..."
try {
  $procs = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -match '^(powershell|pwsh)\.exe$' -and $_.CommandLine -match 'serve\.ps1' -and $_.ProcessId -ne $PID }
  foreach ($proc in $procs) {
    Write-Log "Killing PID $($proc.ProcessId) - $($proc.CommandLine)"
    Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue
  }
} catch {
  Write-Log "Process cleanup check failed: $($_.Exception.Message)"
}
Start-Sleep -Milliseconds 1000

$preferred = $null
if (Test-Path $preferredPortPath) {
  $preferred = (Get-Content $preferredPortPath -Raw).Trim()
}
if ($preferred) {
  $orderedPorts = @($preferred) + ($defaultPorts | Where-Object { "$_" -ne $preferred })
  Write-Log "Preferring last-used port $preferred"
} else {
  $orderedPorts = $defaultPorts
}

# A failed Start() call leaves that HttpListener object permanently
# unusable ("Cannot access a disposed object" on any later call) - so each
# retry below builds a brand new listener with whatever ports are still
# candidates, rather than reusing the broken one.
$badPorts = @()
$listener = $null

while ($true) {
  $activePorts = $orderedPorts | Where-Object { $badPorts -notcontains $_ }
  if (@($activePorts).Count -eq 0) {
    Write-Log "FATAL: no candidate port could be bound"
    exit 1
  }

  $listener = New-Object System.Net.HttpListener
  foreach ($p in $activePorts) {
    $listener.Prefixes.Add("http://localhost:$p/")
  }

  try {
    $listener.Start()
    break
  } catch {
    $msg = $_.Exception.Message
    Write-Log "Bind attempt failed: $msg"
    if ($msg -match "prefix '[^']*:(\d+)/'") {
      $badPort = $matches[1]
      Write-Log "Dropping unavailable port $badPort and retrying with the rest"
      $badPorts += $badPort
    } else {
      Write-Log "FATAL: unrecognized bind failure - $msg"
      exit 1
    }
  }
}

$livePorts = $orderedPorts | Where-Object { $listener.Prefixes.Contains("http://localhost:$_/") }
$port = $livePorts | Select-Object -First 1

Write-Log "Listening on: $($livePorts -join ', ') (serving $root) - primary/visited port: $port"
$port | Out-File -FilePath $portPath -Encoding ascii -NoNewline
$port | Out-File -FilePath $preferredPortPath -Encoding ascii -NoNewline

$mime = @{
  ".html" = "text/html"
  ".js"   = "text/javascript"
  ".css"  = "text/css"
  ".json" = "application/json"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".svg"  = "image/svg+xml"
  ".ico"  = "image/x-icon"
  ".woff" = "font/woff"
  ".woff2"= "font/woff2"
  ".ttf"  = "font/ttf"
  ".map"  = "application/json"
}

while ($listener.IsListening) {
  try {
    $context = $listener.GetContext()
  } catch {
    Write-Log "Listener stopped: $($_.Exception.Message)"
    break
  }
  $req = $context.Request
  $res = $context.Response

  $path = $req.Url.LocalPath
  if ($path -eq "/") { $path = "/index.html" }
  $relative = $path.TrimStart('/') -replace '/', [System.IO.Path]::DirectorySeparatorChar
  $filePath = Join-Path $root $relative

  if (-not (Test-Path $filePath -PathType Leaf)) {
    # Not a real file (e.g. a client-side route) -> fall back to index.html.
    $filePath = $indexPath
  }

  $ext = [System.IO.Path]::GetExtension($filePath)
  $contentType = $mime[$ext]
  if (-not $contentType) { $contentType = "application/octet-stream" }

  try {
    $bytes = [System.IO.File]::ReadAllBytes($filePath)
    $res.ContentType = $contentType
    $res.ContentLength64 = $bytes.Length
    $res.OutputStream.Write($bytes, 0, $bytes.Length)
  } catch {
    $errMsg = $_.Exception.Message
    Write-Log "ERROR serving $path (resolved: $filePath) - $errMsg"
    $body = [System.Text.Encoding]::UTF8.GetBytes("500 - $errMsg`nRequested: $path`nResolved: $filePath")
    $res.StatusCode = 500
    $res.ContentType = "text/plain"
    $res.ContentLength64 = $body.Length
    $res.OutputStream.Write($body, 0, $body.Length)
  } finally {
    $res.OutputStream.Close()
  }
}
