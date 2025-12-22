@echo off
cd /d "%~dp0"
REM start 명령을 사용하여 콘솔 창 없이 실행
start "" pythonw.exe "%~dp0ScreenDraw.py"

