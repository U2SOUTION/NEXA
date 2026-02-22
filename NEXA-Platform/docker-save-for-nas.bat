@echo off
chcp 65001 >nul
title NEXA Platform - NAS용 이미지 저장

cd /d "%~dp0"

echo.
echo [NEXA Platform] 이미지를 tar 파일로 저장합니다.
echo   - 먼저 docker-build.bat 으로 이미지를 빌드해 두세요.
echo.

docker save -o nexa-platform.tar nexa-platform:latest

if %ERRORLEVEL% EQU 0 (
  echo.
  echo [완료] nexa-platform.tar 가 이 폴더에 저장되었습니다.
  echo   위치: %CD%\nexa-platform.tar
  echo.
  echo 다음: 이 파일을 우분투(NAS)로 복사한 뒤, NAS에서 실행:
  echo   docker load -i nexa-platform.tar
  echo.
) else (
  echo.
  echo [실패] nexa-platform:latest 이미지가 없을 수 있습니다.
  echo   docker-build.bat 을 먼저 실행하세요.
  echo.
)

pause
