# ESP32-C3 내장 LED 제어 프로젝트 (PlatformIO)

이 프로젝트는 ESP32-C3 개발보드의 내장 LED를 제어하는 간단한 예제입니다.

## 기능

-   ESP32-C3 내장 LED (GPIO 8) 1초 간격으로 깜빡임
-   Arduino 프레임워크 사용
-   PlatformIO 기반

## 하드웨어 요구사항

-   ESP32-C3 개발보드
-   USB 케이블

## 빌드 및 플래시 (PlatformIO)

```bash
# 프로젝트 빌드
pio run

# ESP32-C3에 플래시
pio run --target upload

# 시리얼 모니터
pio device monitor
```

## VSCode에서 사용하기

1. PlatformIO 확장 설치
2. `Ctrl + Shift + P` → "PlatformIO: Build"
3. `Ctrl + Shift + P` → "PlatformIO: Upload"
4. `Ctrl + Shift + P` → "PlatformIO: Serial Monitor"

## 주요 특징

-   GPIO 8번 핀을 사용 (ESP32-C3 내장 LED)
-   1초 간격으로 LED ON/OFF 반복
-   시리얼 모니터를 통한 상태 확인 가능
-   Arduino 함수 사용으로 간단한 구조

## 코드 구조

-   `src/main.cpp`: 메인 애플리케이션 코드
-   `platformio.ini`: PlatformIO 프로젝트 설정
-   `.vscode/`: VSCode 설정 파일들
