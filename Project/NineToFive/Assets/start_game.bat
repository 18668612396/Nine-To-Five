@echo off
echo Starting Local Game Server...
cd /d "%~dp0.."
start "" "http://localhost:8000/GameProject/index.html"
python -m http.server 8000
pause