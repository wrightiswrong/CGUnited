@echo off
setlocal

rem === Build Your Future - Kiosk Launcher ===
rem Launches Chrome full-screen (no address bar, no tabs, no way to
rem accidentally navigate away) pointed at the live game, and automatically
rem relaunches it if Chrome ever closes or crashes. Meant to run on the
rem Windows laptop fallback for the Expo booth, in case the IdeaHub's
rem built-in browser has trouble.

set "URL=https://wrightiswrong.github.io/CGUnited/"

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
set "PROFILE_DIR=%~dp0chrome-kiosk-profile"

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

rem If we get here, Chrome closed (crash, accidental Alt+F4, power blip).
rem Wait 2 seconds and relaunch automatically.
timeout /t 2 /nobreak >nul
goto loop
