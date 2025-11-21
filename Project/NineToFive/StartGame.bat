@echo off
echo Starting Nine-To-Five Game Server...
echo Please keep this window open while playing.

:: Navigate to the workspace root (2 levels up from Project/NineToFive)
cd /d "%~dp0..\.."

echo Server Root: %CD%
echo Opening http://localhost:8000/Project/NineToFive/index.html ...

:: Open the browser
start "" "http://localhost:8000/Project/NineToFive/index.html"

:: Start the server from the workspace root so Engine/ is accessible
python -m http.server 8000

pause