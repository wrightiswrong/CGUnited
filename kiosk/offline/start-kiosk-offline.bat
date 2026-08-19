@echo off
setlocal
set "SCRIPT_DIR=%~dp0"

rem === Build Your Future - Offline Kiosk Launcher ===
rem No internet required. Starts a local server serving the game from the
rem "dist" folder next to this script, then opens Chrome full-screen against
rem it and auto-relaunches Chrome if it ever closes or crashes.
rem
rem Works straight off this USB stick, or copy the whole "offline" folder
rem to the screen's hard drive first if you'd rather not depend on the USB
rem staying plugged in.

rem Unblock the script in case Windows flagged it as coming from external
rem media (USB) - otherwise it can silently refuse to run.
powershell.exe -NoProfile -Command "Unblock-File -Path '%SCRIPT_DIR%serve.ps1'" >nul 2>&1

rem Clear out any leftover server from a previous run still holding a port
rem in the background (it launches hidden, so it's easy to not notice it's
rem still running).
for %%P in (8787 8788 8789 8790 8791 8850 9090 9191) do (
  for /f "tokens=5" %%p in ('netstat -ano ^| findstr :%%P ^| findstr LISTENING') do (
    taskkill /PID %%p /F >nul 2>&1
  )
)

del "%SCRIPT_DIR%port.txt" >nul 2>&1
start "GameServer" /min powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%SCRIPT_DIR%serve.ps1"

rem Give the local server a moment to start listening and write its port.
timeout /t 3 /nobreak >nul

rem If serve-log.txt reports a fatal error (e.g. dist folder missing, or no
rem candidate port was available), stop here instead of opening Chrome to a
rem broken page.
if not exist "%SCRIPT_DIR%port.txt" (
  echo The local game server failed to start. See serve-log.txt for details:
  type "%SCRIPT_DIR%serve-log.txt"
  pause
  exit /b 1
)

set /p PORT=<"%SCRIPT_DIR%port.txt"
set "URL=http://localhost:%PORT%/"
set "CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"

if not exist "%CHROME%" (
  echo Chrome was not found in the usual install locations.
  echo Edit this file and set CHROME= to the correct path to chrome.exe.
  pause
  exit /b 1
)

rem A dedicated profile folder forces Chrome to open a brand new process
rem every time, instead of detecting an already-running Chrome window and
rem just handing it the URL as a new tab (which ignores --kiosk entirely
rem and is why multiple tabs were stacking up).
set "PROFILE_DIR=%SCRIPT_DIR%chrome-kiosk-profile"

:loop
start "" /wait "%CHROME%" ^
  --kiosk ^
  --user-data-dir="%PROFILE_DIR%" ^
  --no-first-run ^
  --noerrdialogs ^
  --disable-infobars ^
  --disable-session-crashed-bubble ^
  --disable-features=TranslateUI ^
  --overscroll-history-navigation=0 ^
  --disable-pinch ^
  --new-window ^
  "%URL%"

timeout /t 2 /nobreak >nul
goto loop
