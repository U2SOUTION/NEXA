@echo off
chcp 65001 >nul
title NEXA Platform - Docker 이미지 빌드

cd /d "%~dp0"

echo.
echo [NEXA Platform] Docker 이미지 빌드 시작...
echo   - Docker Desktop 이 실행 중이어야 합니다.
echo   - 빌드 폴더: %CD%
echo.

docker build -t nexa-platform:latest .

if %ERRORLEVEL% EQU 0 (
  echo.
  echo [완료] 이미지가 성공적으로 빌드되었습니다: nexa-platform:latest
  echo.
  echo NAS로 옮기려면:
  echo   1. docker save -o nexa-platform.tar nexa-platform:latest
  echo   2. nexa-platform.tar 파일을 우분투(NAS)로 복사
  echo   3. NAS에서: docker load -i nexa-platform.tar
  echo.
) else (
  echo.
  echo [실패] 빌드 중 오류가 발생했습니다. 위 로그를 확인하세요.
  echo.
)

pause
