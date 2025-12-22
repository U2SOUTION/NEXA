@echo off
REM NEXA Platform 개발 서버 시작 스크립트 (바탕화면 아이콘용)
cd /d "%~dp0"
echo 🚀 NEXA Platform 개발 서버 시작 중... (프레젠테이션 모드)
REM 바탕화면 아이콘으로 실행되었음을 표시하는 환경 변수 설정
set DESKTOP_ICON_MODE=true
npm run dev:all

